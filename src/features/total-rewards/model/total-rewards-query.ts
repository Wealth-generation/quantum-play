"use client";

import { useQuery } from "@tanstack/react-query";
import { getTotalRewards } from "../api/total-rewards-client";

export const totalRewardsQueryKey = ["total-rewards"] as const;

export function useTotalRewardsQuery() {
  return useQuery({
    queryFn: getTotalRewards,
    queryKey: totalRewardsQueryKey,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
