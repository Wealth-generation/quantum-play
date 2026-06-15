import {
  ROULETTE_COLOR_CODES,
  ROULETTE_MAX_NUMBER,
  ROULETTE_MIN_NUMBER,
  type RouletteBetColor,
} from "../config/roulette-defaults";
import type { RouletteBetParams } from "../model/roulette-types";
import { formatMoney, isPositiveMoney, sumMoney } from "./roulette-decimal";

// Runtime chip-placement model (the Zustand store is its source of truth).
// Keys are kept JSON-serializable for the localStorage persistence layer.
export interface RoulettePlacements {
  // straight number (0..36, as string key) -> total chip amount
  straight: Record<string, string>;
  // bet color -> total chip amount
  color: Partial<Record<RouletteBetColor, string>>;
}

export const EMPTY_PLACEMENTS: RoulettePlacements = {
  straight: {},
  color: {},
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
  ]);
}

export function hasAnyBet(placements: RoulettePlacements): boolean {
  return isPositiveMoney(totalBet(placements));
}

// Build the backend `params` object. ALL 10 arrays are always present; the 8
// out-of-scope bet types are emitted empty for this slice.
export function buildRouletteBetParams(
  placements: RoulettePlacements,
): RouletteBetParams {
  const straightValues = Object.entries(placements.straight)
    .filter(([, amount]) => isPositiveMoney(amount))
    .map(([numberKey, amount]) => ({
      straightNumber: Number(numberKey),
      amount: formatMoney(amount),
    }));

  const colorValues = (
    Object.entries(placements.color) as Array<[RouletteBetColor, string]>
  )
    .filter(([, amount]) => isPositiveMoney(amount))
    .map(([color, amount]) => ({
      color: ROULETTE_COLOR_CODES[color],
      amount: formatMoney(amount),
    }));

  return {
    straightValues,
    splitValues: [],
    streetValues: [],
    cornerValues: [],
    doubleStreetValues: [],
    columnValues: [],
    dozenValues: [],
    colorValues,
    parityValues: [],
    halfValues: [],
  };
}
