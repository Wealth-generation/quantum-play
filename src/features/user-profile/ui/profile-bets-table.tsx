"use client";

import { cn } from "@/shared/lib";
import { motion, useReducedMotion } from "motion/react";
import {
  formatBetMultiplier,
  formatProfileDateTime,
  isPositiveDecimal,
} from "../lib/user-profile-format";
import type { UserProfileBet } from "../types/user-profile-types";
import { BetValue } from "./profile-ui-primitives";

function userInitial(username: string): string {
  return username.slice(0, 1).toUpperCase();
}

function UserCell({ username }: { username: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-primary text-xs font-black text-on-primary">
        {userInitial(username)}
      </span>
      <span className="truncate font-semibold text-text">{username}</span>
    </div>
  );
}

function ProfileBetRow({
  bet,
  index,
  username,
}: {
  bet: UserProfileBet;
  index: number;
  username: string;
}) {
  const reduceMotion = useReducedMotion();
  const positivePayout = isPositiveDecimal(bet.payout);
  const finalBackground =
    index % 2 === 0 ? "var(--color-surface)" : "var(--color-surface-3)";

  return (
    <motion.div
      animate={{
        backgroundColor: finalBackground,
        opacity: 1,
        y: 0,
      }}
      className="grid min-w-[760px] grid-cols-[1.45fr_0.9fr_0.75fr_0.85fr_0.75fr_1.2fr] items-center gap-4 rounded-sm px-3 py-3 text-sm font-semibold text-text md:min-w-0"
      initial={
        reduceMotion
          ? false
          : {
              backgroundColor:
                "color-mix(in srgb, var(--color-primary) 20%, var(--color-surface))",
              opacity: 0,
              y: -8,
            }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              backgroundColor: {
                delay: 0.45 + Math.min(index, 8) * 0.035,
                duration: 0.75,
                ease: "easeOut",
              },
              delay: Math.min(index, 8) * 0.035,
              duration: 0.28,
              ease: "easeOut",
            }
      }
    >
      <UserCell username={username} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-text">{bet.gameName}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-text-muted">
          {bet.providerName}
        </p>
      </div>
      <BetValue value={bet.betSize} />
      <span className="whitespace-nowrap text-text">
        {formatBetMultiplier(bet.payout, bet.betSize)}
      </span>
      <BetValue
        className={cn(positivePayout && "text-primary-soft")}
        value={bet.payout}
      />
      <span className="whitespace-nowrap text-text-muted">
        {formatProfileDateTime(bet.settledAt)}
      </span>
    </motion.div>
  );
}

export function ProfileBetsTable({
  bets,
  username,
}: {
  bets: UserProfileBet[];
  username: string;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[760px] md:min-w-0">
        <div className="grid min-w-[760px] grid-cols-[1.45fr_0.9fr_0.75fr_0.85fr_0.75fr_1.2fr] gap-4 px-3 py-3 text-xs font-medium text-text-muted md:min-w-0">
          <span>User</span>
          <span>Game</span>
          <span>Bet</span>
          <span>Multiplier</span>
          <span>Win</span>
          <span>Time</span>
        </div>
        <div className="flex flex-col gap-2">
          {bets.map((bet, index) => (
            <ProfileBetRow
              bet={bet}
              index={index}
              key={bet.id}
              username={username}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
