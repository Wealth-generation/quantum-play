"use client";

import Image from "next/image";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-black text-text">{children}</span>;
}

export function CoinValue({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        alt=""
        aria-hidden="true"
        height={20}
        src="/images/game-point.svg"
        width={20}
      />
      <span>{value}</span>
    </span>
  );
}

export function MoneyIcon() {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-on-primary">
      $
    </span>
  );
}

export function MoneyBadge({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-2">
      <MoneyIcon />
      <span>{value}</span>
    </span>
  );
}

export function AutoSummaryCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-h-16 rounded-md border border-border/70 bg-surface-2/70 px-3 py-3 shadow-inset-hi">
      <p className="text-xs font-bold text-text-muted">{label}</p>
      <div className="mt-1 text-sm font-black text-text">{value}</div>
    </div>
  );
}
