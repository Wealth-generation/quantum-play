// Keno-local decimal helpers for money. Money values arrive from the backend
// as strings and must never be handled with parseFloat/Number math.
//
// Uses a hand-rolled BigInt decimal (re-derived from dice-decimal.ts and
// roulette-decimal.ts precedents; not imported from either game module).
// big.js is not used: it ships no type declarations and adding a dependency is
// approval-gated. tsconfig targets ES2017 so BigInt literals (e.g. 10n) are
// unavailable; use the BigInt() constructor throughout.
//
// The response `multiplier` field is a JS number used for display only;
// these helpers operate on string amounts (betSize, payout) only.

const SCALE = 8;
const SCALE_FACTOR = BigInt("100000000"); // 10 ** 8
const ROUND_FACTOR = BigInt("1000000"); // 10 ** (SCALE - 2), for 2dp rounding
const ZERO = BigInt(0);
const TWO = BigInt(2);
const HUNDRED = BigInt(100);

function parseUnits(value: string | number): bigint | null {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  let source = typeof value === "number" ? String(value) : value.trim();

  if (source === "") {
    return null;
  }

  if (/[eE]/.test(source)) {
    const numeric = Number(source);

    if (!Number.isFinite(numeric)) {
      return null;
    }

    source = numeric.toFixed(SCALE);
  }

  const negative = source.startsWith("-");
  const unsigned = source.replace(/^[+-]/, "");
  const [integerPart = "", fractionPart = ""] = unsigned.split(".");

  if (integerPart === "" && fractionPart === "") {
    return null;
  }

  const integerDigits = integerPart === "" ? "0" : integerPart;

  if (
    !/^\d+$/.test(integerDigits) ||
    (fractionPart !== "" && !/^\d+$/.test(fractionPart))
  ) {
    return null;
  }

  const fraction = fractionPart.padEnd(SCALE, "0").slice(0, SCALE);
  const units = BigInt(integerDigits) * SCALE_FACTOR + BigInt(fraction || "0");

  return negative ? -units : units;
}

function unitsOrZero(value: string | number): bigint {
  return parseUnits(value) ?? ZERO;
}

function formatUnits(units: bigint): string {
  const negative = units < ZERO;
  const absolute = negative ? -units : units;
  // Round to 2 decimal places (half-up).
  const rounded = (absolute + ROUND_FACTOR / TWO) / ROUND_FACTOR;
  const integerPart = rounded / HUNDRED;
  const fraction = (rounded % HUNDRED).toString().padStart(2, "0");

  return `${negative ? "-" : ""}${integerPart.toString()}.${fraction}`;
}

export function isValidMoney(value: string | number): boolean {
  return parseUnits(value) !== null;
}

export function isPositiveMoney(value: string | number): boolean {
  const units = parseUnits(value);

  return units !== null && units > ZERO;
}

export function addMoney(a: string | number, b: string | number): string {
  return formatUnits(unitsOrZero(a) + unitsOrZero(b));
}

export function formatMoney(value: string | number): string {
  return formatUnits(unitsOrZero(value));
}

export function compareMoney(a: string | number, b: string | number): number {
  const left = unitsOrZero(a);
  const right = unitsOrZero(b);

  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
}
