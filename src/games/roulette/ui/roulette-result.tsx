"use client";

import { cn } from "@/shared/lib";
import {
  getRouletteColor,
  type RouletteColor,
} from "../config/roulette-defaults";
import { formatMoney, isPositiveMoney } from "../lib/roulette-decimal";
import type { RouletteBetResult } from "../model/roulette-types";

interface RouletteResultProps {
  result: RouletteBetResult | null;
}

const NUMBER_TONE_CLASS: Record<RouletteColor, string> = {
  green: "bg-primary text-on-primary",
  red: "bg-danger text-text",
  black: "bg-surface-3 text-text",
};

export function RouletteResult({ result }: RouletteResultProps) {
  if (!result) {
    return (
      <div className="flex items-center justify-center rounded-md border border-border bg-surface px-4 py-4 text-sm font-medium text-text-muted shadow-inset-hi">
        Place your chips and spin to see the result.
      </div>
    );
  }

  // `payout` is the authoritative total return (stake + winnings); a win is any
  // positive payout. `multiplier` is shown for reference only and is never used
  // for math (multi-bet semantics are unconfirmed).
  const didWin = isPositiveMoney(result.payout);

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-4 py-4 shadow-inset-hi">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-pill text-lg font-black",
            NUMBER_TONE_CLASS[getRouletteColor(result.randomPosition)],
          )}
        >
          {result.randomPosition}
        </span>
        <div className="flex flex-col">
          <span
            className={cn(
              "text-sm font-black",
              didWin ? "text-primary" : "text-text-muted",
            )}
          >
            {didWin ? "Win" : "No win"}
          </span>
          <span className="text-xs font-medium text-text-subtle">
            Bet {formatMoney(result.betSize)} · {result.multiplier}x
          </span>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xs font-bold text-text-muted">Payout</p>
        <p className="text-lg font-black text-text">
          {formatMoney(result.payout)}
        </p>
      </div>
    </div>
  );
}
