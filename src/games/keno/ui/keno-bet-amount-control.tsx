"use client";

import * as React from "react";
import ChipGreen from "@/shared/assets/games/keno/icons/chip-green.svg";
import { useSoundContract } from "@/features/sound";
import { cn } from "@/shared/lib";
import { formatMoney } from "../lib/keno-decimal";

interface KenoBetAmountControlProps {
  balance: string | undefined;
  balanceLoading: boolean;
  betAmount: string;
  disabled?: boolean;
  onBetAmountChange: (value: string) => void;
  onDouble: () => void;
  onHalf: () => void;
  /** When undefined the MAX button is hidden (Max Bet not yet enabled). */
  onMax?: () => void;
}

export function KenoBetAmountControl({
  balance,
  balanceLoading,
  betAmount,
  disabled = false,
  onBetAmountChange,
  onDouble,
  onHalf,
  onMax,
}: KenoBetAmountControlProps) {
  const sound = useSoundContract();
  const balanceDisplay = balanceLoading
    ? "…"
    : balance !== undefined
      ? formatMoney(balance)
      : "—";

  return (
    <div className="flex flex-col gap-2">
      {/* Header row: label + live balance */}
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-text">Bet Amount</span>
        <span className="flex items-center gap-2 text-base text-text">
          {/* 20px coin for balance header */}
          <ChipGreen className="size-5 text-primary" />
          {balanceDisplay}
        </span>
      </div>

      {/* Input container: coin icon + text input + quick-set buttons */}
      <div
        className={cn(
          "flex h-[44px] items-center justify-between rounded-md border border-border px-3",
          "bg-[color-mix(in_srgb,var(--color-surface-3)_25%,transparent)]",
          disabled && "opacity-50",
        )}
      >
        {/* Left: 16px coin + editable amount */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ChipGreen className="size-4 shrink-0 text-primary" />
          <input
            aria-label="Bet amount"
            className="min-w-0 flex-1 bg-transparent text-sm text-text-muted placeholder:text-text-placeholder focus:outline-none disabled:cursor-not-allowed"
            disabled={disabled}
            inputMode="decimal"
            onChange={(e) => onBetAmountChange(e.target.value)}
            placeholder="0.00"
            type="text"
            value={betAmount}
          />
        </div>

        {/* Right: ½ / 2X quick-set buttons + conditional MAX */}
        <div className="flex shrink-0 items-center gap-1">
          {(
            [
              { label: "1/2", action: onHalf },
              { label: "2X", action: onDouble },
            ] as const
          ).map(({ label, action }) => (
            <button
              className={cn(
                "rounded-[6px] border border-border-2/50 bg-surface-3 px-1.5 py-1",
                "text-xs font-semibold text-text-subtle",
                "transition-colors hover:border-border-2 hover:text-text-muted",
                disabled && "cursor-not-allowed",
              )}
              disabled={disabled}
              key={label}
              onClick={() => { sound.play("ui:tick"); action(); }}
              type="button"
            >
              {label}
            </button>
          ))}
          {onMax ? (
            <button
              className={cn(
                "rounded-[6px] border border-border-2/50 bg-surface-3 px-1.5 py-1",
                "text-xs font-semibold text-text-subtle",
                "transition-colors hover:border-border-2 hover:text-text-muted",
                disabled && "cursor-not-allowed",
              )}
              disabled={disabled}
              onClick={() => { sound.play("ui:tick"); onMax(); }}
              type="button"
            >
              MAX
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
