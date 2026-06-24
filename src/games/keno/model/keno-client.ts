import type { KenoBetRequest, KenoBetResult } from "./keno-types";

interface KenoErrorResponse {
  error?: unknown;
}

async function safeErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as KenoErrorResponse;

    return typeof payload.error === "string" ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

export async function placeKenoBet(
  request: KenoBetRequest,
): Promise<KenoBetResult> {
  const response = await fetch("/api/games/keno/bet", {
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await safeErrorMessage(
        response,
        "Keno bet failed. Please try again later.",
      ),
    );
  }

  return response.json() as Promise<KenoBetResult>;
}
