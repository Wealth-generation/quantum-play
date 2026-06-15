import Image from "next/image";
import CrownIcon from "@/shared/assets/landing/features/icons/features-title-icon.svg";
import leaderboardImg from "@/shared/assets/landing/features/images/leaderboard.webp";
import rewardsImg from "@/shared/assets/landing/features/images/rewards.webp";
import gamesImg from "@/shared/assets/landing/features/images/games.webp";
import { FeatureCardButton } from "./feature-card-button";

/**
 * Features section — Figma "features" node 4593:5717.
 *
 * Header: crown icon + "Features" (20px). Then a responsive card grid:
 *   375  → 1 column
 *   768  → 2 columns (3rd card wraps below — "2 + one under")
 *   1024+→ 3 in a row
 *
 * Each card (Figma "Game Image", aspect 275/270): the pre-composed art fills the
 * card; a bottom gradient keeps the title legible; title + chevron sit at the bottom.
 * The complex multi-layer Figma art (blurred copies + plus-lighter glows + overlay)
 * is baked into a single exported WebP per card.
 *
 * Token mapping: card #0e1519 → bg-row · button #1b1f26→#2b303b → from-surface-3
 * to-border-2 · border #1b1f26 → border-border · text #fdfdfd → text-text.
 *
 * Routing for each card is deferred (Track B / route decisions), so cards are not
 * yet links — the chevron button is a placeholder action.
 */

const FEATURES = [
  { key: "leaderboard", title: "Leaderboard", image: leaderboardImg },
  { key: "rewards", title: "Rewards", image: rewardsImg },
  { key: "games", title: "Games", image: gamesImg },
] as const;

export function FeaturesSection() {
  return (
    <section className="w-full px-4 py-8">
      <div className="mx-auto flex max-w-[1175px] flex-col gap-4">
        {/* Header — crown icon (SVGR component, per project SVG loader) + label */}
        <div className="flex items-center gap-2">
          <CrownIcon aria-hidden="true" className="h-[18px] w-auto" />
          <h2 className="font-semibold leading-6 text-text text-[clamp(18px,1.8vw,20px)]">
            Features
          </h2>
        </div>

        {/* Cards — left-aligned, fixed Figma width (275). Wrap: 375 → 1 col,
            768 → 2 + one under, 1024+ → 3 in a row, flush left (no centering). */}
        <div className="flex flex-wrap gap-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.key}
              className="relative isolate flex aspect-[275/270] w-full flex-col justify-end overflow-hidden rounded-lg bg-row p-5 md:w-[275px]"
            >
              {/* Pre-composed card art (fills the card) */}
              <Image
                src={feature.image}
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

              {/* Title + chevron */}
              <div className="relative z-10 flex items-center justify-between">
                <h3 className="font-semibold text-text text-[clamp(20px,2vw,24px)]">
                  {feature.title}
                </h3>
                <FeatureCardButton label={feature.title} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
