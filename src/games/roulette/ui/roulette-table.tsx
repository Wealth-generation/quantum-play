"use client";

import { cn } from "@/shared/lib";
import {
  getRouletteColor,
  ROULETTE_NUMBERS,
  type RouletteBetColor,
  type RouletteColor,
} from "../config/roulette-defaults";
import type { RoulettePlacements } from "../lib/roulette-bets";
import { formatMoney } from "../lib/roulette-decimal";

interface RouletteTableProps {
  placements: RoulettePlacements;
  onPlaceStraight: (value: number) => void;
  onPlaceColor: (color: RouletteBetColor) => void;
  highlightNumber: number | null;
  disabled: boolean;
}

const NUMBER_TONE_CLASS: Record<RouletteColor, string> = {
  green: "bg-primary text-on-primary",
  red: "bg-danger text-text",
  black: "bg-surface-3 text-text",
};

function ChipBadge({ amount }: { amount: string }) {
  return (
    <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-pill border border-text/60 bg-bg px-1 text-[10px] font-black text-text">
      {formatMoney(amount)}
    </span>
  );
}

export function RouletteTable({
  disabled,
  highlightNumber,
  onPlaceColor,
  onPlaceStraight,
  placements,
}: RouletteTableProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-6 gap-1.5 md:grid-cols-[repeat(12,minmax(0,1fr))]">
        {ROULETTE_NUMBERS.map((value) => {
          const amount = placements.straight[String(value)];
          const highlighted = highlightNumber === value;

          return (
            <button
              aria-label={`Bet on number ${value}`}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-sm text-sm font-black transition-transform disabled:cursor-not-allowed disabled:opacity-60",
                NUMBER_TONE_CLASS[getRouletteColor(value)],
                value === 0 && "col-span-6 aspect-auto py-2 md:col-span-12",
                highlighted
                  ? "ring-2 ring-text shadow-glow"
                  : "hover:scale-105",
              )}
              disabled={disabled}
              key={value}
              onClick={() => onPlaceStraight(value)}
              type="button"
            >
              {value}
              {amount ? <ChipBadge amount={amount} /> : null}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {(["red", "black"] as RouletteBetColor[]).map((color) => {
          const amount = placements.color[color];

          return (
            <button
              aria-label={`Bet on ${color}`}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-sm py-3 text-sm font-black uppercase tracking-widest transition-transform disabled:cursor-not-allowed disabled:opacity-60",
                NUMBER_TONE_CLASS[color],
                "hover:scale-[1.02]",
              )}
              disabled={disabled}
              key={color}
              onClick={() => onPlaceColor(color)}
              type="button"
            >
              {color}
              {amount ? <ChipBadge amount={amount} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
