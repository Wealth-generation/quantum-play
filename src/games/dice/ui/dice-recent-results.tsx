"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/lib";
import { formatDecimal } from "../lib/dice-math";
import type { DiceRecentResult } from "../model/use-manual-dice";

export function DiceRecentResults({
  results,
}: {
  results: DiceRecentResult[];
}) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute right-4 top-4 z-10 flex min-h-9 max-w-[calc(100%-2rem)] flex-nowrap justify-end gap-2 overflow-visible md:right-8 md:top-7">
      <AnimatePresence initial={false} mode="popLayout">
        {results.map((result) => (
          <motion.span
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className={cn(
              "rounded-sm px-3 py-2 text-sm font-black text-text shadow-inset-hi",
              result.didWin ? "bg-primary" : "bg-surface-3",
            )}
            exit={{ opacity: 0, scale: 0.92, x: -18 }}
            initial={{ opacity: 0, scale: 0.95, x: 10 }}
            key={result.id}
            layout
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            {formatDecimal(result.randomValue)}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
