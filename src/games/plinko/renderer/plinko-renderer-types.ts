import type { PlinkoBetResult } from "../model";
import type { PlinkoRisk, PlinkoRows } from "../config";

export interface PlinkoRendererBoardState {
  bucketMultipliers: readonly number[];
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
}

export interface PlinkoRendererRound {
  id: string;
  result: PlinkoBetResult;
}

export type PlinkoRendererSettlementReason =
  | "cancelled"
  | "fallback"
  | "visual";

export interface PlinkoRendererOptions {
  board?: PlinkoRendererBoardState;
  onRoundSettled?: (
    round: PlinkoRendererRound,
    reason: PlinkoRendererSettlementReason,
  ) => void;
  turboEnabled?: boolean;
}

export interface PlinkoRenderer {
  destroy: () => void;
  resize: () => void;
  setOptions: (options: PlinkoRendererOptions) => void;
  visualizeRound: (round: PlinkoRendererRound) => void;
}
