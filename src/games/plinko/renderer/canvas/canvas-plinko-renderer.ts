import type {
  PlinkoPlaybackCancellationReason,
  PlinkoPlaybackFailureReason,
  PlinkoPlaybackLifecycleEvent,
  PlinkoPlaybackSelection,
  PlinkoRenderer,
  PlinkoRendererEnqueueResult,
  PlinkoRendererOptions,
  PlinkoRendererRound,
} from "../plinko-renderer-types";
import {
  loadPlinkoAnimationLibrary,
  PlinkoAnimationAssetError,
  preloadPlinkoAnimationLibrary,
} from "./animation-loader";
import { drawPlinkoBall } from "./ball-renderer";
import { drawPlinkoBoard } from "./board-renderer";
import {
  PLINKO_BUCKET_FEEDBACK_DURATION_MS,
  PLINKO_PEG_FEEDBACK_DURATION_MS,
  pruneFeedbacks,
  triggerBucketFeedback,
  triggerPegFeedback,
  type BucketFeedbacks,
  type PegFeedbacks,
} from "./feedback";
import {
  createPlinkoSourceLayout,
  getPlinkoCanvasTransform,
  type PlinkoSourceLayout,
} from "./source-layout";
import { selectCanvasTrajectory } from "./trajectory-selector";
import type { PlinkoAnimationPath } from "./types";

interface CreateCanvasPlinkoRendererOptions extends PlinkoRendererOptions {
  container: HTMLElement;
}

interface PlaybackContext {
  playbackId: string;
  retryCount: number;
  round: PlinkoRendererRound;
  selection: PlinkoPlaybackSelection | null;
}

interface ActiveCanvasPlayback {
  context: PlaybackContext;
  durationMs: number;
  layout: PlinkoSourceLayout;
  path: PlinkoAnimationPath;
  replaySpeed: number;
  startedAt: number | null;
  targetFeedbackFired: boolean;
  touchedPegIds: Set<string>;
}

const NORMAL_REPLAY_SPEED_MULTIPLIER = 0.75;
const TURBO_REPLAY_SPEED_MULTIPLIER = 1;

export async function createCanvasPlinkoRenderer({
  container,
  ...initialOptions
}: CreateCanvasPlinkoRendererOptions): Promise<PlinkoRenderer> {
  const canvas = container.ownerDocument.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context was unavailable.");
  }

  let destroyed = false;
  let options = initialOptions;
  let playbackSequence = 0;
  let animationFrame: number | null = null;
  let devicePixelRatio = 1;
  let transform = getPlinkoCanvasTransform(1, 1);
  let geometryRevision = 0;
  const activePlaybacks = new Map<string, ActiveCanvasPlayback>();
  const playbackContexts = new Map<string, PlaybackContext>();
  const bucketFeedbacks: BucketFeedbacks = new Map();
  const pegFeedbacks: PegFeedbacks = new Map();
  const preloadedRows = new Set<number>();

  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "block";
  canvas.style.height = "100%";
  canvas.style.inset = "0";
  canvas.style.position = "absolute";
  canvas.style.width = "100%";
  container.appendChild(canvas);

  function log(event: string, details: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Plinko canvas] ${event}`, details);
    }
  }

  function emitPlaybackLifecycle(
    playback: PlaybackContext,
    phase: PlinkoPlaybackLifecycleEvent["phase"],
    {
      cancellationReason = null,
      failureReason = null,
      terminal = false,
    }: {
      cancellationReason?: PlinkoPlaybackCancellationReason | null;
      failureReason?: PlinkoPlaybackFailureReason | null;
      terminal?: boolean;
    } = {},
  ) {
    const event: PlinkoPlaybackLifecycleEvent = {
      backendBetId: playback.round.result.betId,
      cancellationReason,
      elapsedSinceAcceptedMs: Math.max(Date.now() - playback.round.acceptedAt, 0),
      failureReason,
      geometryRevision,
      phase,
      playbackId: playback.playbackId,
      retryCount: playback.retryCount,
      roundId: playback.round.id,
      rowsCount: playback.round.result.rowsCount,
      risk: playback.round.result.risk,
      selection: playback.selection,
      targetBucket:
        playback.selection?.targetBucket ?? playback.round.result.bucketIndex,
      terminal,
      turboEnabled: playback.round.turboEnabled,
    };

    options.onPlaybackLifecycle?.(event);
    log(phase, {
      activeBallCount: activePlaybacks.size,
      failureReason,
      playbackId: playback.playbackId,
      roundId: playback.round.id,
      targetBucket: event.targetBucket,
      terminal,
    });
  }

  function preloadSelectedRows() {
    const rowsCount = options.board?.rowsCount;

    if (!rowsCount || preloadedRows.has(rowsCount)) {
      return;
    }

    preloadedRows.add(rowsCount);
    void preloadPlinkoAnimationLibrary(rowsCount)
      .then(() => log("asset-preloaded", { rowsCount }))
      .catch((error) => {
        preloadedRows.delete(rowsCount);
        log("asset-preload-failed", {
          reason: toFailureReason(error),
          rowsCount,
        });
      });
  }

  function startPlayback(playback: PlaybackContext) {
    emitPlaybackLifecycle(playback, "queued");
    const board = options.board;

    if (!board) {
      failPlayback(playback, "board-geometry-missing");
      return;
    }

    void loadPlinkoAnimationLibrary(playback.round.result.rowsCount)
      .then((library) => {
        if (destroyed || playbackContexts.get(playback.round.id) !== playback) {
          return;
        }

        const trajectory = selectCanvasTrajectory({
          library,
          round: playback.round,
          turboEnabled: playback.round.turboEnabled,
        });
        playback.selection = trajectory.selection;

        if (trajectory.kind === "failure") {
          failPlayback(playback, trajectory.selection.failureReason);
          return;
        }

        emitPlaybackLifecycle(playback, "simulated");
        activePlaybacks.set(playback.round.id, {
          context: playback,
          durationMs: getPlaybackDurationMs(trajectory.path.length),
          layout: createPlinkoSourceLayout(playback.round.result.rowsCount),
          path: trajectory.path,
          replaySpeed: playback.round.turboEnabled
            ? TURBO_REPLAY_SPEED_MULTIPLIER
            : NORMAL_REPLAY_SPEED_MULTIPLIER,
          startedAt: null,
          targetFeedbackFired: false,
          touchedPegIds: new Set(),
        });
        log("trajectory-selected", {
          pathLength: trajectory.path.length,
          rowsCount: playback.round.result.rowsCount,
          roundId: playback.round.id,
          targetBucket: trajectory.selection.targetBucket,
          variantIndex: trajectory.selection.variantIndex,
        });
        ensureAnimationFrame();
      })
      .catch((error) => {
        if (!destroyed && playbackContexts.get(playback.round.id) === playback) {
          failPlayback(playback, toFailureReason(error));
        }
      });
  }

  function failPlayback(
    playback: PlaybackContext,
    failureReason: PlinkoPlaybackFailureReason | null,
  ) {
    if (playbackContexts.get(playback.round.id) !== playback) {
      return;
    }

    activePlaybacks.delete(playback.round.id);
    playbackContexts.delete(playback.round.id);
    emitPlaybackLifecycle(playback, "playback-failed", {
      failureReason: failureReason ?? "canvas-draw-failed",
      terminal: true,
    });
    options.onRoundSettled?.(playback.round, "fallback");
  }

  function completePlayback(playback: ActiveCanvasPlayback) {
    if (playbackContexts.get(playback.context.round.id) !== playback.context) {
      return;
    }

    activePlaybacks.delete(playback.context.round.id);
    playbackContexts.delete(playback.context.round.id);
    emitPlaybackLifecycle(playback.context, "completed", { terminal: true });
    options.onRoundSettled?.(playback.context.round, "visual");
  }

  function resizeCanvas() {
    const cssWidth = Math.max(container.clientWidth, 1);
    const cssHeight = Math.max(container.clientHeight, 1);
    const view = container.ownerDocument.defaultView;

    devicePixelRatio = Math.min(view?.devicePixelRatio ?? 1, 2);
    transform = getPlinkoCanvasTransform(cssWidth, cssHeight);
    canvas.width = Math.round(cssWidth * devicePixelRatio);
    canvas.height = Math.round(cssHeight * devicePixelRatio);
    geometryRevision += 1;
    log("resize-transform", {
      cssHeight,
      cssWidth,
      scale: transform.scale,
    });
    ensureAnimationFrame();
  }

  function ensureAnimationFrame() {
    if (destroyed || animationFrame !== null) {
      return;
    }

    animationFrame = (container.ownerDocument.defaultView ?? window).requestAnimationFrame(
      drawFrame,
    );
  }

  function drawFrame(now: number) {
    animationFrame = null;

    if (destroyed) {
      return;
    }

    try {
      drawFrameContents(now);
    } catch {
      for (const playback of [...activePlaybacks.values()]) {
        failPlayback(playback.context, "canvas-draw-failed");
      }
    }

    pruneFeedbacks(pegFeedbacks, now, PLINKO_PEG_FEEDBACK_DURATION_MS);
    pruneFeedbacks(bucketFeedbacks, now, PLINKO_BUCKET_FEEDBACK_DURATION_MS);

    if (
      activePlaybacks.size > 0 ||
      pegFeedbacks.size > 0 ||
      bucketFeedbacks.size > 0
    ) {
      ensureAnimationFrame();
    }
  }

  function drawFrameContents(now: number) {
    const board = options.board;
    const visiblePlaybacks: Array<{
      active: ActiveCanvasPlayback;
      isComplete: boolean;
      point: { x: number; y: number };
      shouldStart: boolean;
    }> = [];

    for (const active of activePlaybacks.values()) {
      if (active.startedAt === null) {
        active.startedAt = now;
      }

      const elapsedMs =
        Math.max(now - active.startedAt, 0) * active.replaySpeed;
      const progress = Math.min(elapsedMs / active.durationMs, 1);
      const point = samplePath(active.path, progress);

      triggerPegContacts(active, point, now);

      if (progress >= 1 && !active.targetFeedbackFired) {
        triggerBucketFeedback(
          bucketFeedbacks,
          active.context.round.result.bucketIndex,
          now,
        );
        active.targetFeedbackFired = true;
      }

      visiblePlaybacks.push({
        active,
        isComplete: progress >= 1,
        point,
        shouldStart: elapsedMs === 0,
      });
    }

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, transform.cssWidth, transform.cssHeight);
    context.save();
    context.translate(transform.offsetX, transform.offsetY);
    context.scale(transform.scale, transform.scale);

    const boardLayout = board
      ? createPlinkoSourceLayout(board.rowsCount)
      : visiblePlaybacks[0]?.active.layout;

    if (boardLayout) {
      drawPlinkoBoard({
        bucketFeedbacks,
        context,
        multipliers: board?.bucketMultipliers ?? [],
        now,
        pegFeedbacks,
        source: boardLayout,
      });
    }

    for (const visual of visiblePlaybacks) {
      drawPlinkoBall(context, visual.point, visual.active.layout.ballRadius);
    }

    context.restore();

    for (const visual of visiblePlaybacks) {
      if (visual.shouldStart) {
        emitPlaybackLifecycle(visual.active.context, "started");
      }

      if (visual.isComplete) {
        completePlayback(visual.active);
      }
    }
  }

  function triggerPegContacts(
    active: ActiveCanvasPlayback,
    point: { x: number; y: number },
    now: number,
  ) {
    for (const peg of active.layout.pegs) {
      if (active.touchedPegIds.has(peg.id)) {
        continue;
      }

      const hitRadius = active.layout.ballRadius + peg.radius * 1.08;
      const xDistance = point.x - peg.x;
      const yDistance = point.y - peg.y;

      if (xDistance * xDistance + yDistance * yDistance <= hitRadius * hitRadius) {
        active.touchedPegIds.add(peg.id);
        triggerPegFeedback(pegFeedbacks, peg.id, now);
      }
    }
  }

  resizeCanvas();
  preloadSelectedRows();

  return {
    destroy: () => {
      if (destroyed) {
        return;
      }

      destroyed = true;

      if (animationFrame !== null) {
        (container.ownerDocument.defaultView ?? window).cancelAnimationFrame(animationFrame);
      }

      animationFrame = null;
      activePlaybacks.clear();
      playbackContexts.clear();
      bucketFeedbacks.clear();
      pegFeedbacks.clear();
      canvas.remove();
    },
    resize: resizeCanvas,
    setOptions: (nextOptions) => {
      options = nextOptions;
      preloadSelectedRows();
      resizeCanvas();
    },
    visualizeRound: (round): PlinkoRendererEnqueueResult => {
      if (destroyed) {
        return {
          playbackId: null,
          reason: "renderer-destroyed",
          retryable: false,
          status: "rejected",
        };
      }

      const existing = playbackContexts.get(round.id);

      if (existing) {
        return {
          playbackId: existing.playbackId,
          reason: "renderer-duplicate-already-active",
          retryable: false,
          status: "already-active",
        };
      }

      if (!options.board || canvas.width === 0 || canvas.height === 0) {
        return {
          playbackId: null,
          reason: "board-geometry-missing",
          retryable: true,
          status: "not-ready",
        };
      }

      const playback: PlaybackContext = {
        playbackId: `plinko-canvas-${++playbackSequence}-${round.id}`,
        retryCount: 0,
        round,
        selection: null,
      };
      playbackContexts.set(round.id, playback);
      emitPlaybackLifecycle(playback, "accepted");
      startPlayback(playback);

      return {
        playbackId: playback.playbackId,
        reason: null,
        retryable: false,
        status: "accepted",
      };
    },
  };
}

function getPlaybackDurationMs(pathLength: number) {
  return Math.min(Math.max(pathLength * 7.4, 1500), 2850);
}

function samplePath(path: PlinkoAnimationPath, progress: number) {
  const position = Math.min(Math.max(progress, 0), 1) * (path.length - 1);
  const startIndex = Math.floor(position);
  const endIndex = Math.min(startIndex + 1, path.length - 1);
  const start = path[startIndex] ?? path[0];
  const end = path[endIndex] ?? start;
  const localProgress = position - startIndex;

  return {
    x: start.x + (end.x - start.x) * localProgress,
    y: start.y + (end.y - start.y) * localProgress,
  };
}

function toFailureReason(error: unknown): PlinkoPlaybackFailureReason {
  if (error instanceof PlinkoAnimationAssetError) {
    return error.code;
  }

  return "canvas-animation-load-failed";
}
