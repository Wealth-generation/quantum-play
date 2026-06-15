"use client";

import { useEffect, useState } from "react";
import TimerIcon from "@/shared/assets/landing/bonus/icons/timer-icon.svg";

/**
 * Countdown timer pill — Figma "time" block. Ticks down from a target computed on
 * mount (now + the given d/h/m). The target is a STATIC PLACEHOLDER — the real
 * promo end time is backend-authoritative (Track B).
 *
 * timer-icon.svg is currentColor, so the icon colour is set per banner via iconClass.
 */
interface CountdownTimerProps {
  days: number;
  hours: number;
  minutes: number;
  /** Tailwind text-color utility for the icon (per-banner accent). */
  iconClass: string;
}

export function CountdownTimer({ days, hours, minutes, iconClass }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState({ days, hours, minutes });

  useEffect(() => {
    const target = Date.now() + ((days * 24 + hours) * 60 + minutes) * 60_000;
    const tick = () => {
      const totalMin = Math.max(0, Math.round((target - Date.now()) / 60_000));
      setRemaining({
        days: Math.floor(totalMin / 1440),
        hours: Math.floor((totalMin % 1440) / 60),
        minutes: totalMin % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [days, hours, minutes]);

  return (
    <div className="flex w-fit items-center gap-2 rounded-md bg-[rgba(43,48,59,0.5)] px-3 py-1.5">
      <TimerIcon aria-hidden className={`size-4 shrink-0 ${iconClass}`} />
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
