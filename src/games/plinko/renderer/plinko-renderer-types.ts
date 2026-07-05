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

export type PlinkoPlaybackLifecyclePhase =
  | "accepted"
  | "completed"
  | "enqueue-rejected"
  | "init-failed"
  | "playback-failed"
  | "queued"
  | "simulated"
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
  | "renderer-destroyed"
  | "renderer-duplicate-already-active"
  | "stage-retry-exhausted";

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
  cancellationReason: null;
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
