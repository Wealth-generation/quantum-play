"use client";

import { Button } from "@/shared/ui/primitives/button";
import { formatDecimal } from "../lib/dice-math";
import { DiceBetAmountControl } from "./dice-bet-amount-control";
import { CoinValue, FieldLabel } from "./dice-ui-atoms";

interface DiceManualControlsProps {
  authenticated: boolean;
  betAmount: string;
  betDisabled: boolean;
  loading: boolean;
  onBetAmountBlur: () => void;
  onBetAmountChange: (value: string) => void;
  onDoubleBetAmount: () => void;
  onHalfBetAmount: () => void;
  profitOnWin: string;
}

export function DiceManualControls({
  authenticated,
  betAmount,
  betDisabled,
  loading,
  onBetAmountBlur,
  onBetAmountChange,
  onDoubleBetAmount,
  onHalfBetAmount,
  profitOnWin,
}: DiceManualControlsProps) {
  return (
    <>
      <DiceBetAmountControl
        onBlur={onBetAmountBlur}
        onChange={onBetAmountChange}
        onDouble={onDoubleBetAmount}
        onHalf={onHalfBetAmount}
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
