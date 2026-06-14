"use client";

import Image from "next/image";
import { Input } from "@/shared/ui/primitives/input";
import { FieldLabel } from "./dice-ui-atoms";

interface DiceNumberOfBetsControlProps {
  disabled?: boolean;
  infinite: boolean;
  onChange: (value: string) => void;
  onToggleInfinite: () => void;
  value: string;
}

export function DiceNumberOfBetsControl({
  disabled,
  infinite,
  onChange,
  onToggleInfinite,
  value,
}: DiceNumberOfBetsControlProps) {
  return (
    <div className="space-y-2">
      <FieldLabel>Number of Bets</FieldLabel>
      <div className="flex rounded-md border border-border bg-control shadow-inset-hi">
        <Input
          aria-label="Number of bets"
          className="h-10 border-0 bg-transparent shadow-none placeholder:text-text-placeholder focus-visible:shadow-none"
          disabled={disabled}
          inputMode="numeric"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter number of bets"
          readOnly={infinite}
          value={infinite ? "∞" : value}
        />
        <button
          aria-label={
            infinite ? "Disable infinite auto-bet" : "Enable infinite auto-bet"
          }
          aria-pressed={infinite}
          className="my-2 flex items-center border-l border-border px-3 text-text-muted hover:text-text disabled:opacity-60"
          disabled={disabled}
          onClick={onToggleInfinite}
          type="button"
        >
          <Image
            alt=""
            aria-hidden="true"
            className="opacity-80"
            height={16}
            src="/images/infinity.svg"
            width={16}
          />
        </button>
      </div>
    </div>
  );
}
