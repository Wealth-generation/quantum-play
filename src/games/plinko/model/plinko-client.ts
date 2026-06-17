import { postLocalGameBetWithAuthRetry } from "@/features/game-bet";
import type { PlinkoBetRequest, PlinkoBetResult, PlinkoConfig } from "./plinko-types";

interface PlinkoErrorResponse {
  error?: unknown;
}

function isPlinkoConfig(value: unknown): value is PlinkoConfig {
  if (!value || typeof value !== "object") {
    return false;
  }

  const config = value as Partial<PlinkoConfig>;

  return (
    typeof config.minBet === "number" &&
    Number.isFinite(config.minBet) &&
    typeof config.maxBet === "number" &&
    Number.isFinite(config.maxBet) &&
    Array.isArray(config.rows) &&
    Array.isArray(config.risks) &&
    Boolean(config.multipliers)
  );
}

async function safeErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as PlinkoErrorResponse;

    return typeof payload.error === "string" ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

export async function getPlinkoConfig(): Promise<PlinkoConfig> {
  const response = await fetch("/api/games/plinko/config", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await safeErrorMessage(
        response,
        "Plinko configuration is unavailable. Please try again later.",
      ),
    );
  }

  const payload = (await response.json()) as unknown;

  if (!isPlinkoConfig(payload)) {
    throw new Error("Plinko configuration response is invalid.");
  }

  return payload;
}

export async function placePlinkoBet(
  request: PlinkoBetRequest,
): Promise<PlinkoBetResult> {
  return postLocalGameBetWithAuthRetry<PlinkoBetResult>(
    "/api/games/plinko/bet",
    request,
    {
      invalidResponseMessage: "Plinko bet response was invalid.",
      requestFailedMessage: "Plinko bet failed. Please try again later.",
    },
  );
}
