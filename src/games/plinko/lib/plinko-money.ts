export function formatPlinkoDecimal(value: number | string, fractionDigits = 2) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0.00";
  }

  return numericValue.toFixed(fractionDigits);
}

export function addPlinkoDecimal(
  left: number | string,
  right: number | string,
) {
  return formatPlinkoDecimal(Number(left || "0") + Number(right || "0"));
}

export function subtractPlinkoDecimal(
  left: number | string,
  right: number | string,
) {
  return formatPlinkoDecimal(Number(left || "0") - Number(right || "0"));
}

export function normalizePlinkoMoneyInput(value: string) {
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
