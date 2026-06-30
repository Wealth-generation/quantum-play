import type { LiveBetDto } from "@/entities/bet/model";
import type { GameSlug } from "@/entities/game/model";
import { refreshAuthSingleFlight } from "@/features/auth/api/auth-refresh-manager";

interface LiveBetsErrorResponse {
  error?: unknown;
}

export type BetLiveBackendGameSlug =
  | "thedoctor_dice"
  | "thedoctor_keno"
  | "thedoctor_plinko"
  | "thedoctor_roulette";

export type BetLiveTab = "all" | "high-rollers" | "lucky" | "your";

export interface BetLiveTabOption {
  value: BetLiveTab;
  label: string;
  endpoint: string | null;
}

export interface YourBetDto {
  id: string;
  betSize: string;
  payout: string;
  settledAt: string;
  gameName: string;
  providerName: string;
}

export interface YourBetsResponse {
  take: number;
  page: number;
  total: number;
  totalPages: number;
  data: YourBetDto[];
}

export interface YourBetsParams {
  page: number;
  take: number;
  gameSlug?: BetLiveBackendGameSlug;
}

export const betLiveTabs: BetLiveTabOption[] = [
  { value: "all", label: "All bets", endpoint: "/api/bets/latest" },
  {
    value: "high-rollers",
    label: "High rollers",
    endpoint: "/api/bets/latest/high-rollers",
  },
  { value: "lucky", label: "Lucky bets", endpoint: "/api/bets/latest/lucky" },
  { value: "your", label: "Your bets", endpoint: null },
];

export const liveBetsStaleTimeMs = 5 * 60 * 1000;
export const yourBetsPage = 1;
export const yourBetsTake = 10;

const backendGameSlugByGameSlug: Record<GameSlug, BetLiveBackendGameSlug> = {
  dice: "thedoctor_dice",
  keno: "thedoctor_keno",
  plinko: "thedoctor_plinko",
  roulette: "thedoctor_roulette",
};

export function liveBetsQueryKey(tab: BetLiveTab) {
  return ["live-bets", tab] as const;
}

export function yourBetsQueryKey({
  gameSlug,
  page,
  sessionUserId,
  take,
}: {
  gameSlug?: BetLiveBackendGameSlug;
  page: number;
  sessionUserId: string;
  take: number;
}) {
  return [
    "live-bets",
    "your",
    sessionUserId,
    gameSlug ?? "all",
    page,
    take,
  ] as const;
}

export function backendGameSlugForBetLive(
  gameSlug?: GameSlug,
): BetLiveBackendGameSlug | undefined {
  return gameSlug ? backendGameSlugByGameSlug[gameSlug] : undefined;
}

async function safeErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as LiveBetsErrorResponse;
    if (typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export async function getLiveBets(endpoint: string): Promise<LiveBetDto[]> {
  const response = await fetch(endpoint, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await safeErrorMessage(
        response,
        "Live bets are unavailable. Please try again later.",
      ),
    );
  }

  return response.json() as Promise<LiveBetDto[]>;
}

async function requestLocalJsonWithAuthRetry<T>(
  url: string,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
  });

  if (response.status === 401) {
    const refreshResult = await refreshAuthSingleFlight();

    if (refreshResult.success) {
      const retryResponse = await fetch(url, {
        method: "GET",
      });

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

export function getYourBets(
  params: YourBetsParams,
): Promise<YourBetsResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    take: String(params.take),
  });

  if (params.gameSlug) {
    searchParams.set("gameSlug", params.gameSlug);
  }

  return requestLocalJsonWithAuthRetry<YourBetsResponse>(
    `/api/user/bets?${searchParams.toString()}`,
    "Bet history is unavailable. Please try again later.",
  );
}
