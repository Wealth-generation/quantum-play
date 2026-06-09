import type { LiveBetDto } from "@/entities/bet/model";

interface LiveBetsErrorResponse {
  error?: unknown;
}

export type BetLiveTab = "all" | "high-rollers" | "lucky" | "your";

export interface BetLiveTabOption {
  value: BetLiveTab;
  label: string;
  endpoint: string | null;
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

export function liveBetsQueryKey(tab: BetLiveTab) {
  return ["live-bets", tab] as const;
}

export async function getLiveBets(endpoint: string): Promise<LiveBetDto[]> {
  const response = await fetch(endpoint, {
    method: "GET",
  });

  if (!response.ok) {
    let message = "Live bets are unavailable. Please try again later.";

    try {
      const payload = (await response.json()) as LiveBetsErrorResponse;
      if (typeof payload.error === "string") {
        message = payload.error;
      }
    } catch {
      message = "Live bets are unavailable. Please try again later.";
    }

    throw new Error(message);
  }

  return response.json() as Promise<LiveBetDto[]>;
}
