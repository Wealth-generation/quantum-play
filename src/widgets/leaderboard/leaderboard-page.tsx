import { SectionReveal } from "@/shared/ui/section-reveal";

import { CountdownBanner } from "./countdown-banner";
import { LeaderboardCTA } from "./leaderboard-cta";
import { LeaderboardHero } from "./leaderboard-hero";
import { LeaderboardTable } from "./leaderboard-table";
import { RulesAccordion } from "./rules-accordion";

export function LeaderboardPage() {
  return (
    <main className="w-full py-8 sm:py-10">
      <SectionReveal eager>
        <LeaderboardHero />
      </SectionReveal>
      <div className="mx-auto mt-8 flex w-full max-w-4xl flex-col gap-8 px-4 sm:px-6">
        <SectionReveal>
          <CountdownBanner />
        </SectionReveal>
        <SectionReveal>
          <LeaderboardCTA />
        </SectionReveal>
        <SectionReveal>
          <LeaderboardTable />
        </SectionReveal>
        <SectionReveal>
          <RulesAccordion />
        </SectionReveal>
      </div>
    </main>
  );
}
