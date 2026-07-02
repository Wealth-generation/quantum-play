import type { TotalRewards } from "../types/total-rewards-types";

interface TotalRewardsErrorResponse {
  error?: unknown;
}

export async function getTotalRewards(): Promise<TotalRewards> {
  const response = await fetch("/api/total-rewards", {
    method: "GET",
  });

  if (!response.ok) {
    let message = "Total rewards are unavailable. Please try again later.";

    try {
      const payload = (await response.json()) as TotalRewardsErrorResponse;
      if (typeof payload.error === "string") {
        message = payload.error;
      }
    } catch {
      message = "Total rewards are unavailable. Please try again later.";
    }

    throw new Error(message);
  }

  return response.json() as Promise<TotalRewards>;
}
