"use client";

import { useQuery } from "@tanstack/react-query";
import { getBalance } from "../api/balance-client";

export const balanceQueryKey = ["balance"] as const;

export function useBalanceQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: getBalance,
    queryKey: balanceQueryKey,
    staleTime: 30_000,
  });
}
