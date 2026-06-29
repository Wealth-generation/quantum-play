import { LobbyHero } from "./lobby-hero";
import { BonusSection } from "./bonus-section";
import { LobbyRewardsBanner } from "./lobby-rewards-banner";
import { FeaturesSection } from "./features-section";
import { GetStartedSection } from "./get-started-section";
import { GamesSection } from "./games-section";
import { LeaderboardSection } from "./leaderboard-section";
import { SectionReveal } from "@/shared/ui/section-reveal";

export function Lobby() {
  return (
    <div>
      <SectionReveal eager>
        <LobbyHero />
      </SectionReveal>
      <SectionReveal>
        <BonusSection />
      </SectionReveal>
      <SectionReveal>
        <LobbyRewardsBanner />
      </SectionReveal>
      <SectionReveal>
        <FeaturesSection />
      </SectionReveal>
      <SectionReveal>
        <GetStartedSection />
      </SectionReveal>
      <SectionReveal>
        <GamesSection />
      </SectionReveal>
      <SectionReveal>
        <LeaderboardSection />
      </SectionReveal>
    </div>
  );
}
