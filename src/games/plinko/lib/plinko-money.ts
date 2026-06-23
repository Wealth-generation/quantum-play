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

export function comparePlinkoDecimal(left: string, right: string) {
  const leftSource = left.trim();
  const rightSource = right.trim();
  const leftFractionDigits = leftSource.split(".")[1]?.length ?? 0;
  const rightFractionDigits = rightSource.split(".")[1]?.length ?? 0;
  const fractionDigits = Math.max(leftFractionDigits, rightFractionDigits);

  function toUnits(source: string) {
    const sign = source.startsWith("-") ? BigInt(-1) : BigInt(1);
    const unsigned = source.replace(/^[+-]/, "");
    const [integerPart = "0", fractionPart = ""] = unsigned.split(".");
    const normalizedInteger = integerPart || "0";
    const normalizedFraction = fractionPart.padEnd(fractionDigits, "0");

    return (
      (BigInt(normalizedInteger) * BigInt(10) ** BigInt(fractionDigits) +
        BigInt(normalizedFraction || "0")) *
      sign
    );
  }

  const leftUnits = toUnits(leftSource);
  const rightUnits = toUnits(rightSource);

  return leftUnits === rightUnits ? 0 : leftUnits > rightUnits ? 1 : -1;
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
