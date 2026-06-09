"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  changeClientSeed,
  getFairnessSeed,
} from "../api/fairness-client";

export const fairnessSeedQueryKey = ["fairness", "seed"] as const;

export function fairnessSeedQueryOptions(enabled = true) {
  return {
    enabled,
    queryFn: getFairnessSeed,
    queryKey: fairnessSeedQueryKey,
    staleTime: 30_000,
  };
}

export function useFairnessSeedQuery(enabled = true) {
  return useQuery(fairnessSeedQueryOptions(enabled));
}

export function useChangeClientSeedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeClientSeed,
    onSuccess: (seed) => {
      queryClient.setQueryData(fairnessSeedQueryKey, seed);
    },
  });
}
