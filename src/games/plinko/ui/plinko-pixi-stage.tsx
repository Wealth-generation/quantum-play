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
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

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

    const observer = new ResizeObserver(() => {
      rendererRef.current?.resize();
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-label="Plinko renderer surface"
      className={cn("relative min-h-80 overflow-hidden", className)}
      ref={containerRef}
    />
  );
}
