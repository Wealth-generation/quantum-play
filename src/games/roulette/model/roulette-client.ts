import type { RouletteBetRequest, RouletteBetResult } from "./roulette-types";

interface RouletteErrorResponse {
  error?: unknown;
}

async function safeErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as RouletteErrorResponse;

    return typeof payload.error === "string" ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

export async function placeRouletteBet(
  request: RouletteBetRequest,
): Promise<RouletteBetResult> {
  const response = await fetch("/api/games/roulette/bet", {
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
        "Roulette bet failed. Please try again later.",
      ),
    );
  }

  return response.json() as Promise<RouletteBetResult>;
}
