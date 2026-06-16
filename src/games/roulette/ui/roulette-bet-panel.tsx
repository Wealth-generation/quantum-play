"use client";

import * as React from "react";
import BetAmountIcon from "@/shared/assets/games/roulette/icons/bet-amount-icon.svg";
import ChipValueIcon from "@/shared/assets/games/roulette/icons/chip-value-icon.svg";
import ClearIcon from "@/shared/assets/games/roulette/icons/clear-icon.svg";
import UndoIcon from "@/shared/assets/games/roulette/icons/undo-icon.svg";
import { cn } from "@/shared/lib";
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
  betDisabled,
  betPending,
  betValidation,
  clearDisabled,
  errorMessage,
  onClear,
  onSelectChip,
  selectedChip,
  totalBet,
}: RouletteBetPanelProps) {
  const [mode, setMode] = React.useState<BetMode>("manual");

  const selectedChipData =
    ROULETTE_CHIPS.find((chip) => chip.value === selectedChip) ??
    ROULETTE_CHIPS[0];
  const clearActive = !clearDisabled;

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

      {/* Swappable tab region pinned to a constant height (Manual settings = 296px)
          so the Bet button below it never moves when toggling Manual↔Auto. */}
      <div className="flex min-h-[296px] flex-col">
        {mode === "manual" ? (
          <div className="flex flex-col gap-6">
          {/* Chip Value / Bet Amount readouts */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-base font-medium leading-5">
              <span className="text-text">Chip Value</span>
              <span className="flex items-center gap-2 text-text">
                <ChipValueIcon className="h-4 w-4" />
                {selectedChipData.label}{" "}
                <span className="uppercase">Coins</span>
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

          {/* Chip tray */}
          <RouletteChipTray
            disabled={betPending}
            onSelectChip={onSelectChip}
            selectedChip={selectedChip}
          />

          {/* Choose action — Clear (functional) + Undo (disabled placeholder) */}
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
        </div>
        ) : (
          // Auto tab — static placeholder this pass (no auto-bet logic / no inputs).
          // flex-1 fills the reserved 296px region so the layout matches Manual.
          <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-md border border-border bg-surface px-4 text-center">
            <p className="text-base font-medium text-text">Auto mode</p>
            <p className="text-sm text-text-muted">Coming soon.</p>
          </div>
        )}
      </div>

      {/* Bet CTA — primary gradient when enabled, slate color-mix when disabled. */}
      <button
        className={cn(
          "flex h-12 w-full items-center justify-center rounded-md px-6 py-3 text-lg font-medium transition-colors",
          betDisabled
            ? cn("cursor-not-allowed", DISABLED_FILL)
            : "bg-gradient-to-b from-primary-tint to-primary text-on-primary shadow-btn hover:from-primary hover:to-primary-hover active:from-primary-hover active:to-primary-press",
        )}
        disabled={betDisabled}
        type="submit"
      >
        {betPending ? "Placing bet…" : "Bet"}
      </button>

      {errorMessage ? (
        <p className="text-sm font-medium text-danger">{errorMessage}</p>
      ) : betValidation ? (
        <p className="text-sm font-medium text-text-muted">{betValidation}</p>
      ) : null}
    </section>
  );
}
