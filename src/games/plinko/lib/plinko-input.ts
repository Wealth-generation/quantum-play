import { formatPlinkoDecimal } from "./plinko-money";

const DEFAULT_MIN_BET = 1;
const DEFAULT_MAX_BET = 100000;

export interface PlinkoBetBounds {
  balance: number | null;
  effectiveMaxBet: number | null;
  effectiveMinBet: number;
  maxBetLimit: number;
}

function finitePositiveOrDefault(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

export function createPlinkoBetBounds({
  balance,
  configMinBet,
  maxBetLimit,
}: {
  balance: string | undefined;
  configMinBet: number | undefined;
  maxBetLimit: number | undefined;
}): PlinkoBetBounds {
  const parsedBalance = balance === undefined ? null : Number(balance);
  const safeBalance =
    parsedBalance !== null && Number.isFinite(parsedBalance)
      ? Math.max(parsedBalance, 0)
      : null;
  const safeMaxBetLimit = finitePositiveOrDefault(
    maxBetLimit,
    DEFAULT_MAX_BET,
  );
  const safeMinBet = Math.min(
    finitePositiveOrDefault(configMinBet, DEFAULT_MIN_BET),
    safeMaxBetLimit,
  );

  return {
    balance: safeBalance,
    effectiveMaxBet:
      safeBalance === null
        ? null
        : Math.max(Math.min(safeBalance, safeMaxBetLimit), 0),
    effectiveMinBet: safeMinBet,
    maxBetLimit: safeMaxBetLimit,
  };
}

export function clampPlinkoBetAmountToBounds(
  value: string,
  bounds: PlinkoBetBounds,
) {
  if (value.trim() === "") {
    return "";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  const upperBound = bounds.effectiveMaxBet ?? bounds.maxBetLimit;
  const clampedValue = Math.min(
    Math.max(numericValue, bounds.effectiveMinBet),
    upperBound,
  );

  return formatPlinkoDecimal(clampedValue);
}

export function normalizePlinkoBetAmountForRequestWithinBounds(
  value: string,
  bounds: PlinkoBetBounds,
) {
  return clampPlinkoBetAmountToBounds(formatPlinkoDecimal(value || "0"), bounds);
}

export function getPlinkoBetAmountValidation(
  value: string,
  bounds: PlinkoBetBounds,
) {
  if (value.trim() === "") {
    return "Enter a bet amount.";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "Enter a valid bet amount.";
  }

  if (bounds.effectiveMaxBet === null) {
    return "Balance is loading.";
  }

  if (numericValue < bounds.effectiveMinBet) {
    return `Minimum bet is ${formatPlinkoDecimal(bounds.effectiveMinBet)}.`;
  }

  if (bounds.balance !== null && numericValue > bounds.balance) {
    return "Insufficient balance.";
  }

  if (numericValue > bounds.maxBetLimit) {
    return `Max bet is ${formatPlinkoDecimal(bounds.maxBetLimit)}.`;
  }

  if (numericValue > bounds.effectiveMaxBet) {
    return `Max bet is ${formatPlinkoDecimal(bounds.effectiveMaxBet)}.`;
  }

  return null;
}
