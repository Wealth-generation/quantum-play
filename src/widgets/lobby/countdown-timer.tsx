"use client";

import { useEffect, useState } from "react";

import { cn } from "@/shared/lib";
import TimerIcon from "@/shared/assets/landing/bonus/icons/timer-icon.svg";

/**
 * Shared countdown timer.
 *
 * - `pill` keeps the existing compact banner treatment used in lobby bonus cards.
 * - `card` matches the standalone Figma countdown card used on the leaderboard page.
 *
 * The target is still a STATIC PLACEHOLDER calculated on mount from the provided
 * duration. Backend-authoritative end times remain deferred.
 */
interface CountdownTimerProps {
  days: number;
  hours: number;
  minutes: number;
  iconClass?: string;
  variant?: "pill" | "card";
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getInitialRemaining({
  days,
  hours,
  minutes,
}: Pick<CountdownTimerProps, "days" | "hours" | "minutes">): TimeParts {
  return { days, hours, minutes, seconds: 0 };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

interface CountdownCellProps {
  label: string;
  value: number;
}

function CountdownCell({ label, value }: CountdownCellProps) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-[8px] bg-[color-mix(in_srgb,var(--color-bg)_55%,var(--color-control))] px-4 py-2">
      <span className="text-sm font-semibold leading-[18px] text-text [font-feature-settings:'calt'_0]">
        {pad(value)}
      </span>
      <span className="text-xs font-semibold leading-4 text-text-placeholder [font-feature-settings:'calt'_0]">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({
  days,
  hours,
  minutes,
  iconClass = "text-primary",
  variant = "pill",
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    getInitialRemaining({ days, hours, minutes }),
  );

  useEffect(() => {
    const target = Date.now() + ((days * 24 + hours) * 60 + minutes) * 60_000;

    const tick = () => {
      const totalSeconds = Math.max(
        0,
        Math.floor((target - Date.now()) / 1_000),
      );

      setRemaining({
        days: Math.floor(totalSeconds / 86_400),
        hours: Math.floor((totalSeconds % 86_400) / 3_600),
        minutes: Math.floor((totalSeconds % 3_600) / 60),
        seconds: totalSeconds % 60,
      });
    };

    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [days, hours, minutes]);

  if (variant === "pill") {
    return (
      <div className="flex w-fit items-center gap-2 rounded-md bg-[rgba(43,48,59,0.5)] px-3 py-1.5">
        <TimerIcon aria-hidden className={cn("size-4 shrink-0", iconClass)} />
        <div className="flex items-center gap-1 font-medium leading-[18px] text-[clamp(12px,1.1vw,14px)]">
          <span className="text-text-muted">{remaining.days}d</span>
          <span className="text-text-subtle">:</span>
          <span className="text-text-muted">{remaining.hours}h</span>
          <span className="text-text-subtle">:</span>
          <span className="text-text-muted">{remaining.minutes}m</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[288px] flex-col items-center justify-center gap-4 rounded-[18px] bg-gradient-to-b from-[color-mix(in_srgb,var(--color-surface-3)_40%,transparent)] to-[color-mix(in_srgb,var(--color-border-2)_40%,transparent)] p-6 text-center">
      <p className="text-base font-semibold leading-5 text-text [font-feature-settings:'lnum'_1,'pnum'_1]">
        Competition ends in:
      </p>

      <div className="flex items-center justify-center gap-2">
        <CountdownCell label="D" value={remaining.days} />
        <span className="text-center text-xs font-semibold leading-4 text-text-placeholder [font-feature-settings:'calt'_0]">
          :
        </span>
        <CountdownCell label="H" value={remaining.hours} />
        <span className="text-center text-xs font-semibold leading-4 text-text-placeholder [font-feature-settings:'calt'_0]">
          :
        </span>
        <CountdownCell label="M" value={remaining.minutes} />
        <span className="text-center text-xs font-semibold leading-4 text-text-placeholder [font-feature-settings:'calt'_0]">
          :
        </span>
        <CountdownCell label="S" value={remaining.seconds} />
      </div>
    </div>
  );
}
