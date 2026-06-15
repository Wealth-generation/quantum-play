"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth";
import {
  type AutoBetRoundResult,
  useAutoBetRunner,
} from "@/features/auto-bet";
import {
  balanceQueryKey,
  clearBalanceDisplayProjection,
  setBalanceDisplayProjection,
  useBalanceQuery,
} from "@/features/balance";
import { getMaxBetButtonAmount, useMaxBetContract } from "@/features/max-bet";
import type { PlinkoFairnessResultSnapshot } from "@/features/provably-fair";
import type { PlinkoRisk, PlinkoRows } from "../config";
import {
  clampPlinkoBetAmountToBounds,
  createPlinkoBetBounds,
  formatPlinkoDecimal,
  getPlinkoBetAmountValidation,
  normalizePlinkoBetAmountForRequestWithinBounds,
  normalizePlinkoMoneyInput,
  subtractPlinkoDecimal,
  addPlinkoDecimal,
} from "../lib";
import { placePlinkoBet } from "./plinko-client";
import type { PlinkoBetResult } from "./plinko-types";
import type { PlinkoRendererRound } from "../renderer";

export type PlinkoRoundStatus =
  | "requesting"
  | "animating"
  | "settled"
  | "failed";

export interface PlinkoAcceptedRound {
  errorMessage: string | null;
  id: string;
  payout: string | null;
  payoutApplied: boolean;
  result: PlinkoBetResult | null;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
  stake: string;
  status: PlinkoRoundStatus;
}

interface UsePlinkoManualBettingOptions {
  betAmount: string;
  configError: boolean;
  configMinBet: number | undefined;
  mode: "manual" | "auto";
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
  onBetAmountNormalized: (value: string) => void;
}

const PLINKO_BALANCE_PROJECTION_OWNER_ID = "plinko-manual-betting";
const DEFAULT_AUTO_BET_COUNT = "10";

type PlinkoAutoBetResult = PlinkoBetResult & AutoBetRoundResult;

function isRoundVisuallyActive(round: PlinkoAcceptedRound) {
  return round.status === "requesting" || round.status === "animating";
}

function normalizePlinkoWholeNumberInput(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

function isPositiveWholeNumber(value: string) {
  if (!/^\d+$/.test(value)) {
    return false;
  }

  return Number(value) > 0;
}

function toAutoBetResult(result: PlinkoBetResult): PlinkoAutoBetResult {
  return {
    ...result,
    didWin: Number(result.payout) > Number(result.betSize),
  };
}

function toPlinkoFairnessResultSnapshot(
  id: string,
  result: PlinkoBetResult,
): PlinkoFairnessResultSnapshot {
  return {
    betId: result.betId,
    betSize: result.betSize,
    bucketIndex: result.bucketIndex,
    contractWarnings: result.contractWarnings,
    createdAt: result.createdAt,
    expectedMultiplier: result.expectedMultiplier,
    id,
    multiplier: result.multiplier,
    payout: result.payout,
    results: result.results,
    risk: result.risk,
    rowsCount: result.rowsCount,
  };
}

function calculateProjectedGamePoints(
  canonicalAnchor: string,
  rounds: readonly PlinkoAcceptedRound[],
) {
  return rounds.reduce((currentGamePoints, round) => {
    if (round.status === "failed") {
      return currentGamePoints;
    }

    const reservedBalance = subtractPlinkoDecimal(
      currentGamePoints,
      round.stake,
    );

    return round.payoutApplied && round.payout
      ? addPlinkoDecimal(reservedBalance, round.payout)
      : reservedBalance;
  }, canonicalAnchor);
}

export function usePlinkoManualBetting({
  betAmount,
  configError,
  configMinBet,
  mode,
  risk,
  rowsCount,
  onBetAmountNormalized,
}: UsePlinkoManualBettingOptions) {
  const authSession = useAuthSession();
  const queryClient = useQueryClient();
  const maxBet = useMaxBetContract();
  const authenticated = authSession.data?.authenticated === true;
  const balanceQuery = useBalanceQuery(authenticated);
  const roundCounterRef = React.useRef(0);
  const [rounds, setRounds] = React.useState<PlinkoAcceptedRound[]>([]);
  const [projectionAnchorGamePoints, setProjectionAnchorGamePoints] =
    React.useState<string | null>(null);
  const [reconciliationInProgress, setReconciliationInProgress] =
    React.useState(false);
  const [lastErrorMessage, setLastErrorMessage] = React.useState<string | null>(
    null,
  );
  const [autoBetCountDraft, setAutoBetCountDraft] = React.useState(
    DEFAULT_AUTO_BET_COUNT,
  );
  const [autoBetInfinite, setAutoBetInfinite] = React.useState(false);
  const [autoSessionMessage, setAutoSessionMessage] = React.useState<
    string | null
  >(null);
  const [roundsToVisualize, setRoundsToVisualize] = React.useState<
    PlinkoRendererRound[]
  >([]);
  const [latestFairnessResult, setLatestFairnessResult] =
    React.useState<PlinkoFairnessResultSnapshot | null>(null);
  const lifecycleIdRef = React.useRef(0);
  const mountedRef = React.useRef(true);
  const roundsRef = React.useRef<PlinkoAcceptedRound[]>([]);
  const projectionAnchorGamePointsRef = React.useRef<string | null>(null);
  const roundResultsRef = React.useRef(new Map<string, PlinkoBetResult>());
  const settledRoundIdsRef = React.useRef(new Set<string>());
  const settlementFallbackTimersRef = React.useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );
  const activeRoundCountRef = React.useRef(0);
  const reconciliationInFlightRef = React.useRef(false);
  const projectedGamePoints = React.useMemo(
    () =>
      projectionAnchorGamePoints
        ? calculateProjectedGamePoints(projectionAnchorGamePoints, rounds)
        : null,
    [projectionAnchorGamePoints, rounds],
  );
  const displayGamePoints =
    projectedGamePoints ?? balanceQuery.data?.gamePoints;
  const betBounds = React.useMemo(
    () =>
      createPlinkoBetBounds({
        balance: displayGamePoints,
        configMinBet,
        maxBetLimit: maxBet.activeMaxBet,
      }),
    [
      configMinBet,
      displayGamePoints,
      maxBet.activeMaxBet,
    ],
  );
  const betAmountValidation = getPlinkoBetAmountValidation(
    betAmount,
    betBounds,
  );
  const unsettledRoundCount = rounds.filter(isRoundVisuallyActive).length;
  const requestingRoundCount = rounds.filter(
    (round) => round.status === "requesting",
  ).length;
  const setProjectionAnchor = React.useCallback((value: string | null) => {
    projectionAnchorGamePointsRef.current = value;
    setProjectionAnchorGamePoints(value);
  }, []);
  const updateRounds = React.useCallback(
    (
      updater: (
        current: readonly PlinkoAcceptedRound[],
      ) => PlinkoAcceptedRound[],
    ) => {
      if (!mountedRef.current) {
        return;
      }

      const nextRounds = updater(roundsRef.current);
      roundsRef.current = nextRounds;
      setRounds(nextRounds);
    },
    [],
  );
  const getProjectedGamePointsSnapshot = React.useCallback(() => {
    const anchor =
      projectionAnchorGamePointsRef.current ??
      balanceQuery.data?.gamePoints ??
      "0.00";

    return calculateProjectedGamePoints(anchor, roundsRef.current);
  }, [balanceQuery.data?.gamePoints]);
  const createCurrentBetBounds = React.useCallback(
    (balance: string | undefined) =>
      createPlinkoBetBounds({
        balance,
        configMinBet,
        maxBetLimit: maxBet.activeMaxBet,
      }),
    [
      configMinBet,
      maxBet.activeMaxBet,
    ],
  );
  const controlsLocked = unsettledRoundCount > 0 || reconciliationInProgress;
  const betDisabled =
    mode !== "manual" ||
    !authenticated ||
    betAmountValidation !== null ||
    configError ||
    reconciliationInProgress ||
    balanceQuery.isLoading ||
    balanceQuery.isError;

  React.useEffect(
    () => {
      lifecycleIdRef.current += 1;
      mountedRef.current = true;
      const settlementFallbackTimers = settlementFallbackTimersRef.current;

      return () => {
        mountedRef.current = false;
        lifecycleIdRef.current += 1;
        for (const timer of settlementFallbackTimers.values()) {
          clearTimeout(timer);
        }

        settlementFallbackTimers.clear();
        clearBalanceDisplayProjection(PLINKO_BALANCE_PROJECTION_OWNER_ID);
      };
    },
    [],
  );

  React.useEffect(() => {
    activeRoundCountRef.current = unsettledRoundCount;
  }, [unsettledRoundCount]);

  React.useEffect(() => {
    if (authenticated && projectedGamePoints !== null) {
      setBalanceDisplayProjection({
        gamePoints: projectedGamePoints,
        ownerId: PLINKO_BALANCE_PROJECTION_OWNER_ID,
      });
      return;
    }

    clearBalanceDisplayProjection(PLINKO_BALANCE_PROJECTION_OWNER_ID);

    if (!authenticated) {
      const resetTimeout = window.setTimeout(() => {
        setProjectionAnchor(null);
        roundResultsRef.current.clear();
        settledRoundIdsRef.current.clear();
        roundsRef.current = [];
        setRounds([]);
        setRoundsToVisualize([]);
        setLatestFairnessResult(null);
      }, 0);

      return () => window.clearTimeout(resetTimeout);
    }
  }, [authenticated, projectedGamePoints, setProjectionAnchor]);

  React.useEffect(() => {
    if (
      !authenticated ||
      projectionAnchorGamePoints === null ||
      unsettledRoundCount > 0 ||
      reconciliationInFlightRef.current
    ) {
      return;
    }

    reconciliationInFlightRef.current = true;
    setReconciliationInProgress(true);

    void queryClient
      .refetchQueries({ queryKey: balanceQueryKey })
      .finally(() => {
        reconciliationInFlightRef.current = false;
        setReconciliationInProgress(false);

        if (activeRoundCountRef.current === 0) {
          setProjectionAnchor(null);
          clearBalanceDisplayProjection(PLINKO_BALANCE_PROJECTION_OWNER_ID);
          roundResultsRef.current.clear();
          settledRoundIdsRef.current.clear();
          roundsRef.current = [];
          setRounds([]);
          setRoundsToVisualize([]);
        }
      });
  }, [
    authenticated,
    projectionAnchorGamePoints,
    queryClient,
    setProjectionAnchor,
    unsettledRoundCount,
  ]);

  const clearSettlementFallback = React.useCallback((roundId: string) => {
    const timer = settlementFallbackTimersRef.current.get(roundId);

    if (timer) {
      clearTimeout(timer);
      settlementFallbackTimersRef.current.delete(roundId);
    }
  }, []);

  const settleRound = React.useCallback(
    (roundId: string) => {
      if (settledRoundIdsRef.current.has(roundId)) {
        return;
      }

      const result = roundResultsRef.current.get(roundId);

      if (!result) {
        return;
      }

      settledRoundIdsRef.current.add(roundId);
      clearSettlementFallback(roundId);
      updateRounds((current) =>
        current.map((candidate) =>
          candidate.id === roundId
            ? {
                ...candidate,
                payout: result.payout,
                payoutApplied: true,
                status: "settled",
              }
            : candidate,
        ),
      );
    },
    [clearSettlementFallback, updateRounds],
  );

  const scheduleSettlementFallback = React.useCallback(
    (roundId: string) => {
      clearSettlementFallback(roundId);
      settlementFallbackTimersRef.current.set(
        roundId,
        setTimeout(() => settleRound(roundId), 4500),
      );
    },
    [clearSettlementFallback, settleRound],
  );

  function updateBetAmount(value: string) {
    if (!controlsLocked) {
      onBetAmountNormalized(normalizePlinkoMoneyInput(value));
    }
  }

  function normalizeBetAmount() {
    if (controlsLocked) {
      return;
    }

    onBetAmountNormalized(
      clampPlinkoBetAmountToBounds(
        betAmount.trim() === "" ? "" : formatPlinkoDecimal(betAmount),
        betBounds,
      ),
    );
  }

  function halfBetAmount() {
    if (controlsLocked) {
      return;
    }

    onBetAmountNormalized(
      clampPlinkoBetAmountToBounds(
        formatPlinkoDecimal(Number(betAmount || "0") / 2),
        betBounds,
      ),
    );
  }

  function doubleBetAmount() {
    if (controlsLocked) {
      return;
    }

    onBetAmountNormalized(
      clampPlinkoBetAmountToBounds(
        formatPlinkoDecimal(Number(betAmount || "0") * 2),
        betBounds,
      ),
    );
  }

  function maxBetAmount() {
    if (controlsLocked) {
      return;
    }

    const projectedBalance = getProjectedGamePointsSnapshot();

    onBetAmountNormalized(
      formatPlinkoDecimal(
        Math.min(
          getMaxBetButtonAmount({
            authenticated,
            balance: projectedBalance,
            maxBetModeMaxBet: maxBet.maxBetModeMaxBet,
          }),
          betBounds.maxBetLimit,
        ),
      ),
    );
  }

  const placePlinkoRound = React.useCallback(
    async (currentBetAmount: string) => {
      const lifecycleId = lifecycleIdRef.current;

      if (!authenticated) {
        throw new Error("AutoBet stopped because your session ended.");
      }

      if (configError) {
        throw new Error("Plinko configuration is unavailable.");
      }

      const projectedBalance = getProjectedGamePointsSnapshot();
      const currentBetBounds = createCurrentBetBounds(projectedBalance);
      const normalizedBetAmount = normalizePlinkoBetAmountForRequestWithinBounds(
        currentBetAmount,
        currentBetBounds,
      );

      if (!normalizedBetAmount) {
        throw new Error("Enter a valid bet amount.");
      }

      const validationMessage = getPlinkoBetAmountValidation(
        normalizedBetAmount,
        currentBetBounds,
      );

      if (validationMessage !== null) {
        throw new Error(validationMessage);
      }

      const id = `plinko-${Date.now()}-${roundCounterRef.current + 1}`;
      roundCounterRef.current += 1;
      setLastErrorMessage(null);
      setAutoSessionMessage(null);
      onBetAmountNormalized(normalizedBetAmount);
      setProjectionAnchor(
        projectionAnchorGamePointsRef.current ??
          balanceQuery.data?.gamePoints ??
          "0.00",
      );
      updateRounds((current) => [
        ...current,
        {
          errorMessage: null,
          id,
          payout: null,
          payoutApplied: false,
          result: null,
          risk,
          rowsCount,
          stake: normalizedBetAmount,
          status: "requesting",
        },
      ]);

      try {
        const result = await placePlinkoBet({
          betSize: normalizedBetAmount,
          risk,
          rowsCount,
        });

        if (
          !mountedRef.current ||
          lifecycleIdRef.current !== lifecycleId
        ) {
          throw new Error("Plinko bet was cancelled because the game closed.");
        }

        const rendererRound = {
          id,
          result,
        };

        roundResultsRef.current.set(id, result);
        setLatestFairnessResult(toPlinkoFairnessResultSnapshot(id, result));
        scheduleSettlementFallback(id);
        setRoundsToVisualize((current) =>
          current.some((round) => round.id === id)
            ? current
            : [...current, rendererRound],
        );
        updateRounds((current) =>
          current.map((round) =>
            round.id === id
              ? {
                  ...round,
                  payout: result.payout,
                  result,
                  status: "animating",
                }
              : round,
          ),
        );

        return toAutoBetResult(result);
      } catch (error) {
        if (
          !mountedRef.current ||
          lifecycleIdRef.current !== lifecycleId
        ) {
          throw error;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Plinko bet failed. Please try again later.";

        setLastErrorMessage(message);
        roundResultsRef.current.delete(id);
        clearSettlementFallback(id);
        updateRounds((current) =>
          current.map((round) =>
            round.id === id
              ? {
                  ...round,
                  errorMessage: message,
                  status: "failed",
                }
              : round,
          ),
        );
        throw error;
      }
    },
    [
      authenticated,
      balanceQuery.data?.gamePoints,
      clearSettlementFallback,
      configError,
      createCurrentBetBounds,
      getProjectedGamePointsSnapshot,
      onBetAmountNormalized,
      risk,
      rowsCount,
      scheduleSettlementFallback,
      setProjectionAnchor,
      updateRounds,
    ],
  );

  const autoRunner = useAutoBetRunner<PlinkoAutoBetResult>({
    delayMs: 0,
    initialBetAmount: betAmount || "0",
    initialRemainingBets: Number(DEFAULT_AUTO_BET_COUNT),
    normalizeBetAmount: (currentBetAmount) =>
      clampPlinkoBetAmountToBounds(
        formatPlinkoDecimal(currentBetAmount),
        betBounds,
      ),
    onError: (error) => {
      setAutoSessionMessage(
        error instanceof Error
          ? error.message
          : "AutoBet stopped because the request failed.",
      );
    },
    placeBet: placePlinkoRound,
  });

  const autoRunning = autoRunner.isRunning;
  const finiteAutoBetCompleted =
    !autoBetInfinite &&
    !autoRunning &&
    autoRunner.state.remainingBets === 0 &&
    autoRunner.state.completedRounds > 0;
  const autoBetCountForNextRun = finiteAutoBetCompleted
    ? "0"
    : autoBetCountDraft;
  const autoBetCountDisplay =
    (autoRunning || finiteAutoBetCompleted) &&
    !autoBetInfinite &&
    autoRunner.state.remainingBets !== null
      ? String(autoRunner.state.remainingBets)
      : autoBetCountDraft;
  const autoStartGuardReasons = [
    mode !== "auto" ? "auto mode is not selected" : null,
    !authenticated ? "user is not authenticated" : null,
    betAmountValidation ? betAmountValidation : null,
    !autoBetInfinite && !isPositiveWholeNumber(autoBetCountForNextRun)
      ? "number of bets is not a positive finite integer"
      : null,
    autoRunning ? "auto runner is already running" : null,
    configError ? "plinko config query is in error" : null,
    balanceQuery.isLoading ? "balance is loading" : null,
    balanceQuery.isError ? "balance query is in error" : null,
    unsettledRoundCount > 0 ? "plinko rounds are still settling" : null,
    reconciliationInProgress ? "balance reconciliation is in progress" : null,
  ].filter((reason): reason is string => reason !== null);
  const autoStartDisabled = autoStartGuardReasons.length > 0;

  React.useEffect(() => {
    if (!authenticated && autoRunning) {
      queueMicrotask(() => {
        setAutoSessionMessage("AutoBet stopped because your session ended.");
      });
      autoRunner.stop();
    }
  }, [authenticated, autoRunning, autoRunner]);

  function updateAutoBetCount(value: string) {
    const normalized = normalizePlinkoWholeNumberInput(value);
    setAutoBetCountDraft(normalized);

    if (!autoBetInfinite) {
      autoRunner.setRemainingBets(normalized ? Number(normalized) : 0);
    }
  }

  function toggleAutoBetInfinite() {
    if (autoRunning) {
      return;
    }

    setAutoBetInfinite((current) => {
      const nextInfinite = !current;
      autoRunner.setRemainingBets(
        nextInfinite ? "infinite" : Number(autoBetCountDraft || "0"),
      );

      return nextInfinite;
    });
  }

  function startAutoBet() {
    if (autoStartDisabled) {
      return;
    }

    const projectedBalance = getProjectedGamePointsSnapshot();
    const currentBetBounds = createCurrentBetBounds(projectedBalance);
    const normalizedBetAmount = normalizePlinkoBetAmountForRequestWithinBounds(
      betAmount,
      currentBetBounds,
    );

    if (
      !normalizedBetAmount ||
      getPlinkoBetAmountValidation(normalizedBetAmount, currentBetBounds) !==
        null
    ) {
      return;
    }

    setAutoSessionMessage(null);
    setLastErrorMessage(null);
    onBetAmountNormalized(normalizedBetAmount);
    autoRunner.setCurrentBetAmount(normalizedBetAmount);
    autoRunner.start({
      currentBetAmount: normalizedBetAmount,
      remainingBets: autoBetInfinite
        ? "infinite"
        : Number(autoBetCountForNextRun || "0"),
    });
  }

  async function placeManualBet() {
    if (betDisabled || betAmountValidation !== null) {
      return;
    }

    try {
      await placePlinkoRound(betAmount);
    } catch {
      // The hook stores and renders the safe error message.
    }
  }

  return {
    autoBetCountDisplay,
    autoBetCountDraft,
    autoBetInfinite,
    autoRunning,
    autoStartDisabled,
    authenticated,
    balanceQuery,
    betAmountValidation,
    betBounds,
    betDisabled,
    controlsLocked: controlsLocked || autoRunning,
    doubleBetAmount,
    halfBetAmount,
    lastErrorMessage,
    latestFairnessResult,
    maxBet,
    maxBetAmount,
    normalizeBetAmount,
    placeManualBet,
    requestingRoundCount,
    rounds,
    roundsToVisualize,
    settleRound,
    startAutoBet,
    stopAutoBet: autoRunner.stop,
    toggleAutoBetInfinite,
    unsettledRoundCount,
    updateAutoBetCount,
    updateBetAmount,
    visibleErrorMessage:
      autoRunner.state.errorMessage ?? autoSessionMessage ?? lastErrorMessage,
  };
}
