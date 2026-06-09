"use client";

import * as React from "react";
import { useAuthSession } from "@/features/auth";
import { formatDecimal } from "../lib/dice-math";
import { normalizeAutoBetAmount, normalizeBetAmountForRequest } from "../lib/dice-input";
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

  const auto = useDiceAutoBet({
    above: dice.above,
    authenticated,
    betAmount: dice.betAmount,
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
    auto.autoRunning ||
    betMutation.isPending ||
    configQuery.isError;

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
    const normalized = normalizeAutoBetAmount(dice.betAmount);
    dice.normalizeCurrentBetAmount();

    if (activeMode === "auto") {
      auto.syncBetAmount(normalized || "0");
    }
  }

  function halfBetAmount() {
    dice.halfBetAmount();
    const nextValue = Number(dice.betAmount || "0") / 2;

    if (activeMode === "auto") {
      auto.syncBetAmount(formatDecimal(nextValue));
    }
  }

  function doubleBetAmount() {
    dice.doubleBetAmount();
    const nextValue = Number(dice.betAmount || "0") * 2;

    if (activeMode === "auto") {
      auto.syncBetAmount(formatDecimal(nextValue));
    }
  }

  async function handleBet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (betDisabled) {
      return;
    }

    try {
      const normalizedBetAmount = normalizeBetAmountForRequest(dice.betAmount);
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
