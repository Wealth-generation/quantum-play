// Frontend-only visual/default constants for Roulette. The backend exposes NO
// roulette config endpoint, so these are presentation defaults and client-side
// fallbacks only — the backend remains authoritative for outcome and payout.

import type { StaticImageData } from "next/image";
import coin1 from "@/shared/assets/games/roulette/images/coin-1.webp";
import coin5 from "@/shared/assets/games/roulette/images/coin-5.webp";
import coin25 from "@/shared/assets/games/roulette/images/coin-25.webp";
import coin50 from "@/shared/assets/games/roulette/images/coin-50.webp";
import coin250 from "@/shared/assets/games/roulette/images/coin-250.webp";
import coin500 from "@/shared/assets/games/roulette/images/coin-500.webp";
import coin2000 from "@/shared/assets/games/roulette/images/coin-2000.webp";
import coin5000 from "@/shared/assets/games/roulette/images/coin-5000.webp";
import coin25000 from "@/shared/assets/games/roulette/images/coin-25000.webp";
import coin50000 from "@/shared/assets/games/roulette/images/coin-50000.webp";

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

// Chip tray denominations. `value` is the real stake placed per chip; `label` is
// the short display text (already baked into the coin art, also used for a11y and
// the Chip Value readout); `image` is the optimized coin webp. Frontend-only.
export interface RouletteChip {
  value: number;
  label: string;
  image: StaticImageData;
}

export const ROULETTE_CHIPS: readonly RouletteChip[] = [
  { value: 1, label: "1", image: coin1 },
  { value: 5, label: "5", image: coin5 },
  { value: 25, label: "25", image: coin25 },
  { value: 50, label: "50", image: coin50 },
  { value: 250, label: "250", image: coin250 },
  { value: 500, label: "500", image: coin500 },
  { value: 2000, label: "2K", image: coin2000 },
  { value: 5000, label: "5K", image: coin5000 },
  { value: 25000, label: "25K", image: coin25000 },
  { value: 50000, label: "50K", image: coin50000 },
];

export const ROULETTE_CHIP_DENOMINATIONS = ROULETTE_CHIPS.map(
  (chip) => chip.value,
);
export const ROULETTE_DEFAULT_CHIP = ROULETTE_CHIPS[0].value;

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
