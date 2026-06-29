"use client";

import * as React from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/primitives/button";
import { betGameFilters, type BetGameFilter } from "../model/bet-game-filters";
import { BETS_PAGE_SIZE } from "../model/constants";
import { useUserProfileBetsQuery } from "../model/user-profile-query";
import type {
  UserProfileBetGameSlug,
  UserProfileData,
} from "../types/user-profile-types";
import { ProfileBetsTable } from "./profile-bets-table";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  SectionCard,
} from "./profile-ui-primitives";

function GameFilter({
  value,
  onChange,
}: {
  value: BetGameFilter;
  onChange: (value: BetGameFilter) => void;
}) {
  return (
    <div className="overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex min-w-max items-center gap-3">
        {betGameFilters.map((filter) => (
          <button
            className={cn(
              "relative flex h-10 items-center gap-2 rounded-sm px-3 text-sm font-bold transition-colors",
              value === filter.value
                ? "bg-surface-3 text-text"
                : "text-text-muted hover:bg-surface-3 hover:text-text",
            )}
            key={filter.value}
            onClick={() => onChange(filter.value)}
            type="button"
          >
            <Image
              alt=""
              aria-hidden="true"
              className="rounded-sm"
              height={22}
              src={filter.icon}
              width={22}
            />
            {filter.label}
            {value === filter.value ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-2 h-0.5 rounded-pill bg-primary"
              />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function StaticTableControls() {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
      <div
        aria-disabled="true"
        className="flex h-11 items-center gap-2 rounded-sm border border-border bg-surface px-3 text-sm font-semibold text-text-placeholder"
      >
        <Search aria-hidden="true" className="h-4 w-4 text-text-subtle" />
        Enter text
      </div>
      <div
        aria-disabled="true"
        className="flex h-11 items-center justify-between gap-2 rounded-sm border border-border bg-surface px-3 text-sm font-semibold text-text-muted"
      >
        <span>Sort by Date</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 text-text-subtle" />
      </div>
    </div>
  );
}

function PaginationControls({
  currentPage,
  disabled,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  const pages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => index + 1,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p className="text-sm font-semibold text-text-muted">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Previous page"
          disabled={currentPage <= 1 || disabled}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          size="icon"
          type="button"
          variant="secondary"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {pages.map((pageNumber) => (
            <button
              aria-current={pageNumber === currentPage ? "page" : undefined}
              className={cn(
                "h-10 min-w-10 rounded-sm border px-3 text-sm font-bold transition-colors",
                pageNumber === currentPage
                  ? "border-primary/50 bg-primary/15 text-primary-soft"
                  : "border-border bg-surface-3 text-text-muted hover:text-text",
              )}
              disabled={disabled}
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              type="button"
            >
              {pageNumber}
            </button>
          ))}
          {totalPages > 5 ? (
            <span className="px-2 text-sm font-bold text-text-subtle">...</span>
          ) : null}
        </div>
        <Button
          aria-label="Next page"
          disabled={currentPage >= totalPages || disabled}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          size="icon"
          type="button"
          variant="secondary"
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ProfileBetsHistoryPanel({
  authenticated,
  profile,
}: {
  authenticated: boolean;
  profile: UserProfileData;
}) {
  const [page, setPage] = React.useState(1);
  const [gameFilter, setGameFilter] = React.useState<BetGameFilter>("all");
  const gameSlug =
    gameFilter === "all" ? undefined : (gameFilter as UserProfileBetGameSlug);
  const betsQuery = useUserProfileBetsQuery(
    {
      gameSlug,
      page,
      take: BETS_PAGE_SIZE,
    },
    authenticated,
  );
  const bets = betsQuery.data?.data ?? [];
  const totalPages = Math.max(1, betsQuery.data?.totalPages ?? 1);
  const currentPage = betsQuery.data?.page ?? page;

  return (
    <SectionCard title="Bets History">
      <div className="flex flex-col gap-4">
        <GameFilter
          onChange={(nextFilter) => {
            setGameFilter(nextFilter);
            setPage(1);
          }}
          value={gameFilter}
        />

        <StaticTableControls />

        {betsQuery.isLoading ? (
          <div className="grid gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <LoadingBlock className="h-12 rounded-sm bg-surface" key={index} />
            ))}
          </div>
        ) : betsQuery.isError ? (
          <ErrorState
            message={
              betsQuery.error instanceof Error
                ? betsQuery.error.message
                : "Bet history is unavailable."
            }
          />
        ) : bets.length === 0 ? (
          <EmptyState label="No bets found" />
        ) : (
          <ProfileBetsTable bets={bets} username={profile.username} />
        )}

        <PaginationControls
          currentPage={currentPage}
          disabled={betsQuery.isFetching}
          onPageChange={setPage}
          totalPages={totalPages}
        />
      </div>
    </SectionCard>
  );
}
