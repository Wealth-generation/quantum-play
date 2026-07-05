"use client";

import { AnimatePresence, motion } from "motion/react";
import { getPlinkoBucketDomStyle, formatPlinkoMultiplier } from "../lib";
import type { PlinkoMiniHistoryItem } from "../model";

const PLINKO_HISTORY_ANIMATION_DURATION = 0.16;

export function PlinkoMiniHistory({
  items,
}: {
  items: readonly PlinkoMiniHistoryItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Recent Plinko results"
      className="pointer-events-none absolute right-3 top-4 z-20 flex w-12 flex-col gap-1.5 md:right-6 md:top-6"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => {
          const bucketStyle = getPlinkoBucketDomStyle(
            item.bucketIndex,
            item.rowsCount + 1,
          );

          return (
            <motion.span
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex h-7 items-center justify-center rounded-md px-2 text-[10px] font-black shadow-inset-hi md:h-8 md:text-xs"
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              initial={{ opacity: 0, scale: 0.94, y: -8 }}
              key={item.id}
              layout
              style={bucketStyle}
              transition={{
                duration: PLINKO_HISTORY_ANIMATION_DURATION,
                ease: "easeOut",
              }}
            >
              {formatPlinkoMultiplier(item.multiplier)}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
