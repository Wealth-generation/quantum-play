"use client";

import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CountdownTimer } from "./countdown-timer";

/**
 * Bonus banner — Figma nodes 4635:65073 (fortune) / 4635:65115 (competition).
 *
 * `variant` drives the accent (purple/red) bottom border and the timer-icon colour.
 * Text + countdown sit on top.
 *
 * Token mapping: accent #7e22ce → accent · #dc2626 → danger · eyebrow #c7cbd4 →
 * text-muted · title #fdfdfd → text-text.
 */
interface BonusCardProps {
  image: StaticImageData;
  variant: "fortune" | "competition";
  eyebrow: string;
  title: string;
  /** Promo-code block (fortune only) — composed by the section. */
  children?: ReactNode;
  timer: { days: number; hours: number; minutes: number };
}

const VARIANT = {
  fortune: { border: "border-accent", icon: "text-accent" },
  competition: { border: "border-danger", icon: "text-danger" },
} as const;

export function BonusCard({ image, variant, eyebrow, title, children, timer }: BonusCardProps) {
  const prefersReduced = useReducedMotion();
  const v = VARIANT[variant];

  return (
    <motion.article
      whileHover={prefersReduced ? undefined : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`relative isolate flex min-h-[220px] overflow-hidden rounded-lg border-b p-5 ${v.border}`}
    >
      {/* Full banner art (background) */}
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />

      {/* Content (left), above the image */}
      <div className="relative flex min-h-[180px] flex-1 flex-col justify-between">
        <div className="flex flex-col gap-1">
          <p className="leading-6 text-text-muted text-[clamp(14px,1.4vw,18px)]">{eyebrow}</p>
          <h3 className="font-black uppercase leading-tight text-text text-[clamp(26px,3.5vw,36px)]">
            {title}
          </h3>
          {children}
        </div>
        <CountdownTimer
          days={timer.days}
          hours={timer.hours}
          minutes={timer.minutes}
          iconClass={v.icon}
        />
      </div>
    </motion.article>
  );
}
