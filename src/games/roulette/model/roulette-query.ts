"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { balanceQueryKey } from "@/features/balance";
import { placeRouletteBet } from "./roulette-client";

export function useRouletteBetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeRouletteBet,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: balanceQueryKey });
    },
  });
}
