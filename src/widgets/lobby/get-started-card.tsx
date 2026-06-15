"use client";

import type { ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "motion/react";

/**
 * Get-started card — Figma "card" node 4593:5818.
 *
 * Image banner (top) + text block (bg-surface-3): title, description, green CTA.
 * Client island so the CTA can animate on hover (Motion). `description` is a
 * ReactNode because it contains inline links / bold text (composed by the section).
 */
export interface GetStartedCardProps {
  image: StaticImageData;
  title: string;
  description: ReactNode;
  buttonLabel: string;
  buttonHref: string;
}

export function GetStartedCard({
  image,
  title,
  description,
  buttonLabel,
  buttonHref,
}: GetStartedCardProps) {
  const prefersReduced = useReducedMotion();

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-[#1f2123]">
      {/* Image banner (Figma h-210) */}
      <div className="relative h-[210px] w-full shrink-0 bg-[#09051a]">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>

      {/* Text block */}
      <div className="flex flex-1 flex-col gap-4 bg-surface-3 px-4 py-5">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold leading-5 text-text text-[clamp(16px,1.6vw,18px)]">
            {title}
          </h3>
          <div className="flex flex-col gap-1 leading-[18px] text-text-muted text-[clamp(12px,1.1vw,14px)]">
            {description}
          </div>
        </div>

        {/* CTA — primary gradient (from-primary-tint to-primary); routing deferred */}
        <motion.a
          href={buttonHref}
          whileHover={prefersReduced ? undefined : { scale: 1.02 }}
          whileTap={prefersReduced ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="mt-auto flex h-12 items-center justify-center rounded-md bg-gradient-to-b from-primary-tint to-primary font-medium text-on-primary outline-none text-[clamp(16px,1.5vw,18px)] focus-visible:shadow-glow"
        >
          {buttonLabel}
        </motion.a>
      </div>
    </article>
  );
}
