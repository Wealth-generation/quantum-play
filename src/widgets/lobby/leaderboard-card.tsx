"use client";

import type { ComponentType, SVGProps } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "motion/react";

import avatar01 from "@/shared/assets/landing/leaderboard/images/avatar-01.webp";
import avatar02 from "@/shared/assets/landing/leaderboard/images/avatar-02.webp";
import avatar03 from "@/shared/assets/landing/leaderboard/images/avatar-03.webp";
import rankGold from "@/shared/assets/landing/leaderboard/images/rank-gold.webp";
import rankSilver from "@/shared/assets/landing/leaderboard/images/rank-silver.webp";
import rankBronze from "@/shared/assets/landing/leaderboard/images/rank-bronze.webp";
import TrophyGold from "@/shared/assets/landing/leaderboard/icons/Trophy-gold.svg";
import TrophySilver from "@/shared/assets/landing/leaderboard/icons/Trophy-silver.svg";
import TrophyBronze from "@/shared/assets/landing/leaderboard/icons/Trophy-bronze.svg";

type Place = 1 | 2 | 3;

interface PlaceConfig {
  avatar: StaticImageData;
  rank: StaticImageData;
  Trophy: ComponentType<SVGProps<SVGSVGElement>>;
  /** Bottom gradient stop of the card. */
  to: string;
  /** Responsive order + raise (Figma: 1st centered & higher; mobile order 1/2/3). */
  layout: string;
}

const CONFIG: Record<Place, PlaceConfig> = {
  1: { avatar: avatar02, rank: rankGold, Trophy: TrophyGold, to: "to-[#1a2f58]", layout: "md:order-2" },
  2: { avatar: avatar01, rank: rankSilver, Trophy: TrophySilver, to: "to-[#212551]", layout: "md:order-1 md:mt-12" },
  3: { avatar: avatar03, rank: rankBronze, Trophy: TrophyBronze, to: "to-[#212551]", layout: "md:order-3 md:mt-12" },
};

interface LeaderboardCardProps {
  place: Place;
  username: string;
  /** STATIC PLACEHOLDER — wagered total (backend-authoritative, Track B). */
  wagered: string;
  /** STATIC PLACEHOLDER — prize amount (backend-authoritative, Track B). */
  reward: string;
}

export function LeaderboardCard({ place, username, wagered, reward }: LeaderboardCardProps) {
  const prefersReduced = useReducedMotion();
  const { avatar, rank, Trophy, to, layout } = CONFIG[place];

  return (
    <motion.div
      whileHover={prefersReduced ? undefined : { scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`flex w-full flex-col items-center gap-4 rounded-[18px] bg-gradient-to-b from-[#0f1228] p-6 md:w-[225px] lg:w-[250px] ${to} ${layout}`}
    >
      {/* Avatar with gradient ring + rank medal badge straddling its bottom edge.
          Container is relative + overflow-visible (default) so the badge can hang below. */}
      <div className="relative size-[100px] shrink-0">
        <div className="size-full rounded-full bg-gradient-to-b from-[#0fa] to-accent p-[3px]">
          <div className="relative size-full overflow-hidden rounded-full bg-[#0b1a1c]">
            <Image src={avatar} alt="" fill sizes="100px" className="object-cover" />
          </div>
        </div>
        {/* Rank medal — Figma 60px (60% of the 100px avatar), centered on the avatar bottom */}
        <Image
          src={rank}
          alt={`Rank ${place}`}
          className="absolute bottom-0 left-1/2 h-auto w-3/5 -translate-x-1/2 translate-y-1/2"
        />
      </div>

      <p className="font-semibold leading-8 text-text text-[clamp(20px,2vw,24px)]">
        {username}
      </p>

      {/* Wagered */}
      <div className="flex w-full flex-col items-center gap-1.5">
        <p className="font-light uppercase text-text-muted text-[clamp(12px,1vw,14px)] leading-[18px]">
          Wagered
        </p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
            $
          </span>
          <p className="font-semibold leading-6 text-text text-[clamp(16px,1.5vw,20px)]">
            {wagered}
          </p>
        </div>
      </div>

      {/* Reward */}
      <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#060e16] p-4">
        <Trophy aria-hidden className="size-6 shrink-0" />
        <p className="font-semibold leading-8 text-text text-[clamp(20px,2vw,24px)]">
          {reward}
        </p>
      </div>
    </motion.div>
  );
}
