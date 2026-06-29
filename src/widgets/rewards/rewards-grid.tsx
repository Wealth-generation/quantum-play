import { rewardCards } from "./rewards-data";
import { RewardsCard } from "./rewards-card";

export function RewardsGrid() {
  return (
    <div className="flex flex-wrap gap-6">
      {rewardCards.map((card) => (
        <RewardsCard key={card.id} card={card} />
      ))}
    </div>
  );
}
