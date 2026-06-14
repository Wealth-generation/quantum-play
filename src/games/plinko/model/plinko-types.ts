import type {
  PlinkoMultiplierTable,
  PlinkoRisk,
  PlinkoRows,
} from "../config";

export type PlinkoPathStep = 0 | 1;

export interface PlinkoConfig {
  maxBet: number;
  minBet: number;
  multipliers: PlinkoMultiplierTable;
  risks: readonly PlinkoRisk[];
  rows: readonly PlinkoRows[];
}

export interface PlinkoBetRequest {
  betSize: number | string;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
}

export interface PlinkoResultContractWarning {
  code:
    | "BUCKET_OUT_OF_RANGE"
    | "INVALID_PATH_STEP"
    | "MULTIPLIER_MISMATCH"
    | "RESULT_LENGTH_MISMATCH";
  message: string;
}

export interface PlinkoBetResult {
  bucketIndex: number;
  contractWarnings: PlinkoResultContractWarning[];
  createdAt: string;
  betId: string;
  betSize: string;
  expectedMultiplier: number | null;
  multiplier: number;
  payout: string;
  results: PlinkoPathStep[];
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
}
