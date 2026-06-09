"use client";

import { Input } from "@/shared/ui/primitives/input";
import { cn } from "@/shared/lib";
import { normalizePercentInput } from "../lib/dice-input";
import type { DiceAutoStrategyConfig } from "../model/use-dice-auto-bet";

interface DiceStrategyControlProps {
  onChange: (value: DiceAutoStrategyConfig) => void;
  value: DiceAutoStrategyConfig;
}

export function DiceStrategyControl({
  onChange,
  value,
}: DiceStrategyControlProps) {
  const increaseSelected = value.mode === "increase";

  return (
    <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center rounded-md border border-border bg-control p-1 shadow-inset-hi">
      <button
        className={cn(
          "h-8 rounded-sm px-4 text-xs font-black transition-colors",
          value.mode === "reset"
            ? "bg-primary text-on-primary"
            : "bg-surface-2 text-text-muted hover:text-text",
        )}
        onClick={() => onChange({ mode: "reset", increaseByPercent: "" })}
        type="button"
      >
        Reset
      </button>
      <button
        className={cn(
          "h-8 rounded-sm px-4 text-xs font-black transition-colors",
          value.mode === "increase"
            ? "bg-primary text-on-primary"
            : "bg-surface-2 text-text-muted hover:text-text",
        )}
        onClick={() => onChange({ ...value, mode: "increase" })}
        type="button"
      >
        Increase By
      </button>
      <div className="relative min-w-0 px-2">
        <Input
          aria-label="Increase percentage"
          className="h-8 border-0 bg-transparent px-1 pr-5 text-right font-black shadow-none placeholder:text-text-placeholder disabled:opacity-100 focus-visible:shadow-none"
          disabled={!increaseSelected}
          inputMode="decimal"
          onChange={(event) =>
            onChange({
              ...value,
              increaseByPercent: normalizePercentInput(event.target.value),
            })
          }
          placeholder="0.00"
          value={increaseSelected ? value.increaseByPercent : ""}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-text-muted">
          %
        </span>
      </div>
    </div>
  );
}
