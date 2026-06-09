"use client";

import * as React from "react";
import { useAuthSession } from "@/features/auth";
import { useBalanceQuery } from "@/features/balance";
import { formatDecimal } from "../lib/dice-math";
import {
  clampBetAmountToBounds,
  createDiceBetBounds,
  getDiceBetAmountValidation,
  normalizeAutoBetAmount,
  normalizeBetAmountForRequestWithinBounds,
} from "../lib/dice-input";
import {
  useDiceConfigQuery,
  useManualDiceBetMutation,
} from "./dice-query";
import { useDiceAutoBet } from "./use-dice-auto-bet";
import { useManualDice } from "./use-manual-dice";

export type DiceMode = "manual" | "auto";

export function useDiceGameController() {
  const authSession = useAuthSession();
  const configQuery = useDiceConfigQuery();
  const betMutation = useManualDiceBetMutation();
  const dice = useManualDice(configQuery.data);
  const [activeMode, setActiveMode] = React.useState<DiceMode>("manual");
  const authenticated = authSession.data?.authenticated === true;
  const balanceQuery = useBalanceQuery(authenticated);
  const betBounds = React.useMemo(
    () =>
      createDiceBetBounds({
        balance: balanceQuery.data?.gamePoints,
        configMaxBet: configQuery.data?.maxBet,
        configMinBet: configQuery.data?.minBet,
      }),
    [
      balanceQuery.data?.gamePoints,
      configQuery.data?.maxBet,
      configQuery.data?.minBet,
    ],
  );
  const betAmountValidation = getDiceBetAmountValidation(
    dice.betAmount,
    betBounds,
  );

  const auto = useDiceAutoBet({
    above: dice.above,
    authenticated,
    betAmount: dice.betAmount,
    betBounds,
    betAmountValidation,
    canBet: dice.canBet,
    configError: configQuery.isError,
    mutationPending: betMutation.isPending,
    applyResult: dice.applyResult,
    placeBet: betMutation.mutateAsync,
    threshold: dice.threshold,
    updateBetAmount: dice.updateBetAmount,
  });

  const betDisabled =
    activeMode !== "manual" ||
    !authenticated ||
    !dice.canBet ||
    betAmountValidation !== null ||
    auto.autoRunning ||
    betMutation.isPending ||
    configQuery.isError ||
    balanceQuery.isLoading ||
    balanceQuery.isError;

  function updateMode(mode: DiceMode) {
    if (auto.autoRunning) {
      return;
    }

    setActiveMode(mode);
  }

  function updateBetAmount(value: string) {
    dice.updateBetAmount(value);

    if (activeMode === "auto") {
      auto.syncBetAmount(value || "0");
    }
  }

  function normalizeBetAmount() {
    const normalized = clampBetAmountToBounds(
      normalizeAutoBetAmount(dice.betAmount),
      betBounds,
    );
    dice.updateBetAmount(normalized);

    if (activeMode === "auto") {
      auto.syncBetAmount(normalized || "0");
    }
  }

  function halfBetAmount() {
    const nextValue = clampBetAmountToBounds(
      formatDecimal(Number(dice.betAmount || "0") / 2),
      betBounds,
    );
    dice.updateBetAmount(nextValue);

    if (activeMode === "auto") {
      auto.syncBetAmount(nextValue || "0");
    }
  }

  function doubleBetAmount() {
    const nextValue = clampBetAmountToBounds(
      formatDecimal(Number(dice.betAmount || "0") * 2),
      betBounds,
    );
    dice.updateBetAmount(nextValue);

    if (activeMode === "auto") {
      auto.syncBetAmount(nextValue || "0");
    }
  }

  async function handleBet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (betDisabled) {
      return;
    }

    try {
      if (betAmountValidation !== null) {
        return;
      }

      const normalizedBetAmount = normalizeBetAmountForRequestWithinBounds(
        dice.betAmount,
        betBounds,
      );
      dice.updateBetAmount(normalizedBetAmount);

      const result = await betMutation.mutateAsync({
        above: true,
        betSize: normalizedBetAmount,
        threshold: dice.threshold,
      });
      dice.applyResult(result);
    } catch {
      // The mutation state renders the safe error message below.
    }
  }

  return {
    activeMode,
    authenticated,
    auto,
    balanceQuery,
    betAmountValidation,
    betBounds,
    betDisabled,
    betMutation,
    configQuery,
    dice,
    doubleBetAmount,
    halfBetAmount,
    handleBet,
    normalizeBetAmount,
    updateBetAmount,
    updateMode,
  };
}
