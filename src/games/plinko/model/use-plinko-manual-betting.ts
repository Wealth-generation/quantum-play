"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth";
import {
  balanceQueryKey,
  clearBalanceDisplayProjection,
  setBalanceDisplayProjection,
  useBalanceQuery,
} from "@/features/balance";
import { getMaxBetButtonAmount, useMaxBetContract } from "@/features/max-bet";
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
  configMaxBet: number | undefined;
  configMinBet: number | undefined;
  mode: "manual" | "auto";
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
  onBetAmountNormalized: (value: string) => void;
}

const PLINKO_BALANCE_PROJECTION_OWNER_ID = "plinko-manual-betting";

function isRoundVisuallyActive(round: PlinkoAcceptedRound) {
  return round.status === "requesting" || round.status === "animating";
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
  configMaxBet,
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
  const [roundsToVisualize, setRoundsToVisualize] = React.useState<
    PlinkoRendererRound[]
  >([]);
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
        maxBetLimit: maxBet.enabled
          ? maxBet.activeMaxBet
          : Math.min(maxBet.activeMaxBet, configMaxBet ?? maxBet.activeMaxBet),
      }),
    [
      configMaxBet,
      configMinBet,
      displayGamePoints,
      maxBet.activeMaxBet,
      maxBet.enabled,
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
    () => () => {
      for (const timer of settlementFallbackTimersRef.current.values()) {
        clearTimeout(timer);
      }

      settlementFallbackTimersRef.current.clear();
      clearBalanceDisplayProjection(PLINKO_BALANCE_PROJECTION_OWNER_ID);
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
        setProjectionAnchorGamePoints(null);
        roundResultsRef.current.clear();
        settledRoundIdsRef.current.clear();
        setRounds([]);
        setRoundsToVisualize([]);
      }, 0);

      return () => window.clearTimeout(resetTimeout);
    }
  }, [authenticated, projectedGamePoints]);

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
          setProjectionAnchorGamePoints(null);
          clearBalanceDisplayProjection(PLINKO_BALANCE_PROJECTION_OWNER_ID);
          roundResultsRef.current.clear();
          settledRoundIdsRef.current.clear();
          setRounds([]);
          setRoundsToVisualize([]);
        }
      });
  }, [
    authenticated,
    projectionAnchorGamePoints,
    queryClient,
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
      setRounds((current) =>
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
    [clearSettlementFallback],
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

    onBetAmountNormalized(
      formatPlinkoDecimal(
        Math.min(
          getMaxBetButtonAmount({
            authenticated,
            balance: displayGamePoints,
            maxBetModeMaxBet: maxBet.maxBetModeMaxBet,
          }),
          betBounds.maxBetLimit,
        ),
      ),
    );
  }

  async function placeManualBet() {
    if (betDisabled || betAmountValidation !== null) {
      return;
    }

    const normalizedBetAmount = normalizePlinkoBetAmountForRequestWithinBounds(
      betAmount,
      betBounds,
    );

    if (!normalizedBetAmount) {
      return;
    }

    const id = `plinko-${Date.now()}-${roundCounterRef.current + 1}`;
    roundCounterRef.current += 1;
    setLastErrorMessage(null);
    onBetAmountNormalized(normalizedBetAmount);
    setProjectionAnchorGamePoints(
      (current) => current ?? balanceQuery.data?.gamePoints ?? "0.00",
    );
    setRounds((current) => [
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
      const rendererRound = {
        id,
        result,
      };

      roundResultsRef.current.set(id, result);
      scheduleSettlementFallback(id);
      setRoundsToVisualize((current) =>
        current.some((round) => round.id === id)
          ? current
          : [...current, rendererRound],
      );
      setRounds((current) =>
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
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Plinko bet failed. Please try again later.";

      setLastErrorMessage(message);
      roundResultsRef.current.delete(id);
      clearSettlementFallback(id);
      setRounds((current) =>
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
    }
  }

  return {
    authenticated,
    balanceQuery,
    betAmountValidation,
    betBounds,
    betDisabled,
    controlsLocked,
    doubleBetAmount,
    halfBetAmount,
    lastErrorMessage,
    maxBet,
    maxBetAmount,
    normalizeBetAmount,
    placeManualBet,
    requestingRoundCount,
    rounds,
    roundsToVisualize,
    settleRound,
    unsettledRoundCount,
    updateBetAmount,
  };
}
