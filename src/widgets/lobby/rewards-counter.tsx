"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { useTotalRewardsQuery } from "@/features/total-rewards";
import { FlipDigit } from "./flip-digit";

/**
 * Animated rewards counter — Figma "counter" node 4511:44992 (desktop spec).
 *
 * Renders $ + flip-animated digit cells + static thousand separators. On mount,
 * the value count-ups from zero to the backend total over ~1 500 ms.
 *
 * Layout is fixed by the resolved backend value and never changes mid-animation:
 *   N ≤ 6 → "6int" mode: 6 integer tiles  +  ","  +  decimal "."  +  2 cent tiles
 *            e.g. "25000.00" → 025,000.00
 *   7 ≤ N ≤ 8 → "8int" mode: 8 integer tiles, no decimal or cents
 *            e.g. "1836855"  → 01,836,855
 * where N = digit count of the integer part of totalMoneyGiven.
 *
 * Sizes are fluid: each clamp interpolates from the 375 banner spec (small) up to the
 * desktop Figma spec (cell 49.759px / font 36px), matching Figma exactly at the top end.
 *
 * Token mapping: counter #0a0d19 → bg-bg · cell #0e121c → bg-surface · $ #22c55e →
 * text-primary · digit #fdfdfd → text-text · comma #c7cbd4 → text-text-muted.
 */

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

// Insert US-style grouping commas into an already-zero-padded digit string.
// "025000"    → ["0","2","5",",","0","0","0"]
// "01836855"  → ["0","1",",","8","3","6",",","8","5","5"]
function groupDigits(padded: string): string[] {
  const chars = padded.split("");
  const len = chars.length;
  const result: string[] = [];
  for (let i = 0; i < len; i++) {
    result.push(chars[i]);
    const remaining = len - i - 1;
    if (remaining > 0 && remaining % 3 === 0) {
      result.push(",");
    }
  }
  return result;
}

type LayoutMode = "6int" | "8int";

interface CounterLayout {
  mode: LayoutMode;
  // Animation target — the parsed float of totalMoneyGiven (always ≥ 0).
  target: number;
}

function buildLayout(totalMoneyGiven: string): CounterLayout {
  const float = parseFloat(totalMoneyGiven);
  const dotIdx = totalMoneyGiven.indexOf(".");
  const intStr = dotIdx === -1 ? totalMoneyGiven : totalMoneyGiven.slice(0, dotIdx);
  const N = intStr.length;

  if (N > 8) {
    // N > 8 is not expected — display full integer without cents and flag it.
    console.warn("[RewardsCounter] totalMoneyGiven integer part exceeds 8 digits:", totalMoneyGiven);
  }

  return {
    mode: N <= 6 ? "6int" : "8int",
    target: Number.isFinite(float) && float >= 0 ? float : 0,
  };
}

// Derive the chars array from the current animated value and the fixed layout mode.
// Only the digit values change per frame; comma/period positions stay constant.
function buildChars(v: number, mode: LayoutMode): string[] {
  const intPart = Math.floor(v);

  if (mode === "6int") {
    const clamped = Math.min(intPart, 999_999);
    const centPart = Math.min(99, Math.max(0, Math.round((v - intPart) * 100)));
    return [
      ...groupDigits(clamped.toString().padStart(6, "0")),
      ".",
      ...centPart.toString().padStart(2, "0").split(""),
    ];
  }

  // "8int" mode — no decimal or cents.
  const clamped = Math.min(intPart, 99_999_999);
  return groupDigits(clamped.toString().padStart(8, "0"));
}

// Pre-computed loading placeholder — 8int zeros shown before data resolves.
const LOADING_CHARS = groupDigits("00000000");

export function RewardsCounter() {
  const prefersReduced = useReducedMotion();
  const { data } = useTotalRewardsQuery();

  // Stable on the string value — layout only recalculates when totalMoneyGiven changes,
  // not on every TanStack Query background refetch that returns the same value.
  const totalMoneyGiven = data?.totalMoneyGiven;

  const layout = useMemo<CounterLayout | null>(() => {
    if (!totalMoneyGiven) return null;
    return buildLayout(totalMoneyGiven);
  }, [totalMoneyGiven]);

  const [animValue, setAnimValue] = useState(0);
  const animRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    // prefersReduced: display target directly in render — no animation to run.
    if (!layout || prefersReduced) {
      animRef.current?.stop();
      return;
    }

    animRef.current?.stop();

    // animate() is an external subscription — onUpdate/onComplete are callbacks,
    // not synchronous setState calls in the effect body.
    const controls = animate(0, layout.target, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v: number) => setAnimValue(v),
      onComplete: () => setAnimValue(layout.target),
    });

    animRef.current = controls;

    return () => {
      controls.stop();
    };
  }, [layout, prefersReduced]);

  // When prefersReduced, show target directly without going through animValue.
  const displayValue = layout
    ? prefersReduced
      ? layout.target
      : animValue
    : 0;

  const chars = useMemo(
    () => (layout ? buildChars(displayValue, layout.mode) : LOADING_CHARS),
    [layout, displayValue],
  );

  let digitIndex = 0;
  const ariaLabel = totalMoneyGiven
    ? `Total rewards: $${parseFloat(totalMoneyGiven).toLocaleString("en-US")}`
    : "Total rewards: loading";

  return (
    <div
      aria-label={ariaLabel}
      className="flex w-fit max-w-full shrink-0 items-center gap-[var(--ct-gap)] overflow-hidden rounded-[var(--ct-radius)] bg-bg pl-[var(--ct-pl)] pr-[var(--ct-pr)] py-[var(--ct-py)]"
      style={counterVars}
    >
      <FlipDigit value="$" isSymbol />

      <div className="flex items-center gap-[var(--digit-gap)] overflow-hidden rounded-[var(--grp-radius)]">
        {chars.map((char, i) =>
          char === "," || char === "." ? (
            <FlipDigit key={i} value={char} isSymbol />
          ) : (
            <FlipDigit key={i} value={char} index={digitIndex++} />
          ),
        )}
      </div>
    </div>
  );
}
