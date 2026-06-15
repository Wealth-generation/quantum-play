"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

/**
 * Chevron "›" button for a feature card. Client island so the FeaturesSection
 * itself can stay a Server Component. Hover/tap animation via Motion, disabled
 * when the user prefers reduced motion.
 *
 * Visuals (Figma): 32×32, gradient #1b1f26→#2b303b (from-surface-3 to-border-2),
 * 1px border #1b1f26 (border-border), rounded-md, white chevron.
 */
export function FeatureCardButton({ label }: { label: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={`Open ${label}`}
      whileHover={prefersReduced ? undefined : { scale: 1.1 }}
      whileTap={prefersReduced ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-gradient-to-b from-surface-3 to-border-2 text-text outline-none transition-colors hover:border-border-2 focus-visible:shadow-glow"
    >
      <ChevronRight className="size-4" aria-hidden="true" />
    </motion.button>
  );
}
