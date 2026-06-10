"use client";

import Image from "next/image";

interface DiceMetricProps {
  label: string;
  onSuffixClick?: () => void;
  suffix?: string;
  value: string;
}

export function DiceMetric({
  label,
  onSuffixClick,
  suffix,
  value,
}: DiceMetricProps) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="text-sm font-black text-text">{label}</p>
      <div className="flex h-11 items-center justify-between gap-3 rounded-md border border-border bg-control px-3 text-sm font-bold text-text shadow-inset-hi">
        <span className="truncate">{value}</span>
        {onSuffixClick ? (
          <button
            aria-label="Mirror rollover"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-surface-3 hover:text-text"
            onClick={onSuffixClick}
            type="button"
          >
            <Image
              alt=""
              aria-hidden="true"
              height={16}
              src="/images/rollover.svg"
              width={16}
            />
          </button>
        ) : suffix ? (
          <span className="text-lg text-text-muted">{suffix}</span>
        ) : null}
      </div>
    </div>
  );
}
