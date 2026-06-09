"use client";

import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "motion/react";

/**
 * Game card — client island so the card can animate on hover (Motion). The
 * StaticImageData and class strings passed in are serializable, so GamesSection
 * itself stays a Server Component.
 *
 * Figma "roulette/dice/keno/plinko" (4543:12034 …): 275×230, bg-row, rounded-lg,
 * 3px bottom accent border (per game), inset top highlight (shadow-inset-hi),
 * pre-composed art filling the card, title top-left.
 */
interface GameCardProps {
  title: string;
  image: StaticImageData;
  /** Tailwind border-color utility for the 3px bottom accent. */
  accentClass: string;
}

export function GameCard({ title, image, accentClass }: GameCardProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`relative isolate flex aspect-[275/230] cursor-pointer flex-col overflow-hidden rounded-lg border-b-[3px] bg-row p-5 ${accentClass}`}
    >
      {/* Pre-composed card art (fills the card) */}
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 25vw"
        className="object-cover"
      />

      {/* Inset top highlight (Figma shadow-inset-hi), above the art */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-inset-hi"
      />

      {/* Title — top-left (Figma flow child at the top of the card) */}
      <h3 className="relative font-semibold leading-8 text-text text-[clamp(20px,2vw,24px)]">
        {title}
      </h3>
    </motion.div>
  );
}
