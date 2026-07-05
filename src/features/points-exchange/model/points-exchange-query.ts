"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { balanceQueryKey, type Balance } from "@/features/balance";
import { exchangeWatchPointsForGamePoints } from "../api/points-exchange-client";
import type { PointsExchangeResult } from "../types/points-exchange-types";

export function usePointsExchangeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exchangeWatchPointsForGamePoints,
    onSuccess: (result: PointsExchangeResult) => {
      queryClient.setQueryData<Balance>(balanceQueryKey, {
        gamePoints: result.gamePoints,
        watchPoints: result.watchPoints,
      });
    },
  });
}
