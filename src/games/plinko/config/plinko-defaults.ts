import {
  PLINKO_RISKS,
  PLINKO_ROWS,
  plinkoMultipliers,
} from "./plinko-multipliers";

export const PLINKO_DEFAULT_BET_AMOUNT = "1";
export const PLINKO_DEFAULT_MIN_BET = 1;
export const PLINKO_DEFAULT_MAX_BET = 100000;
export const PLINKO_MAX_BET_MODE_LIMIT = 500000;
export const PLINKO_DEFAULT_ROWS = 8;
export const PLINKO_DEFAULT_RISK = "LOW";
export const PLINKO_RECENT_RESULTS_LIMIT = 5;

export const plinkoLocalConfig = {
  defaultBetAmount: PLINKO_DEFAULT_BET_AMOUNT,
  defaultMaxBet: PLINKO_DEFAULT_MAX_BET,
  defaultMinBet: PLINKO_DEFAULT_MIN_BET,
  defaultRisk: PLINKO_DEFAULT_RISK,
  defaultRows: PLINKO_DEFAULT_ROWS,
  maxBetModeLimit: PLINKO_MAX_BET_MODE_LIMIT,
  multipliers: plinkoMultipliers,
  recentResultsLimit: PLINKO_RECENT_RESULTS_LIMIT,
  risks: PLINKO_RISKS,
  rows: PLINKO_ROWS,
} as const;
