import { Copy } from "lucide-react";
import StarIcon from "@/shared/assets/landing/getStarted/icons/how-to-get-started-title-icon.svg";
import degencityCard from "@/shared/assets/landing/getStarted/images/degencity-card.webp";
import discordCard from "@/shared/assets/landing/getStarted/images/discord-card.webp";
import connectCard from "@/shared/assets/landing/getStarted/images/connect-card.webp";
import { GetStartedCard } from "./get-started-card";

/**
 * Get-started section — Figma "How to get started?" node 4593:5813.
 *
 * Header (star icon + label) + three cards in a row (375 → 1 column).
 *
 * STATIC PLACEHOLDER / brand-neutral: the Figma reference uses competitor brand copy
 * (DegenCity, THEDOCTOR, thedoctor.net). Per the project guardrail those are replaced
 * with neutral Quantum Play placeholders; the Figma STYLING (green bold code, green
 * links via text-primary) is preserved exactly. Real promo code / links / hrefs are
 * deferred (Track B).
 *
 * Token mapping: text block #1b1f26 → bg-surface-3 · code/links #22c55e → text-primary ·
 * CTA #4ade80→#22c55e → from-primary-tint to-primary · body #c7cbd4 → text-text-muted.
 */
const linkClass = "font-semibold text-primary hover:underline";

export function GetStartedSection() {
  return (
    <section className="w-full px-4 py-8">
      <div className="mx-auto flex max-w-[1175px] flex-col gap-4">
        {/* Header — star icon (SVGR) + label */}
        <div className="flex items-center gap-2">
          <StarIcon aria-hidden="true" className="h-5 w-auto" />
          <h2 className="font-semibold leading-6 text-text text-[clamp(18px,1.8vw,20px)]">
            How to get started?
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <GetStartedCard
            image={degencityCard}
            title="Create your Quantum Play account"
            buttonLabel="Register"
            buttonHref="#"
            description={
              <>
                <span>Register on Quantum Play using our promo code:</span>
                <span className="inline-flex items-center gap-1">
                  <span className="font-semibold leading-5 text-primary text-[clamp(14px,1.3vw,16px)]">
                    QUANTUM
                  </span>
                  <Copy aria-hidden className="size-4 shrink-0 text-primary" />
                </span>
                <span>
                  Please clear your browser cache and/or cookies before creating
                  your account.
                </span>
              </>
            }
          />

          <GetStartedCard
            image={discordCard}
            title="Join our Discord"
            buttonLabel="Join Discord"
            buttonHref="#"
            description={
              <span>
                Make sure you&apos;re Super Confirmed to be eligible. Weekly
                giveaways and promotions are posted in Discord under{" "}
                <a href="#" className={linkClass}>
                  Giveaways
                </a>{" "}
                and{" "}
                <a href="#" className={linkClass}>
                  Announcements
                </a>
              </span>
            }
          />

          <GetStartedCard
            image={connectCard}
            title="Connect your account"
            buttonLabel="Connect Account"
            buttonHref="#"
            description={
              <span>
                Link your Discord to your{" "}
                <a href="#" className={linkClass}>
                  quantumplay.com
                </a>{" "}
                profile
              </span>
            }
          />
        </div>
      </div>
    </section>
  );
}
