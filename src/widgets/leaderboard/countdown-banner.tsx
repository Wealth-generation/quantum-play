"use client";

import { useState } from "react";

import { CountdownTimer } from "@/widgets/lobby/countdown-timer";

function getDurationParts(targetDate: Date) {
  const totalMinutes = Math.max(
    0,
    Math.round((targetDate.getTime() - Date.now()) / 60_000),
  );

  return {
    days: Math.floor(totalMinutes / 1_440),
    hours: Math.floor((totalMinutes % 1_440) / 60),
    minutes: totalMinutes % 60,
  };
}

export function CountdownBanner() {
  const [targetDate] = useState(
    () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
  );
  const duration = getDurationParts(targetDate);

  return (
    <section className="w-full">
      <CountdownTimer
        days={duration.days}
        hours={duration.hours}
        minutes={duration.minutes}
        variant="card"
      />
    </section>
  );
}
