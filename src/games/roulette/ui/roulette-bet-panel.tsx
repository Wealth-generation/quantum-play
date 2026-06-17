"use client";

import * as React from "react";
import BetAmountIcon from "@/shared/assets/games/roulette/icons/bet-amount-icon.svg";
import ChipValueIcon from "@/shared/assets/games/roulette/icons/chip-value-icon.svg";
import ClearIcon from "@/shared/assets/games/roulette/icons/clear-icon.svg";
import InfinityIcon from "@/shared/assets/games/roulette/icons/infinity-icon.svg";
import UndoIcon from "@/shared/assets/games/roulette/icons/undo-icon.svg";
import { cn } from "@/shared/lib";
import { Input } from "@/shared/ui/primitives/input";
import { ROULETTE_CHIPS } from "../config/roulette-defaults";
import { formatMoney } from "../lib/roulette-decimal";
import { RouletteChipTray } from "./roulette-chip-tray";

interface RouletteBetPanelProps {
  selectedChip: number;
  onSelectChip: (chip: number) => void;
  totalBet: string;
  onClear: () => void;
  clearDisabled: boolean;
  betDisabled: boolean;
  betPending: boolean;
  betValidation: string | null;
  errorMessage: string | null;
  // Auto mode
  autoBetCountDraft: string;
  autoBetInfinite: boolean;
  autoErrorMessage: string | null;
  autoRunning: boolean;
  autoStartDisabled: boolean;
  onUpdateAutoBetCount: (value: string) => void;
  onToggleAutoBetInfinite: () => void;
  onStartAutoBet: () => void;
  onStopAutoBet: () => void;
}

type BetMode = "manual" | "auto";

// Disabled fill has no @theme token (#3f4a59 @50% slate). Reproduced via color-mix
// from --color-border-2 + transparent, per the audited spec (no new token).
const DISABLED_FILL =
  "bg-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)] text-text-placeholder";

// Active tab fill is the no-token neutral gradient (#1b1f26 @40% → #2b303b @40%),
// composed from --color-surface-3 / --color-border-2 at 40% alpha.
const ACTIVE_TAB =
  "border border-border bg-gradient-to-b from-[color-mix(in_srgb,var(--color-surface-3)_40%,transparent)] to-[color-mix(in_srgb,var(--color-border-2)_40%,transparent)] text-text";

export function RouletteBetPanel({
  autoBetCountDraft,
  autoBetInfinite,
  autoErrorMessage,
  autoRunning,
  autoStartDisabled,
  betDisabled,
  betPending,
  betValidation,
  clearDisabled,
  errorMessage,
  onClear,
  onSelectChip,
  onStartAutoBet,
  onStopAutoBet,
  onToggleAutoBetInfinite,
  onUpdateAutoBetCount,
  selectedChip,
  totalBet,
}: RouletteBetPanelProps) {
  const [mode, setMode] = React.useState<BetMode>("manual");

  const selectedChipData =
    ROULETTE_CHIPS.find((chip) => chip.value === selectedChip) ??
    ROULETTE_CHIPS[0];
  const clearActive = !clearDisabled;

  const betCtaDisabled =
    mode === "manual" ? betDisabled : !autoRunning && autoStartDisabled;

  return (
    <section className="flex flex-col gap-8 rounded-l-xl bg-surface p-6 lg:h-full">
      {/* Manual / Auto tab switcher */}
      <div
        className="flex w-full items-center gap-2 rounded-lg bg-surface p-2"
        role="tablist"
      >
        {(["manual", "auto"] as const).map((tab) => (
          <button
            aria-selected={mode === tab}
            className={cn(
              "flex-1 rounded-md px-4 py-3 text-base font-medium capitalize transition-colors",
              mode === tab ? ACTIVE_TAB : "text-text-muted hover:text-text",
            )}
            key={tab}
            onClick={() => setMode(tab)}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Settings group — Chip Value, Bet Amount, and the chip tray are SHARED by
          both tabs; only the block directly above Bet swaps (Manual: Choose action,
          Auto: Number of bets). */}
      <div className="flex flex-col gap-6">
        {/* Chip Value / Bet Amount readouts (shared) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-base font-medium leading-5">
            <span className="text-text">Chip Value</span>
            <span className="flex items-center gap-2 text-text">
              <ChipValueIcon className="h-4 w-4" />
              {selectedChipData.label} <span className="uppercase">Coins</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-base font-medium leading-5">
            <span className="text-text">Bet Amount</span>
            <span className="flex items-center gap-2 text-text">
              <BetAmountIcon className="h-4 w-4" />
              {formatMoney(totalBet)} <span className="uppercase">Coins</span>
            </span>
          </div>
        </div>

        {/* Chip tray (shared — chips are placed in both Manual and Auto) */}
        <RouletteChipTray
          disabled={betPending}
          onSelectChip={onSelectChip}
          selectedChip={selectedChip}
        />

        {/* Tab-dependent block — height-reserved so the Bet button never moves.
            Manual: Choose action (80px). Auto: Number of bets (76px). */}
        <div className="flex min-h-[80px] flex-col">
          {mode === "manual" ? (
            <div className="flex flex-col gap-3">
              <p className="text-base font-medium leading-5 text-text">
                Choose action
              </p>
              <div className="flex gap-2">
                <button
                  className={cn(
                    "flex h-12 flex-1 items-center justify-center gap-2 rounded-md px-6 py-3 text-lg font-medium transition-colors",
                    clearActive
                      ? "border border-border bg-surface-3 text-text hover:border-border-2"
                      : cn("cursor-not-allowed", DISABLED_FILL),
                  )}
                  disabled={!clearActive}
                  onClick={onClear}
                  type="button"
                >
                  <ClearIcon className="h-5 w-5" />
                  Clear
                </button>
                {/* Undo — rendered placeholder, no undo stack this pass. */}
                <button
                  aria-disabled="true"
                  className={cn(
                    "flex h-12 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-md px-6 py-3 text-lg font-medium",
                    DISABLED_FILL,
                  )}
                  disabled
                  type="button"
                >
                  <UndoIcon className="h-5 w-5" />
                  Undo
                </button>
              </div>
            </div>
          ) : (
            // Auto — Number of bets + ∞ (Figma 3973-64467). Replays the placement.
            <div className="flex flex-col gap-3">
              <p className="text-base font-medium leading-5 text-text">
                Number of bets
              </p>
              <div className="flex rounded-md border border-border bg-control">
                <Input
                  aria-label="Number of bets"
                  className="h-11 border-0 bg-transparent shadow-none focus-visible:shadow-none"
                  disabled={autoRunning}
                  inputMode="numeric"
                  onChange={(event) => onUpdateAutoBetCount(event.target.value)}
                  placeholder="Enter number of bets"
                  readOnly={autoBetInfinite}
                  value={autoBetInfinite ? "∞" : autoBetCountDraft}
                />
                <button
                  aria-label={
                    autoBetInfinite
                      ? "Disable infinite auto-bet"
                      : "Enable infinite auto-bet"
                  }
                  aria-pressed={autoBetInfinite}
                  className="my-2 flex items-center border-l border-border px-3 text-text-muted hover:text-text disabled:opacity-60"
                  disabled={autoRunning}
                  onClick={onToggleAutoBetInfinite}
                  type="button"
                >
                  <InfinityIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bet CTA — shared, always labelled "Bet". Manual submits one bet; Auto starts
          the session (and acts as stop while running). */}
      <button
        className={cn(
          "flex h-12 w-full items-center justify-center rounded-md px-6 py-3 text-lg font-medium transition-colors",
          betCtaDisabled
            ? cn("cursor-not-allowed", DISABLED_FILL)
            : "bg-gradient-to-b from-primary-tint to-primary text-on-primary shadow-btn hover:from-primary hover:to-primary-hover active:from-primary-hover active:to-primary-press",
        )}
        disabled={betCtaDisabled}
        onClick={
          mode === "auto"
            ? autoRunning
              ? onStopAutoBet
              : onStartAutoBet
            : undefined
        }
        type={mode === "manual" ? "submit" : "button"}
      >
        {mode === "manual" && betPending ? "Placing bet…" : "Bet"}
      </button>

      {mode === "auto" ? (
        autoErrorMessage ? (
          <p className="text-sm font-medium text-danger">{autoErrorMessage}</p>
        ) : null
      ) : errorMessage ? (
        <p className="text-sm font-medium text-danger">{errorMessage}</p>
      ) : betValidation ? (
        <p className="text-sm font-medium text-text-muted">{betValidation}</p>
      ) : null}
    </section>
  );
}
