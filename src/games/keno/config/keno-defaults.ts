// Frontend-only visual/default constants for Keno. The backend exposes no
// Keno config endpoint; these are presentation defaults and client-side
// fallbacks only. The backend remains authoritative for outcome and payout.

import type { KenoRiskLevel } from "../model/keno-types";

// Grid / selection constants (VERIFIED against prod 2026-06-21).
export const KENO_TILE_COUNT = 40; // internal indices 0..39
export const KENO_MAX_SELECTED = 10; // user selects 1..10 tiles
export const KENO_DRAW_COUNT = 10; // backend always draws exactly 10

// Bet bounds. MIN_BET is a UI floor; max bet = user balance (no fixed cap).
export const KENO_MIN_BET = "1.00";

// History strip length (matches roulette HISTORY_CAP).
export const KENO_HISTORY_CAP = 5;

// Animation timing constants (normal mode).
export const KENO_AUTOPICK_STEP_MS = 150; // ms between each auto-selected tile
export const KENO_AUTOPICK_TOTAL_MS = 1500; // 10 × KENO_AUTOPICK_STEP_MS
export const KENO_REVEAL_STEP_MS = 200; // ms between successive tile reveals
export const KENO_REVEAL_TOTAL_MS = 2000; // 10 × KENO_REVEAL_STEP_MS
export const KENO_POST_REVEAL_SETTLE_MS = 320; // wait after last tile before onFinaliseReveal
export const KENO_FINALISE_TO_SETTLED_MS = 600; // wait between onFinaliseReveal and onRevealSettled
export const KENO_DIAMOND_PULSE_MS = 2000; // one full glow-pulse cycle on hit tiles (unchanged in turbo)

// Animation timing constants (turbo mode).
// Turbo compresses within-round animation only; inter-round delay is unchanged.
export const KENO_AUTOPICK_STEP_TURBO_MS = 0; // instant auto-pick in turbo
export const KENO_REVEAL_STEP_TURBO_MS = 0; // instant reveal stagger in turbo
export const KENO_POST_REVEAL_SETTLE_TURBO_MS = 50; // floor: tile state visible before finalise
export const KENO_FINALISE_TO_SETTLED_TURBO_MS = 100; // minimal pause keeps result visible

// Risk levels — UPPERCASE strings matching the `risk` wire field.
export const KENO_RISK_LEVELS = ["CLASSIC", "LOW", "MEDIUM", "HIGH"] as const;

// ---------------------------------------------------------------------------
// Multiplier table (VERIFIED against prod 2026-06-21, DISPLAY-ONLY).
// Backend `payout` is authoritative for the realized payout amount.
//
// Structure: KENO_MULTIPLIERS[risk][pickCount][matchCount]
//   pickCount  = number of tiles the player selected (1..10)
//   matchCount = how many of those matched the draw (0..pickCount)
//
// Row length = pickCount + 1 (index 0 = 0 matches, index pickCount = all matches).
// Rows with a non-zero value at matchCount 0 (e.g. LOW pick=1 [0.7, 1.85])
// are correct — transcribed verbatim from verified prod data.
// ---------------------------------------------------------------------------

type MultipliersByPick = Partial<Record<number, number[]>>;
type MultiplierTable = Record<KenoRiskLevel, MultipliersByPick>;

export const KENO_MULTIPLIERS: MultiplierTable = {
  CLASSIC: {
    // Each row has pickCount + 1 entries: index = matchCount (0..pickCount).
    1: [0, 3.96],
    2: [0, 1.9, 4.5],
    3: [0, 1, 3.1, 10.4],
    4: [0, 0.8, 1.8, 5, 22.5],
    5: [0, 0.25, 1.4, 4.1, 16.5, 36],
    6: [0, 0, 1, 3.68, 7, 16.5, 40],
    7: [0, 0, 0.47, 3, 4.5, 14, 31, 60],
    8: [0, 0, 0, 2.2, 4, 13, 22, 55, 70],
    9: [0, 0, 0, 1.55, 3, 8, 15, 44, 60, 85],
    10: [0, 0, 0, 1.4, 2.25, 4.5, 8, 17, 50, 80, 100],
  },
  LOW: {
    1: [0.7, 1.85],
    2: [0, 2, 3.8],
    3: [0, 1.1, 1.38, 26],
    4: [0, 0, 2.2, 7.9, 90],
    5: [0, 0, 1.5, 4.2, 13, 300],
    6: [0, 0, 1.1, 2, 6.2, 100, 700],
    7: [0, 0, 1.1, 1.6, 3.5, 15, 225, 700],
    8: [0, 0, 1.1, 1.5, 2, 5.5, 39, 100, 800],
    9: [0, 0, 1.1, 1.3, 1.7, 2.5, 7.5, 50, 250, 1000],
    10: [0, 0, 1.1, 1.2, 1.3, 1.8, 3.5, 13, 50, 250, 1000],
  },
  MEDIUM: {
    1: [0.4, 2.75],
    2: [0, 1.8, 5.1],
    3: [0, 0, 2.8, 50],
    4: [0, 0, 1.7, 10, 100],
    5: [0, 0, 1.4, 4, 14, 390],
    6: [0, 0, 0, 3, 9, 180, 710],
    7: [0, 0, 0, 2, 7, 30, 400, 800],
    8: [0, 0, 0, 2, 4, 11, 67, 400, 900],
    9: [0, 0, 0, 2, 2.5, 5, 15, 100, 500, 1000],
    10: [0, 0, 0, 1.6, 2, 4, 7, 26, 100, 500, 1000],
  },
  HIGH: {
    1: [0, 3.96],
    2: [0, 0, 17.1],
    3: [0, 0, 0, 81.5],
    4: [0, 0, 0, 10, 259],
    5: [0, 0, 0, 4.5, 48, 450],
    6: [0, 0, 0, 0, 11, 350, 710],
    7: [0, 0, 0, 0, 7, 90, 400, 800],
    8: [0, 0, 0, 0, 5, 20, 270, 600, 900],
    9: [0, 0, 0, 0, 4, 11, 56, 500, 800, 1000],
    10: [0, 0, 0, 0, 3.5, 8, 13, 63, 500, 800, 1000],
  },
};

/**
 * Returns the multiplier row for a given risk level and pick count, or
 * undefined when pickCount 1..9 data has not been verified yet.
 *
 * Row length = pickCount + 1 (index 0 = 0 matches, index pickCount = all matches).
 */
export function getKenoMultiplierRow(
  risk: KenoRiskLevel,
  pickCount: number,
): number[] | undefined {
  return KENO_MULTIPLIERS[risk][pickCount];
}
