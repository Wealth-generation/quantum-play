import { formatDecimal } from "./dice-math";

const DEFAULT_MIN_BET = 1;
const DEFAULT_MAX_BET = 100000;

export interface DiceBetBounds {
  balance: number | null;
  effectiveMaxBet: number | null;
  effectiveMinBet: number;
  maxBetLimit: number;
}

export function normalizeMoneyInput(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const firstDot = normalized.indexOf(".");

  if (firstDot === -1) {
    return normalized;
  }

  return `${normalized.slice(0, firstDot + 1)}${normalized
    .slice(firstDot + 1)
    .replace(/\./g, "")}`;
}

export function normalizePercentInput(value: string) {
  return normalizeMoneyInput(value);
}

export function normalizeWholeNumberInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function isPositiveWholeNumber(value: string) {
  const numericValue = Number(value);

  return (
    value.trim() !== "" &&
    Number.isFinite(numericValue) &&
    Number.isInteger(numericValue) &&
    numericValue > 0
  );
}

export function normalizeAutoBetAmount(value: string) {
  return value.trim() === "" ? "" : formatDecimal(value);
}

export function normalizeBetAmountForRequest(value: string) {
  return formatDecimal(value || "0");
}

function finitePositiveOrDefault(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

export function createDiceBetBounds({
  balance,
  configMinBet,
  maxBetLimit,
}: {
  balance: string | undefined;
  configMinBet: number | undefined;
  maxBetLimit: number | undefined;
}): DiceBetBounds {
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

export function clampBetAmountToBounds(value: string, bounds: DiceBetBounds) {
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

  return formatDecimal(clampedValue);
}

export function normalizeBetAmountForRequestWithinBounds(
  value: string,
  bounds: DiceBetBounds,
) {
  return clampBetAmountToBounds(normalizeBetAmountForRequest(value), bounds);
}

export function getDiceBetAmountValidation(
  value: string,
  bounds: DiceBetBounds,
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
    return `Minimum bet is ${formatDecimal(bounds.effectiveMinBet)}.`;
  }

  if (bounds.balance !== null && numericValue > bounds.balance) {
    return "Insufficient balance.";
  }

  if (numericValue > bounds.maxBetLimit) {
    return `Max bet is ${formatDecimal(bounds.maxBetLimit)}.`;
  }

  if (numericValue > bounds.effectiveMaxBet) {
    return `Max bet is ${formatDecimal(bounds.effectiveMaxBet)}.`;
  }

  return null;
}
