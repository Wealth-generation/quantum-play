"use client";

import * as React from "react";
import { useAuthSession } from "@/features/auth";
import { useBalanceQuery } from "@/features/balance";
import { ROULETTE_MIN_TOTAL_BET } from "../config/roulette-defaults";
import { buildRouletteBetParams, hasAnyBet, totalBet } from "../lib/roulette-bets";
import { compareMoney, formatMoney } from "../lib/roulette-decimal";
import { useRouletteAutoBet } from "./use-roulette-auto-bet";
import { useRouletteBetMutation } from "./roulette-query";
import { useRouletteStore } from "./roulette-store";
import type { RouletteBetResult } from "./roulette-types";

export function useRouletteGameController() {
  const authSession = useAuthSession();
  const authenticated = authSession.data?.authenticated === true;
  const balanceQuery = useBalanceQuery(authenticated);
  const betMutation = useRouletteBetMutation();

  const placements = useRouletteStore((state) => state.placements);
  const selectedChip = useRouletteStore((state) => state.selectedChip);
  const hydrated = useRouletteStore((state) => state.hydrated);
  const hydrate = useRouletteStore((state) => state.hydrate);
  const setSelectedChip = useRouletteStore((state) => state.setSelectedChip);
  const placeStraight = useRouletteStore((state) => state.placeStraight);
  const placeColor = useRouletteStore((state) => state.placeColor);
  const placeDozen = useRouletteStore((state) => state.placeDozen);
  const placeColumn = useRouletteStore((state) => state.placeColumn);
  const placeParity = useRouletteStore((state) => state.placeParity);
  const placeHalf = useRouletteStore((state) => state.placeHalf);
  const clearBets = useRouletteStore((state) => state.clearBets);
  const addToHistory = useRouletteStore((state) => state.addToHistory);

  const [lastResult, setLastResult] = React.useState<RouletteBetResult | null>(
    null,
  );

  // Single result handler for both manual and auto-bet paths so history is
  // always recorded regardless of which bet mode is active.
  const handleResult = React.useCallback(
    (result: RouletteBetResult) => {
      setLastResult(result);
      addToHistory(result);
    },
    [setLastResult, addToHistory],
  );

  // Load the persisted placements after mount (avoids SSR hydration mismatch).
  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const total = totalBet(placements);
  const hasBets = hasAnyBet(placements);
  const balance = balanceQuery.data?.gamePoints;

  const auto = useRouletteAutoBet({
    authenticated,
    balance,
    balanceLoading: balanceQuery.isLoading,
    onResult: handleResult,
    placeBet: betMutation.mutateAsync,
  });
  const insufficientBalance =
    authenticated &&
    balance !== undefined &&
    hasBets &&
    compareMoney(total, balance) > 0;
  const belowMinimum =
    hasBets && compareMoney(total, ROULETTE_MIN_TOTAL_BET) < 0;

  const betValidation: string | null = !authenticated
    ? "Sign in to place a bet."
    : !hasBets
      ? "Place at least one chip."
      : balanceQuery.isLoading
        ? "Balance is loading."
        : belowMinimum
          ? `Minimum bet is ${formatMoney(ROULETTE_MIN_TOTAL_BET)}.`
          : insufficientBalance
            ? "Insufficient balance."
            : null;

  const betDisabled =
    betValidation !== null ||
    betMutation.isPending ||
    balanceQuery.isError;

  const errorMessage =
    betMutation.isError && betMutation.error instanceof Error
      ? betMutation.error.message
      : betMutation.isError
        ? "Roulette bet failed."
        : null;

  async function handleBet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (betDisabled) {
      return;
    }

    try {
      const result = await betMutation.mutateAsync({
        params: buildRouletteBetParams(placements),
      });
      handleResult(result);
    } catch {
      // The mutation error state renders the safe error message below.
    }
  }

  return {
    authenticated,
    balanceQuery,
    betDisabled,
    betMutation,
    betValidation,
    clearBets,
    errorMessage,
    handleBet,
    hydrated,
    lastResult,
    placeColor,
    placeColumn,
    placeDozen,
    placeHalf,
    placeParity,
    placeStraight,
    placements,
    selectedChip,
    setSelectedChip,
    totalBet: total,
    // Auto mode (number of bets + ∞), reusing the shared auto-bet runner.
    autoBetCountDraft: auto.autoBetCountDraft,
    autoBetInfinite: auto.autoBetInfinite,
    autoErrorMessage: auto.autoErrorMessage,
    autoRunning: auto.autoRunning,
    autoStartDisabled: auto.autoStartDisabled,
    startAutoBet: auto.startAutoBet,
    stopAutoBet: auto.stopAutoBet,
    toggleAutoBetInfinite: auto.toggleAutoBetInfinite,
    updateAutoBetCount: auto.updateAutoBetCount,
  };
}
