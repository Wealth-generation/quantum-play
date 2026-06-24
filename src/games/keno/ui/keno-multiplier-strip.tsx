"use client";

import ChipGreen from "@/shared/assets/games/keno/icons/chip-green.svg";
import { cn } from "@/shared/lib";
import { getKenoMultiplierRow } from "../config/keno-defaults";
import type { KenoRiskLevel } from "../model/keno-types";

interface KenoMultiplierStripProps {
  /** Number of tiles currently selected (0 = show placeholder). */
  pickCount: number;
  risk: KenoRiskLevel;
  /**
   * 0-based drawn indices from the store (revealedNumbers). Populated during
   * the reveal animation and retained through the entire freeze phase — cleared
   * only by clearReveal() when the next bet starts or a tile click exits freeze.
   * Binding highlight to this (not to revealResult/currentResult) ensures the
   * cumulative strip highlight persists after the win overlay is dismissed.
   */
  revealedNumbers?: readonly number[];
  /** The tiles the player selected (0-based indices). Used to derive match count. */
  selectedTiles?: ReadonlySet<number>;
  isRevealComplete?: boolean;
}

// Figma node 3986:40467 "place for potential win multipliers":
//   bg = rgba(43,48,59,0.5) = --color-border-2 at 50% = bg-border-2/50
//   radius = --radius-lg = 12px
const OUTER = "rounded-[var(--radius-lg,12px)] bg-border-2/50";

export function KenoMultiplierStrip({
  isRevealComplete = false,
  pickCount,
  revealedNumbers,
  risk,
  selectedTiles,
}: KenoMultiplierStripProps) {
  // Placeholder — no tiles selected yet.
  if (pickCount === 0) {
    return (
      <div className={cn(OUTER, "flex items-center justify-center px-4 py-3")}>
        <p className="text-center text-base font-medium text-text-muted">
          Select numbers 1–10 to start
        </p>
      </div>
    );
  }

  const row = getKenoMultiplierRow(risk, pickCount);
  if (!row) return null;

  // highlightedIndex = number of the player's selected tiles that were drawn
  // (selected ∩ revealedNumbers). Only computed once isRevealComplete is true
  // and at least one number has been drawn — this ensures the highlight appears
  // at the correct moment (after finaliseReveal) and not mid-animation.
  // revealedNumbers persists through the entire freeze phase (cleared only by
  // clearReveal on next bet / freeze exit), so the highlight survives overlay dismiss.
  let highlightedIndex: number | undefined;
  if (isRevealComplete && revealedNumbers && revealedNumbers.length > 0 && selectedTiles) {
    highlightedIndex = revealedNumbers.filter((r) => selectedTiles.has(r)).length;
  }

  // Active — cells fill the same dark rounded container.
  // overflow-hidden clips cell corners at the container edges so the outer
  // radius creates the visual boundary. Cells use min-w-0 (not min-w-[3rem])
  // so up to 11 cells (10-pick row) compress to fit within the grid width.
  return (
    <div
      aria-label="Multiplier table"
      className={cn(OUTER, "overflow-hidden")}
      role="list"
    >
      <div className="flex items-stretch gap-[6px]">
        {row.map((multiplier, matchCount) => {
          // isExact: the cell whose index equals the player's achieved match count.
          // isCumulative: all cells from 0 through highlightedIndex inclusive —
          //   the left-to-right run that fills up to the achieved result.
          const isExact = highlightedIndex === matchCount;
          const isCumulative =
            highlightedIndex !== undefined && matchCount <= highlightedIndex;

          return (
            <div
              aria-current={isExact ? "true" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col overflow-hidden rounded-[8px]",
                "transition-opacity duration-150",
                isRevealComplete &&
                  highlightedIndex !== undefined &&
                  !isCumulative
                  ? "opacity-40"
                  : "opacity-100",
                isExact && "ring-1 ring-primary",
              )}
              key={matchCount}
              role="listitem"
            >
              {/* Top card — green gradient with chip icon + match count.
                  px-2 instead of px-4: at max 11 cells each cell is ~46px,
                  px-4 (32px padding) would leave no room for the content. */}
              <div
                className="flex items-center justify-center border border-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)] px-2 py-[6px]"
                style={{ background: "linear-gradient(to bottom, #0a271a, #39b17d)" }}
              >
                <div className="flex items-center gap-0.5">
                  <ChipGreen aria-hidden className="size-3 shrink-0" />
                  <span className="whitespace-nowrap text-[10px] leading-[13px] text-text">
                    {matchCount}x
                  </span>
                </div>
              </div>

              {/* Bottom card — slightly lighter bg (bg-surface-3) for cumulative
                  highlighted cells (0..matchCount); normal dark gradient otherwise. */}
              <div
                className={cn(
                  "flex flex-1 items-center justify-center px-2 py-2",
                  isCumulative
                    ? "bg-surface-3"
                    : "bg-gradient-to-b from-surface-3 to-border-2",
                )}
              >
                <span className="tabular-nums text-center text-[10px] leading-[13px] font-semibold text-text">
                  {multiplier > 0 ? `${multiplier}x` : "0x"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
