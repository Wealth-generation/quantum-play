// Roulette-local decimal helpers for money. Money values arrive from the
// backend as strings and must never be handled with parseFloat/Number math.
//
// Decision note: the supplied prompt asked for "Big.js wrappers", but `big.js`
// ships no type declarations and `@types/big.js` is not installed — importing it
// fails the strict TypeScript build, and adding a dependency is approval-gated.
// The Dice module sets the precedent with a hand-rolled, game-local BigInt
// decimal (`src/games/dice/lib/dice-decimal.ts`). This mirrors that approach
// (re-derived, not imported from Dice) so the build stays green without a new
// dependency. A truly generic money helper could later live in `src/shared/`,
// but extracting one now would touch the Dice module (out of scope) — flagged in
// the task artifact.

// `tsconfig` targets ES2017, so BigInt literals (e.g. `10n`) are unavailable;
// use the BigInt(...) constructor, matching the Dice decimal helper.
const SCALE = 8;
const SCALE_FACTOR = BigInt("100000000"); // 10 ** 8
const ROUND_FACTOR = BigInt("1000000"); // 10 ** (SCALE - 2)
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

  // Normalize scientific notation through Number, then to a fixed string.
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

  if (!/^\d+$/.test(integerDigits) || (fractionPart !== "" && !/^\d+$/.test(fractionPart))) {
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
  // Round to 2 decimals (half-up).
  const rounded = (absolute + ROUND_FACTOR / TWO) / ROUND_FACTOR;
  const integerPart = rounded / HUNDRED;
  const fraction = (rounded % HUNDRED).toString().padStart(2, "0");

  return `${negative ? "-" : ""}${integerPart.toString()}.${fraction}`;
}

export function isValidMoney(value: string | number): boolean {
  return parseUnits(value) !== null;
}

export function addMoney(a: string | number, b: string | number): string {
  return formatUnits(unitsOrZero(a) + unitsOrZero(b));
}

export function subtractMoney(a: string | number, b: string | number): string {
  return formatUnits(unitsOrZero(a) - unitsOrZero(b));
}

export function sumMoney(values: Array<string | number>): string {
  return formatUnits(
    values.reduce<bigint>((total, value) => total + unitsOrZero(value), ZERO),
  );
}

export function formatMoney(value: string | number): string {
  return formatUnits(unitsOrZero(value));
}

export function isPositiveMoney(value: string | number): boolean {
  const units = parseUnits(value);

  return units !== null && units > ZERO;
}

export function compareMoney(a: string | number, b: string | number): number {
  const left = unitsOrZero(a);
  const right = unitsOrZero(b);

  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}
