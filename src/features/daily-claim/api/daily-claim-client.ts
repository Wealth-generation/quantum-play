import { refreshAuthSingleFlight } from "@/features/auth/api/auth-refresh-manager";
import type { DailyClaimResult, DailyClaimStatus } from "../types/daily-claim-types";

interface DailyClaimErrorResponse {
  error?: unknown;
}

function requestLocalJson(url: string, init: RequestInit) {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...init,
    headers,
  });
}

async function safeErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const payload = (await response.json()) as DailyClaimErrorResponse;
    if (typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

async function requestLocalJsonWithAuthRetry<T>(
  url: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const response = await requestLocalJson(url, init);

  if (response.status === 401) {
    const refreshResult = await refreshAuthSingleFlight();

    if (refreshResult.success) {
      const retryResponse = await requestLocalJson(url, init);

      if (!retryResponse.ok) {
        throw new Error(await safeErrorMessage(retryResponse, fallbackMessage));
      }

      return retryResponse.json() as Promise<T>;
    }
  }

  if (!response.ok) {
    throw new Error(await safeErrorMessage(response, fallbackMessage));
  }

  return response.json() as Promise<T>;
}

export function getDailyClaimStatus(): Promise<DailyClaimStatus> {
  return requestLocalJsonWithAuthRetry<DailyClaimStatus>(
    "/api/daily-claimer/status",
    {
      method: "GET",
    },
    "Daily Claim is unavailable. Please try again later.",
  );
}

export function claimDailyReward(): Promise<DailyClaimResult> {
  return requestLocalJsonWithAuthRetry<DailyClaimResult>(
    "/api/daily-claimer/claim",
    {
      method: "POST",
    },
    "Daily Claim failed. Please try again later.",
  );
}
