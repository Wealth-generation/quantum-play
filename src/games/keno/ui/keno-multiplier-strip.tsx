"use client";

import ChipGreen from "@/shared/assets/games/keno/icons/chip-green.svg";
import { cn } from "@/shared/lib";
import { getKenoMultiplierRow } from "../config/keno-defaults";
import type { KenoBetResult, KenoRiskLevel } from "../model/keno-types";

interface KenoMultiplierStripProps {
  /** Number of tiles currently selected (0 = show placeholder). */
  pickCount: number;
  risk: KenoRiskLevel;
  /**
   * The settled bet result. When present and isRevealComplete is true the
   * achieved-match cell is highlighted.
   */
  revealResult?: KenoBetResult | null;
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
  revealResult,
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

  let highlightedIndex: number | undefined;
  if (isRevealComplete && revealResult && selectedTiles) {
    highlightedIndex = revealResult.results.filter((r) =>
      selectedTiles.has(r),
    ).length;
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
          const isHighlighted = highlightedIndex === matchCount;

          return (
            <div
              aria-current={isHighlighted ? "true" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col overflow-hidden rounded-[8px]",
                "transition-opacity duration-150",
                isRevealComplete &&
                  highlightedIndex !== undefined &&
                  !isHighlighted
                  ? "opacity-40"
                  : "opacity-100",
                isHighlighted && "ring-1 ring-primary",
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

              {/* Bottom card — neutral dark gradient with multiplier value. */}
              <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-surface-3 to-border-2 px-2 py-2">
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
