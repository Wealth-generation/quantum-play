import { SectionReveal } from "@/shared/ui/section-reveal";

import { RewardsHeader } from "./rewards-header";
import { RewardsSearchBar } from "./rewards-search-bar";
import { RewardsGrid } from "./rewards-grid";
import { RewardsFaq } from "./rewards-faq";

export function RewardsPage() {
  return (
    <main className="max-w-[1175px] mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <SectionReveal eager>
          <RewardsHeader />
        </SectionReveal>
        <SectionReveal>
          <RewardsSearchBar />
        </SectionReveal>
        <SectionReveal>
          <RewardsGrid />
        </SectionReveal>
        <SectionReveal>
          <RewardsFaq />
        </SectionReveal>
      </div>
    </main>
  );
}
