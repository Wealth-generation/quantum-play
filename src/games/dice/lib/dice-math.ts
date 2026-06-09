import {
  DICE_MAX_THRESHOLD,
  DICE_MIN_THRESHOLD,
} from "../config/dice-defaults";
import { Decimal } from "./dice-decimal";

export function clampThreshold(value: number) {
  if (!Number.isFinite(value)) {
    return DICE_MIN_THRESHOLD;
  }

  return Math.min(Math.max(value, DICE_MIN_THRESHOLD), DICE_MAX_THRESHOLD);
}

export function roundThreshold(value: number) {
  return Math.round(clampThreshold(value) * 100) / 100;
}

export function calculateChance(threshold: number, above: boolean) {
  const clamped = roundThreshold(threshold);
  const chance = above ? 100 - clamped : clamped;

  return Math.max(Math.min(chance, 98), 2);
}

export function calculateMultiplier(
  threshold: number,
  above: boolean,
  rtp: number,
) {
  const chance = calculateChance(threshold, above);

  if (!Number.isFinite(rtp) || rtp <= 0 || chance <= 0) {
    return 0;
  }

  return rtp / (chance / 100);
}

export function calculateProfitOnWin(
  betAmount: string,
  threshold: number,
  above: boolean,
  rtp: number,
) {
  const multiplier = calculateMultiplier(threshold, above, rtp);
  const payout = Decimal.from(betAmount, "0").times(multiplier.toFixed(8));

  return payout.minus(betAmount || "0").toString();
}

export function formatDecimal(value: string | number, fractionDigits = 2) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0.00";
  }

  return numericValue.toFixed(fractionDigits);
}

export function normalizeBetAmount(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const firstDot = normalized.indexOf(".");

  if (firstDot === -1) {
    return normalized;
  }

  return `${normalized.slice(0, firstDot + 1)}${normalized
    .slice(firstDot + 1)
    .replace(/\./g, "")
    .slice(0, 2)}`;
}

export function isPositiveBetAmount(value: string) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue > 0;
}
