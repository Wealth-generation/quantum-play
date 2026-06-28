import Image from "next/image";
import { Crown, Pencil, Trophy } from "lucide-react";
import { shortenAddress } from "../lib/user-profile-format";
import type {
  UserProfileData,
  UserProfileStats,
} from "../types/user-profile-types";
import {
  ErrorState,
  LoadingBlock,
  MetricCard,
  SectionCard,
  StatusPill,
} from "./profile-ui-primitives";

function StatsGrid({
  isError,
  isLoading,
  profile,
  stats,
}: {
  isError: boolean;
  isLoading: boolean;
  profile: UserProfileData;
  stats?: UserProfileStats;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <LoadingBlock className="h-32" />
        <LoadingBlock className="h-32" />
        <LoadingBlock className="h-32" />
        <LoadingBlock className="h-32" />
      </div>
    );
  }

  if (isError || !stats) {
    return <ErrorState message="Profile statistics are unavailable." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={
          <Image
            alt=""
            aria-hidden="true"
            height={26}
            src="/images/game-point.svg"
            width={26}
          />
        }
        label="Game Points"
        value={profile.balances.gamePoints}
      />
      <MetricCard
        icon={
          <Image
            alt=""
            aria-hidden="true"
            height={26}
            src="/images/watch-point.svg"
            width={26}
          />
        }
        label="Total Points Wagered"
        value={stats.watchPointSpent}
      />
      <MetricCard
        icon={<Trophy aria-hidden="true" className="h-5 w-5" />}
        label="Bets"
        value={stats.bets}
      />
      <MetricCard
        icon={<Crown aria-hidden="true" className="h-5 w-5" />}
        label="Leaderboard"
        value={stats.currentLeaderboardPosition}
      />
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
  const connected = Boolean(address);

  return (
    <div className="grid gap-3 rounded-md border border-border-2 bg-surface-3 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-bg/50">
        <Image alt={`${ticker} icon`} height={28} src={src} width={28} />
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="font-bold text-text">{ticker}</p>
          <p className="text-sm font-semibold text-text-muted">{label}</p>
          <StatusPill
            active={connected}
            label={connected ? "Connected" : "Empty"}
          />
        </div>
        <p className="rounded-md border border-border bg-control px-3 py-2 text-sm font-semibold text-text-muted">
          {shortenAddress(address)}
        </p>
      </div>
      <button
        aria-label={`${label} wallet update unavailable`}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-bg/50 text-text-muted disabled:opacity-60"
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
      <StatsGrid
        isError={statsError}
        isLoading={statsLoading}
        profile={profile}
        stats={stats}
      />

      <SectionCard title="Crypto Wallets">
        <div className="grid gap-3">
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
