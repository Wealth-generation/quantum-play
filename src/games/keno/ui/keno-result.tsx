"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import ChipGreen from "@/shared/assets/games/keno/icons/chip-green.svg";
import diamondSrc from "@/shared/assets/games/keno/images/diamond.webp";
import { formatMoney } from "../lib/keno-decimal";
import type { KenoBetResult } from "../model/keno-types";

interface KenoResultProps {
  /** Win result to display. Controller sets this after reveal settles, clears at
   *  the start of the next bet. Null hides the overlay. */
  result: KenoBetResult | null;
  /** The tiles the player selected — used to derive match count display. */
  selectedTiles: ReadonlySet<number>;
  /** Called when the user clicks anywhere on the backdrop to dismiss. */
  onDismiss?: () => void;
}

export function KenoResult({ result, selectedTiles, onDismiss }: KenoResultProps) {
  // multiplier <= 0 means a true zero-payout round (e.g. CLASSIC pick=1 match=0).
  // Sub-1x multipliers (LOW 0.7x, MEDIUM 0.4x) are intentionally shown — product
  // design: any non-zero payout surfaces the overlay. See use-keno-game-controller.ts.
  if (!result || result.multiplier <= 0) return null;

  const matchCount = result.results.filter((r) => selectedTiles.has(r)).length;

  return (
    // Full-size blurred backdrop scoped to the right game panel.
    // Click anywhere to dismiss — cursor-pointer signals interactivity.
    <div
      aria-live="polite"
      className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center backdrop-blur-[2px]"
      onClick={onDismiss}
      role="button"
      style={{ background: "rgba(14,18,28,0.8)" }}
      tabIndex={-1}
    >
      {/* Result card — 190px fixed width, matching Figma node 4107:123885. */}
      <div className="flex w-[190px] flex-col overflow-hidden rounded-lg">
        {/* Trophy header: green gradient background (Figma: #0a271a → #39b17d).
            No @theme token match for these two raw hex values; flagged for
            future design-token alignment with --color-primary family. */}
        <div
          className="flex items-center justify-center border border-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)] px-4 py-3"
          style={{ background: "linear-gradient(to bottom, #0a271a, #39b17d)" }}
        >
          <div className="flex items-center gap-1.5 rounded-xl px-4 py-1">
            <Trophy className="size-5 shrink-0 text-text" strokeWidth={1.5} />
            <span className="text-base/5 font-semibold tabular-nums text-text">
              {result.multiplier}x
            </span>
          </div>
        </div>

        {/* Payout row: dark neutral gradient (surface-3 → border-2). */}
        <div className="flex h-16 items-center justify-between bg-gradient-to-b from-surface-3 to-border-2 p-4">
          {/* Left: chip-green icon + payout amount */}
          <div className="flex items-center gap-1.5">
            <ChipGreen aria-hidden className="size-5 shrink-0" />
            <span className="text-base/5 font-semibold tabular-nums text-text">
              {formatMoney(result.payout)}
            </span>
          </div>

          {/* Right: diamond gem icon + match count */}
          <div className="flex items-center gap-1.5">
            <Image
              alt=""
              aria-hidden
              className="size-4 object-contain"
              height={16}
              src={diamondSrc}
              width={16}
            />
            <span className="text-sm font-semibold text-text">{matchCount}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
