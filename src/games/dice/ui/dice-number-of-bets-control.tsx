"use client";

import Image from "next/image";
import { Input } from "@/shared/ui/primitives/input";
import { FieldLabel } from "./dice-ui-atoms";

interface DiceNumberOfBetsControlProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
}

export function DiceNumberOfBetsControl({
  disabled,
  onChange,
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
          value={value}
        />
        <button
          aria-label="Infinite auto-bet is not available in this MVP"
          className="my-2 flex items-center border-l border-border px-3 disabled:opacity-60"
          disabled
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
