"use client";

import { Button } from "@/shared/ui/primitives/button";
import { formatDecimal } from "../lib/dice-math";
import type { DiceAutoConfig, DiceAutoStrategyConfig } from "../model/use-dice-auto-bet";
import { DiceBetAmountControl } from "./dice-bet-amount-control";
import { DiceNumberOfBetsControl } from "./dice-number-of-bets-control";
import { AutoSummaryCard, MoneyBadge } from "./dice-ui-atoms";

function autoSummary(config: DiceAutoStrategyConfig) {
  if (config.mode === "increase") {
    return `${formatDecimal(config.increaseByPercent || "0")}%`;
  }

  return "Auto";
}

interface DiceAutoControlsProps {
  authenticated: boolean;
  autoBetCountDraft: string;
  autoConfig: DiceAutoConfig;
  autoRunning: boolean;
  autoStartDisabled: boolean;
  betAmount: string;
  betAmountFeedback: string | null;
  onBetAmountBlur: () => void;
  onBetAmountChange: (value: string) => void;
  onConfigure: () => void;
  onDoubleBetAmount: () => void;
  onHalfBetAmount: () => void;
  onStart: () => void;
  onStop: () => void;
  onUpdateAutoBetCount: (value: string) => void;
}

export function DiceAutoControls({
  authenticated,
  autoBetCountDraft,
  autoConfig,
  autoRunning,
  autoStartDisabled,
  betAmount,
  betAmountFeedback,
  onBetAmountBlur,
  onBetAmountChange,
  onConfigure,
  onDoubleBetAmount,
  onHalfBetAmount,
  onStart,
  onStop,
  onUpdateAutoBetCount,
}: DiceAutoControlsProps) {
  return (
    <>
      <div className="order-1 flex flex-col gap-3 md:order-3">
        <Button
          className="h-12 w-full text-base font-black"
          disabled={autoRunning}
          onClick={onConfigure}
          type="button"
          variant="secondary"
        >
          Configure
        </Button>
        {autoRunning ? (
          <Button
            className="h-12 w-full bg-danger text-base font-black text-text hover:bg-danger/90"
            onClick={onStop}
            type="button"
          >
            Stop Auto-Bet
          </Button>
        ) : (
          <Button
            className="h-12 w-full text-base font-black"
            disabled={autoStartDisabled}
            onClick={onStart}
            type="button"
            variant={authenticated ? "primary" : "secondary"}
          >
            Start Auto-Bet
          </Button>
        )}
      </div>

      <div className="order-2 space-y-5 md:order-2">
        <DiceBetAmountControl
          disabled={autoRunning}
          feedback={betAmountFeedback}
          onBlur={onBetAmountBlur}
          onChange={onBetAmountChange}
          onDouble={onDoubleBetAmount}
          onHalf={onHalfBetAmount}
          value={betAmount}
        />

        <DiceNumberOfBetsControl
          disabled={autoRunning}
          onChange={onUpdateAutoBetCount}
          value={autoBetCountDraft}
        />

        <div className="grid grid-cols-2 gap-1">
          <AutoSummaryCard
            label="On Win"
            value={autoSummary(autoConfig.onWin)}
          />
          <AutoSummaryCard
            label="On Loss"
            value={autoSummary(autoConfig.onLoss)}
          />
          <AutoSummaryCard
            label="Stop on Profit"
            value={<MoneyBadge value={formatDecimal(autoConfig.stopOnProfit)} />}
          />
          <AutoSummaryCard
            label="Stop on Loss"
            value={<MoneyBadge value={formatDecimal(autoConfig.stopOnLoss)} />}
          />
        </div>
      </div>
    </>
  );
}
