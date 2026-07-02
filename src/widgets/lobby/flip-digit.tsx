"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * One counter cell.
 *
 * Digits animate like a split-flap board: on value change the old digit slides up
 * and out while the new one slides in from below (both clipped by the cell's
 * overflow-hidden). Symbols ($ and ,) render statically.
 *
 * Sizing comes from CSS vars set by the parent RewardsCounter (--cell-w, --cell-h,
 * --num-font, --num-lh, --comma-font) so the whole counter scales fluidly.
 */
interface FlipDigitProps {
  /** "0"–"9", "$" or "," */
  value: string;
  /** $ and , — static, no flip */
  isSymbol?: boolean;
  /** Position among digits — drives the small per-cell stagger. */
  index?: number;
}

export function FlipDigit({ value, isSymbol = false, index = 0 }: FlipDigitProps) {
  const prefersReduced = useReducedMotion();

  // Static symbols: $ (green standalone) and , (muted separator).
  if (isSymbol) {
    if (value === "$") {
      return (
        <span className="font-black uppercase leading-[var(--num-lh)] text-primary text-[length:var(--num-font)]">
          $
        </span>
      );
    }
    return (
      <span className="self-end font-semibold leading-[var(--num-lh)] text-text-muted text-[length:var(--comma-font)]">
        {value}
      </span>
    );
  }

  // Animated digit cell.
  //
  // The base layer always renders the current character in its resting position —
  // this is what guarantees the digit is visible. During fast count-up, low-weight
  // digits (tens/hundreds) can change on nearly every animation frame; if the flip
  // overlay below were the only thing rendering the digit, a value could be swapped
  // out again before its enter transition ever committed a frame, leaving the tile
  // stuck at its un-animated (fully clipped, i.e. blank-looking) initial position.
  // The overlay is purely decorative on top of the always-correct base.
  return (
    <span className="relative flex h-[var(--cell-h)] w-[var(--cell-w)] items-center justify-center overflow-hidden bg-surface font-black uppercase leading-[var(--num-lh)] text-text text-[length:var(--num-font)]">
      <span className="absolute inset-0 flex items-center justify-center">{value}</span>

      {!prefersReduced && (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            aria-hidden="true"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut", delay: index * 0.05 }}
            className="absolute inset-0 flex items-center justify-center bg-surface"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  );
}
