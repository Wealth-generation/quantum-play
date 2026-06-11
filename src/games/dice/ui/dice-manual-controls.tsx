"use client";

import { Button } from "@/shared/ui/primitives/button";
import { formatDecimal } from "../lib/dice-math";
import { DiceBetAmountControl } from "./dice-bet-amount-control";
import { CoinValue, FieldLabel } from "./dice-ui-atoms";

interface DiceManualControlsProps {
  authenticated: boolean;
  betAmount: string;
  betAmountFeedback: string | null;
  betDisabled: boolean;
  loading: boolean;
  onBetAmountBlur: () => void;
  onBetAmountChange: (value: string) => void;
  onDoubleBetAmount: () => void;
  onHalfBetAmount: () => void;
  onMaxBetAmount?: () => void;
  profitOnWin: string;
}

export function DiceManualControls({
  authenticated,
  betAmount,
  betAmountFeedback,
  betDisabled,
  loading,
  onBetAmountBlur,
  onBetAmountChange,
  onDoubleBetAmount,
  onHalfBetAmount,
  onMaxBetAmount,
  profitOnWin,
}: DiceManualControlsProps) {
  return (
    <>
      <DiceBetAmountControl
        feedback={betAmountFeedback}
        onBlur={onBetAmountBlur}
        onChange={onBetAmountChange}
        onDouble={onDoubleBetAmount}
        onHalf={onHalfBetAmount}
        onMax={onMaxBetAmount}
        value={betAmount}
      />

      <div className="space-y-2">
        <FieldLabel>Profit on Win</FieldLabel>
        <div className="flex h-11 items-center rounded-md border border-border bg-control px-3 text-sm font-bold text-text shadow-inset-hi">
          <CoinValue value={formatDecimal(profitOnWin)} />
        </div>
      </div>

      <Button
        className="h-12 w-full text-base font-black"
        disabled={betDisabled}
        type="submit"
        variant={authenticated ? "primary" : "secondary"}
      >
        {loading ? "Betting..." : "Bet"}
      </Button>
    </>
  );
}
