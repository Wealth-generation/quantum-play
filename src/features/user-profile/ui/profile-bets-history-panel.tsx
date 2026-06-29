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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/primitives/popover";
import { betGameFilters, type BetGameFilter } from "../model/bet-game-filters";
import { BETS_PAGE_SIZE } from "../model/constants";
import { useUserProfileBetsQuery } from "../model/user-profile-query";
import type {
  UserProfileBet,
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

type BetsSortBy = "date" | "win";

const sortOptions = [
  { value: "date", label: "Date" },
  { value: "win", label: "Win" },
] satisfies Array<{ value: BetsSortBy; label: string }>;

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function resolveSearchGameFilter(value: string): BetGameFilter | null {
  const normalized = normalizeSearch(value);

  if (!normalized) {
    return "all";
  }

  if (normalized === "all") {
    return "all";
  }

  for (const filter of betGameFilters) {
    if (filter.value === "all") {
      continue;
    }

    const label = filter.label.toLowerCase();
    const slugGame = filter.value.replace("thedoctor_", "");

    if (
      normalized === label ||
      normalized === slugGame ||
      normalized === filter.value
    ) {
      return filter.value;
    }
  }

  return null;
}

function searchValueForFilter(value: BetGameFilter): string {
  if (value === "all") {
    return "";
  }

  return betGameFilters.find((filter) => filter.value === value)?.label ?? "";
}

function sortableNumber(value: string): number {
  const numeric = Number(value);

  return Number.isFinite(numeric) ? numeric : 0;
}

function sortableDate(value: string): number {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function sortBetsOnCurrentPage(
  bets: UserProfileBet[],
  sortBy: BetsSortBy,
): UserProfileBet[] {
  const sorted = [...bets];

  if (sortBy === "win") {
    sorted.sort(
      (left, right) => sortableNumber(right.payout) - sortableNumber(left.payout),
    );
    return sorted;
  }

  sorted.sort(
    (left, right) => sortableDate(right.settledAt) - sortableDate(left.settledAt),
  );
  return sorted;
}

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

function TableControls({
  onSearchChange,
  onSortChange,
  searchValue,
  sortBy,
}: {
  onSearchChange: (value: string) => void;
  onSortChange: (value: BetsSortBy) => void;
  searchValue: string;
  sortBy: BetsSortBy;
}) {
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const selectedSortOption =
    sortOptions.find((option) => option.value === sortBy) ?? sortOptions[0];

  function handleSortChange(value: BetsSortBy) {
    onSortChange(value);
    setIsSortOpen(false);
  }

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
      <label className="flex h-11 items-center gap-2 rounded-sm border border-border bg-surface px-3 text-sm font-semibold text-text-muted focus-within:border-border-2">
        <Search aria-hidden="true" className="h-4 w-4 text-text-subtle" />
        <span className="sr-only">Search bets by game</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-text outline-none placeholder:text-text-placeholder"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Enter text"
          type="search"
          value={searchValue}
        />
      </label>
      <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
        <PopoverTrigger asChild>
          <button
            aria-expanded={isSortOpen}
            aria-haspopup="listbox"
            aria-label="Sort bets"
            className="flex h-11 min-w-0 items-center justify-between gap-2 rounded-sm border border-border bg-surface px-3 text-sm font-semibold text-text-muted outline-none transition-colors hover:border-border-2 focus-visible:border-border-2"
            type="button"
          >
            <span className="min-w-0 truncate">
              Sort by:{" "}
              <span className="text-primary-soft">
                {selectedSortOption.label}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "h-4 w-4 shrink-0 text-text-subtle transition-transform",
                isSortOpen && "rotate-180 text-text",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[var(--radix-popover-trigger-width)] min-w-40 rounded-md border border-border bg-surface p-2 shadow-overlay"
          sideOffset={6}
        >
          <div aria-label="Sort bets" className="space-y-1" role="listbox">
            {sortOptions.map((option) => {
              const isSelected = option.value === sortBy;

              return (
                <button
                  aria-selected={isSelected}
                  className={cn(
                    "flex h-9 w-full items-center rounded-sm px-3 text-left text-sm font-semibold transition-colors",
                    isSelected
                      ? "bg-surface-3 text-text"
                      : "text-text-muted hover:bg-surface-3 hover:text-text",
                  )}
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  role="option"
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
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
  const [searchValue, setSearchValue] = React.useState("");
  const [sortBy, setSortBy] = React.useState<BetsSortBy>("date");
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
  const sortedBets = React.useMemo(
    () => sortBetsOnCurrentPage(betsQuery.data?.data ?? [], sortBy),
    [betsQuery.data, sortBy],
  );
  const totalPages = Math.max(1, betsQuery.data?.totalPages ?? 1);
  const currentPage = betsQuery.data?.page ?? page;

  return (
    <SectionCard title="Bets History">
      <div className="flex flex-col gap-4">
        <GameFilter
          onChange={(nextFilter) => {
            setGameFilter(nextFilter);
            setSearchValue(searchValueForFilter(nextFilter));
            setPage(1);
          }}
          value={gameFilter}
        />

        <TableControls
          onSearchChange={(nextValue) => {
            setSearchValue(nextValue);

            const nextFilter = resolveSearchGameFilter(nextValue);

            if (nextFilter !== null && nextFilter !== gameFilter) {
              setGameFilter(nextFilter);
              setPage(1);
            }
          }}
          onSortChange={setSortBy}
          searchValue={searchValue}
          sortBy={sortBy}
        />

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
        ) : sortedBets.length === 0 ? (
          <EmptyState label="No bets found" />
        ) : (
          <ProfileBetsTable bets={sortedBets} username={profile.username} />
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
