"use client";

import { cn } from "@/shared/lib";
import type { DiceMode } from "../model/use-dice-game-controller";
import type { DiceAutoConfig } from "../model/use-dice-auto-bet";
import { DiceAutoControls } from "./dice-auto-controls";
import { DiceManualControls } from "./dice-manual-controls";

interface DiceControlsPanelProps {
  activeMode: DiceMode;
  authenticated: boolean;
  autoBetCountDraft: string;
  autoConfig: DiceAutoConfig;
  autoErrorMessage: string | null;
  autoRunning: boolean;
  autoStartDisabled: boolean;
  betAmount: string;
  betDisabled: boolean;
  configError: boolean;
  manualErrorMessage: string | null;
  manualLoading: boolean;
  onBetAmountBlur: () => void;
  onBetAmountChange: (value: string) => void;
  onConfigure: () => void;
  onDoubleBetAmount: () => void;
  onHalfBetAmount: () => void;
  onModeChange: (mode: DiceMode) => void;
  onStartAutoBet: () => void;
  onStopAutoBet: () => void;
  onUpdateAutoBetCount: (value: string) => void;
  profitOnWin: string;
}

export function DiceControlsPanel({
  activeMode,
  authenticated,
  autoBetCountDraft,
  autoConfig,
  autoErrorMessage,
  autoRunning,
  autoStartDisabled,
  betAmount,
  betDisabled,
  configError,
  manualErrorMessage,
  manualLoading,
  onBetAmountBlur,
  onBetAmountChange,
  onConfigure,
  onDoubleBetAmount,
  onHalfBetAmount,
  onModeChange,
  onStartAutoBet,
  onStopAutoBet,
  onUpdateAutoBetCount,
  profitOnWin,
}: DiceControlsPanelProps) {
  return (
    <div className="order-2 flex flex-col gap-5 border-t border-border bg-surface px-4 py-5 md:order-1 md:border-r md:border-t-0 md:px-6">
      <div
        className={cn(
          "grid grid-cols-2 rounded-md bg-bg p-1",
          activeMode === "auto" && "order-3 md:order-none",
        )}
      >
        <button
          className={cn(
            "h-11 rounded-sm text-sm font-black transition-colors",
            activeMode === "manual"
              ? "bg-surface-3 text-text shadow-inset-hi"
              : "text-text-muted",
          )}
          disabled={autoRunning}
          onClick={() => onModeChange("manual")}
          type="button"
        >
          Manual
        </button>
        <button
          className={cn(
            "h-11 rounded-sm text-sm font-black transition-colors",
            activeMode === "auto"
              ? "bg-surface-3 text-text shadow-inset-hi"
              : "text-text-muted",
          )}
          disabled={autoRunning}
          onClick={() => onModeChange("auto")}
          type="button"
        >
          Auto
        </button>
      </div>

      {activeMode === "manual" ? (
        <DiceManualControls
          authenticated={authenticated}
          betAmount={betAmount}
          betDisabled={betDisabled}
          loading={manualLoading}
          onBetAmountBlur={onBetAmountBlur}
          onBetAmountChange={onBetAmountChange}
          onDoubleBetAmount={onDoubleBetAmount}
          onHalfBetAmount={onHalfBetAmount}
          profitOnWin={profitOnWin}
        />
      ) : (
        <DiceAutoControls
          authenticated={authenticated}
          autoBetCountDraft={autoBetCountDraft}
          autoConfig={autoConfig}
          autoRunning={autoRunning}
          autoStartDisabled={autoStartDisabled}
          betAmount={betAmount}
          onBetAmountBlur={onBetAmountBlur}
          onBetAmountChange={onBetAmountChange}
          onConfigure={onConfigure}
          onDoubleBetAmount={onDoubleBetAmount}
          onHalfBetAmount={onHalfBetAmount}
          onStart={onStartAutoBet}
          onStop={onStopAutoBet}
          onUpdateAutoBetCount={onUpdateAutoBetCount}
        />
      )}

      {!authenticated ? (
        <p className="text-xs font-semibold text-text-subtle">
          Log in to place a bet.
        </p>
      ) : null}

      {configError ? (
        <p className="text-xs font-semibold text-danger" role="alert">
          Dice configuration is unavailable.
        </p>
      ) : null}

      {manualErrorMessage && activeMode === "manual" ? (
        <p className="text-xs font-semibold text-danger" role="alert">
          {manualErrorMessage}
        </p>
      ) : null}

      {autoErrorMessage && activeMode === "auto" ? (
        <p className="text-xs font-semibold text-danger" role="alert">
          {autoErrorMessage}
        </p>
      ) : null}
    </div>
  );
}
