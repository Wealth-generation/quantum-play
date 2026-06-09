"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { FlipDigit } from "./flip-digit";

/**
 * Animated rewards counter — Figma "counter" node 4511:44992 (desktop spec).
 *
 * Renders $ + flip-animated digit cells + static thousand separators. Every 30s the
 * value ticks up by a random amount and the changed digits flip.
 *
 * STATIC PLACEHOLDER: the start value and the random increments are demo behaviour —
 * the real "total rewards given back" is backend-authoritative (Track B endpoint).
 *
 * Sizes are fluid: each clamp interpolates from the 375 banner spec (small) up to the
 * desktop Figma spec (cell 49.759px / font 36px), so the counter scales with width and
 * matches Figma exactly at the top end.
 *
 * Token mapping: counter #0a0d19 → bg-bg · cell #0e121c → bg-surface · $ #22c55e →
 * text-primary · digit #fdfdfd → text-text · comma #c7cbd4 → text-text-muted.
 */
interface RewardsCounterProps {
  initialValue?: number;
}

const counterVars = {
  "--cell-w": "clamp(26.322px, calc(12.78px + 3.61vw), 49.759px)",
  "--cell-h": "clamp(29.879px, calc(14.51px + 4.099vw), 56.483px)",
  "--num-font": "clamp(19.044px, calc(9.24px + 2.613vw), 36px)",
  "--num-lh": "clamp(21.16px, calc(10.27px + 2.903vw), 40px)",
  "--digit-gap": "clamp(1.067px, calc(0.518px + 0.146vw), 2.017px)",
  "--ct-gap": "clamp(10.58px, calc(5.135px + 1.452vw), 20px)",
  "--ct-pl": "clamp(10.58px, calc(5.135px + 1.452vw), 20px)",
  "--ct-pr": "clamp(6.348px, calc(3.082px + 0.871vw), 12px)",
  "--ct-py": "clamp(6.348px, calc(3.082px + 0.871vw), 12px)",
  "--ct-radius": "clamp(6.348px, calc(3.082px + 0.871vw), 12px)",
  "--grp-radius": "clamp(4.232px, calc(2.055px + 0.581vw), 8px)",
  "--comma-font": "clamp(10.58px, calc(5.135px + 1.452vw), 20px)",
} as CSSProperties;

export function RewardsCounter({ initialValue = 1836855 }: RewardsCounterProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => prev + Math.floor(Math.random() * 1000));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // "1,836,855" → ["1", ",", "8", "3", "6", ",", "8", "5", "5"]
  const chars = useMemo(() => value.toLocaleString("en-US").split(""), [value]);

  let digitIndex = 0;

  return (
    <div
      aria-label={`Total rewards: $${value.toLocaleString("en-US")}`}
      className="flex w-fit max-w-full shrink-0 items-center gap-[var(--ct-gap)] overflow-hidden rounded-[var(--ct-radius)] bg-bg pl-[var(--ct-pl)] pr-[var(--ct-pr)] py-[var(--ct-py)]"
      style={counterVars}
    >
      <FlipDigit value="$" isSymbol />

      <div className="flex items-center gap-[var(--digit-gap)] overflow-hidden rounded-[var(--grp-radius)]">
        {chars.map((char, i) =>
          char === "," ? (
            <FlipDigit key={i} value="," isSymbol />
          ) : (
            <FlipDigit key={i} value={char} index={digitIndex++} />
          ),
        )}
      </div>
    </div>
  );
}
