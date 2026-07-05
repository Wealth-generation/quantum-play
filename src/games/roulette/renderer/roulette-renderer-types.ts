import type { RouletteBetResult } from "../model/roulette-types";

export interface RouletteRendererSpin {
  result: RouletteBetResult;
  /**
   * Ball screen angle at trigger time, derived from the orbit container's live CSS transform.
   * Formula: -π/2 + Math.atan2(orbitMatrix.m12, orbitMatrix.m11)
   * The disc angle is no longer passed here — the renderer reads it directly from the Pixi disc sprite.
   */
  startBallAngleRad: number;
  /**
   * Ball screen angle (rad) when the Pixi animation hands back to the CSS idle orbit.
   * Set by the renderer in the onSpinSettled callback; undefined in the visualizeSpin input.
   * Used by RouletteWheel to compute the CSS animation-delay for seamless idle handoff.
   */
  exitBallAngleRad?: number;
}

export type RouletteRendererSettlementReason = "visual" | "cancelled" | "resize";

export interface RouletteRendererOptions {
  onSpinSettled?: (
    spin: RouletteRendererSpin,
    reason: RouletteRendererSettlementReason,
  ) => void;
  /** Mobile/overlay path only: fires onSpinSettled immediately after the dwell
   * phase, skipping the 500 ms return-to-rim tail. The caller unmounts the
   * scene on settlement, so the idle-return animation is not needed. */
  skipReturnTail?: boolean;
}

export interface RouletteRenderer {
  clearBall: () => void;
  destroy: () => void;
  resize: () => void;
  setOptions: (options: RouletteRendererOptions) => void;
  visualizeSpin: (spin: RouletteRendererSpin) => void;
}
