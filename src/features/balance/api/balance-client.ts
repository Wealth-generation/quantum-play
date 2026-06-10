import type { Balance } from "../types/balance-types";

interface BalanceErrorResponse {
  error?: unknown;
}

export async function getBalance(): Promise<Balance> {
  const response = await fetch("/api/user/balance", {
    method: "GET",
  });

  if (!response.ok) {
    let message = "Balance is unavailable. Please try again later.";

    try {
      const payload = (await response.json()) as BalanceErrorResponse;
      if (typeof payload.error === "string") {
        message = payload.error;
      }
    } catch {
      message = "Balance is unavailable. Please try again later.";
    }

    throw new Error(message);
  }

  return response.json() as Promise<Balance>;
}
