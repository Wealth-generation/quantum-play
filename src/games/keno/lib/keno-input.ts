// Keno-local bet-amount input normalisation. Pure string/number helpers;
// no React, no Zustand store. Operates on string amounts only.
// Mirrors the precedent established by dice-input.ts (re-derived, not imported).

import { KENO_MIN_BET } from "../config/keno-defaults";
import { compareMoney, formatMoney, isPositiveMoney } from "./keno-decimal";

/**
 * Strips all characters that cannot form a valid decimal number, keeping at
 * most one decimal point. Safe to call on raw <input> onChange values.
 */
export function normalizeMoneyInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const dotIndex = cleaned.indexOf(".");

  if (dotIndex === -1) {
    return cleaned;
  }

  return (
    cleaned.slice(0, dotIndex + 1) +
    cleaned.slice(dotIndex + 1).replace(/\./g, "")
  );
}

/**
 * Format a string amount to canonical 2dp representation for display / request.
 * Returns "0.00" for empty, non-numeric, or zero inputs.
 */
export function formatBetAmount(value: string): string {
  return formatMoney(value);
}

/**
 * Halve the bet amount (floor to 2dp, minimum KENO_MIN_BET if result > 0).
 * Returns KENO_MIN_BET when the result would be below it but input was positive.
 */
export function halfBetAmount(betSize: string): string {
  if (!isPositiveMoney(betSize)) {
    return KENO_MIN_BET;
  }

  const numeric = Number(betSize);

  if (!Number.isFinite(numeric)) {
    return KENO_MIN_BET;
  }

  const halved = formatMoney(Math.floor((numeric / 2) * 100) / 100);

  return compareMoney(halved, KENO_MIN_BET) >= 0 ? halved : KENO_MIN_BET;
}

/**
 * Double the bet amount (2dp formatted). Does not clamp to balance — the
 * controller or UI layer must apply balance clamping before submission.
 */
export function doubleBetAmount(betSize: string): string {
  if (!isPositiveMoney(betSize)) {
    return formatMoney(KENO_MIN_BET);
  }

  const numeric = Number(betSize);

  if (!Number.isFinite(numeric)) {
    return formatMoney(KENO_MIN_BET);
  }

  return formatMoney(numeric * 2);
}

/**
 * Set bet amount to the full available balance (formatted 2dp).
 * Returns KENO_MIN_BET when balance is undefined, empty, or non-positive.
 */
export function maxBetAmount(balance: string | undefined): string {
  if (balance === undefined || !isPositiveMoney(balance)) {
    return KENO_MIN_BET;
  }

  return formatMoney(balance);
}

/**
 * Clamp a bet amount to [KENO_MIN_BET, balance]. Used before placing a request.
 * - If balance is undefined, clamps only to KENO_MIN_BET floor.
 * - If the result is non-positive, returns KENO_MIN_BET.
 */
export function clampBetAmount(
  betSize: string,
  balance: string | undefined,
): string {
  const formatted = formatMoney(betSize);

  if (compareMoney(formatted, KENO_MIN_BET) < 0) {
    return KENO_MIN_BET;
  }

  if (balance !== undefined && compareMoney(formatted, balance) > 0) {
    return formatMoney(balance);
  }

  return formatted;
}
