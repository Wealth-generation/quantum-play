import StarFild from "@/shared/assets/rewards/icons/rewards-title-star-field.svg";

export function RewardsHeader() {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        <StarFild className="size-8" aria-hidden="true" />
        <h2 className="text-3xl font-semibold text-text">Rewards</h2>
      </div>
      <p className="text-sm text-text-muted">
        Explore your available rewards and bonuses
      </p>
    </div>
  );
}
