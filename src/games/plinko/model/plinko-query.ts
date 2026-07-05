"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlinkoConfig } from "./plinko-client";

export const plinkoConfigQueryKey = ["games", "plinko", "config"] as const;

export function usePlinkoConfigQuery() {
  return useQuery({
    queryFn: getPlinkoConfig,
    queryKey: plinkoConfigQueryKey,
    staleTime: 5 * 60 * 1000,
  });
}
