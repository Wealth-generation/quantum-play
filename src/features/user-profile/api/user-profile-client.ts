import { refreshAuthSingleFlight } from "@/features/auth/api/auth-refresh-manager";
import type {
  UserProfileBetsParams,
  UserProfileBetsResponse,
  UserProfileData,
  UserProfileStats,
} from "../types/user-profile-types";

interface UserProfileErrorResponse {
  error?: unknown;
}

function getLocalJson(url: string) {
  return fetch(url, {
    method: "GET",
  });
}

async function safeErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as UserProfileErrorResponse;
    if (typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

async function requestJson<T>(
  url: string,
  fallbackMessage: string,
): Promise<T> {
  const response = await getLocalJson(url);

  if (response.status === 401) {
    const refreshResult = await refreshAuthSingleFlight();

    if (refreshResult.success) {
      const retryResponse = await getLocalJson(url);

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

export function getUserProfile(): Promise<UserProfileData> {
  return requestJson<UserProfileData>(
    "/api/user/profile",
    "Profile is unavailable. Please try again later.",
  );
}

export function getUserProfileStats(): Promise<UserProfileStats> {
  return requestJson<UserProfileStats>(
    "/api/user/profile/stats",
    "Profile statistics are unavailable. Please try again later.",
  );
}

export function getUserProfileBets(
  params: UserProfileBetsParams,
): Promise<UserProfileBetsResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    take: String(params.take),
  });

  if (params.gameSlug) {
    searchParams.set("gameSlug", params.gameSlug);
  }

  return requestJson<UserProfileBetsResponse>(
    `/api/user/bets?${searchParams.toString()}`,
    "Bet history is unavailable. Please try again later.",
  );
}
