"use client";

import { useSoundContract } from "@/features/sound";
import { Input } from "@/shared/ui/primitives/input";
import { CoinValue, FieldLabel } from "./dice-ui-atoms";

interface DiceBetAmountControlProps {
  disabled?: boolean;
  feedback?: string | null;
  onBlur: () => void;
  onChange: (value: string) => void;
  onDouble: () => void;
  onHalf: () => void;
  onMax?: () => void;
  value: string;
}

export function DiceBetAmountControl({
  disabled,
  feedback,
  onBlur,
  onChange,
  onDouble,
  onHalf,
  onMax,
  value,
}: DiceBetAmountControlProps) {
  const sound = useSoundContract();

  return (
    <div className="space-y-2">
      <FieldLabel>Bet Amount</FieldLabel>
      <div className="flex rounded-md border border-border bg-control shadow-inset-hi">
        <div className="flex flex-1 items-center px-3 font-bold text-text">
          <CoinValue value="" />
          <Input
            aria-label="Bet amount"
            className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:shadow-none"
            disabled={disabled}
            inputMode="decimal"
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            value={value}
          />
        </div>
        <button
          className="my-2 border-l border-border px-3 text-xs font-bold text-text-muted hover:text-text disabled:opacity-50"
          disabled={disabled}
          onClick={() => {
            sound.play("ui:tick");
            onHalf();
          }}
          type="button"
        >
          1/2
        </button>
        <button
          className="my-2 border-l border-border px-3 text-xs font-bold text-text-muted hover:text-text disabled:opacity-50"
          disabled={disabled}
          onClick={() => {
            sound.play("ui:tick");
            onDouble();
          }}
          type="button"
        >
          2X
        </button>
        {onMax ? (
          <button
            className="my-2 border-l border-border px-3 text-xs font-bold text-text-muted hover:text-text disabled:opacity-50"
            disabled={disabled}
            onClick={() => {
              sound.play("ui:tick");
              onMax();
            }}
            type="button"
          >
            MAX
          </button>
        ) : null}
      </div>
      {feedback ? (
        <p className="text-xs font-semibold text-danger" role="alert">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
