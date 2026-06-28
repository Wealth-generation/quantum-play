import { cn } from "@/shared/lib";
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
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-primary text-sm font-black text-on-primary">
        {userInitial(username)}
      </span>
      <span className="truncate font-bold text-text">{username}</span>
    </div>
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
      <div className="min-w-[780px] rounded-md border border-border-2 bg-surface p-2 shadow-inset-hi">
        <div className="grid grid-cols-[1.3fr_1fr_0.75fr_0.85fr_0.75fr_1.15fr] gap-4 px-3 py-3 text-xs font-semibold text-text-subtle">
          <span>User</span>
          <span>Game</span>
          <span>Bet</span>
          <span>Multiplier</span>
          <span>Win</span>
          <span>Time</span>
        </div>
        <div className="flex flex-col gap-2">
          {bets.map((bet) => {
            const positivePayout = isPositiveDecimal(bet.payout);

            return (
              <div
                className="grid grid-cols-[1.3fr_1fr_0.75fr_0.85fr_0.75fr_1.15fr] items-center gap-4 rounded-sm bg-surface-3 px-3 py-4 text-sm"
                key={bet.id}
              >
                <UserCell username={username} />
                <div className="min-w-0">
                  <p className="truncate font-bold text-text">{bet.gameName}</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-text-subtle">
                    {bet.providerName}
                  </p>
                </div>
                <BetValue value={bet.betSize} />
                <span className="whitespace-nowrap font-semibold text-text">
                  {formatBetMultiplier(bet.payout, bet.betSize)}
                </span>
                <BetValue
                  className={cn(positivePayout && "text-primary-soft")}
                  value={bet.payout}
                />
                <span className="whitespace-nowrap font-semibold text-text-muted">
                  {formatProfileDateTime(bet.settledAt)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
