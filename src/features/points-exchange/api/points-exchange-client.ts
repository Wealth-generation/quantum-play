import { refreshAuthSingleFlight } from "@/features/auth/api/auth-refresh-manager";
import type {
  PointsExchangeRequest,
  PointsExchangeResult,
} from "../types/points-exchange-types";

interface PointsExchangeErrorResponse {
  error?: unknown;
}

const EXCHANGE_FAILED_MESSAGE = "Exchange failed. Please try again.";
const SESSION_EXPIRED_MESSAGE = "Your session expired. Please log in again.";

function requestLocalJson(url: string, init: RequestInit) {
  const headers = new Headers(init.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...init,
    headers,
  });
}

async function safeErrorMessage(response: Response, fallbackMessage: string) {
  if (response.status === 401) {
    return SESSION_EXPIRED_MESSAGE;
  }

  try {
    const payload = (await response.json()) as PointsExchangeErrorResponse;
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
): Promise<T> {
  const response = await requestLocalJson(url, init);

  if (response.status === 401) {
    const refreshResult = await refreshAuthSingleFlight();

    if (refreshResult.success) {
      const retryResponse = await requestLocalJson(url, init);

      if (!retryResponse.ok) {
        throw new Error(
          await safeErrorMessage(retryResponse, EXCHANGE_FAILED_MESSAGE),
        );
      }

      return retryResponse.json() as Promise<T>;
    }

    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(await safeErrorMessage(response, EXCHANGE_FAILED_MESSAGE));
  }

  return response.json() as Promise<T>;
}

export function exchangeWatchPointsForGamePoints(
  request: PointsExchangeRequest,
): Promise<PointsExchangeResult> {
  return requestLocalJsonWithAuthRetry<PointsExchangeResult>(
    "/api/balance/watch-to-game",
    {
      body: JSON.stringify({ amount: request.amount }),
      method: "POST",
    },
  );
}
