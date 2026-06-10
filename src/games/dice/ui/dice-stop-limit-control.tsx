"use client";

import { Input } from "@/shared/ui/primitives/input";
import { normalizeMoneyInput } from "../lib/dice-input";
import { formatDecimal } from "../lib/dice-math";
import { FieldLabel, MoneyIcon } from "./dice-ui-atoms";

interface DiceStopLimitControlProps {
  label: string;
  onChange: (value: string) => void;
  value: string;
}

export function DiceStopLimitControl({
  label,
  onChange,
  value,
}: DiceStopLimitControlProps) {
  const previewValue = formatDecimal(value || "0");

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="grid h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-control px-3 text-sm font-bold text-text shadow-inset-hi">
        <div className="flex min-w-0 items-center gap-2">
          <MoneyIcon />
          <Input
            aria-label={label}
            className="h-9 min-w-0 border-0 bg-transparent px-0 text-left font-black shadow-none placeholder:text-text-placeholder focus-visible:shadow-none"
            inputMode="decimal"
            onChange={(event) =>
              onChange(normalizeMoneyInput(event.target.value))
            }
            placeholder="0.00"
            value={value}
          />
        </div>
        <span className="shrink-0 text-right font-black text-text">
          ${previewValue}
        </span>
      </div>
    </div>
  );
}
