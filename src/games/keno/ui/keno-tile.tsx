"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useAnimation } from "motion/react";
import diamondSrc from "@/shared/assets/games/keno/images/diamond.webp";
import { cn } from "@/shared/lib";
import { KENO_DIAMOND_PULSE_MS } from "../config/keno-defaults";
import { tileLabel, type KenoTileState } from "../lib/keno-tiles";

// -----------------------------------------------------------------------------
// Figma reference (file EY3yBnmcrxTIhGBPQKNnnO):
//   idle     → 3984:37985  dark gradient bg + gray-alpha border, white text
//   selected → 3984:67086  green gradient bg, dark text (no border)
//   hit      → 3986:44638  dark bg + green contour border + glow + diamond asset slot
//   miss     → 3985:67088  red border + red-tinted bg, danger text
//   drawn    → [inferred — confirm at ui-qa]
//              no dedicated Figma node; "number drawn, user did NOT pick it"
//              treatment: muted neutral to distinguish from idle (plain dark)
//              and hit (bright green with diamond)
// -----------------------------------------------------------------------------

// Diamond asset slot note:
// Asset pipeline: PNG export → cwebp → src/shared/assets/games/keno/images/
// Replace the <span data-keno-diamond> placeholder once the WebP is available.
// The diamond glyph appears on the hit tile only.

export interface KenoTileProps {
  /** 0-based index. tileLabel(index) = index + 1 is the ONLY +1 in the UI. */
  index: number;
  state: KenoTileState;
  onToggle?: () => void;
  disabled?: boolean;
  /** When true, renders a looping green glow ring (hit tiles after round settles). */
  pulsing?: boolean;
}

// Tailwind classes per state, derived from Figma design tokens mapped to
// the project's @theme CSS variables (globals.css). No hard-coded hex.
//
// Token mapping used:
//   surface-3  (#1b1f26) ≈ Figma --button/neutral/bg-dark
//   border-2   (#2b303b) ≈ Figma --button/neutral/bg-mid
//   border-2/50 ≈ Figma --border/gray-alpha rgba(63,74,89,0.5)
//   primary-tint (#4ade80) ≈ Figma --button/brand/bg-soft
//   primary    (#22c55e) ≈ Figma --button/brand/bg-main
//   text       (#fdfdfd) ≈ Figma --text/primary
//   on-primary (#07111a) ≈ Figma --text/inverse
//   danger/10  ≈ Figma --bg/danger rgba(220,38,38,0.1)
//   danger     (#dc2626) ≈ Figma --text/feedback-danger (#ef4444, nearest token)
const STATE_CLASSES: Record<KenoTileState, string> = {
  idle: cn(
    "bg-gradient-to-b from-surface-3 to-border-2",
    "border border-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)]",
    "text-text",
  ),
  selected: cn(
    "bg-gradient-to-b from-primary-tint to-primary",
    "text-on-primary",
  ),
  hit: cn(
    // Dark tile bg (same as idle) so the diamond glyph reads clearly.
    // Green is expressed only as the contour border + outer glow; the
    // looping pulse ring (pulsing prop) adds the animated halo on top.
    "bg-gradient-to-b from-surface-3 to-border-2",
    "border border-[color-mix(in_srgb,var(--color-primary)_60%,transparent)]",
    "shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_80%,transparent)]",
  ),
  miss: cn(
    "bg-danger/10",
    "border border-danger/60",
    "text-danger",
  ),
  // Drawn-not-selected: backend drew this index but user didn't pick it.
  // Visual converges to the same red treatment as miss — every in-results
  // position without a diamond is red. Logical state stays "drawn" so
  // match-counting in the controller remains correct.
  drawn: cn(
    "bg-danger/10",
    "border border-danger/60",
    "text-danger",
  ),
};

const TEXT_CLASSES: Record<KenoTileState, string> = {
  idle: "text-text",
  selected: "text-on-primary",
  hit: "text-text",       // dark bg — light number reads under the diamond overlay
  miss: "text-danger",
  drawn: "text-danger",  // same red treatment as miss (visual convergence)
};

export function KenoTile({ index, state, onToggle, disabled, pulsing }: KenoTileProps) {
  const controls = useAnimation();

  // Fire a one-shot bounce animation when a tile enters a revealed state.
  // Controls are imperative so this only plays on the idle/selected → hit/drawn
  // transition, not on subsequent re-renders with the same state.
  React.useEffect(() => {
    if (state === "hit") {
      void controls.start({
        scale: [0.78, 1.14, 1],
        transition: { duration: 0.35, ease: "easeOut" },
      });
    } else if (state === "drawn") {
      void controls.start({
        scale: [0.85, 1.06, 1],
        transition: { duration: 0.25, ease: "easeOut" },
      });
    }
    // On state reset (idle/selected/miss), the animation has already ended at
    // scale 1, so no explicit reset is needed.
  }, [state, controls]);

  // Contract: KenoGrid passes onToggle only to tiles that should be interactive.
  // Normal play: idle/selected tiles. Freeze phase: ALL tiles get the exit-freeze
  // handler so any click exits freeze and toggles the clicked index.
  const canInteract = Boolean(onToggle) && !disabled;

  return (
    <motion.button
      animate={controls}
      aria-pressed={state === "selected"}
      className={cn(
        // Base layout
        "relative flex items-center justify-center overflow-hidden select-none",
        // Shape — radius-lg from globals.css
        "rounded-[var(--radius-lg,12px)]",
        // Size:
        //   Mobile <md:  w-full + aspect-square → tiles fill the 8-column grid
        //                proportionally (≈41px@375px, no overflow). Matches Figma
        //                mobile node 4107:124226 which uses 42px tiles in a flex-wrap
        //                grid; fluid approach avoids overflow at 320px.
        //   Tablet md–lg: same w-full approach (panel+grid still stacked)
        //   Desktop lg+:  67px (Figma artboard size)
        "w-full aspect-square lg:size-[67px] lg:aspect-auto",
        // Transitions for non-animated state changes (idle ↔ selected)
        "transition-[background,border-color,box-shadow] duration-150",
        // State-specific visual
        STATE_CLASSES[state],
        // Interactive states
        canInteract
          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-bg"
          : "cursor-default",
        // Dim locked idle tiles during reveal
        disabled && state === "idle" && "opacity-40",
      )}
      disabled={!canInteract}
      onClick={onToggle}
      type="button"
      whileTap={canInteract ? { scale: 0.91 } : undefined}
    >
      {/* Diamond overlay — hit state only.
          Positioned behind the tile number (z-10 on text); object-contain + padding
          keeps it visually within the tile bounds. */}
      {state === "hit" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <Image
            alt=""
            className="object-contain p-1.5 opacity-75"
            fill
            src={diamondSrc}
          />
        </span>
      )}

      {/* Looping green glow ring — shown on winning tiles after the round settles.
          Driven by the pulsingTiles set in the controller; cleared at the start of
          the next bet. Infinite loop must not gate handleRevealSettled. */}
      {pulsing && (
        <motion.span
          animate={{ opacity: [0.25, 0.85, 0.25] }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-inset ring-primary/70"
          initial={{ opacity: 0.25 }}
          transition={{
            duration: KENO_DIAMOND_PULSE_MS / 1000,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      )}

      {/* Tile number — tileLabel is the ONLY +1 (0-based index → display label) */}
      <span
        className={cn(
          "relative z-10 font-semibold leading-none text-center whitespace-nowrap",
          // Font size + leading scale with tile: ~12px@mobile, 20px/24px@desktop
          "text-[clamp(12px,3.7vw,20px)] lg:text-[20px] leading-none lg:leading-[24px]",
          TEXT_CLASSES[state],
        )}
      >
        {tileLabel(index)}
      </span>
    </motion.button>
  );
}
