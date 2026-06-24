"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/shared/lib";
import { getRouletteColor } from "../config/roulette-defaults";
import { useRouletteStore } from "../model/roulette-store";

// Figma node 3973-61763: vertical stack of 40×40 number badges, 8px gap.
// Badge color maps to roulette number color via getRouletteColor():
//   red   → bg-danger fill + border (Figma "win item", #ef4444/#dc2626 family)
//   black → neutral gradient from-surface-3 to-border-2 (Figma "lose item")
//   green → bg-primary (number 0 only; not in Figma node, safe default)
//
// Exit animation pattern follows plinko-mini-history.tsx: AnimatePresence
// mode="popLayout" pops the exiting item out of the layout flow immediately
// (absolute positioned during its exit), so remaining items re-layout without
// holding the dead slot open. layout prop smoothly repositions staying items.
export function RouletteHistory() {
  const history = useRouletteStore((state) => state.history);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <AnimatePresence initial={false} mode="popLayout">
        {history.map((entry) => {
          const color = getRouletteColor(entry.randomPosition);
          return (
            <motion.div
              key={entry.betId}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              initial={{ opacity: 0, scale: 0.94, y: -8 }}
              layout
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold",
                color === "red" && "border border-danger bg-danger text-text",
                color === "black" &&
                  "bg-gradient-to-b from-surface-3 to-border-2 text-text",
                color === "green" && "bg-primary text-on-primary",
              )}
            >
              {entry.randomPosition}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
