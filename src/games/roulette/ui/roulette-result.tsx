"use client";

import { useEffect, useState } from "react";
import { Coins, Trophy } from "lucide-react";
import { formatMoney, isPositiveMoney } from "../lib/roulette-decimal";
import type { RouletteBetResult } from "../model/roulette-types";

interface RouletteResultProps {
  result: RouletteBetResult | null;
}

const DISMISS_MS = 2000;

export function RouletteResult({ result }: RouletteResultProps) {
  const [visible, setVisible] = useState(false);

  // Derive stable primitives so the effect dep array is exhaustive-deps-clean.
  const betId = result?.betId ?? null;
  const isWin = result !== null && isPositiveMoney(result.payout);

  useEffect(() => {
    if (!isWin || betId === null) return;

    // Both setVisible calls are inside timer callbacks — react-hooks/set-state-in-effect
    // (React Compiler rule) forbids synchronous setState in an effect body.
    // The 0ms show timer is imperceptible; cleanup cancels both timers so rapid
    // back-to-back wins restart the countdown rather than stacking timers.
    const showId = setTimeout(() => setVisible(true), 0);
    const hideId = setTimeout(() => setVisible(false), DISMISS_MS);
    return () => {
      clearTimeout(showId);
      clearTimeout(hideId);
    };
  }, [betId, isWin]);

  // isWin guard hides the overlay immediately when a loss arrives even if the
  // hide timer was cancelled (cleanup) but visible is still true from prior win.
  if (!visible || !isWin || !result) {
    return null;
  }

  return (
    // Full-size blurred backdrop scoped to the right game panel.
    // rounded-tr/br match the panel card outline (--radius-xl = 16px).
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-tr-xl rounded-br-xl backdrop-blur-[2px]"
      style={{ background: "rgba(14,18,28,0.8)" }}
    >
      {/* Result card: 190px fixed width, two stacked blocks clipped by the outer radius. */}
      <div className="flex w-[190px] flex-col overflow-hidden rounded-lg">
        {/* Trophy header — Figma gradient: #0a271a→#39b17d (raw hex; no @theme token match;
            flag for future design-token alignment with --color-primary family). */}
        <div
          className="flex items-center justify-center border border-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)] px-4 py-3"
          style={{ background: "linear-gradient(to bottom, #0a271a, #39b17d)" }}
        >
          {/* Inner pill capsule (--radius-xl) holds icon + multiplier. */}
          <div className="flex items-center gap-1.5 rounded-xl px-4 py-1">
            {/* Trophy icon: lucide Trophy (20×20). Figma specifies "Icon/All/cup" SVG asset;
                lucide Trophy is the closest available substitute. */}
            <Trophy className="size-5 shrink-0 text-text" strokeWidth={1.5} />
            <span className="text-base/5 font-semibold tabular-nums text-text">
              {result.multiplier}x
            </span>
          </div>
        </div>

        {/* Payout row — dark neutral gradient (--color-surface-3 → --color-border-2). */}
        <div className="flex h-16 items-center justify-between bg-gradient-to-b from-surface-3 to-border-2 p-4">
          {/* Left: coin icon + formatted payout total. */}
          <div className="flex items-center gap-1.5">
            {/* Coin icon: lucide Coins (16px). Figma calls for "Icon/Doctor/main coin-dark"
                project asset; no matching small UI icon found in src/shared/assets.
                Replace with the project coin asset when a 16px SVG variant is available. */}
            <Coins className="size-4 shrink-0 text-text" strokeWidth={1.5} />
            <span className="text-base/5 font-semibold tabular-nums text-text">
              {formatMoney(result.payout)}
            </span>
          </div>

          {/* Right: winning number badge — neutral bg, no roulette color-coding (per design). */}
          <div className="flex size-10 items-center justify-center rounded-sm bg-border-2">
            <span className="text-sm font-semibold text-text">
              {result.randomPosition}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
