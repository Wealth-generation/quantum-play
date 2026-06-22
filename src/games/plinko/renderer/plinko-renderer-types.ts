import type { PlinkoBetResult } from "../model";
import type { PlinkoRisk, PlinkoRows } from "../config";

export interface PlinkoRendererBoardState {
  bucketMultipliers: readonly number[];
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
}

export interface PlinkoRendererRound {
  acceptedAt: number;
  id: string;
  result: PlinkoBetResult;
  turboEnabled: boolean;
}

export interface PlinkoVisualTarget {
  betId: string;
  risk: PlinkoRisk;
  roundId: string;
  rowsCount: PlinkoRows;
  targetBucketIndex: number;
  visualSeed: number;
}

export interface PlinkoPlaybackSelection {
  animationStatus: string;
  failureReason: string | null;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
  source: string;
  targetBucket: number;
  turboEnabled: boolean;
}

export type PlinkoRendererSettlementReason =
  | "cancelled"
  | "fallback"
  | "visual";

export type PlinkoPlaybackCancellationReason =
  | "board-change"
  | "resize"
  | "resize-retry-exhausted"
  | "teardown";

export type PlinkoPlaybackLifecyclePhase =
  | "accepted"
  | "cancelled"
  | "completed"
  | "enqueue-rejected"
  | "init-failed"
  | "no-valid"
  | "playback-failed"
  | "queued"
  | "simulated"
  | "start-failed"
  | "started";

export type PlinkoPlaybackFailureReason =
  | "board-geometry-missing"
  | "canvas-animation-load-failed"
  | "canvas-animation-parse-failed"
  | "canvas-bucket-mismatch"
  | "canvas-draw-failed"
  | "canvas-renderer-init-failed"
  | "canvas-result-invalid"
  | "canvas-trajectory-missing"
  | "model-watchdog-no-visible-playback"
  | "model-watchdog-renderer-timeout"
  | "no-pocket-settle"
  | "no-valid-candidate"
  | "out-of-bounds"
  | "pixi-ball-start-failed"
  | "pixi-playback-render-failed"
  | "pixi-renderer-init-failed"
  | "production-playback-unexpected-error"
  | "production-resolver-unexpected-error"
  | "renderer-destroyed"
  | "renderer-duplicate-already-active"
  | "resize-retry-exhausted"
  | "simulation-error"
  | "stage-retry-exhausted"
  | "target-bucket-missing"
  | "target-pocket-did-not-stabilize"
  | "timeout-or-sample-cap"
  | "trajectory-bucket-impact-missing"
  | "wrong-pocket";

export type PlinkoRendererEnqueueResult =
  | {
      playbackId: string;
      reason: null;
      retryable: false;
      status: "accepted";
    }
  | {
      playbackId: string;
      reason: "renderer-duplicate-already-active";
      retryable: false;
      status: "already-active";
    }
  | {
      playbackId: null;
      reason: "board-geometry-missing";
      retryable: true;
      status: "not-ready";
    }
  | {
      playbackId: null;
      reason: "renderer-destroyed";
      retryable: false;
      status: "rejected";
    };

export interface PlinkoPlaybackLifecycleEvent {
  backendBetId: string;
  cancellationReason: PlinkoPlaybackCancellationReason | null;
  elapsedSinceAcceptedMs: number;
  failureReason: PlinkoPlaybackFailureReason | null;
  geometryRevision: number | null;
  phase: PlinkoPlaybackLifecyclePhase;
  playbackId: string;
  retryCount: number;
  roundId: string;
  rowsCount: PlinkoRows;
  risk: PlinkoRisk;
  selection: PlinkoPlaybackSelection | null;
  targetBucket: number;
  terminal: boolean;
  turboEnabled: boolean;
}

export interface PlinkoRendererOptions {
  board?: PlinkoRendererBoardState;
  onPlaybackLifecycle?: (event: PlinkoPlaybackLifecycleEvent) => void;
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
  visualizeRound: (round: PlinkoRendererRound) => PlinkoRendererEnqueueResult;
}
