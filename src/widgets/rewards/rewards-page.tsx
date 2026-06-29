import { RewardsHeader } from "./rewards-header";
import { RewardsSearchBar } from "./rewards-search-bar";
import { RewardsGrid } from "./rewards-grid";
import { RewardsFaq } from "./rewards-faq";

export function RewardsPage() {
  return (
    <main className="max-w-[1175px] mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <RewardsHeader />
        <RewardsSearchBar />
        <RewardsGrid />
        <RewardsFaq />
      </div>
    </main>
  );
}
