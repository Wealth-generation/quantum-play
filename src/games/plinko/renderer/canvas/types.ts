import type { PlinkoRisk, PlinkoRows } from "../../config";
import type { PlinkoPlaybackSelection } from "../plinko-renderer-types";

export interface PlinkoAnimationPoint {
  x: number;
  y: number;
}

export type PlinkoAnimationPath = readonly PlinkoAnimationPoint[];

export interface PlinkoAnimationLibrary {
  buckets: ReadonlyMap<number, readonly PlinkoAnimationPath[]>;
  rowsCount: PlinkoRows;
}

export type CanvasPlaybackFailureReason =
  | "canvas-animation-load-failed"
  | "canvas-animation-parse-failed"
  | "canvas-bucket-mismatch"
  | "canvas-draw-failed"
  | "canvas-result-invalid"
  | "canvas-trajectory-missing";

export interface CanvasPlaybackSelection extends PlinkoPlaybackSelection {
  animationStatus: "canvas-ready" | "canvas-invalid";
  failureReason: CanvasPlaybackFailureReason | null;
  pathLength: number;
  pathValid: boolean;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
  source: "canvas-json";
  targetBucket: number;
  turboEnabled: boolean;
  variantIndex: number | null;
}

export type CanvasTrajectorySelection =
  | {
      kind: "success";
      path: PlinkoAnimationPath;
      selection: CanvasPlaybackSelection;
    }
  | {
      kind: "failure";
      selection: CanvasPlaybackSelection;
    };
