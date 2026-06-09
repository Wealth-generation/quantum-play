import { formatDecimal } from "./dice-math";

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
