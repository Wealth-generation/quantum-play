"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getUserProfile,
  getUserProfileBets,
  getUserProfileSeedHistory,
  getUserProfileStats,
} from "../api/user-profile-client";
import type {
  UserProfileBetsParams,
  UserProfileSeedHistoryParams,
} from "../types/user-profile-types";

export const userProfileQueryKey = ["user-profile", "profile"] as const;
export const userProfileStatsQueryKey = ["user-profile", "stats"] as const;

export function userProfileBetsQueryKey(params: UserProfileBetsParams) {
  return [
    "user-profile",
    "bets",
    params.page,
    params.take,
    params.gameSlug ?? "all",
  ] as const;
}

export function userProfileSeedHistoryQueryKey(
  params: UserProfileSeedHistoryParams,
) {
  return ["user-profile", "seed-history", params.page, params.take] as const;
}

export function useUserProfileQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: getUserProfile,
    queryKey: userProfileQueryKey,
    staleTime: 30_000,
  });
}

export function useUserProfileStatsQuery(enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: getUserProfileStats,
    queryKey: userProfileStatsQueryKey,
    staleTime: 30_000,
  });
}

export function useUserProfileBetsQuery(
  params: UserProfileBetsParams,
  enabled: boolean,
) {
  return useQuery({
    enabled,
    queryFn: () => getUserProfileBets(params),
    queryKey: userProfileBetsQueryKey(params),
    staleTime: 30_000,
  });
}

export function useUserProfileSeedHistoryQuery(
  params: UserProfileSeedHistoryParams,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getUserProfileSeedHistory(params),
    queryKey: userProfileSeedHistoryQueryKey(params),
    staleTime: 30_000,
  });
}
