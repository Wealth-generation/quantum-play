import { AuthRequestError, refreshAuth } from "./auth-client";

export type AuthRefreshResult =
  | { success: true }
  | {
      reason: "auth-failed" | "unavailable" | "unknown";
      status?: number;
      success: false;
    };

let inFlightRefresh: Promise<AuthRefreshResult> | null = null;

async function performRefresh(): Promise<AuthRefreshResult> {
  try {
    await refreshAuth();

    return { success: true };
  } catch (error) {
    if (error instanceof AuthRequestError) {
      if (error.status === 401) {
        return {
          reason: "auth-failed",
          status: error.status,
          success: false,
        };
      }

      if (error.status >= 500) {
        return {
          reason: "unavailable",
          status: error.status,
          success: false,
        };
      }

      return {
        reason: "unknown",
        status: error.status,
        success: false,
      };
    }

    return {
      reason: "unknown",
      success: false,
    };
  }
}

export function refreshAuthSingleFlight(): Promise<AuthRefreshResult> {
  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }

  return inFlightRefresh;
}
