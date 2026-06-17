"use client";

import { cn } from "@/shared/lib";
import {
  getRouletteColor,
  type RouletteBetColor,
} from "../config/roulette-defaults";
import type { RoulettePlacements } from "../lib/roulette-bets";
import { formatMoney } from "../lib/roulette-decimal";
import type {
  ColumnBetKey,
  DozenBetKey,
  HalfBetKey,
  ParityBetKey,
} from "../model/roulette-types";

interface RouletteTableProps {
  placements: RoulettePlacements;
  onPlaceStraight: (value: number) => void;
  onPlaceColor: (color: RouletteBetColor) => void;
  onPlaceDozen: (dozen: DozenBetKey) => void;
  onPlaceColumn: (column: ColumnBetKey) => void;
  onPlaceParity: (parity: ParityBetKey) => void;
  onPlaceHalf: (half: HalfBetKey) => void;
  highlightNumber: number | null;
  disabled: boolean;
}

// Board layout order (Figma 3855-15335): 12 columns × 3 rows, top row first.
// Top = 3,6,…36 (3c); middle = 2,5,…35 (3c-1); bottom = 1,4,…34 (3c-2).
const BOARD_NUMBERS: number[] = [0, 1, 2].flatMap((sub) =>
  Array.from({ length: 12 }, (_, column) => 3 * (column + 1) - sub),
);

// Zone border #3f4a59 @50% has no @theme token → color-mix from --color-border-2.
const ZONE_BORDER =
  "border border-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)]";

const BLACK_CELL = "bg-gradient-to-b from-surface-3 to-border-2";

function ChipBadge({ amount }: { amount: string }) {
  return (
    <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-pill border border-text/60 bg-bg px-1 text-[10px] font-bold text-text">
      {formatMoney(amount)}
    </span>
  );
}

export function RouletteTable({
  disabled,
  highlightNumber,
  onPlaceColor,
  onPlaceColumn,
  onPlaceDozen,
  onPlaceHalf,
  onPlaceParity,
  onPlaceStraight,
  placements,
}: RouletteTableProps) {
  return (
    // Native board is 625px wide; fluid below that. 14 equal columns (zero + 12
    // number columns + 2:1) with aspect-square cells keep the proportions while
    // shrinking to fit the column — no transform/scale needed.
    <div className="mx-auto flex w-full max-w-[625px] flex-col gap-[5px] text-sm font-semibold text-text">
      {/* Number grid: zero (col 1, 3 rows) + 36 numbers (cols 2–13) + 2:1 (col 14) */}
      <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-[5px]">
        {/* Zero — straight bet 0, spans all three rows */}
        <button
          aria-label="Bet on number 0"
          className="relative col-start-1 row-start-1 row-span-3 flex items-center justify-center rounded-[7px] bg-primary text-on-primary transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110"
          disabled={disabled}
          onClick={() => onPlaceStraight(0)}
          type="button"
        >
          0
          {placements.straight["0"] ? (
            <ChipBadge amount={placements.straight["0"]} />
          ) : null}
        </button>

        {/* 2:1 column-bet cells. gridRowStart 1=TOP (3,6,9…36), 2=MIDDLE (2,5,8…35),
            3=BOTTOM (1,4,7…34) — must match ColumnBetKey enum ordering. */}
        {(
          [
            { row: 1, key: "TOP" as ColumnBetKey },
            { row: 2, key: "MIDDLE" as ColumnBetKey },
            { row: 3, key: "BOTTOM" as ColumnBetKey },
          ] as const
        ).map(({ row, key }) => {
          const amount = placements.column[key];

          return (
            <button
              aria-label={`Bet on column ${key.toLowerCase()}`}
              className={cn(
                "relative col-start-14 flex aspect-square items-center justify-center rounded-sm bg-surface transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
                ZONE_BORDER,
              )}
              disabled={disabled}
              key={`col-${row}`}
              onClick={() => onPlaceColumn(key)}
              style={{ gridRowStart: row }}
              type="button"
            >
              2:1
              {amount ? <ChipBadge amount={amount} /> : null}
            </button>
          );
        })}

        {/* Number cells 1–36 — auto-flow into columns 2–13, row by row */}
        {BOARD_NUMBERS.map((value) => {
          const amount = placements.straight[String(value)];

          return (
            <button
              aria-label={`Bet on number ${value}`}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-sm transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
                getRouletteColor(value) === "red" ? "bg-danger" : BLACK_CELL,
                highlightNumber === value && "ring-2 ring-text shadow-glow",
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

      {/* Dozens row */}
      <div className="flex items-stretch gap-[3px]">
        {(
          [
            { label: "1 to 12", key: "FIRST" as DozenBetKey },
            { label: "13 to 24", key: "SECOND" as DozenBetKey },
            { label: "25 to 36", key: "THIRD" as DozenBetKey },
          ] as const
        ).map(({ label, key }) => {
          const amount = placements.dozen[key];

          return (
            <button
              aria-label={`Bet on dozens ${label}`}
              className={cn(
                "relative flex flex-1 items-center justify-center rounded-sm bg-surface px-[9px] py-[14px] transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
                ZONE_BORDER,
              )}
              disabled={disabled}
              key={label}
              onClick={() => onPlaceDozen(key)}
              type="button"
            >
              {label}
              {amount ? <ChipBadge amount={amount} /> : null}
            </button>
          );
        })}
      </div>

      {/* Even-money / parity / color row. */}
      <div className="flex items-stretch gap-[3px]">
        {/* half LOW = "1 to 18" */}
        <button
          aria-label="Bet on 1 to 18"
          className={cn(
            "relative flex flex-1 items-center justify-center rounded-sm bg-surface px-[9px] py-[14px] transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
            ZONE_BORDER,
          )}
          disabled={disabled}
          onClick={() => onPlaceHalf("LOW")}
          type="button"
        >
          1 to 18
          {placements.half["LOW"] ? (
            <ChipBadge amount={placements.half["LOW"]} />
          ) : null}
        </button>

        {/* parity EVEN */}
        <button
          aria-label="Bet on Even"
          className={cn(
            "relative flex flex-1 items-center justify-center rounded-sm bg-surface px-[9px] py-[14px] transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
            ZONE_BORDER,
          )}
          disabled={disabled}
          onClick={() => onPlaceParity("EVEN")}
          type="button"
        >
          Even
          {placements.parity["EVEN"] ? (
            <ChipBadge amount={placements.parity["EVEN"]} />
          ) : null}
        </button>

        {/* color bets — Red + Black */}
        {(["red", "black"] as RouletteBetColor[]).map((color) => {
          const amount = placements.color[color];

          return (
            <button
              aria-label={`Bet on ${color}`}
              className={cn(
                "relative flex flex-1 items-center justify-center rounded-sm transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
                color === "red" ? "bg-danger" : BLACK_CELL,
              )}
              disabled={disabled}
              key={color}
              onClick={() => onPlaceColor(color)}
              type="button"
            >
              {amount ? <ChipBadge amount={amount} /> : null}
            </button>
          );
        })}

        {/* parity ODD */}
        <button
          aria-label="Bet on Odd"
          className={cn(
            "relative flex flex-1 items-center justify-center rounded-sm bg-surface px-[9px] py-[14px] transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
            ZONE_BORDER,
          )}
          disabled={disabled}
          onClick={() => onPlaceParity("ODD")}
          type="button"
        >
          Odd
          {placements.parity["ODD"] ? (
            <ChipBadge amount={placements.parity["ODD"]} />
          ) : null}
        </button>

        {/* half HIGH = "19 to 36" */}
        <button
          aria-label="Bet on 19 to 36"
          className={cn(
            "relative flex flex-1 items-center justify-center rounded-sm bg-surface px-[9px] py-[14px] transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
            ZONE_BORDER,
          )}
          disabled={disabled}
          onClick={() => onPlaceHalf("HIGH")}
          type="button"
        >
          19 to 36
          {placements.half["HIGH"] ? (
            <ChipBadge amount={placements.half["HIGH"]} />
          ) : null}
        </button>
      </div>
    </div>
  );
}
