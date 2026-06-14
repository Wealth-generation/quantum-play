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
  roundToVisualize?: PlinkoRendererRound | null;
}

export function PlinkoPixiStage({
  className,
  rendererOptions,
  roundToVisualize,
}: PlinkoPixiStageProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rendererRef = React.useRef<PlinkoRenderer | null>(null);
  const visualizedRoundIdRef = React.useRef<string | null>(null);
  const rendererOptionsRef = React.useRef<PlinkoRendererOptions | undefined>(
    rendererOptions,
  );
  const roundToVisualizeRef = React.useRef<PlinkoRendererRound | null>(
    roundToVisualize ?? null,
  );
  const resizeFrameRef = React.useRef<number | null>(null);
  const resizeTimeoutsRef = React.useRef<Set<number>>(new Set());

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
    roundToVisualizeRef.current = roundToVisualize ?? null;
  }, [roundToVisualize]);

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

      if (
        roundToVisualizeRef.current &&
        visualizedRoundIdRef.current !== roundToVisualizeRef.current.id
      ) {
        visualizedRoundIdRef.current = roundToVisualizeRef.current.id;
        renderer.visualizeRound(roundToVisualizeRef.current);
      }
    });

    return () => {
      cancelled = true;
      clearScheduledResizes();
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [clearScheduledResizes, scheduleRendererResize]);

  React.useEffect(() => {
    rendererRef.current?.setOptions(rendererOptions ?? {});
  }, [rendererOptions]);

  React.useEffect(() => {
    if (
      !roundToVisualize ||
      visualizedRoundIdRef.current === roundToVisualize.id
    ) {
      return;
    }

    visualizedRoundIdRef.current = roundToVisualize.id;
    rendererRef.current?.visualizeRound(roundToVisualize);
  }, [roundToVisualize]);

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
