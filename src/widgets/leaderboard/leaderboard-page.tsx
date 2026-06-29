import { CountdownBanner } from "./countdown-banner";
import { LeaderboardCTA } from "./leaderboard-cta";
import { LeaderboardHero } from "./leaderboard-hero";
import { LeaderboardTable } from "./leaderboard-table";
import { RulesAccordion } from "./rules-accordion";

export function LeaderboardPage() {
  return (
    <main className="w-full py-8 sm:py-10">
      <LeaderboardHero />
      <div className="mx-auto mt-8 flex w-full max-w-4xl flex-col gap-8 px-4 sm:px-6">
        <CountdownBanner />
        <LeaderboardCTA />
        <LeaderboardTable />
        <RulesAccordion />
      </div>
    </main>
  );
}
