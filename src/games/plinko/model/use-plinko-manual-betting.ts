"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth";
import {
  balanceQueryKey,
  useBalanceQuery,
  type Balance,
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
  betAmount: string;
  errorMessage: string | null;
  id: string;
  result: PlinkoBetResult | null;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
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

function updateGamePoints(
  current: Balance | undefined,
  updater: (currentGamePoints: string) => string,
): Balance | undefined {
  if (!current) {
    return current;
  }

  return {
    ...current,
    gamePoints: updater(current.gamePoints),
  };
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
  const [lastErrorMessage, setLastErrorMessage] = React.useState<string | null>(
    null,
  );
  const [roundToVisualize, setRoundToVisualize] =
    React.useState<PlinkoRendererRound | null>(null);
  const roundResultsRef = React.useRef(new Map<string, PlinkoBetResult>());
  const settledRoundIdsRef = React.useRef(new Set<string>());
  const settlementFallbackTimersRef = React.useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );
  const betBounds = React.useMemo(
    () =>
      createPlinkoBetBounds({
        balance: balanceQuery.data?.gamePoints,
        configMinBet,
        maxBetLimit: maxBet.enabled
          ? maxBet.activeMaxBet
          : Math.min(maxBet.activeMaxBet, configMaxBet ?? maxBet.activeMaxBet),
      }),
    [
      balanceQuery.data?.gamePoints,
      configMaxBet,
      configMinBet,
      maxBet.activeMaxBet,
      maxBet.enabled,
    ],
  );
  const betAmountValidation = getPlinkoBetAmountValidation(
    betAmount,
    betBounds,
  );
  const unsettledRoundCount = rounds.filter(
    (round) => round.status === "requesting" || round.status === "animating",
  ).length;
  const requestingRoundCount = rounds.filter(
    (round) => round.status === "requesting",
  ).length;
  const controlsLocked = unsettledRoundCount > 0;
  const betDisabled =
    mode !== "manual" ||
    !authenticated ||
    betAmountValidation !== null ||
    configError ||
    balanceQuery.isLoading ||
    balanceQuery.isError;

  React.useEffect(
    () => () => {
      for (const timer of settlementFallbackTimersRef.current.values()) {
        clearTimeout(timer);
      }

      settlementFallbackTimersRef.current.clear();
    },
    [],
  );

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
      queryClient.setQueryData<Balance | undefined>(
        balanceQueryKey,
        (current) =>
          updateGamePoints(current, (gamePoints) =>
            addPlinkoDecimal(gamePoints, result.payout),
          ),
      );
      setRounds((current) =>
        current.map((candidate) =>
          candidate.id === roundId
            ? {
                ...candidate,
                status: "settled",
              }
            : candidate,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: balanceQueryKey });
    },
    [clearSettlementFallback, queryClient],
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
            balance: balanceQuery.data?.gamePoints,
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
    queryClient.setQueryData<Balance | undefined>(
      balanceQueryKey,
      (current) =>
        updateGamePoints(current, (gamePoints) =>
          subtractPlinkoDecimal(gamePoints, normalizedBetAmount),
        ),
    );
    setRounds((current) => [
      ...current,
      {
        betAmount: normalizedBetAmount,
        errorMessage: null,
        id,
        result: null,
        risk,
        rowsCount,
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
      setRoundToVisualize(rendererRound);
      setRounds((current) =>
        current.map((round) =>
          round.id === id
            ? {
                ...round,
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

      queryClient.setQueryData<Balance | undefined>(
        balanceQueryKey,
        (current) =>
          updateGamePoints(current, (gamePoints) =>
            addPlinkoDecimal(gamePoints, normalizedBetAmount),
          ),
      );
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
    roundToVisualize,
    settleRound,
    unsettledRoundCount,
    updateBetAmount,
  };
}
