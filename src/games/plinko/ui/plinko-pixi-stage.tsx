"use client";

import * as React from "react";
import { cn } from "@/shared/lib";
import {
  createPixiPlinkoRenderer,
  type PlinkoRenderer,
  type PlinkoRendererOptions,
  type PlinkoRendererRound,
} from "../renderer";

interface PlinkoPixiStageProps {
  className?: string;
  rendererOptions?: PlinkoRendererOptions;
  roundsToVisualize?: readonly PlinkoRendererRound[];
}

export function PlinkoPixiStage({
  className,
  rendererOptions,
  roundsToVisualize,
}: PlinkoPixiStageProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rendererRef = React.useRef<PlinkoRenderer | null>(null);
  const visualizedRoundIdsRef = React.useRef(new Set<string>());
  const rendererOptionsRef = React.useRef<PlinkoRendererOptions | undefined>(
    rendererOptions,
  );
  const roundsToVisualizeRef = React.useRef<readonly PlinkoRendererRound[]>(
    roundsToVisualize ?? [],
  );
  const resizeFrameRef = React.useRef<number | null>(null);
  const resizeTimeoutsRef = React.useRef<Set<number>>(new Set());

  const visualizeQueuedRounds = React.useCallback(() => {
    const renderer = rendererRef.current;

    if (!renderer) {
      return;
    }

    for (const round of roundsToVisualizeRef.current) {
      if (visualizedRoundIdsRef.current.has(round.id)) {
        continue;
      }

      visualizedRoundIdsRef.current.add(round.id);
      renderer.visualizeRound(round);
    }
  }, []);

  const clearScheduledResizes = React.useCallback(() => {
    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = null;
    }

    for (const timeout of resizeTimeoutsRef.current.values()) {
      window.clearTimeout(timeout);
    }

    resizeTimeoutsRef.current.clear();
  }, []);

  const scheduleRendererResize = React.useCallback(() => {
    rendererRef.current?.resize();

    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
    }

    resizeFrameRef.current = window.requestAnimationFrame(() => {
      resizeFrameRef.current = null;
      rendererRef.current?.resize();
    });

    const timeout = window.setTimeout(() => {
      resizeTimeoutsRef.current.delete(timeout);
      rendererRef.current?.resize();
    }, 120);

    resizeTimeoutsRef.current.add(timeout);
  }, []);

  React.useEffect(() => {
    rendererOptionsRef.current = rendererOptions;
  }, [rendererOptions]);

  React.useEffect(() => {
    roundsToVisualizeRef.current = roundsToVisualize ?? [];
    visualizeQueuedRounds();
  }, [roundsToVisualize, visualizeQueuedRounds]);

  React.useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;

    if (!container) {
      return undefined;
    }

    void createPixiPlinkoRenderer({ container }).then((renderer) => {
      if (cancelled) {
        renderer.destroy();
        return;
      }

      rendererRef.current = renderer;
      renderer.setOptions(rendererOptionsRef.current ?? {});
      scheduleRendererResize();
      visualizeQueuedRounds();
    });

    return () => {
      cancelled = true;
      clearScheduledResizes();
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [clearScheduledResizes, scheduleRendererResize, visualizeQueuedRounds]);

  React.useEffect(() => {
    rendererRef.current?.setOptions(rendererOptions ?? {});
  }, [rendererOptions]);

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
