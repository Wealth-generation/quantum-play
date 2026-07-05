"use client";

import { motion } from "motion/react";
import { useTurboMode } from "@/features/turbo-mode";
import { cn } from "@/shared/lib";
import {
  DICE_MAX_THRESHOLD,
  DICE_MIN_THRESHOLD,
} from "../config/dice-defaults";
import { formatDecimal } from "../lib/dice-math";

const DICE_MARKER_EDGE_PERCENT = 4;
const DICE_RESULT_MARKER_DURATION = 0.26;
const DICE_TURBO_RESULT_MARKER_DURATION = 0.09;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function toTrackPercent(value: number) {
  const clampedValue = clamp(value, DICE_MIN_THRESHOLD, DICE_MAX_THRESHOLD);
  return (
    ((clampedValue - DICE_MIN_THRESHOLD) /
      (DICE_MAX_THRESHOLD - DICE_MIN_THRESHOLD)) *
    100
  );
}

function markerBubbleTranslateClass(percent: number) {
  if (percent <= DICE_MARKER_EDGE_PERCENT) {
    return "translate-x-0";
  }

  if (percent >= 100 - DICE_MARKER_EDGE_PERCENT) {
    return "-translate-x-full";
  }

  return "-translate-x-1/2";
}

interface DiceResultMarkerProps {
  didWin: boolean;
  randomValue: number;
}

export function DiceResultMarker({
  didWin,
  randomValue,
}: DiceResultMarkerProps) {
  const { turboEnabled } = useTurboMode();
  const percent = toTrackPercent(randomValue);
  const left = `${percent}%`;

  return (
    <motion.div
      animate={{ left, opacity: 1, scale: 1 }}
      className="absolute bottom-2 z-10 h-0 w-0"
      initial={false}
      transition={{
        duration: turboEnabled
          ? DICE_TURBO_RESULT_MARKER_DURATION
          : DICE_RESULT_MARKER_DURATION,
        ease: "easeOut",
      }}
    >
      <div
        className={cn(
          "absolute bottom-0 left-0 rounded-sm border px-3 py-2 text-sm font-black text-text shadow-overlay",
          markerBubbleTranslateClass(percent),
          didWin
            ? "border-primary/50 bg-primary/20"
            : "border-danger/50 bg-danger/20",
        )}
      >
        {formatDecimal(randomValue)}
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-0 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent",
          didWin ? "border-t-primary/50" : "border-t-danger/50",
        )}
      />
    </motion.div>
  );
}
