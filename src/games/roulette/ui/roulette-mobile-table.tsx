"use client";

import { useState } from "react";
import ClearIcon from "@/shared/assets/games/roulette/icons/clear-icon.svg";
import UndoIcon from "@/shared/assets/games/roulette/icons/undo-icon.svg";
import { cn } from "@/shared/lib";
import {
  getRouletteColor,
  type RouletteBetColor,
} from "../config/roulette-defaults";
import { getOutsideBetNumbers, type RoulettePlacements } from "../lib/roulette-bets";
import type {
  ColumnBetKey,
  DozenBetKey,
  HalfBetKey,
  ParityBetKey,
} from "../model/roulette-types";
import { RouletteChipStack } from "./roulette-chip-stack";

// Same prop shape as RouletteTable — identical bet handlers, placements, disabled
// gate, and chip-stack rendering. Only the grid arrangement differs.
interface RouletteMobileTableProps {
  placements: RoulettePlacements;
  onPlaceStraight: (value: number) => void;
  onPlaceColor: (color: RouletteBetColor) => void;
  onPlaceDozen: (dozen: DozenBetKey) => void;
  onPlaceColumn: (column: ColumnBetKey) => void;
  onPlaceParity: (parity: ParityBetKey) => void;
  onPlaceHalf: (half: HalfBetKey) => void;
  highlightNumber: number | null;
  disabled: boolean;
  onClear?: () => void;
  clearDisabled?: boolean;
  onUndo?: () => void;
  undoDisabled?: boolean;
}

// Zone border: rgba(63,74,89,0.5) per Figma; no exact project token — using the
// established color-mix approximation (accepted per GAP-16 decision).
const ZONE_BORDER =
  "border border-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)]";

const BLACK_CELL = "bg-gradient-to-b from-surface-3 to-border-2";

// Clear / Undo enabled background — neutral gradient matching black number cells.
const BTN_NEUTRAL = "bg-gradient-to-b from-surface-3 to-border-2 border border-border";

const DISABLED_BTN =
  "cursor-not-allowed bg-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)] text-text-placeholder";

// Shared classes for all outside-bet sidebar cells (flex-1 fills available height).
const OUTSIDE_CELL =
  "relative flex flex-1 items-center justify-center rounded-[4px] bg-surface px-1 text-center leading-tight transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110";

// Number source order: desktop row 1 (TOP: multiples of 3) → row 2 (MIDDLE) → row 3 (BOTTOM).
// flex-wrap at w-[130px] wraps every 3 × 40px cells (+ 2 × 5px gaps = 130px exactly),
// producing 12 visible rows of 3 — equivalent to rotating the desktop board 90°.
//   rows  1–4:  3,6,9,…,36   (TOP column-bet group)
//   rows  5–8:  2,5,8,…,35   (MIDDLE column-bet group)
//   rows 9–12:  1,4,7,…,34   (BOTTOM column-bet group)
const MOBILE_NUMBERS: number[] = [
  3,  6,  9,  12, 15, 18, 21, 24, 27, 30, 33, 36,
  2,  5,  8,  11, 14, 17, 20, 23, 26, 29, 32, 35,
  1,  4,  7,  10, 13, 16, 19, 22, 25, 28, 31, 34,
];

export function RouletteMobileTable({
  clearDisabled,
  disabled,
  highlightNumber,
  onClear,
  onPlaceColor,
  onPlaceColumn,
  onPlaceDozen,
  onPlaceHalf,
  onPlaceParity,
  onPlaceStraight,
  onUndo,
  placements,
  undoDisabled,
}: RouletteMobileTableProps) {
  const [hoveredNumbers, setHoveredNumbers] = useState<ReadonlySet<number>>(new Set());
  return (
    // Outer flex row. Default items-stretch causes the sidebar columns to expand
    // to match the numbers section height (~625px at 40px cells), so flex-1 cells
    // in each column divide the full available height without explicit h-full.
    <div className="flex gap-[8px] text-sm font-semibold text-text">

      {/* ── Sidebar: two parallel 58px columns, 4px gap between them ── */}
      <div className="flex shrink-0 gap-[4px]">

        {/* Column 1: even-money bets (6 flex-1 cells) + Clear button at bottom */}
        <div className="flex w-[58px] flex-col gap-[5px]">
          <button
            aria-label="Bet on 1 to 18"
            className={cn(OUTSIDE_CELL, ZONE_BORDER)}
            disabled={disabled}
            onClick={() => onPlaceHalf("LOW")}
            onMouseEnter={() => setHoveredNumbers(getOutsideBetNumbers("half", "LOW"))}
            onMouseLeave={() => setHoveredNumbers(new Set())}
            type="button"
          >
            1 to 18
            {placements.half["LOW"] ? (
              <RouletteChipStack amount={placements.half["LOW"]} />
            ) : null}
          </button>

          <button
            aria-label="Bet on Even"
            className={cn(OUTSIDE_CELL, ZONE_BORDER)}
            disabled={disabled}
            onClick={() => onPlaceParity("EVEN")}
            onMouseEnter={() => setHoveredNumbers(getOutsideBetNumbers("parity", "EVEN"))}
            onMouseLeave={() => setHoveredNumbers(new Set())}
            type="button"
          >
            Even
            {placements.parity["EVEN"] ? (
              <RouletteChipStack amount={placements.parity["EVEN"]} />
            ) : null}
          </button>

          {/* Red: bg-danger (#dc2626) accepted per GAP-15 decision */}
          <button
            aria-label="Bet on Red"
            className="relative flex flex-1 items-center justify-center rounded-[4px] bg-danger transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110"
            disabled={disabled}
            onClick={() => onPlaceColor("red")}
            type="button"
          >
            {placements.color["red"] ? (
              <RouletteChipStack amount={placements.color["red"]} />
            ) : null}
          </button>

          <button
            aria-label="Bet on Black"
            className={cn(
              "relative flex flex-1 items-center justify-center rounded-[4px] transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
              BLACK_CELL,
            )}
            disabled={disabled}
            onClick={() => onPlaceColor("black")}
            type="button"
          >
            {placements.color["black"] ? (
              <RouletteChipStack amount={placements.color["black"]} />
            ) : null}
          </button>

          <button
            aria-label="Bet on Odd"
            className={cn(OUTSIDE_CELL, ZONE_BORDER)}
            disabled={disabled}
            onClick={() => onPlaceParity("ODD")}
            onMouseEnter={() => setHoveredNumbers(getOutsideBetNumbers("parity", "ODD"))}
            onMouseLeave={() => setHoveredNumbers(new Set())}
            type="button"
          >
            Odd
            {placements.parity["ODD"] ? (
              <RouletteChipStack amount={placements.parity["ODD"]} />
            ) : null}
          </button>

          <button
            aria-label="Bet on 19 to 36"
            className={cn(OUTSIDE_CELL, ZONE_BORDER)}
            disabled={disabled}
            onClick={() => onPlaceHalf("HIGH")}
            onMouseEnter={() => setHoveredNumbers(getOutsideBetNumbers("half", "HIGH"))}
            onMouseLeave={() => setHoveredNumbers(new Set())}
            type="button"
          >
            19 to 36
            {placements.half["HIGH"] ? (
              <RouletteChipStack amount={placements.half["HIGH"]} />
            ) : null}
          </button>

          {/* Clear — fixed 40px, pinned to the bottom of the even-money column */}
          <button
            aria-label="Clear bets"
            className={cn(
              "flex h-[40px] w-full shrink-0 items-center justify-center rounded-[4px] transition-colors",
              clearDisabled
                ? DISABLED_BTN
                : cn(BTN_NEUTRAL, "text-text hover:brightness-110"),
            )}
            disabled={clearDisabled}
            onClick={onClear}
            type="button"
          >
            <ClearIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Column 2: dozens (3 flex-1 cells) + Undo button at bottom */}
        <div className="flex w-[58px] flex-col gap-[5px]">
          {(
            [
              { label: "1 to 12",  key: "FIRST"  as DozenBetKey },
              { label: "13 to 24", key: "SECOND" as DozenBetKey },
              { label: "25 to 36", key: "THIRD"  as DozenBetKey },
            ] as const
          ).map(({ label, key }) => {
            const amount = placements.dozen[key];
            return (
              <button
                aria-label={`Bet on ${label}`}
                className={cn(OUTSIDE_CELL, ZONE_BORDER)}
                disabled={disabled}
                key={key}
                onClick={() => onPlaceDozen(key)}
                onMouseEnter={() => setHoveredNumbers(getOutsideBetNumbers("dozen", key))}
                onMouseLeave={() => setHoveredNumbers(new Set())}
                type="button"
              >
                {label}
                {amount ? <RouletteChipStack amount={amount} /> : null}
              </button>
            );
          })}

          {/* Undo — pinned to the bottom of the dozens column */}
          <button
            aria-label="Undo last bet"
            className={cn(
              "flex h-[40px] w-full shrink-0 items-center justify-center rounded-[4px] transition-colors",
              undoDisabled
                ? DISABLED_BTN
                : cn(BTN_NEUTRAL, "text-text hover:brightness-110"),
            )}
            disabled={undoDisabled}
            onClick={onUndo}
            type="button"
          >
            <UndoIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Numbers section: zero + number grid + 2:1 row ── */}
      <div className="flex flex-col gap-[5px]">

        {/* Zero — width scoped to the 3-column grid (130px), not the full board */}
        <button
          aria-label="Bet on number 0"
          className="relative flex h-[40px] w-[130px] items-center justify-center rounded-[5px] bg-primary text-on-primary transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110"
          disabled={disabled}
          onClick={() => onPlaceStraight(0)}
          type="button"
        >
          0
          {placements.straight["0"] ? (
            <RouletteChipStack amount={placements.straight["0"]} />
          ) : null}
        </button>

        {/* Number grid: flex-wrap, w-[130px].
            3 × 40px cells + 2 × 5px gaps = 130px → exactly 3 per row.
            MOBILE_NUMBERS source order ensures the wrap produces the Figma groupings:
            the first 4 rows show TOP numbers, next 4 MIDDLE, last 4 BOTTOM. */}
        <div className="flex w-[130px] flex-wrap gap-[5px]">
          {MOBILE_NUMBERS.map((value) => {
            const amount = placements.straight[String(value)];
            return (
              <button
                aria-label={`Bet on number ${value}`}
                className={cn(
                  "relative flex size-[40px] items-center justify-center rounded-[4px] transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
                  getRouletteColor(value) === "red" ? "bg-danger" : BLACK_CELL,
                  (highlightNumber === value || hoveredNumbers.has(value)) && "ring-2 ring-text shadow-glow",
                )}
                disabled={disabled}
                key={value}
                onClick={() => onPlaceStraight(value)}
                type="button"
              >
                {value}
                {amount ? <RouletteChipStack amount={amount} /> : null}
              </button>
            );
          })}
        </div>

        {/* 2:1 column-bet row — standalone below the number grid.
            LEFT=TOP (rows 1–4 above), MIDDLE=MIDDLE (rows 5–8), RIGHT=BOTTOM (rows 9–12). */}
        <div className="flex gap-[5px]">
          {(
            [
              { key: "TOP"    as ColumnBetKey },
              { key: "MIDDLE" as ColumnBetKey },
              { key: "BOTTOM" as ColumnBetKey },
            ] as const
          ).map(({ key }) => {
            const amount = placements.column[key];
            return (
              <button
                aria-label={`Bet on column ${key.toLowerCase()}`}
                className={cn(
                  "relative flex size-[40px] items-center justify-center rounded-[4px] bg-surface transition-transform disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:brightness-110",
                  ZONE_BORDER,
                )}
                disabled={disabled}
                key={key}
                onClick={() => onPlaceColumn(key)}
                onMouseEnter={() => setHoveredNumbers(getOutsideBetNumbers("column", key))}
                onMouseLeave={() => setHoveredNumbers(new Set())}
                type="button"
              >
                2:1
                {amount ? <RouletteChipStack amount={amount} /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
