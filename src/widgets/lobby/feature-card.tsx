"use client";

import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

const MotionLink = motion(Link);

interface FeatureCardProps {
  title: string;
  image: StaticImageData;
  href: string;
}

/**
 * Feature card — client island so the whole card can animate on hover (Motion).
 * The StaticImageData and strings passed in are serializable, so FeaturesSection
 * itself stays a Server Component.
 *
 * Figma "Game Image" (4593:5717): 275×270, bg-row, rounded-lg, pre-composed art,
 * bottom gradient, title + decorative chevron at the bottom.
 *
 * Motion props mirror GameCard exactly: whileHover scale 1.03, spring stiffness 300
 * damping 22. No whileTap (matches GameCard).
 */
export function FeatureCard({ title, image, href }: FeatureCardProps) {
  const prefersReduced = useReducedMotion();

  return (
    <MotionLink
      href={href}
      whileHover={prefersReduced ? undefined : { scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative isolate flex aspect-[275/270] w-full flex-col justify-end overflow-hidden rounded-lg bg-row p-5 md:w-[275px]"
    >
      {/* Pre-composed card art (fills the card) */}
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />

      {/* Bottom legibility gradient (Figma overlay layer, reproduced in CSS) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-10 h-3/5 bg-gradient-to-t from-row via-row/70 to-transparent"
      />

      {/* Title + decorative chevron */}
      <div className="relative z-10 flex items-center justify-between">
        <h3 className="font-semibold text-text text-[clamp(20px,2vw,24px)]">
          {title}
        </h3>
        {/* Visual-only chevron — aria-hidden so it does not duplicate the link's accessible name */}
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-gradient-to-b from-surface-3 to-border-2 text-text"
        >
          <ChevronRight className="size-4" />
        </span>
      </div>
    </MotionLink>
  );
}
