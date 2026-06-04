"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getAuthSession, logout } from "../api/auth-client";
import type { AuthSession } from "../types/auth-types";

export const authSessionQueryKey = ["auth", "session"] as const;

const unauthenticatedSession: AuthSession = {
  authenticated: false,
  user: null,
};

export function useAuthSession() {
  return useQuery({
    queryKey: authSessionQueryKey,
    queryFn: getAuthSession,
    staleTime: 30_000,
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authSessionQueryKey, unauthenticatedSession);
    },
  });
}
