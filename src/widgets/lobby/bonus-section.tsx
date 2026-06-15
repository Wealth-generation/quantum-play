"use client";

import fortuneBonus from "@/shared/assets/landing/bonus/images/fortune-bonus.webp";
import competitionCard from "@/shared/assets/landing/bonus/images/competition-card.webp";
import CopyIcon from "@/shared/assets/landing/bonus/icons/copy-link-icon.svg";
import { BonusCard } from "./bonus-card";

/**
 * Bonus section — Figma node 4635:65072. Two banners in a row (375 → 1 column,
 * fortune banner on top).
 *
 * STATIC PLACEHOLDER / brand-neutral: the Figma reference uses competitor brand copy
 * (THEDOCTOR). The promo code is replaced with a neutral Quantum Play placeholder; the
 * Figma styling (purple code + copy icon) is preserved. Real code/end-times are
 * deferred (Track B).
 *
 * Client component so the copy-to-clipboard handler can live inline in the promo block.
 */

// STATIC PLACEHOLDER promo code (Track B).
const PROMO_CODE = "QUANTUM";

export function BonusSection() {
  function copyCode() {
    navigator.clipboard?.writeText(PROMO_CODE).catch(() => {
      /* clipboard may be unavailable (insecure context) — no-op */
    });
  }

  return (
    <section className="w-full px-4 py-8">
      <div className="mx-auto grid max-w-[1175px] grid-cols-1 gap-4 md:grid-cols-2">
        <BonusCard
          image={fortuneBonus}
          variant="fortune"
          eyebrow="Get 5%"
          title="Fortune Bonus"
          timer={{ days: 2, hours: 15, minutes: 35 }}
        >
          <div className="flex items-center gap-1">
            <span className="font-medium leading-5 text-text text-[clamp(14px,1.3vw,16px)]">
              Use code:
            </span>
            <button
              type="button"
              onClick={copyCode}
              aria-label={`Copy promo code ${PROMO_CODE}`}
              className="flex items-center gap-1 rounded-md text-accent outline-none focus-visible:shadow-glow"
            >
              <span className="font-semibold leading-5 text-[clamp(14px,1.3vw,16px)]">
                {PROMO_CODE}
              </span>
              <CopyIcon aria-hidden className="size-4 shrink-0" />
            </button>
          </div>
        </BonusCard>

        <BonusCard
          image={competitionCard}
          variant="competition"
          eyebrow="Monthly"
          title="Competition"
          timer={{ days: 2, hours: 15, minutes: 35 }}
        />
      </div>
    </section>
  );
}
