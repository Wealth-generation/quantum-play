import {
  ROULETTE_COLOR_CODES,
  ROULETTE_MAX_NUMBER,
  ROULETTE_MIN_NUMBER,
  type RouletteBetColor,
} from "../config/roulette-defaults";
import type {
  ColumnBetKey,
  DozenBetKey,
  HalfBetKey,
  ParityBetKey,
  RouletteBetParams,
} from "../model/roulette-types";
import { formatMoney, isPositiveMoney, sumMoney } from "./roulette-decimal";

// Runtime chip-placement model (the Zustand store is its source of truth).
// Keys are kept JSON-serializable for the localStorage persistence layer.
export interface RoulettePlacements {
  // straight number (0..36, as string key) -> total chip amount
  straight: Record<string, string>;
  // bet color -> total chip amount
  color: Partial<Record<RouletteBetColor, string>>;
  // outside bets
  dozen: Partial<Record<DozenBetKey, string>>;
  column: Partial<Record<ColumnBetKey, string>>;
  parity: Partial<Record<ParityBetKey, string>>;
  half: Partial<Record<HalfBetKey, string>>;
}

export const EMPTY_PLACEMENTS: RoulettePlacements = {
  straight: {},
  color: {},
  dozen: {},
  column: {},
  parity: {},
  half: {},
};

export function isStraightNumber(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= ROULETTE_MIN_NUMBER &&
    value <= ROULETTE_MAX_NUMBER
  );
}

export function totalBet(placements: RoulettePlacements): string {
  return sumMoney([
    ...Object.values(placements.straight),
    ...Object.values(placements.color),
    ...Object.values(placements.dozen),
    ...Object.values(placements.column),
    ...Object.values(placements.parity),
    ...Object.values(placements.half),
  ]);
}

export function hasAnyBet(placements: RoulettePlacements): boolean {
  return isPositiveMoney(totalBet(placements));
}

// Returns the set of straight-number cells (1–36, 0 excluded) covered by an
// outside bet. Used by the board components to drive hover highlighting.
export function getOutsideBetNumbers(
  category: "dozen" | "half" | "parity" | "column",
  key: DozenBetKey | HalfBetKey | ParityBetKey | ColumnBetKey,
): ReadonlySet<number> {
  switch (`${category}:${key}`) {
    case "dozen:FIRST":   return new Set(Array.from({ length: 12 }, (_, i) => i + 1));
    case "dozen:SECOND":  return new Set(Array.from({ length: 12 }, (_, i) => i + 13));
    case "dozen:THIRD":   return new Set(Array.from({ length: 12 }, (_, i) => i + 25));
    case "half:LOW":      return new Set(Array.from({ length: 18 }, (_, i) => i + 1));
    case "half:HIGH":     return new Set(Array.from({ length: 18 }, (_, i) => i + 19));
    case "parity:EVEN":   return new Set(Array.from({ length: 18 }, (_, i) => (i + 1) * 2));
    case "parity:ODD":    return new Set(Array.from({ length: 18 }, (_, i) => i * 2 + 1));
    case "column:TOP":    return new Set(Array.from({ length: 12 }, (_, i) => (i + 1) * 3));
    case "column:MIDDLE": return new Set(Array.from({ length: 12 }, (_, i) => (i + 1) * 3 - 1));
    case "column:BOTTOM": return new Set(Array.from({ length: 12 }, (_, i) => (i + 1) * 3 - 2));
    default:              return new Set();
  }
}

// Build the backend `params` object. ALL 10 arrays are always present; the 8
// out-of-scope bet types are emitted empty for this slice.
export function buildRouletteBetParams(
  placements: RoulettePlacements,
): RouletteBetParams {
  // VERIFIED against prod payload (2026-06-15): straight entry is
  // `{ straightNumber, amount }`, amount a string. The filter runs on `amount`
  // (positive money), NEVER on the number key — so `straightNumber: 0` is kept
  // (a chip on pocket 0 with a positive amount survives).
  const straightValues = Object.entries(placements.straight)
    .filter(([, amount]) => isPositiveMoney(amount))
    .map(([numberKey, amount]) => ({
      straightNumber: Number(numberKey),
      amount: formatMoney(amount),
    }));

  // VERIFIED against prod payload (2026-06-15): color entry is
  // `{ color, amount }` with color an UPPERCASE "RED"/"BLACK" string (see
  // ROULETTE_COLOR_CODES) and amount a string.
  const colorValues = (
    Object.entries(placements.color) as Array<[RouletteBetColor, string]>
  )
    .filter(([, amount]) => isPositiveMoney(amount))
    .map(([color, amount]) => ({
      color: ROULETTE_COLOR_CODES[color],
      amount: formatMoney(amount),
    }));

  // VERIFIED against prod payload (2026-06-17): dozen entry is
  // `{ dozen: "FIRST"|"SECOND"|"THIRD", amount }`, amount a string.
  const dozenValues = (
    Object.entries(placements.dozen) as Array<[DozenBetKey, string]>
  )
    .filter(([, amount]) => isPositiveMoney(amount))
    .map(([dozen, amount]) => ({ dozen, amount: formatMoney(amount) }));

  // VERIFIED: column entry is `{ column: "TOP"|"MIDDLE"|"BOTTOM", amount }`.
  // TOP = row with 3,6,9…36; MIDDLE = 2,5,8…35; BOTTOM = 1,4,7…34.
  const columnValues = (
    Object.entries(placements.column) as Array<[ColumnBetKey, string]>
  )
    .filter(([, amount]) => isPositiveMoney(amount))
    .map(([column, amount]) => ({ column, amount: formatMoney(amount) }));

  // VERIFIED: parity entry is `{ parity: "EVEN"|"ODD", amount }`.
  const parityValues = (
    Object.entries(placements.parity) as Array<[ParityBetKey, string]>
  )
    .filter(([, amount]) => isPositiveMoney(amount))
    .map(([parity, amount]) => ({ parity, amount: formatMoney(amount) }));

  // VERIFIED: half entry is `{ half: "LOW"|"HIGH", amount }`.
  const halfValues = (
    Object.entries(placements.half) as Array<[HalfBetKey, string]>
  )
    .filter(([, amount]) => isPositiveMoney(amount))
    .map(([half, amount]) => ({ half, amount: formatMoney(amount) }));

  return {
    straightValues,
    splitValues: [],
    streetValues: [],
    cornerValues: [],
    doubleStreetValues: [],
    columnValues,
    dozenValues,
    colorValues,
    parityValues,
    halfValues,
  };
}
