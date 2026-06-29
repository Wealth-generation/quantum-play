"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Reveal wrapper — fades + slides a section in the first time it scrolls into view.
 *
 * Client wrapper so the (server) sections it wraps can stay server components.
 * Respects prefers-reduced-motion (fades only, no vertical movement).
 *
 * (Project uses the `motion` package; `motion/react` is the framer-motion-compatible
 * entry — same useInView / useReducedMotion API.)
 */
interface SectionRevealProps {
  children: ReactNode;
  /** Optional stagger delay (seconds) for adjacent reveals. */
  delay?: number;
  className?: string;
  /**
   * Skip the initial hidden state. Use for above-the-fold sections that are
   * already in the viewport on mount — prevents a brief hydration FOIC where
   * Motion applies opacity:0 before the IntersectionObserver can fire.
   */
  eager?: boolean;
}

export function SectionReveal({ children, delay = 0, className, eager = false }: SectionRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: eager ? 1 : 0, y: prefersReduced || eager ? 0 : 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
