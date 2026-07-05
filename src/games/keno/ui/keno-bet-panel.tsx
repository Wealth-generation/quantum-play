"use client";

import { useSoundContract } from "@/features/sound";
import { cn } from "@/shared/lib";
import { KENO_RISK_LEVELS } from "../config/keno-defaults";
import type { KenoRiskLevel } from "../model/keno-types";
import { KenoBetAmountControl } from "./keno-bet-amount-control";

export type BetMode = "manual" | "auto";

// ─── Token constants ───────────────────────────────────────────────────────

// Active tab: neutral gradient + border (Figma: gradient-neutral40 treatment).
const ACTIVE_TAB =
  "border border-border bg-gradient-to-b from-[color-mix(in_srgb,var(--color-surface-3)_40%,transparent)] to-[color-mix(in_srgb,var(--color-border-2)_40%,transparent)] text-text";

// Disabled button fill (Figma: --button/brand/bg-disabled @ 50%).
const DISABLED_FILL =
  "bg-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)] text-text-placeholder";

// Active neutral action button (Clear Table / Auto Pick enabled state).
const NEUTRAL_BTN =
  "border border-border bg-gradient-to-b from-surface-3 to-border-2 text-text hover:border-border-2";

// Risk-level text colors (Figma: text/accent-blue / text/brand / text/accent-yellow / text/accent-red).
const RISK_TEXT: Record<KenoRiskLevel, string> = {
  CLASSIC: "text-accent-blue",
  LOW: "text-primary",
  MEDIUM: "text-accent-yellow",
  HIGH: "text-danger",
};

// Human-readable labels matching Figma text.
const RISK_LABELS: Record<KenoRiskLevel, string> = {
  CLASSIC: "Classic",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

// ─── Types ────────────────────────────────────────────────────────────────

export interface KenoBetPanelProps {
  // Mode — hoisted to root (keno-game.tsx) so tablet/desktop share state
  mode: BetMode;
  onModeChange: (mode: BetMode) => void;
  // Balance
  balance: string | undefined;
  balanceLoading: boolean;
  // Bet amount
  betAmount: string;
  onBetAmountChange: (value: string) => void;
  onHalf: () => void;
  onDouble: () => void;
  /** When undefined the MAX button is hidden (Max Bet not yet enabled). */
  onMax?: () => void;
  // Risk
  selectedRisk: KenoRiskLevel;
  onRiskChange: (risk: KenoRiskLevel) => void;
  // Tile actions
  selectedCount: number;
  onClearTiles: () => void;
  onAutoPick: () => void;
  // Manual bet — form submit is handled by the outer <form> in keno-game.tsx
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

// ─── Component ────────────────────────────────────────────────────────────

export function KenoBetPanel({
  autoBetCountDraft,
  autoBetInfinite,
  autoErrorMessage,
  autoRunning,
  autoStartDisabled,
  balance,
  balanceLoading,
  betAmount,
  betDisabled,
  betPending,
  betValidation,
  errorMessage,
  mode,
  onAutoPick,
  onBetAmountChange,
  onClearTiles,
  onDouble,
  onHalf,
  onMax,
  onModeChange,
  onRiskChange,
  onStartAutoBet,
  onStopAutoBet,
  onToggleAutoBetInfinite,
  onUpdateAutoBetCount,
  selectedCount,
  selectedRisk,
}: KenoBetPanelProps) {
  const sound = useSoundContract();
  const clearDisabled = selectedCount === 0;
  // Controls shared across both tabs are disabled during a pending bet/reveal.
  const sharedDisabled = betPending;

  const betCtaDisabled =
    mode === "manual"
      ? betDisabled
      : !autoRunning && autoStartDisabled;

  // Responsive element order (Figma tab view node 10235:48715):
  //   mobile/tablet  → Bet CTA (1) · Clear+AutoPick (2) · BetAmount (3) · Risk (4) · NumBets (5) · Mode (6)
  //   desktop lg+    → Mode (1) · BetAmount (2) · Risk (3) · NumBets (4) · Clear+AutoPick (5) · Bet CTA (6)
  // max-md: no rounding (full-width section below grid), px-4 to match Figma
  // betcontrol px-16px. Tablet md+ restores rounded-l-xl and p-6 per slice 5b.
  return (
    <section className="flex flex-col gap-6 max-md:rounded-none rounded-l-xl bg-surface max-md:px-4 p-6 lg:h-full">

      {/* ── Manual / Auto mode switcher — last on mobile, first on desktop ── */}
      <div
        className="order-6 lg:order-1 flex w-full items-center gap-2 rounded-lg bg-surface p-2"
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
            onClick={() => onModeChange(tab)}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Bet Amount — 3rd on mobile, 2nd on desktop ── */}
      <div className="order-3 lg:order-2">
        <KenoBetAmountControl
          balance={balance}
          balanceLoading={balanceLoading}
          betAmount={betAmount}
          disabled={sharedDisabled}
          onBetAmountChange={onBetAmountChange}
          onDouble={onDouble}
          onHalf={onHalf}
          onMax={onMax}
        />
      </div>

      {/* ── Risk selector — 4th on mobile, 3rd on desktop ── */}
      <div className="order-4 lg:order-3 flex flex-col gap-1">
        <p className="text-base font-medium text-text">Risk</p>
        <div
          className="flex w-full items-center gap-2 rounded-lg bg-surface p-2"
          role="tablist"
        >
          {KENO_RISK_LEVELS.map((risk) => {
            const active = selectedRisk === risk;
            return (
              <button
                aria-selected={active}
                className={cn(
                  "min-w-0 flex-1 rounded-md px-2 py-3 text-base font-medium transition-colors",
                  RISK_TEXT[risk],
                  active
                    ? "border border-border bg-gradient-to-b from-[color-mix(in_srgb,var(--color-surface-3)_40%,transparent)] to-[color-mix(in_srgb,var(--color-border-2)_40%,transparent)]"
                    : "hover:bg-surface-3/30",
                  sharedDisabled && "cursor-not-allowed opacity-60",
                )}
                disabled={sharedDisabled}
                key={risk}
                onClick={() => onRiskChange(risk)}
                role="tab"
                type="button"
              >
                {RISK_LABELS[risk]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Number of bets (auto mode) — 5th on mobile, 4th on desktop.
          Always rendered (visibility:hidden in manual) to stabilise height. ── */}
      <div
        aria-hidden={mode !== "auto" ? true : undefined}
        className={cn(
          "order-5 lg:order-4 flex flex-col gap-1",
          mode !== "auto" && "invisible",
        )}
      >
        <p className="text-sm font-light text-text-muted">Number of bets</p>
        <div className="flex h-[44px] items-center rounded-md border border-primary-press bg-surface-3 px-3">
          <input
            aria-label="Number of bets"
            className="min-w-0 flex-1 bg-transparent text-sm text-text-muted placeholder:text-text-placeholder focus:outline-none disabled:cursor-not-allowed"
            disabled={autoRunning}
            inputMode="numeric"
            onChange={(e) => onUpdateAutoBetCount(e.target.value)}
            placeholder="Enter number of bets"
            readOnly={autoBetInfinite}
            tabIndex={mode !== "auto" ? -1 : undefined}
            type="text"
            value={autoBetInfinite ? "∞" : autoBetCountDraft}
          />
          <button
            aria-label={
              autoBetInfinite
                ? "Disable infinite auto-bet"
                : "Enable infinite auto-bet"
            }
            aria-pressed={autoBetInfinite}
            className="flex items-center border-l border-border-2/50 pl-3 text-text-muted transition-colors hover:text-text disabled:opacity-60"
            disabled={autoRunning}
            onClick={onToggleAutoBetInfinite}
            tabIndex={mode !== "auto" ? -1 : undefined}
            type="button"
          >
            ∞
          </button>
        </div>
      </div>

      {/* ── Mobile-group: Bet CTA (top) + Clear+AutoPick (12px below).
          Figma node 4107:131253 shows these as a "btns" group with gap-12px.
          lg:contents: transparent wrapper at lg+ so children participate in the
          section's flex layout with their individual lg:order-N values. ── */}
      <div className="order-1 flex flex-col gap-3 lg:contents">

        {/* Bet CTA — top of group on mobile, 6th (last) on desktop */}
        <button
          className={cn(
            "lg:order-6 flex h-12 w-full items-center justify-center rounded-md px-6 py-3 text-lg font-medium transition-colors",
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
              : () => sound.play("ui:click")
          }
          type={mode === "manual" ? "submit" : "button"}
        >
          {mode === "manual" && betPending ? "Placing bet…" : "Bet"}
        </button>

        {/* Clear Table + Auto Pick — below Bet CTA on mobile (12px), 5th on desktop */}
        <div className="lg:order-5 flex gap-2">
          <button
            className={cn(
              "flex h-12 flex-1 items-center justify-center rounded-md px-6 py-3 text-lg font-medium transition-colors",
              clearDisabled || sharedDisabled
                ? cn("cursor-not-allowed", DISABLED_FILL)
                : NEUTRAL_BTN,
            )}
            disabled={clearDisabled || sharedDisabled}
            onClick={onClearTiles}
            type="button"
          >
            Clear Table
          </button>
          <button
            className={cn(
              "flex h-12 flex-1 items-center justify-center rounded-md px-6 py-3 text-lg font-medium transition-colors",
              sharedDisabled
                ? cn("cursor-not-allowed", DISABLED_FILL)
                : NEUTRAL_BTN,
            )}
            disabled={sharedDisabled}
            onClick={onAutoPick}
            type="button"
          >
            Auto Pick
          </button>
        </div>

      </div>

      {/* ── Validation / error messages — stays at the bottom on both layouts ── */}
      {(mode === "auto" ? autoErrorMessage : errorMessage ?? betValidation) && (
        <p className="order-7 text-sm font-medium text-danger">
          {mode === "auto"
            ? autoErrorMessage
            : errorMessage ?? betValidation}
        </p>
      )}
    </section>
  );
}
