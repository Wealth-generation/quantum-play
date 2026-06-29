import Image from "next/image";
import type { StaticImageData } from "next/image";
import { Clock } from "lucide-react";

import RakebackImg from "@/shared/assets/rewards/images/reward-card-rakeback-15.webp";
import CashbackImg from "@/shared/assets/rewards/images/reward-card-cashback-10.webp";
import FreeSpinsImg from "@/shared/assets/rewards/images/reward-card-free-spins-777.webp";
import { cn } from "@/shared/lib";

import type { RewardCard } from "./rewards-data";

const imageMap: Record<string, StaticImageData> = {
  rakeback: RakebackImg,
  cashback: CashbackImg,
  "free-spins": FreeSpinsImg,
};

export function RewardsCard({ card }: { card: RewardCard }) {
  const src = imageMap[card.id] ?? RakebackImg;

  return (
    <div
      className={cn(
        "w-full sm:w-[303px] rounded-lg overflow-hidden flex flex-col",
        card.status === "active"
          ? "border-2 border-border-2 shadow-[0px_3px_14px_rgba(34,197,94,0.09)]"
          : "border border-border",
      )}
    >
      <div className="relative h-[200px] bg-gradient-to-b from-surface-3 to-bg overflow-hidden">
        <Image src={src} alt={card.title} fill className="object-contain" />
      </div>

      <div className="bg-surface-3 border-t border-border p-5 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-text">{card.title}</h3>
          <p className="text-base text-text-subtle">{card.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-muted">Duration</span>
          <div className="flex items-center gap-2 bg-[rgba(43,48,59,0.5)] px-3 py-1.5 rounded-md text-sm font-medium text-text-muted">
            <Clock size={16} aria-hidden="true" />
            {card.timeLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
