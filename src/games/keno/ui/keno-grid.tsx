"use client";

import * as React from "react";
import {
  KENO_FINALISE_TO_SETTLED_MS,
  KENO_FINALISE_TO_SETTLED_TURBO_MS,
  KENO_POST_REVEAL_SETTLE_MS,
  KENO_POST_REVEAL_SETTLE_TURBO_MS,
  KENO_REVEAL_STEP_MS,
  KENO_REVEAL_STEP_TURBO_MS,
  KENO_TILE_COUNT,
} from "../config/keno-defaults";
import { getKenoTileState } from "../lib/keno-tiles";
import type { KenoBetResult } from "../model/keno-types";
import { KenoTile } from "./keno-tile";

// Tile indices array — computed once, shared across renders.
const TILE_INDICES = Array.from({ length: KENO_TILE_COUNT }, (_, i) => i);

export interface KenoGridProps {
  /** 0-based selected tile indices from the store / controller. */
  selectedTiles: ReadonlySet<number>;
  /** 0-based drawn indices revealed so far (grows during animation). */
  revealedNumbers: readonly number[];
  /** True once ALL drawn tiles have been revealed; drives miss state. */
  isRevealComplete: boolean;
  /**
   * Non-null while a reveal round is active. Set by the controller when a bet
   * result arrives; KenoGrid drives the staggered reveal by calling
   * addRevealedNumber for each index in revealResult.results, then calling
   * onFinaliseReveal and onRevealSettled when the sequence completes.
   */
  revealResult: KenoBetResult | null;
  /** Store action: appends one drawn index to revealedNumbers. */
  addRevealedNumber: (index: number) => void;
  /** Store action: sets isRevealComplete = true (shows miss state). */
  onFinaliseReveal: () => void;
  /**
   * Controller callback: push result to history, clear reveal state, resolve
   * the auto-bet runner's pending promise. Called after the full reveal + a
   * brief display pause so the player can see the miss/hit state.
   */
  onRevealSettled: () => void;
  /** Toggle a tile in/out of the selected set (disabled during reveal). */
  onToggleTile: (index: number) => void;
  /** Disable all tile interactions (true while a bet is pending). */
  disabled?: boolean;
  /**
   * When true, all three reveal timings are compressed to turbo values:
   *   stagger 0 ms, post-reveal settle 50 ms, finalise-to-settled 100 ms.
   * Captured at reveal start; mid-reveal turbo toggles are intentionally ignored.
   */
  turbo?: boolean;
  /** 0-based indices of tiles that won last round; drives looping glow pulse. */
  pulsingTiles?: ReadonlySet<number>;
  /**
   * Freeze-phase exit trigger (exit trigger 3). Called when the player clicks a
   * previously-selected tile while the board is frozen (isRevealComplete true,
   * revealResult null). The controller clears reveal state and toggles the tile.
   * Undefined means freeze-exit via tile click is disabled.
   */
  onExitFreeze?: (index: number) => void;
}

export function KenoGrid({
  selectedTiles,
  revealedNumbers,
  isRevealComplete,
  revealResult,
  addRevealedNumber,
  onFinaliseReveal,
  onRevealSettled,
  onToggleTile,
  disabled = false,
  turbo = false,
  pulsingTiles,
  onExitFreeze,
}: KenoGridProps) {
  // Drive the staggered reveal sequence. Fires when revealResult transitions
  // from null → a result object. Each setTimeout call adds one drawn index to
  // revealedNumbers (which updates tile state in the store), so each KenoTile
  // reacts to its own state change and plays its entrance animation
  // independently — no animation logic lives here.
  React.useEffect(() => {
    if (!revealResult) return;

    const drawn = revealResult.results; // always 10 drawn 0-based indices
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Timings are captured once at reveal start; mid-reveal turbo toggles are
    // intentionally ignored (turbo is excluded from this effect's deps).
    const staggerMs = turbo ? KENO_REVEAL_STEP_TURBO_MS : KENO_REVEAL_STEP_MS;
    const postRevealMs = turbo ? KENO_POST_REVEAL_SETTLE_TURBO_MS : KENO_POST_REVEAL_SETTLE_MS;
    const finaliseToSettledMs = turbo ? KENO_FINALISE_TO_SETTLED_TURBO_MS : KENO_FINALISE_TO_SETTLED_MS;

    drawn.forEach((drawnIndex, i) => {
      timers.push(
        setTimeout(
          () => {
            addRevealedNumber(drawnIndex);

            // After the last tile's reveal step, wait for its entrance animation
            // to finish, then mark reveal complete and schedule the settle call.
            if (i === drawn.length - 1) {
              timers.push(
                setTimeout(() => {
                  onFinaliseReveal();

                  timers.push(
                    setTimeout(() => {
                      onRevealSettled();
                    }, finaliseToSettledMs),
                  );
                }, postRevealMs),
              );
            }
          },
          i * staggerMs,
        ),
      );
    });

    return () => timers.forEach(clearTimeout);
    // Stable store actions (Zustand) and callbacks don't change between renders.
    // turbo is intentionally excluded: changing turbo mid-reveal is not supported
    // and would require resetting the in-flight reveal sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealResult]);

  // Tile interaction is locked while a reveal is active or the caller signals
  // disabled (bet pending / auto-pick running). During the freeze phase
  // (isRevealComplete true, revealResult null) tiles are not globally disabled —
  // any tile click exits freeze and toggles that index via onExitFreeze.
  const tilesDisabled = disabled || revealResult !== null;

  // Freeze phase: reveal animation done, board holds its revealed state.
  // All tiles receive the exit-freeze handler so any click exits freeze.
  const isFrozen = isRevealComplete && revealResult === null;

  return (
    // 8 columns × 5 rows.
    // w-fit: shrinks the grid to its content width (8 × 67px + 7 × 4.75px = ~569px)
    // so 1fr columns equal tile width exactly and gaps match Figma (4.75px).
    // Without w-fit the 1fr columns expand to fill the parent, making gaps look huge.
    // mx-auto: centers the fixed-width grid in the wider parent area.
    <div
      aria-label="Keno number grid"
      className="grid grid-cols-8 gap-[2px] w-full md:gap-[4.75px] lg:w-fit lg:mx-auto"
      role="group"
    >
      {TILE_INDICES.map((i) => {
        // Route the toggle handler based on phase:
        //   reveal active / globally disabled → undefined (no interaction)
        //   freeze phase → ALL tiles get the exit-freeze handler (any click exits)
        //   normal selection → all tiles get the regular toggle
        let tileToggle: (() => void) | undefined;
        if (!tilesDisabled) {
          if (isFrozen) {
            if (onExitFreeze) {
              tileToggle = () => onExitFreeze(i);
            }
          } else {
            tileToggle = () => onToggleTile(i);
          }
        }

        return (
          <KenoTile
            disabled={tilesDisabled}
            index={i}
            key={i}
            onToggle={tileToggle}
            pulsing={pulsingTiles?.has(i)}
            state={getKenoTileState(
              i,
              selectedTiles,
              revealedNumbers,
              isRevealComplete,
            )}
          />
        );
      })}
    </div>
  );
}
