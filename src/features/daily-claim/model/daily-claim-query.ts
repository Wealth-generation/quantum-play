"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { balanceQueryKey } from "@/features/balance";
import { claimDailyReward, getDailyClaimStatus } from "../api/daily-claim-client";

export const dailyClaimStatusQueryKey = ["daily-claim", "status"] as const;

export function useDailyClaimStatusQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: getDailyClaimStatus,
    queryKey: dailyClaimStatusQueryKey,
    staleTime: 15_000,
  });
}

export function useDailyClaimMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimDailyReward,
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: balanceQueryKey }),
        queryClient.refetchQueries({ queryKey: dailyClaimStatusQueryKey }),
      ]);
    },
  });
}
