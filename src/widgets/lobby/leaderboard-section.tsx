import type { ReactNode } from "react";
import Image from "next/image";

import leaderboardBg from "@/shared/assets/landing/leaderboard/images/leaderboard-bg.webp";
import leftChips from "@/shared/assets/landing/leaderboard/images/left-bg-chips.webp";
import rightChips from "@/shared/assets/landing/leaderboard/images/right-bg-chips.webp";
import rightRocket from "@/shared/assets/landing/leaderboard/images/right-bg-rocket.webp";

import { LeaderboardCard } from "./leaderboard-card";

interface LeaderboardSectionPlayer {
  place: 1 | 2 | 3;
  username: string;
  wagered: string;
  reward: string;
}

interface LeaderboardSectionProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  players?: LeaderboardSectionPlayer[];
  showAction?: boolean;
  actionLabel?: string;
}

const playersFallback: LeaderboardSectionPlayer[] = [
  { place: 1, username: "Username", wagered: "1,234.567", reward: "1,500.00" },
  { place: 2, username: "Username", wagered: "1,234.567", reward: "1,500.00" },
  { place: 3, username: "Username", wagered: "1,234.567", reward: "1,500.00" },
];

const subtitleFallback = (
  <>
    Players who wager using code{" "}
    <span className="font-semibold text-[clamp(16px,1.6vw,20px)]">QUANTUM</span>{" "}
    on Quantum Play are automatically entered
  </>
);

export function LeaderboardSection({
  title = "Monthly Leaderboard",
  subtitle = subtitleFallback,
  players = playersFallback,
  showAction = true,
  actionLabel = "View all",
}: LeaderboardSectionProps = {}) {
  return (
    <section className="relative w-full overflow-hidden px-4 py-10">
      <Image
        src={leaderboardBg}
        alt=""
        fill
        sizes="100vw"
        priority
        className="z-0 object-cover"
      />

      <div className="relative z-10 mx-auto flex max-w-[1175px] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-black uppercase leading-tight text-text text-[clamp(28px,4vw,40px)]">
            {title}
          </h2>
          <p className="text-text-muted text-[clamp(14px,1.5vw,18px)] leading-6">
            {subtitle}
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-5">
          <div className="relative isolate mx-auto flex w-full flex-col items-center gap-5 md:w-fit md:flex-row md:items-start md:justify-center md:gap-4">
            <Image
              src={leftChips}
              alt=""
              aria-hidden="true"
              className="absolute right-full top-[18%] -z-10 hidden h-auto w-[clamp(70px,9vw,140px)] translate-x-[7px] md:block"
            />
            <Image
              src={rightRocket}
              alt=""
              aria-hidden="true"
              className="absolute left-full top-[2%] -z-10 hidden h-auto w-[clamp(80px,10vw,170px)] -translate-x-[33px] md:block"
            />
            <Image
              src={rightChips}
              alt=""
              aria-hidden="true"
              className="absolute bottom-[2%] left-full -z-10 hidden h-auto w-[clamp(55px,7vw,100px)] -translate-x-[9px] md:block"
            />

            {players.map((player) => (
              <LeaderboardCard
                key={player.place}
                place={player.place}
                username={player.username}
                wagered={player.wagered}
                reward={player.reward}
              />
            ))}
          </div>

          {showAction ? (
            <button
              type="button"
              className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-md border border-border bg-gradient-to-b from-surface-3 to-border-2 px-6 font-semibold text-text outline-none transition-colors text-[clamp(16px,1.5vw,20px)] hover:border-border-2 focus-visible:shadow-glow"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
