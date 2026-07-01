import * as React from "react";
import type { DailyClaimStatus } from "../types/daily-claim-types";

function finiteTimestamp(value: string): number | null {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : null;
}

function remainingSecondsFromDeadline(deadlineMs: number) {
  return Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
}

export function hasDailyClaimCountdown(
  status: DailyClaimStatus | undefined,
) {
  if (!status || status.available || !status.enabled || status.invalidConfig) {
    return false;
  }

  if (typeof status.nextClaimAt === "string") {
    const claimAtMs = finiteTimestamp(status.nextClaimAt);

    if (claimAtMs !== null && remainingSecondsFromDeadline(claimAtMs) > 0) {
      return true;
    }
  }

  return status.secondsUntilNextClaim > 0;
}

function deadlineFromValues({
  available,
  enabled,
  invalidConfig,
  nextClaimAt,
  secondsUntilNextClaim,
}: Partial<DailyClaimStatus>) {
  if (available || !enabled || invalidConfig) {
    return null;
  }

  const claimAtMs = typeof nextClaimAt === "string"
    ? finiteTimestamp(nextClaimAt)
    : null;

  if (claimAtMs !== null) {
    return remainingSecondsFromDeadline(claimAtMs) > 0 ? claimAtMs : null;
  }

  return typeof secondsUntilNextClaim === "number" && secondsUntilNextClaim > 0
    ? Date.now() + Math.max(0, secondsUntilNextClaim) * 1000
    : null;
}

export function formatDailyClaimCountdown(totalSeconds: number) {
  const normalizedSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(normalizedSeconds / 3600);
  const minutes = Math.floor((normalizedSeconds % 3600) / 60);
  const seconds = normalizedSeconds % 60;

  return `${hours}h:${minutes}m:${seconds}s`;
}

export function useDailyClaimCountdown(
  status: DailyClaimStatus | undefined,
  onExpire?: () => void,
) {
  const [, setRemainingSeconds] = React.useState(0);
  const available = status?.available;
  const enabled = status?.enabled;
  const invalidConfig = status?.invalidConfig;
  const nextClaimAt = status?.nextClaimAt;
  const secondsUntilNextClaim = status?.secondsUntilNextClaim;
  const deadlineMs = React.useMemo(
    () =>
      deadlineFromValues({
        available,
        enabled,
        invalidConfig,
        nextClaimAt,
        secondsUntilNextClaim,
      }),
    [
      available,
      enabled,
      invalidConfig,
      nextClaimAt,
      secondsUntilNextClaim,
    ],
  );

  React.useEffect(() => {
    if (deadlineMs === null) {
      return;
    }

    const activeDeadlineMs = deadlineMs;
    let expired = false;

    function updateRemainingSeconds() {
      const nextRemainingSeconds = remainingSecondsFromDeadline(activeDeadlineMs);
      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds <= 0 && !expired) {
        expired = true;
        onExpire?.();
      }
    }

    const timeoutId = window.setTimeout(updateRemainingSeconds, 0);
    const intervalId = window.setInterval(updateRemainingSeconds, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [deadlineMs, onExpire]);

  return deadlineMs === null ? 0 : remainingSecondsFromDeadline(deadlineMs);
}
