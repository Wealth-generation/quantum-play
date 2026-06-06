"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, CircleOff } from "lucide-react";
import {
  formatLiveBetTime,
  formatMultiplier,
  shortenUsername,
  type LiveBetDto,
} from "@/entities/bet/model";
import { cn } from "@/shared/lib";
import {
  betLiveTabs,
  getLiveBets,
  liveBetsQueryKey,
  liveBetsStaleTimeMs,
  type BetLiveTabOption,
} from "./bet-live-client";

interface BetLiveProps {
  variant: "lobby" | "game";
  className?: string;
}

function selectedTabLabel(tab: BetLiveTabOption): string {
  return tab.label === "All bets" ? "All Bets" : tab.label;
}

function BetTabs({
  activeTab,
  onSelect,
}: {
  activeTab: BetLiveTabOption;
  onSelect: (tab: BetLiveTabOption) => void;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <div className="hidden rounded-md border border-border bg-surface p-1 md:inline-flex">
        {betLiveTabs.map((tab) => (
          <button
            className={cn(
              "h-8 rounded-sm px-3 text-sm font-semibold text-text-muted transition-colors",
              tab.value === activeTab.value
                ? "bg-surface-3 text-text shadow-inset-hi"
                : "hover:text-text",
            )}
            key={tab.value}
            onClick={() => onSelect(tab)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative md:hidden">
        <button
          aria-expanded={mobileOpen}
          className="flex h-11 min-w-40 items-center justify-between gap-4 rounded-md border border-border bg-surface-3 px-4 text-sm font-semibold text-text shadow-inset-hi"
          onClick={() => setMobileOpen((open) => !open)}
          type="button"
        >
          {selectedTabLabel(activeTab)}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-text-muted transition-transform",
              mobileOpen && "rotate-180",
            )}
          />
        </button>

        {mobileOpen ? (
          <div className="absolute right-0 top-12 z-30 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-border bg-surface shadow-overlay">
            {betLiveTabs.map((tab) => (
              <button
                className={cn(
                  "block h-11 w-full px-4 text-left text-sm font-semibold transition-colors",
                  tab.value === activeTab.value
                    ? "bg-surface-3 text-text"
                    : "text-text-muted hover:bg-surface-3 hover:text-text",
                )}
                key={tab.value}
                onClick={() => {
                  onSelect(tab);
                  setMobileOpen(false);
                }}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

function TableHeader({ showTime }: { showTime: boolean }) {
  return (
    <div
      className={cn(
        "grid min-w-[760px] grid-cols-[1.5fr_1fr_0.85fr_0.9fr_0.85fr] gap-4 px-3 py-3 text-xs font-medium text-text-muted md:min-w-0",
        showTime &&
          "grid-cols-[1.45fr_0.9fr_0.75fr_0.85fr_0.75fr_1.2fr]",
      )}
    >
      <span>User</span>
      <span>Game</span>
      <span>Bet</span>
      <span>Multiplier</span>
      <span>Prize</span>
      {showTime ? <span>Time</span> : null}
    </div>
  );
}

function ChipValue({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap text-text">
      <Image
        alt=""
        aria-hidden="true"
        height={18}
        src="/images/game-point.svg"
        width={18}
      />
      <span>{value}</span>
    </span>
  );
}

function LiveBetRow({
  bet,
  index,
  showTime,
}: {
  bet: LiveBetDto;
  index: number;
  showTime: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{
        backgroundColor: "var(--color-surface)",
        opacity: 1,
        y: 0,
      }}
      className={cn(
        "grid min-w-[760px] grid-cols-[1.5fr_1fr_0.85fr_0.9fr_0.85fr] gap-4 rounded-sm bg-surface px-3 py-4 text-sm font-semibold text-text md:min-w-0",
        showTime &&
          "grid-cols-[1.45fr_0.9fr_0.75fr_0.85fr_0.75fr_1.2fr]",
      )}
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
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-primary text-xs font-black text-on-primary">
          {bet.username.slice(0, 1).toUpperCase()}
        </span>
        <span className="truncate">{shortenUsername(bet.username)}</span>
      </div>
      <span className="truncate">{bet.gameName}</span>
      <ChipValue value={bet.betSize} />
      <span className="whitespace-nowrap">{formatMultiplier(bet.multiplier)}</span>
      <ChipValue value={bet.payout} />
      {showTime ? (
        <span className="whitespace-nowrap text-text-muted">
          {formatLiveBetTime(bet.betSettledAt)}
        </span>
      ) : null}
    </motion.div>
  );
}

function BetLiveTable({
  bets,
  tabValue,
  showTime,
}: {
  bets: LiveBetDto[];
  tabValue: string;
  showTime: boolean;
}) {
  if (bets.length === 0) {
    return (
      <div className="overflow-x-auto pb-2">
        <TableHeader showTime={showTime} />
        <div className="flex min-h-32 min-w-[760px] items-center justify-center gap-2 text-sm font-medium text-text-subtle md:min-w-0">
          <CircleOff className="h-5 w-5" aria-hidden="true" />
          <span>No bets yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <TableHeader showTime={showTime} />
      <div className="flex min-w-[760px] flex-col gap-2 md:min-w-0">
        {bets.map((bet, index) => (
          <LiveBetRow
            bet={bet}
            index={index}
            key={`${tabValue}-${bet.betId}`}
            showTime={showTime}
          />
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="h-14 animate-pulse rounded-sm bg-surface"
          key={index}
        />
      ))}
    </div>
  );
}

export function BetLive({ className, variant }: BetLiveProps) {
  const [activeTab, setActiveTab] = React.useState(betLiveTabs[0]);
  const queryClient = useQueryClient();
  const showTime = variant === "lobby";
  const endpoint = activeTab.endpoint;

  React.useEffect(() => {
    for (const tab of betLiveTabs) {
      if (!tab.endpoint) {
        continue;
      }

      void queryClient.prefetchQuery({
        queryFn: () => getLiveBets(tab.endpoint!),
        queryKey: liveBetsQueryKey(tab.value),
        staleTime: liveBetsStaleTimeMs,
      });
    }
  }, [queryClient]);

  const liveBetsQuery = useQuery({
    enabled: endpoint !== null,
    queryFn: () => getLiveBets(endpoint!),
    queryKey: liveBetsQueryKey(activeTab.value),
    retry: 1,
    staleTime: liveBetsStaleTimeMs,
  });

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-text">Bet Live</h2>
        <BetTabs activeTab={activeTab} onSelect={setActiveTab} />
      </div>

      {activeTab.value === "your" ? (
        <div className="rounded-md border border-border bg-surface p-6 text-sm font-semibold text-text-muted">
          Log in to see your bets.
        </div>
      ) : liveBetsQuery.isLoading ? (
        <LoadingState />
      ) : liveBetsQuery.isError ? (
        <div className="rounded-md border border-danger/40 bg-surface p-6 text-sm font-semibold text-danger">
          {liveBetsQuery.error instanceof Error
            ? liveBetsQuery.error.message
            : "Live bets are unavailable. Please try again later."}
        </div>
      ) : (
        <BetLiveTable
          bets={liveBetsQuery.data ?? []}
          showTime={showTime}
          tabValue={activeTab.value}
        />
      )}
    </section>
  );
}
