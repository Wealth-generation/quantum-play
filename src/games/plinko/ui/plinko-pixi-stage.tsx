"use client";

import * as React from "react";
import { cn } from "@/shared/lib";
import {
  createPixiPlinkoRenderer,
  type PlinkoPlaybackFailureReason,
  type PlinkoPlaybackLifecycleEvent,
  type PlinkoRenderer,
  type PlinkoRendererOptions,
  type PlinkoRendererRound,
} from "../renderer";

interface PlinkoPixiStageProps {
  className?: string;
  rendererOptions?: PlinkoRendererOptions;
  roundsToVisualize?: readonly PlinkoRendererRound[];
}

const MAX_STAGE_DISPATCH_RETRIES = 2;
const STAGE_DISPATCH_RETRY_DELAY_MS = 120;

export function PlinkoPixiStage({
  className,
  rendererOptions,
  roundsToVisualize,
}: PlinkoPixiStageProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rendererRef = React.useRef<PlinkoRenderer | null>(null);
  const committedRoundIdsRef = React.useRef(new Set<string>());
  const dispatchedRoundIdsRef = React.useRef(new Set<string>());
  const heldRoundIdsRef = React.useRef(new Set<string>());
  const skippedRoundIdsRef = React.useRef(new Set<string>());
  const terminalRoundIdsRef = React.useRef(new Set<string>());
  const dispatchRetryCountsRef = React.useRef(new Map<string, number>());
  const dispatchRetryTimeoutsRef = React.useRef(
    new Map<string, number>(),
  );
  const rendererInitFailureRef = React.useRef<PlinkoPlaybackFailureReason | null>(
    null,
  );
  const rendererOptionsRef = React.useRef<PlinkoRendererOptions | undefined>(
    rendererOptions,
  );
  const roundsToVisualizeRef = React.useRef<readonly PlinkoRendererRound[]>(
    roundsToVisualize ?? [],
  );
  const resizeFrameRef = React.useRef<number | null>(null);
  const resizeTimeoutRef = React.useRef<number | null>(null);
  const [dispatchRetryEpoch, setDispatchRetryEpoch] = React.useState(0);

  const emitStageDiagnostic = React.useCallback(
    (
      phase:
        | "stage-dispatch-acknowledged"
        | "stage-dispatch-attempted"
        | "stage-dispatch-rejected"
        | "stage-dispatch-skipped-duplicate"
        | "stage-held-awaiting-renderer",
      round: PlinkoRendererRound,
      {
        failureReason = null,
        playbackId = null,
        rendererReady = rendererRef.current !== null,
        retryCount = dispatchRetryCountsRef.current.get(round.id) ?? 0,
        terminal = false,
      }: {
        failureReason?: PlinkoPlaybackFailureReason | null;
        playbackId?: string | null;
        rendererReady?: boolean;
        retryCount?: number;
        terminal?: boolean;
      } = {},
    ) => {
      if (process.env.NODE_ENV !== "development") {
        return;
      }

      console.debug(
        `[Plinko playback:${playbackId ?? `plinko-stage-${round.id}`}] ${phase}`,
        {
          backendBetId: round.result.betId,
          elapsedSinceAcceptedMs: Math.max(Date.now() - round.acceptedAt, 0),
          failureReason,
          playbackId,
          rendererReady,
          retryCount,
          risk: round.result.risk,
          roundId: round.id,
          rowsCount: round.result.rowsCount,
          targetBucket: round.result.bucketIndex,
          terminal,
          turboEnabled: rendererOptionsRef.current?.turboEnabled === true,
        },
      );
    },
    [],
  );

  const clearDispatchRetry = React.useCallback((roundId: string) => {
    const timeout = dispatchRetryTimeoutsRef.current.get(roundId);

    if (timeout) {
      window.clearTimeout(timeout);
      dispatchRetryTimeoutsRef.current.delete(roundId);
    }

    dispatchRetryCountsRef.current.delete(roundId);
  }, []);

  const handlePlaybackLifecycle = React.useCallback(
    (event: PlinkoPlaybackLifecycleEvent) => {
      if (event.phase === "started") {
        committedRoundIdsRef.current.add(event.roundId);
      }

      if (event.terminal) {
        terminalRoundIdsRef.current.add(event.roundId);
        heldRoundIdsRef.current.delete(event.roundId);
        clearDispatchRetry(event.roundId);
      }

      rendererOptionsRef.current?.onPlaybackLifecycle?.(event);
    },
    [clearDispatchRetry],
  );

  const applyRendererOptions = React.useCallback(
    (renderer: PlinkoRenderer) => {
      const currentOptions = rendererOptionsRef.current ?? {};

      renderer.setOptions({
        ...currentOptions,
        onPlaybackLifecycle: handlePlaybackLifecycle,
      });
    },
    [handlePlaybackLifecycle],
  );

  const reportRendererTerminalFailure = React.useCallback(
    (
      round: PlinkoRendererRound,
      phase: "enqueue-rejected" | "init-failed",
      failureReason: PlinkoPlaybackFailureReason,
    ) => {
      const event: PlinkoPlaybackLifecycleEvent = {
        backendBetId: round.result.betId,
        cancellationReason: null,
        elapsedSinceAcceptedMs: Math.max(Date.now() - round.acceptedAt, 0),
        failureReason,
        geometryRevision: null,
        phase,
        playbackId: `plinko-playback-stage-${round.id}`,
        retryCount: dispatchRetryCountsRef.current.get(round.id) ?? 0,
        roundId: round.id,
        rowsCount: round.result.rowsCount,
        risk: round.result.risk,
        selection: null,
        targetBucket: round.result.bucketIndex,
        terminal: true,
        turboEnabled: rendererOptionsRef.current?.turboEnabled === true,
      };

      handlePlaybackLifecycle(event);

      if (process.env.NODE_ENV === "development") {
        console.debug(`[Plinko playback:${event.playbackId}] ${phase}`, event);
      }

      rendererOptionsRef.current?.onRoundSettled?.(round, "fallback");
    },
    [handlePlaybackLifecycle],
  );

  const scheduleDispatchRetry = React.useCallback(
    (round: PlinkoRendererRound) => {
      const currentRetryCount = dispatchRetryCountsRef.current.get(round.id) ?? 0;

      if (currentRetryCount >= MAX_STAGE_DISPATCH_RETRIES) {
        emitStageDiagnostic("stage-dispatch-rejected", round, {
          failureReason: "stage-retry-exhausted",
          rendererReady: true,
          retryCount: currentRetryCount,
          terminal: true,
        });
        reportRendererTerminalFailure(
          round,
          "enqueue-rejected",
          "stage-retry-exhausted",
        );
        return;
      }

      const nextRetryCount = currentRetryCount + 1;
      dispatchRetryCountsRef.current.set(round.id, nextRetryCount);
      heldRoundIdsRef.current.add(round.id);
      emitStageDiagnostic("stage-held-awaiting-renderer", round, {
        failureReason: "board-geometry-missing",
        rendererReady: true,
        retryCount: nextRetryCount,
      });

      if (dispatchRetryTimeoutsRef.current.has(round.id)) {
        return;
      }

      const timeout = window.setTimeout(() => {
        dispatchRetryTimeoutsRef.current.delete(round.id);
        setDispatchRetryEpoch((current) => current + 1);
      }, STAGE_DISPATCH_RETRY_DELAY_MS);
      dispatchRetryTimeoutsRef.current.set(round.id, timeout);
    },
    [emitStageDiagnostic, reportRendererTerminalFailure],
  );

  const visualizeQueuedRounds = React.useCallback(() => {
    const renderer = rendererRef.current;

    if (!renderer) {
      const failureReason = rendererInitFailureRef.current;

      for (const round of roundsToVisualizeRef.current) {
        if (terminalRoundIdsRef.current.has(round.id)) {
          continue;
        }

        if (failureReason) {
          reportRendererTerminalFailure(round, "init-failed", failureReason);
          continue;
        }

        if (!heldRoundIdsRef.current.has(round.id)) {
          heldRoundIdsRef.current.add(round.id);
          emitStageDiagnostic("stage-held-awaiting-renderer", round, {
            rendererReady: false,
          });
        }
      }

      return;
    }

    for (const round of roundsToVisualizeRef.current) {
      if (
        dispatchedRoundIdsRef.current.has(round.id) ||
        terminalRoundIdsRef.current.has(round.id)
      ) {
        if (!skippedRoundIdsRef.current.has(round.id)) {
          skippedRoundIdsRef.current.add(round.id);
          emitStageDiagnostic("stage-dispatch-skipped-duplicate", round, {
            rendererReady: true,
          });
        }
        continue;
      }

      emitStageDiagnostic("stage-dispatch-attempted", round, {
        rendererReady: true,
      });
      const acknowledgement = renderer.visualizeRound(round);

      if (acknowledgement.status === "accepted") {
        dispatchedRoundIdsRef.current.add(round.id);
        heldRoundIdsRef.current.delete(round.id);
        clearDispatchRetry(round.id);
        emitStageDiagnostic("stage-dispatch-acknowledged", round, {
          playbackId: acknowledgement.playbackId,
          rendererReady: true,
        });
        continue;
      }

      if (acknowledgement.status === "already-active") {
        dispatchedRoundIdsRef.current.add(round.id);
        heldRoundIdsRef.current.delete(round.id);
        clearDispatchRetry(round.id);
        emitStageDiagnostic("stage-dispatch-rejected", round, {
          failureReason: acknowledgement.reason,
          playbackId: acknowledgement.playbackId,
          rendererReady: true,
        });
        continue;
      }

      emitStageDiagnostic("stage-dispatch-rejected", round, {
        failureReason: acknowledgement.reason,
        rendererReady: acknowledgement.status !== "rejected",
      });

      if (acknowledgement.retryable) {
        scheduleDispatchRetry(round);
        continue;
      }

      reportRendererTerminalFailure(
        round,
        "enqueue-rejected",
        acknowledgement.reason,
      );
    }
  }, [
    clearDispatchRetry,
    emitStageDiagnostic,
    reportRendererTerminalFailure,
    scheduleDispatchRetry,
  ]);

  const clearScheduledResizes = React.useCallback(() => {
    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = null;
    }

    if (resizeTimeoutRef.current !== null) {
      window.clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = null;
    }
  }, []);

  const clearDispatchRetries = React.useCallback(() => {
    for (const timeout of dispatchRetryTimeoutsRef.current.values()) {
      window.clearTimeout(timeout);
    }

    dispatchRetryTimeoutsRef.current.clear();
  }, []);

  const scheduleRendererResize = React.useCallback(() => {
    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
    }

    if (resizeTimeoutRef.current !== null) {
      window.clearTimeout(resizeTimeoutRef.current);
    }

    resizeFrameRef.current = window.requestAnimationFrame(() => {
      resizeFrameRef.current = null;

      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeTimeoutRef.current = null;
        rendererRef.current?.resize();
      }, 120);
    });
  }, []);

  React.useEffect(() => {
    rendererOptionsRef.current = rendererOptions;
    const renderer = rendererRef.current;

    if (renderer) {
      applyRendererOptions(renderer);
    }
  }, [applyRendererOptions, rendererOptions]);

  React.useEffect(() => {
    roundsToVisualizeRef.current = roundsToVisualize ?? [];
    visualizeQueuedRounds();
  }, [dispatchRetryEpoch, roundsToVisualize, visualizeQueuedRounds]);

  React.useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;

    if (!container) {
      return undefined;
    }

    void createPixiPlinkoRenderer({ container })
      .then((renderer) => {
        if (cancelled) {
          renderer.destroy();
          return;
        }

        rendererRef.current = renderer;
        applyRendererOptions(renderer);
        scheduleRendererResize();
        visualizeQueuedRounds();
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        rendererInitFailureRef.current = "pixi-renderer-init-failed";
        visualizeQueuedRounds();
      });

    return () => {
      cancelled = true;
      clearDispatchRetries();
      clearScheduledResizes();
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [
    applyRendererOptions,
    clearDispatchRetries,
    clearScheduledResizes,
    scheduleRendererResize,
    visualizeQueuedRounds,
  ]);

  React.useEffect(() => {
    const container = containerRef.current;

    if (!container || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(scheduleRendererResize);

    observer.observe(container);

    return () => observer.disconnect();
  }, [scheduleRendererResize]);

  React.useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const ownerDocument = container.ownerDocument;

    ownerDocument.addEventListener("fullscreenchange", scheduleRendererResize);

    return () => {
      ownerDocument.removeEventListener(
        "fullscreenchange",
        scheduleRendererResize,
      );
    };
  }, [scheduleRendererResize]);

  return (
    <div
      aria-label="Plinko renderer surface"
      className={cn("relative min-h-80 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
