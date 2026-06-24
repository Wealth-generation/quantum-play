"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { balanceQueryKey } from "@/features/balance";
import { placeKenoBet } from "./keno-client";

export function useKenoBetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeKenoBet,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: balanceQueryKey });
    },
  });
}
