"use client";

import Image from "next/image";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Slider } from "@/shared/ui/primitives/slider";
import { PLINKO_RISKS, type PlinkoRisk, type PlinkoRows } from "../config";

export type PlinkoMode = "manual" | "auto";

const riskTone: Record<
  PlinkoRisk,
  {
    selected: string;
    unselected: string;
  }
> = {
  LOW: {
    selected: "border-primary/45 bg-primary/25 text-primary shadow-inset-hi",
    unselected: "border-transparent text-primary",
  },
  MEDIUM: {
    selected: "border-yellow-400/50 bg-yellow-400/20 text-yellow-300 shadow-inset-hi",
    unselected: "border-transparent text-yellow-300",
  },
  HIGH: {
    selected: "border-danger/50 bg-danger/20 text-danger shadow-inset-hi",
    unselected: "border-transparent text-danger",
  },
};

interface PlinkoControlsProps {
  betAmount: string;
  betAmountFeedback: string | null;
  buttonLabel: string;
  configError: boolean;
  configLoading: boolean;
  mode: PlinkoMode;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
  controlsLocked: boolean;
  authenticated: boolean;
  betDisabled: boolean;
  errorMessage: string | null;
  loading: boolean;
  onBetAmountChange: (value: string) => void;
  onBetAmountBlur: () => void;
  onDoubleBetAmount: () => void;
  onHalfBetAmount: () => void;
  onMaxBetAmount?: () => void;
  onModeChange: (mode: PlinkoMode) => void;
  onRiskChange: (risk: PlinkoRisk) => void;
  onRowsChange: (value: number[]) => void;
}

export function PlinkoControls({
  betAmount,
  betAmountFeedback,
  buttonLabel,
  configError,
  configLoading,
  mode,
  risk,
  rowsCount,
  controlsLocked,
  authenticated,
  betDisabled,
  errorMessage,
  loading,
  onBetAmountChange,
  onBetAmountBlur,
  onDoubleBetAmount,
  onHalfBetAmount,
  onMaxBetAmount,
  onModeChange,
  onRiskChange,
  onRowsChange,
}: PlinkoControlsProps) {
  return (
    <aside className="order-2 flex flex-col gap-4 border-t border-border bg-surface px-4 py-4 md:order-1 md:gap-5 md:border-r md:border-t-0 md:px-6 md:py-5">
      <div className="order-5 grid grid-cols-2 rounded-md bg-bg p-1 md:order-none">
        {(["manual", "auto"] as const).map((nextMode) => (
          <button
            aria-pressed={mode === nextMode}
            className={cn(
              "h-11 rounded-sm text-sm font-black transition-colors",
              mode === nextMode
                ? "bg-surface-3 text-text shadow-inset-hi"
                : "text-text-muted",
            )}
            disabled={controlsLocked}
            key={nextMode}
            onClick={() => onModeChange(nextMode)}
            type="button"
          >
            {nextMode === "manual" ? "Manual" : "Auto"}
          </button>
        ))}
      </div>

      <div className="order-2 space-y-2 md:order-none">
        <label className="text-sm font-black text-text" htmlFor="plinko-bet-amount">
          Bet Amount
        </label>
        <div className="flex rounded-md border border-border bg-control shadow-inset-hi">
          <div className="flex min-w-0 flex-1 items-center px-3 font-bold text-text">
            <Image
              alt=""
              aria-hidden="true"
              className="shrink-0"
              height={20}
              src="/images/game-point.svg"
              width={20}
            />
            <Input
              aria-label="Bet amount"
              className="h-10 min-w-0 border-0 bg-transparent px-2 shadow-none focus-visible:shadow-none"
              disabled={controlsLocked}
              id="plinko-bet-amount"
              inputMode="decimal"
              onBlur={onBetAmountBlur}
              onChange={(event) => onBetAmountChange(event.target.value)}
              value={betAmount}
            />
          </div>
          <button
            className="my-2 border-l border-border px-3 text-xs font-bold text-text-muted hover:text-text disabled:opacity-50"
            disabled={controlsLocked}
            onClick={onHalfBetAmount}
            type="button"
          >
            1/2
          </button>
          <button
            className="my-2 border-l border-border px-3 text-xs font-bold text-text-muted hover:text-text disabled:opacity-50"
            disabled={controlsLocked}
            onClick={onDoubleBetAmount}
            type="button"
          >
            2X
          </button>
          {onMaxBetAmount ? (
            <button
              className="my-2 border-l border-border px-3 text-xs font-bold text-text-muted hover:text-text disabled:opacity-50"
              disabled={controlsLocked}
              onClick={onMaxBetAmount}
              type="button"
            >
              MAX
            </button>
          ) : null}
        </div>
        {betAmountFeedback ? (
          <p className="text-xs font-semibold text-danger" role="alert">
            {betAmountFeedback}
          </p>
        ) : null}
      </div>

      <div className="order-3 space-y-2 md:order-none">
        <p className="text-sm font-black text-text">Risk</p>
        <div className="grid grid-cols-3 rounded-md bg-bg p-1">
          {PLINKO_RISKS.map((nextRisk) => (
            <button
              aria-pressed={risk === nextRisk}
              className={cn(
                "h-11 rounded-sm border text-sm font-black transition-colors",
                risk === nextRisk
                  ? riskTone[nextRisk].selected
                  : riskTone[nextRisk].unselected,
              )}
              disabled={controlsLocked}
              key={nextRisk}
              onClick={() => onRiskChange(nextRisk)}
              type="button"
            >
              {nextRisk[0] + nextRisk.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="order-4 space-y-2 md:order-none md:space-y-3">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-black text-text" htmlFor="plinko-rows">
            Rows
          </label>
          <span className="text-sm font-black tabular-nums text-text">
            {rowsCount}
          </span>
        </div>
        <Slider
          id="plinko-rows"
          disabled={controlsLocked}
          max={14}
          min={8}
          onValueChange={onRowsChange}
          step={1}
          value={[rowsCount]}
        />
      </div>

      {mode === "auto" ? (
        <div className="order-6 space-y-2 md:order-none">
          <label className="text-sm font-black text-text" htmlFor="plinko-auto-count">
            Number of Bets
          </label>
          <Input disabled id="plinko-auto-count" value="0" />
        </div>
      ) : null}

      <Button
        className="order-1 h-12 text-base font-black md:order-none"
        disabled={betDisabled}
        type="submit"
        variant={authenticated ? "primary" : "secondary"}
      >
        {loading ? "Betting..." : buttonLabel}
      </Button>

      {!authenticated ? (
        <p className="order-7 text-xs font-semibold text-text-subtle md:order-none">
          Log in to place a bet.
        </p>
      ) : null}

      {configLoading ? (
        <p className="order-7 text-xs font-semibold text-text-subtle md:order-none">
          Loading Plinko configuration
        </p>
      ) : null}

      {configError ? (
        <p className="order-7 text-xs font-semibold text-danger md:order-none" role="alert">
          Plinko configuration is unavailable.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="order-7 text-xs font-semibold text-danger md:order-none" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </aside>
  );
}
