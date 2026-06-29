import Image from "next/image";
import { Pencil } from "lucide-react";
import { cn } from "@/shared/lib";
import { shortenAddress } from "../lib/user-profile-format";
import type {
  UserProfileData,
  UserProfileStats,
} from "../types/user-profile-types";
import {
  LoadingBlock,
  SectionCard,
} from "./profile-ui-primitives";

interface StatCardConfig {
  image: string;
  label: string;
  value: string;
  valueIcon?: string;
}

const UNAVAILABLE_STAT_VALUE = "\u2014";

function ProfileStatCard({ image, label, value, valueIcon }: StatCardConfig) {
  const unavailable = value === UNAVAILABLE_STAT_VALUE;

  return (
    <div className="relative min-h-20 overflow-hidden rounded-md border border-border bg-surface shadow-inset-hi">
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 h-full w-24 object-cover object-left opacity-90"
        height={88}
        src={image}
        width={120}
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-transparent via-surface/30 to-surface"
      />
      <div className="relative flex min-h-20 flex-col justify-center pl-[5.75rem] pr-4">
        <p className="truncate text-sm font-semibold text-text">
          {label}
        </p>
        <span
          className={cn(
            "mt-1 flex items-center gap-1.5 truncate text-lg font-black text-text",
            unavailable && "text-text-subtle",
          )}
        >
          {valueIcon ? (
            <Image
              alt=""
              aria-hidden="true"
              height={20}
              src={valueIcon}
              width={20}
            />
          ) : null}
          {value}
        </span>
      </div>
    </div>
  );
}

function StatsGrid({
  isError,
  isLoading,
  stats,
}: {
  isError: boolean;
  isLoading: boolean;
  stats?: UserProfileStats;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <LoadingBlock className="h-20" />
        <LoadingBlock className="h-20" />
        <LoadingBlock className="h-20" />
        <LoadingBlock className="h-20" />
      </div>
    );
  }

  const availableStats = isError ? undefined : stats;
  const statCards: StatCardConfig[] = [
    {
      image: "/images/total-degency-wagered.webp",
      label: "Total DegenCity wagered",
      value: UNAVAILABLE_STAT_VALUE,
      valueIcon: "/images/game-point.svg",
    },
    {
      image: "/images/total-points-wagered.webp",
      label: "Total points wagered",
      value: availableStats?.watchPointSpent ?? UNAVAILABLE_STAT_VALUE,
      valueIcon: "/images/game-point.svg",
    },
    {
      image: "/images/referred-users.webp",
      label: "Referred users",
      value: UNAVAILABLE_STAT_VALUE,
    },
    {
      image: "/images/degencity-leaderboard.webp",
      label: "DegenCity Leaderboard",
      value:
        availableStats?.currentLeaderboardPosition ?? UNAVAILABLE_STAT_VALUE,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => (
        <ProfileStatCard
          image={card.image}
          key={card.label}
          label={card.label}
          value={card.value}
          valueIcon={card.valueIcon}
        />
      ))}
    </div>
  );
}

function WalletRow({
  address,
  label,
  src,
  ticker,
}: {
  address: string | null;
  label: string;
  src: string;
  ticker: string;
}) {
  const displayAddress = address ? shortenAddress(address) : "Enter address";

  return (
    <div className="flex h-12 min-w-0 overflow-hidden rounded-md border border-border bg-surface shadow-inset-hi">
      <div className="flex w-[5.25rem] shrink-0 items-center gap-2 border-r border-border px-3">
        <Image alt={`${ticker} icon`} height={20} src={src} width={20} />
        <span className="text-sm font-black text-text">{ticker}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center bg-control px-3 text-sm font-semibold text-text-muted">
        <span className="truncate" title={address ?? "Enter address"}>
          {displayAddress}
        </span>
      </div>
      <button
        aria-label={`${label} wallet update unavailable`}
        className="flex w-11 shrink-0 items-center justify-center border-l border-border bg-surface text-text-muted disabled:opacity-60"
        disabled
        type="button"
      >
        <Pencil aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProfileOverviewPanel({
  profile,
  stats,
  statsError,
  statsLoading,
}: {
  profile: UserProfileData;
  stats?: UserProfileStats;
  statsError: boolean;
  statsLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Statistics">
        <StatsGrid
          isError={statsError}
          isLoading={statsLoading}
          stats={stats}
        />
      </SectionCard>

      <SectionCard title="Crypto Wallets">
        <div className="grid gap-3 lg:grid-cols-3">
          <WalletRow
            address={profile.cryptoAddresses.btcAddress}
            label="Bitcoin"
            src="/images/BTC.svg"
            ticker="BTC"
          />
          <WalletRow
            address={profile.cryptoAddresses.ethAddress}
            label="Ethereum"
            src="/images/ETH.svg"
            ticker="ETH"
          />
          <WalletRow
            address={profile.cryptoAddresses.ltcAddress}
            label="Litecoin"
            src="/images/LTC.svg"
            ticker="LTC"
          />
        </div>
      </SectionCard>
    </div>
  );
}
