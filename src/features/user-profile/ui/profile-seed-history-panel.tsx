"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";
import { Button } from "@/shared/ui/primitives/button";
import {
  formatProfileDate,
  shortenIdentifier,
} from "../lib/user-profile-format";
import { useUserProfileSeedHistoryQuery } from "../model/user-profile-query";
import type { UserProfileSeedHistoryRow } from "../types/user-profile-types";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  SectionCard,
} from "./profile-ui-primitives";

const SEED_HISTORY_PAGE_SIZE = 10;

function SeedValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="truncate font-mono text-xs font-semibold text-text">
        {shortenIdentifier(value)}
      </span>
      <button
        aria-label={`${label} copy disabled`}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-control text-text-subtle"
        disabled
        type="button"
      >
        <Copy aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SeedHistoryRow({ row }: { row: UserProfileSeedHistoryRow }) {
  return (
    <div className="grid min-w-[700px] grid-cols-[1.4fr_1.4fr_0.6fr_1fr] items-center gap-4 rounded-sm bg-surface-3 px-3 py-3 text-sm md:min-w-0">
      <SeedValue label="Client seed" value={row.clientSeed} />
      <SeedValue label="Server seed" value={row.serverSeed} />
      <span className="font-bold tabular-nums text-text">{row.nonce}</span>
      <span className="whitespace-nowrap font-semibold text-text-muted">
        {formatProfileDate(row.createdAt)}
      </span>
    </div>
  );
}

function SeedHistoryTable({ rows }: { rows: UserProfileSeedHistoryRow[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[700px] md:min-w-0">
        <div className="grid min-w-[700px] grid-cols-[1.4fr_1.4fr_0.6fr_1fr] gap-4 px-3 py-3 text-xs font-medium text-text-muted md:min-w-0">
          <span>Client Seed</span>
          <span>Server Seed</span>
          <span>Nonce</span>
          <span>Date</span>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <SeedHistoryRow
              key={`${row.createdAt}-${row.nonce}-${row.clientSeed}-${row.serverSeed}`}
              row={row}
            />
          ))}
        </div>
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
          aria-label="Previous seed history page"
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
              className={
                pageNumber === currentPage
                  ? "h-10 min-w-10 rounded-sm border border-primary/50 bg-primary/15 px-3 text-sm font-bold text-primary-soft"
                  : "h-10 min-w-10 rounded-sm border border-border bg-surface-3 px-3 text-sm font-bold text-text-muted transition-colors hover:text-text"
              }
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
          aria-label="Next seed history page"
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

export function ProfileSeedHistoryPanel() {
  const [page, setPage] = React.useState(1);
  const seedHistoryQuery = useUserProfileSeedHistoryQuery({
    page,
    take: SEED_HISTORY_PAGE_SIZE,
  });
  const rows = seedHistoryQuery.data?.data ?? [];
  const totalPages = Math.max(1, seedHistoryQuery.data?.totalPages ?? 1);
  const currentPage = seedHistoryQuery.data?.page ?? page;

  return (
    <SectionCard title="Seed History">
      <div className="flex flex-col gap-4">
        {seedHistoryQuery.isLoading ? (
          <div className="grid gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <LoadingBlock className="h-12 rounded-sm bg-surface" key={index} />
            ))}
          </div>
        ) : seedHistoryQuery.isError ? (
          <ErrorState
            message={
              seedHistoryQuery.error instanceof Error
                ? seedHistoryQuery.error.message
                : "Seed history is unavailable."
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState label="No seed history found" />
        ) : (
          <SeedHistoryTable rows={rows} />
        )}

        <PaginationControls
          currentPage={currentPage}
          disabled={seedHistoryQuery.isFetching}
          onPageChange={setPage}
          totalPages={totalPages}
        />
      </div>
    </SectionCard>
  );
}
