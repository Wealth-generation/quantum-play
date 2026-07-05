import { rewardCards } from "./rewards-data";
import { RewardsCard } from "./rewards-card";

export function RewardsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:flex lg:flex-wrap lg:gap-6">
      {rewardCards.map((card) => (
        <RewardsCard key={card.id} card={card} />
      ))}
    </div>
  );
}
