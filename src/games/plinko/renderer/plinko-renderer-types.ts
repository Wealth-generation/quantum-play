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

export interface PlinkoRendererOptions {
  board?: PlinkoRendererBoardState;
  onRoundSettled?: (round: PlinkoRendererRound) => void;
  turboEnabled?: boolean;
}

export interface PlinkoRenderer {
  destroy: () => void;
  resize: () => void;
  setOptions: (options: PlinkoRendererOptions) => void;
  visualizeRound: (round: PlinkoRendererRound) => void;
}
