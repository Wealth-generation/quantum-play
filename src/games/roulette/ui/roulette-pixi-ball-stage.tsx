"use client";

import * as React from "react";
import wheelDiscAsset from "@/shared/assets/games/roulette/images/wheel-disc.webp";
import { createPixiRouletteBallRenderer } from "../renderer/pixi-roulette-ball-renderer";
import type {
  RouletteRenderer,
  RouletteRendererOptions,
  RouletteRendererSpin,
  RouletteRendererSettlementReason,
} from "../renderer/roulette-renderer-types";
import type { RouletteBetResult } from "../model/roulette-types";

interface RoulettePixiBallStageProps {
  /**
   * Ref to the idle-ball orbit wrapper.
   * Read at trigger time to derive the ball's actual start angle from its live orbit position.
   */
  orbitRef: React.RefObject<HTMLDivElement | null>;
  /** Non-null while a spin animation is requested; null during idle. */
  pendingSpin: RouletteBetResult | null;
  onSpinSettled?: (
    spin: RouletteRendererSpin,
    reason: RouletteRendererSettlementReason,
  ) => void;
  /** Mobile/overlay path only: skip the 500 ms return-to-rim tail after dwell.
   * onSpinSettled fires at end of dwell; the caller unmounts the scene. */
  skipReturnTail?: boolean;
}

export function RoulettePixiBallStage({
  orbitRef,
  pendingSpin,
  onSpinSettled,
  skipReturnTail,
}: RoulettePixiBallStageProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rendererRef = React.useRef<RouletteRenderer | null>(null);
  const rendererOptionsRef = React.useRef<RouletteRendererOptions>({});
  /** betId of the last spin we passed to the renderer; prevents double-trigger on re-render. */
  const visualizedSpinIdRef = React.useRef<string | null>(null);
  /** Becomes true once the async Pixi factory resolves; causes the pendingSpin
   * effect to re-run if pendingSpin arrived before the renderer was ready
   * (overlay/mobile path where Pixi loads after the bet result). */
  const [rendererMounted, setRendererMounted] = React.useState(false);

  const resizeFrameRef = React.useRef<number | null>(null);
  const resizeTimeoutsRef = React.useRef<Set<number>>(new Set());

  const clearScheduledResizes = React.useCallback(() => {
    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
      resizeFrameRef.current = null;
    }
    for (const t of resizeTimeoutsRef.current.values()) {
      window.clearTimeout(t);
    }
    resizeTimeoutsRef.current.clear();
  }, []);

  const scheduleResize = React.useCallback(() => {
    rendererRef.current?.resize();

    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current);
    }
    resizeFrameRef.current = window.requestAnimationFrame(() => {
      resizeFrameRef.current = null;
      rendererRef.current?.resize();
    });

    const t = window.setTimeout(() => {
      resizeTimeoutsRef.current.delete(t);
      rendererRef.current?.resize();
    }, 120);
    resizeTimeoutsRef.current.add(t);
  }, []);

  // Mount / unmount — mirrors plinko-pixi-stage.tsx exactly.
  React.useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;

    if (!container) return undefined;

    void createPixiRouletteBallRenderer({ container, discImageUrl: wheelDiscAsset.src }).then((renderer) => {
      if (cancelled) {
        renderer.destroy();
        return;
      }
      rendererRef.current = renderer;
      renderer.setOptions(rendererOptionsRef.current);
      scheduleResize();
      setRendererMounted(true);
    });

    return () => {
      cancelled = true;
      clearScheduledResizes();
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [clearScheduledResizes, scheduleResize]);

  // Keep options ref in sync.
  React.useEffect(() => {
    rendererOptionsRef.current = { onSpinSettled, skipReturnTail };
    rendererRef.current?.setOptions({ onSpinSettled, skipReturnTail });
  }, [onSpinSettled, skipReturnTail]);

  // Trigger or clear the spin when pendingSpin changes.
  // rendererMounted in the dep array causes this effect to re-run when Pixi
  // finishes loading, which handles the overlay/mobile race where pendingSpin
  // arrives before the async renderer factory resolves.
  React.useEffect(() => {
    const renderer = rendererRef.current;

    if (!pendingSpin) {
      visualizedSpinIdRef.current = null;
      renderer?.clearBall();
      return;
    }

    if (visualizedSpinIdRef.current === pendingSpin.betId) return;

    // Exit early if Pixi has not yet initialized. rendererMounted transitions
    // false→true when the factory resolves, triggering a re-run of this effect.
    if (!renderer || !rendererMounted) return;

    visualizedSpinIdRef.current = pendingSpin.betId;

    // Read the idle orbit container's live rotation to find the ball's actual start angle.
    // The ball is at 12 o'clock in the orbit's local frame (-π/2 in screen trig).
    // Orbit rotation (CW, positive θ) shifts the ball's screen angle to -π/2 + θ.
    // CSS animations continue running even when visibility:hidden, so this read is safe
    // after pendingSpin becomes non-null.
    // The disc angle is now read directly from the Pixi disc sprite inside the renderer.
    let startBallAngleRad = -Math.PI / 2; // fallback if transform unreadable
    const orbitEl = orbitRef.current;
    if (orbitEl) {
      const transformStr = getComputedStyle(orbitEl).transform;
      if (transformStr && transformStr !== "none") {
        const matrix = new DOMMatrix(transformStr);
        if (Number.isFinite(matrix.m11) && Number.isFinite(matrix.m12)) {
          startBallAngleRad = -Math.PI / 2 + Math.atan2(matrix.m12, matrix.m11);
        }
      }
    }

    renderer.visualizeSpin({ result: pendingSpin, startBallAngleRad });
  }, [pendingSpin, orbitRef, rendererMounted]);

  // ResizeObserver — mirrors plinko-pixi-stage.tsx.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(scheduleResize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [scheduleResize]);

  // Fullscreen changes can shift the container size.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const doc = container.ownerDocument;
    doc.addEventListener("fullscreenchange", scheduleResize);
    return () => doc.removeEventListener("fullscreenchange", scheduleResize);
  }, [scheduleResize]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      ref={containerRef}
    />
  );
}
