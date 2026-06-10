"use client";

import * as React from "react";
import {
  DICE_DEFAULT_BET_AMOUNT,
  DICE_DEFAULT_THRESHOLD,
  DICE_RECENT_RESULTS_LIMIT,
} from "../config/dice-defaults";
import {
  calculateChance,
  calculateMultiplier,
  calculateProfitOnWin,
  formatDecimal,
  isPositiveBetAmount,
  normalizeBetAmount,
  roundThreshold,
} from "../lib/dice-math";
import type { DiceBetResult, DiceConfig } from "./dice-types";

export interface DiceRecentResult {
  id: string;
  didWin: boolean;
  randomValue: number;
}

export function useManualDice(config: DiceConfig | undefined) {
  const [betAmount, setBetAmount] = React.useState(DICE_DEFAULT_BET_AMOUNT);
  const [threshold, setThreshold] = React.useState(DICE_DEFAULT_THRESHOLD);
  const [lastResult, setLastResult] = React.useState<DiceBetResult | null>(null);
  const [recentResults, setRecentResults] = React.useState<DiceRecentResult[]>(
    [],
  );

  const rtp = config?.rtp ?? 0.99;
  const above = true;
  const chance = calculateChance(threshold, above);
  const multiplier = calculateMultiplier(threshold, above, rtp);
  const profitOnWin = calculateProfitOnWin(betAmount || "0", threshold, above, rtp);
  const canBet = isPositiveBetAmount(betAmount);

  function updateBetAmount(value: string) {
    setBetAmount(normalizeBetAmount(value));
  }

  function normalizeCurrentBetAmount() {
    setBetAmount((current) =>
      current.trim() === "" ? "" : formatDecimal(current),
    );
  }

  function halfBetAmount() {
    const nextValue = Number(betAmount || "0") / 2;
    setBetAmount(formatDecimal(nextValue));
  }

  function doubleBetAmount() {
    const nextValue = Number(betAmount || "0") * 2;
    setBetAmount(formatDecimal(nextValue));
  }

  function updateThreshold(value: number) {
    setThreshold(roundThreshold(value));
  }

  function mirrorThreshold() {
    setThreshold((current) => roundThreshold(100 - current));
  }

  function applyResult(result: DiceBetResult) {
    setLastResult(result);
    setRecentResults((current) =>
      [
        ...current,
        {
          id: `${result.betId}-${result.createdAt}`,
          didWin: result.didWin,
          randomValue: result.randomValue,
        },
      ].slice(-DICE_RECENT_RESULTS_LIMIT),
    );
  }

  return {
    above,
    betAmount,
    canBet,
    chance,
    halfBetAmount,
    doubleBetAmount,
    lastResult,
    multiplier,
    profitOnWin,
    recentResults,
    mirrorThreshold,
    threshold,
    updateBetAmount,
    normalizeCurrentBetAmount,
    updateThreshold,
    applyResult,
  };
}
