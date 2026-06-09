"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { balanceQueryKey } from "@/features/balance";
import { getDiceConfig, placeDiceBet } from "./dice-client";

export const diceConfigQueryKey = ["games", "dice", "config"] as const;

export function useDiceConfigQuery() {
  return useQuery({
    queryFn: getDiceConfig,
    queryKey: diceConfigQueryKey,
    staleTime: 5 * 60 * 1000,
  });
}

export function useManualDiceBetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeDiceBet,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: balanceQueryKey });
    },
  });
}
