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
        "rounded-md lg:rounded-lg overflow-hidden flex flex-col",
        "border-[0.5px] border-border",
        "hover:border-2 hover:border-border-2 hover:shadow-[0px_3px_14px_rgba(34,197,94,0.09)]",
        "lg:w-[303px]",
      )}
    >
      <div className="relative h-[110px] lg:h-[200px] bg-gradient-to-b from-surface-3 to-bg overflow-hidden">
        <Image src={src} alt={card.title} fill className="object-cover" />
      </div>

      <div className="bg-surface-3 border-t border-border p-3 lg:p-5 flex flex-col justify-between min-h-[219px] lg:min-h-0 lg:gap-3">
        <div className="flex flex-col gap-0.5 lg:gap-1">
          <h3 className="text-base lg:text-xl font-semibold text-text">{card.title}</h3>
          <p className="text-xs lg:text-base text-text-subtle">{card.description}</p>
        </div>

        <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-3">
          <span className="text-xs text-text-muted">Time left:</span>
          <div className="flex items-center gap-2 bg-[rgba(43,48,59,0.5)] px-3 py-1.5 rounded-md text-xs font-medium text-text-muted w-fit">
            <Clock size={16} aria-hidden="true" />
            {card.timeLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
