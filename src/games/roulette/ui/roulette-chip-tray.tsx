"use client";

import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/primitives/button";
import {
  ROULETTE_CHIP_DENOMINATIONS,
  type RouletteColor,
} from "../config/roulette-defaults";
import { formatMoney } from "../lib/roulette-decimal";

interface RouletteChipTrayProps {
  selectedChip: number;
  onSelectChip: (chip: number) => void;
  totalBet: string;
  onClear: () => void;
  clearDisabled: boolean;
}

const CHIP_TONE: Record<number, RouletteColor> = {
  1: "green",
  5: "red",
  25: "black",
  100: "green",
  500: "red",
};

const CHIP_TONE_CLASS: Record<RouletteColor, string> = {
  green: "bg-primary text-on-primary",
  red: "bg-danger text-text",
  black: "bg-surface-3 text-text",
};

export function RouletteChipTray({
  clearDisabled,
  onClear,
  onSelectChip,
  selectedChip,
  totalBet,
}: RouletteChipTrayProps) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-surface px-4 py-4 shadow-inset-hi">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-text">Chip</span>
        <span className="text-sm font-medium text-text-muted">
          Total bet{" "}
          <span className="font-black text-text">{formatMoney(totalBet)}</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ROULETTE_CHIP_DENOMINATIONS.map((chip) => {
          const active = chip === selectedChip;

          return (
            <button
              aria-label={`Select chip ${chip}`}
              aria-pressed={active}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-pill border-2 text-sm font-black transition-transform",
                CHIP_TONE_CLASS[CHIP_TONE[chip] ?? "black"],
                active
                  ? "scale-110 border-text shadow-glow"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
              key={chip}
              onClick={() => onSelectChip(chip)}
              type="button"
            >
              {chip}
            </button>
          );
        })}
      </div>

      <Button
        className="w-full"
        disabled={clearDisabled}
        onClick={onClear}
        size="sm"
        type="button"
        variant="secondary"
      >
        Clear bets
      </Button>
    </div>
  );
}
