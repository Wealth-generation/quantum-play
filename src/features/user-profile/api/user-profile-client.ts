import type {
  UserProfileBetsParams,
  UserProfileBetsResponse,
  UserProfileData,
  UserProfileStats,
} from "../types/user-profile-types";

interface UserProfileErrorResponse {
  error?: unknown;
}

async function requestJson<T>(
  url: string,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    let message = fallbackMessage;

    try {
      const payload = (await response.json()) as UserProfileErrorResponse;
      if (typeof payload.error === "string") {
        message = payload.error;
      }
    } catch {
      message = fallbackMessage;
    }

    throw new Error(message);
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
