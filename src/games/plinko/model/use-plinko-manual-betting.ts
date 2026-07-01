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
  type BalanceDisplayEvent,
  useBalanceQuery,
} from "@/features/balance";
import { getMaxBetButtonAmount, useMaxBetContract } from "@/features/max-bet";
import type { PlinkoFairnessResultSnapshot } from "@/features/provably-fair";
import { useSoundContract } from "@/features/sound";
import type { PlinkoRisk, PlinkoRows } from "../config";
import {
  clampPlinkoBetAmountToBounds,
  comparePlinkoDecimal,
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
import type {
  PlinkoPlaybackFailureReason,
  PlinkoPlaybackLifecycleEvent,
  PlinkoRendererRound,
} from "../renderer";

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
  turboEnabled: boolean;
  onBetAmountNormalized: (value: string) => void;
}

const PLINKO_BALANCE_PROJECTION_OWNER_ID = "plinko-manual-betting";
const DEFAULT_AUTO_BET_COUNT = "10";

type PlinkoAutoBetResult = PlinkoBetResult & AutoBetRoundResult;

type PlinkoPlaybackDiagnosticEvent =
  | "model-fallback-fired"
  | "model-fallback-scheduled"
  | "model-request-started"
  | "model-response-accepted"
  | "model-round-created"
  | "model-terminal-no-visible-playback"
  | "model-visual-queue-added"
  | "model-visual-queue-cleared"
  | "renderer-completed"
  | "renderer-enqueue-accepted"
  | "renderer-enqueue-rejected"
  | "renderer-init-failed"
  | "renderer-playback-failed"
  | "renderer-queued"
  | "renderer-simulated"
  | "renderer-started";

interface PlinkoRoundPlaybackLifecycle {
  acceptedAt: number | null;
  backendBetId: string | null;
  modelTerminal: boolean;
  playbackId: string | null;
  rendererEntered: boolean;
  rendererStarted: boolean;
  rendererTerminal: boolean;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
  targetBucket: number | null;
  turboEnabled: boolean;
}

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

function getPlinkoSettlementOutcome(result: PlinkoBetResult) {
  const netResult = comparePlinkoDecimal(result.payout, result.betSize);

  if (netResult === 0) {
    return undefined;
  }

  return netResult === 1 ? "win" : "loss";
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
  turboEnabled,
  onBetAmountNormalized,
}: UsePlinkoManualBettingOptions) {
  const authSession = useAuthSession();
  const queryClient = useQueryClient();
  const maxBet = useMaxBetContract();
  const sound = useSoundContract();
  const soundRef = React.useRef(sound);
  React.useEffect(() => { soundRef.current = sound; }, [sound]);
  const authenticated = authSession.data?.authenticated === true;
  const balanceQuery = useBalanceQuery(authenticated);
  const roundCounterRef = React.useRef(0);
  const [rounds, setRounds] = React.useState<PlinkoAcceptedRound[]>([]);
  const [projectionAnchorGamePoints, setProjectionAnchorGamePoints] =
    React.useState<string | null>(null);
  const [reconciliationInProgress, setReconciliationInProgress] =
    React.useState(false);
  const [balanceDisplayEvent, setBalanceDisplayEvent] =
    React.useState<BalanceDisplayEvent | null>(null);
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
  const roundPlaybackLifecyclesRef = React.useRef(
    new Map<string, PlinkoRoundPlaybackLifecycle>(),
  );
  const roundsToVisualizeRef = React.useRef<PlinkoRendererRound[]>([]);
  const settledRoundIdsRef = React.useRef(new Set<string>());
  const settlementFallbackTimersRef = React.useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );
  const activeRoundCountRef = React.useRef(0);
  const manualRoundLockRef = React.useRef(false);
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
    balanceQuery.isError ||
    requestingRoundCount > 0;

  const emitPlaybackDiagnostic = React.useCallback(
    (
      event: PlinkoPlaybackDiagnosticEvent,
      roundId: string,
      {
        failureReason = null,
        playbackId,
        rendererReady,
        retryCount = 0,
        settledNoVisiblePlayback,
        terminal = false,
      }: {
        failureReason?: PlinkoPlaybackFailureReason | null;
        playbackId?: string | null;
        rendererReady?: boolean;
        retryCount?: number;
        settledNoVisiblePlayback?: boolean;
        terminal?: boolean;
      } = {},
    ) => {
      if (process.env.NODE_ENV !== "development") {
        return;
      }

      const lifecycle = roundPlaybackLifecyclesRef.current.get(roundId);
      const resolvedPlaybackId = playbackId ?? lifecycle?.playbackId ?? null;

      console.debug(
        `[Plinko playback:${resolvedPlaybackId ?? roundId}] ${event}`,
        {
          backendBetId: lifecycle?.backendBetId ?? null,
          elapsedSinceAcceptedMs:
            lifecycle?.acceptedAt === null || lifecycle?.acceptedAt === undefined
              ? null
              : Math.max(Date.now() - lifecycle.acceptedAt, 0),
          failureReason,
          playbackId: resolvedPlaybackId,
          rendererEntered: lifecycle?.rendererEntered ?? false,
          rendererReady,
          rendererStarted: lifecycle?.rendererStarted ?? false,
          rendererTerminal: lifecycle?.rendererTerminal ?? false,
          retryCount,
          risk: lifecycle?.risk ?? risk,
          roundId,
          rowsCount: lifecycle?.rowsCount ?? rowsCount,
          settledNoVisiblePlayback,
          targetBucket: lifecycle?.targetBucket ?? null,
          terminal,
          turboEnabled: lifecycle?.turboEnabled ?? turboEnabled,
        },
      );
    },
    [risk, rowsCount, turboEnabled],
  );

  const clearVisualQueue = React.useCallback(
    (reason: "auth-reset" | "reconciled") => {
      const queuedRounds = roundsToVisualizeRef.current;
      roundsToVisualizeRef.current = [];

      for (const round of queuedRounds) {
        emitPlaybackDiagnostic("model-visual-queue-cleared", round.id, {
          terminal:
            roundPlaybackLifecyclesRef.current.get(round.id)?.rendererTerminal ===
            true,
        });
      }

      setRoundsToVisualize([]);

      if (reason === "auth-reset") {
        roundPlaybackLifecyclesRef.current.clear();
      }
    },
    [emitPlaybackDiagnostic],
  );

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
        event:
          balanceDisplayEvent?.nextValue === projectedGamePoints
            ? balanceDisplayEvent
            : undefined,
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
        clearVisualQueue("auth-reset");
        setLatestFairnessResult(null);
        setBalanceDisplayEvent(null);
      }, 0);

      return () => window.clearTimeout(resetTimeout);
    }
  }, [
    authenticated,
    balanceDisplayEvent,
    clearVisualQueue,
    projectedGamePoints,
    setProjectionAnchor,
  ]);

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
          clearVisualQueue("reconciled");
          roundPlaybackLifecyclesRef.current.clear();
          setBalanceDisplayEvent(null);
        }
      });
  }, [
    authenticated,
    clearVisualQueue,
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
      setBalanceDisplayEvent({
        balanceType: "GAME_POINTS",
        id: `${roundId}-settlement-${result.betId}`,
        nextValue: addPlinkoDecimal(
          getProjectedGamePointsSnapshot(),
          result.payout,
        ),
        outcome: getPlinkoSettlementOutcome(result),
        reason: "bet-settlement",
      });
      updateRounds((current) =>
        current.map((roundToUpdate) =>
          roundToUpdate.id === roundId
            ? {
                ...roundToUpdate,
                payout: result.payout,
                payoutApplied: true,
                status: "settled",
              }
            : roundToUpdate,
        ),
      );
    },
    [clearSettlementFallback, getProjectedGamePointsSnapshot, updateRounds],
  );

  const scheduleSettlementFallback = React.useCallback(
    (roundId: string) => {
      clearSettlementFallback(roundId);
      emitPlaybackDiagnostic("model-fallback-scheduled", roundId);
      settlementFallbackTimersRef.current.set(
        roundId,
        setTimeout(() => {
          const lifecycle = roundPlaybackLifecyclesRef.current.get(roundId);
          const settledNoVisiblePlayback = lifecycle?.rendererStarted !== true;
          const failureReason = settledNoVisiblePlayback
            ? "model-watchdog-no-visible-playback"
            : "model-watchdog-renderer-timeout";

          emitPlaybackDiagnostic("model-fallback-fired", roundId, {
            failureReason,
            playbackId: lifecycle?.playbackId,
            settledNoVisiblePlayback,
            terminal: true,
          });

          if (lifecycle) {
            lifecycle.modelTerminal = true;
          }

          if (settledNoVisiblePlayback) {
            emitPlaybackDiagnostic("model-terminal-no-visible-playback", roundId, {
              failureReason,
              playbackId: lifecycle?.playbackId,
              settledNoVisiblePlayback: true,
              terminal: true,
            });
          }

          settleRound(roundId);
        }, 4500),
      );
    },
    [clearSettlementFallback, emitPlaybackDiagnostic, settleRound],
  );

  const handlePlaybackLifecycle = React.useCallback(
    (event: PlinkoPlaybackLifecycleEvent) => {
      const lifecycle = roundPlaybackLifecyclesRef.current.get(event.roundId);

      if (lifecycle) {
        lifecycle.backendBetId = event.backendBetId;
        lifecycle.playbackId = event.playbackId;
        lifecycle.targetBucket = event.targetBucket;

        if (event.phase !== "enqueue-rejected" && event.phase !== "init-failed") {
          lifecycle.rendererEntered = true;
        }

        if (event.phase === "started") {
          lifecycle.rendererStarted = true;
        }

        if (event.terminal) {
          lifecycle.rendererTerminal = true;
        }
      }

      if (event.phase === "started") {
        soundRef.current.play("plinko:drop");
      }

      if (event.phase === "completed") {
        soundRef.current.play("plinko:pocket");
        const result = roundResultsRef.current.get(event.roundId);
        if (result && Number(result.payout) > Number(result.betSize)) {
          soundRef.current.play("bet:win");
        }
      }

      const diagnosticEvent: PlinkoPlaybackDiagnosticEvent =
        event.phase === "accepted"
          ? "renderer-enqueue-accepted"
          : event.phase === "completed"
            ? "renderer-completed"
            : event.phase === "enqueue-rejected"
              ? "renderer-enqueue-rejected"
              : event.phase === "init-failed"
                ? "renderer-init-failed"
                : event.phase === "playback-failed"
                  ? "renderer-playback-failed"
                  : event.phase === "queued"
                    ? "renderer-queued"
                    : event.phase === "simulated"
                      ? "renderer-simulated"
                      : "renderer-started";

      emitPlaybackDiagnostic(diagnosticEvent, event.roundId, {
        failureReason: event.failureReason,
        playbackId: event.playbackId,
        rendererReady: event.phase !== "enqueue-rejected",
        retryCount: event.retryCount,
        terminal: event.terminal,
      });
    },
    [emitPlaybackDiagnostic],
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
      const requestTurboEnabled = turboEnabled;

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
      roundPlaybackLifecyclesRef.current.set(id, {
        acceptedAt: null,
        backendBetId: null,
        modelTerminal: false,
        playbackId: null,
        rendererEntered: false,
        rendererStarted: false,
        rendererTerminal: false,
        risk,
        rowsCount,
        targetBucket: null,
        turboEnabled: requestTurboEnabled,
      });
      emitPlaybackDiagnostic("model-round-created", id);
      emitPlaybackDiagnostic("model-request-started", id);
      setLastErrorMessage(null);
      setAutoSessionMessage(null);
      onBetAmountNormalized(normalizedBetAmount);
      setBalanceDisplayEvent({
        balanceType: "GAME_POINTS",
        id: `${id}-debit`,
        nextValue: subtractPlinkoDecimal(projectedBalance, normalizedBetAmount),
        reason: "bet-debit",
      });
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

        const acceptedAt = Date.now();
        const lifecycle = roundPlaybackLifecyclesRef.current.get(id);

        if (lifecycle) {
          lifecycle.acceptedAt = acceptedAt;
          lifecycle.backendBetId = result.betId;
          lifecycle.risk = result.risk;
          lifecycle.rowsCount = result.rowsCount;
          lifecycle.targetBucket = result.bucketIndex;
        }

        emitPlaybackDiagnostic("model-response-accepted", id);

        const rendererRound: PlinkoRendererRound = {
          acceptedAt,
          id,
          result,
          turboEnabled: requestTurboEnabled,
        };

        roundResultsRef.current.set(id, result);
        setLatestFairnessResult(toPlinkoFairnessResultSnapshot(id, result));
        emitPlaybackDiagnostic("model-visual-queue-added", id);
        scheduleSettlementFallback(id);
        setRoundsToVisualize((current) => {
          const nextRounds = current.some((round) => round.id === id)
            ? current
            : [...current, rendererRound];
          roundsToVisualizeRef.current = [...nextRounds];
          return nextRounds;
        });
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
        setBalanceDisplayEvent(null);
        roundResultsRef.current.delete(id);
        roundPlaybackLifecyclesRef.current.delete(id);
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
      emitPlaybackDiagnostic,
      getProjectedGamePointsSnapshot,
      onBetAmountNormalized,
      risk,
      rowsCount,
      scheduleSettlementFallback,
      setProjectionAnchor,
      turboEnabled,
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
    if (
      manualRoundLockRef.current ||
      betDisabled ||
      betAmountValidation !== null
    ) {
      return;
    }

    manualRoundLockRef.current = true;

    try {
      await placePlinkoRound(betAmount);
    } catch {
      // The hook stores and renders the safe error message.
    } finally {
      manualRoundLockRef.current = false;
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
    onPlaybackLifecycle: handlePlaybackLifecycle,
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
