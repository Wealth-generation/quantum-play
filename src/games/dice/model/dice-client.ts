import type {
  DiceBetRequest,
  DiceBetResult,
  DiceConfig,
} from "./dice-types";

interface DiceErrorResponse {
  error?: unknown;
}

async function safeErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as DiceErrorResponse;

    return typeof payload.error === "string" ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

export async function getDiceConfig(): Promise<DiceConfig> {
  const response = await fetch("/api/games/dice/config", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await safeErrorMessage(
        response,
        "Dice configuration is unavailable. Please try again later.",
      ),
    );
  }

  return response.json() as Promise<DiceConfig>;
}

export async function placeDiceBet(
  request: DiceBetRequest,
): Promise<DiceBetResult> {
  const response = await fetch("/api/games/dice/bet", {
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
        "Dice bet failed. Please try again later.",
      ),
    );
  }

  return response.json() as Promise<DiceBetResult>;
}
