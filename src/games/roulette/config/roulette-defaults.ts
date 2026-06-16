// Frontend-only visual/default constants for Roulette. The backend exposes NO
// roulette config endpoint, so these are presentation defaults and client-side
// fallbacks only — the backend remains authoritative for outcome and payout.

export type RouletteColor = "red" | "black" | "green";
export type RouletteBetColor = "red" | "black";

// European single-zero wheel: 0 is green; the standard red set is fixed.
const RED_NUMBERS = new Set<number>([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export const ROULETTE_MIN_NUMBER = 0;
export const ROULETTE_MAX_NUMBER = 36;

export function getRouletteColor(value: number): RouletteColor {
  if (value === 0) {
    return "green";
  }

  return RED_NUMBERS.has(value) ? "red" : "black";
}

// Numbers 0..36 in numeric order, used to render the straight-bet grid.
export const ROULETTE_NUMBERS: number[] = Array.from(
  { length: ROULETTE_MAX_NUMBER - ROULETTE_MIN_NUMBER + 1 },
  (_, index) => ROULETTE_MIN_NUMBER + index,
);

// Chip denominations offered in the tray. Frontend presentation only.
export const ROULETTE_CHIP_DENOMINATIONS = [1, 5, 25, 100, 500] as const;
export const ROULETTE_DEFAULT_CHIP = ROULETTE_CHIP_DENOMINATIONS[0];

// Client-side bet bounds fallback (no backend config endpoint exists).
export const ROULETTE_MIN_TOTAL_BET = 1;
export const ROULETTE_MAX_PAYOUT = 500000;

// Display-only payout ratios (winnings:stake) for the in-scope bet types.
export const ROULETTE_DISPLAY_PAYOUTS = {
  straight: "35:1",
  color: "1:1",
} as const;

// Backend color encoding for `colorValues` entries.
// VERIFIED against prod payload (2026-06-15): colorValues entries use an
// UPPERCASE color code — { color: "RED" | "BLACK", amount }. This map is the
// single source of that encoding; do not change without a fresh captured sample.
export const ROULETTE_COLOR_CODES: Record<RouletteBetColor, string> = {
  red: "RED",
  black: "BLACK",
};
