"use client";

import { cn } from "@/shared/lib";
import { getRouletteColor } from "../config/roulette-defaults";
import { useRouletteStore } from "../model/roulette-store";

// Figma node 3973-61763: vertical stack of 40×40 number badges, 8px gap.
// Badge color maps to roulette number color via getRouletteColor():
//   red   → bg-danger fill + border (Figma "win item", #ef4444/#dc2626 family)
//   black → neutral gradient from-surface-3 to-border-2 (Figma "lose item")
//   green → bg-primary (number 0 only; not in Figma node, safe default)
export function RouletteHistory() {
  const history = useRouletteStore((state) => state.history);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {history.map((entry) => {
        const color = getRouletteColor(entry.randomPosition);
        return (
          <div
            key={entry.betId}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold",
              color === "red" && "border border-danger bg-danger text-text",
              color === "black" &&
                "bg-gradient-to-b from-surface-3 to-border-2 text-text",
              color === "green" && "bg-primary text-on-primary",
            )}
          >
            {entry.randomPosition}
          </div>
        );
      })}
    </div>
  );
}
