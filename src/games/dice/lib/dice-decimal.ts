type DecimalInput = number | string | Decimal;

const DECIMAL_SCALE_DIGITS = 12;
const DECIMAL_SCALE = BigInt("1000000000000");

export class Decimal {
  private constructor(private readonly units: bigint) {}

  static from(value: number | string | undefined, fallback = "0") {
    const nextValue = value === undefined || value === "" ? fallback : value;

    return new Decimal(parseDecimalUnits(nextValue));
  }

  minus(value: DecimalInput) {
    return new Decimal(this.units - Decimal.fromInput(value).units);
  }

  plus(value: DecimalInput) {
    return new Decimal(this.units + Decimal.fromInput(value).units);
  }

  times(value: DecimalInput) {
    return new Decimal(
      (this.units * Decimal.fromInput(value).units) / DECIMAL_SCALE,
    );
  }

  toNumber() {
    return Number(this.toString());
  }

  toString() {
    const negative = this.units < BigInt(0);
    const absoluteUnits = negative ? -this.units : this.units;
    const integerPart = absoluteUnits / DECIMAL_SCALE;
    const fractionalPart = absoluteUnits % DECIMAL_SCALE;
    const fraction = fractionalPart
      .toString()
      .padStart(DECIMAL_SCALE_DIGITS, "0")
      .replace(/0+$/, "");

    return `${negative ? "-" : ""}${integerPart.toString()}${
      fraction ? `.${fraction}` : ""
    }`;
  }

  private static fromInput(value: DecimalInput) {
    return value instanceof Decimal ? value : Decimal.from(value);
  }
}

function normalizeDecimalSource(value: number | string) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Decimal value must be finite.");
    }

    return value.toFixed(DECIMAL_SCALE_DIGITS);
  }

  const trimmed = value.trim();

  if (trimmed.toLowerCase().includes("e")) {
    const numericValue = Number(trimmed);

    if (!Number.isFinite(numericValue)) {
      throw new Error("Decimal value must be finite.");
    }

    return numericValue.toFixed(DECIMAL_SCALE_DIGITS);
  }

  return trimmed;
}

function parseDecimalUnits(value: number | string) {
  const source = normalizeDecimalSource(value);
  const sign = source.startsWith("-") ? BigInt(-1) : BigInt(1);
  const unsigned = source.replace(/^[+-]/, "");
  const [integerSource = "0", fractionSource = ""] = unsigned.split(".");
  const integerPart = integerSource || "0";
  const fractionPart = fractionSource
    .padEnd(DECIMAL_SCALE_DIGITS, "0")
    .slice(0, DECIMAL_SCALE_DIGITS);

  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(fractionSource)) {
    throw new Error("Decimal value is invalid.");
  }

  return (
    (BigInt(integerPart) * DECIMAL_SCALE + BigInt(fractionPart || "0")) * sign
  );
}
