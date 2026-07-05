import type {
  ChangeClientSeedRequest,
  FairnessSeed,
} from "../types/fairness-types";

interface FairnessErrorResponse {
  error?: unknown;
}

function isFairnessSeed(value: unknown): value is FairnessSeed {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<FairnessSeed>;

  return (
    typeof candidate.clientSeed === "string" &&
    typeof candidate.hashedServerSeed === "string" &&
    typeof candidate.nextHashedServerSeed === "string" &&
    typeof candidate.nonce === "number" &&
    Number.isFinite(candidate.nonce)
  );
}

async function safeErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as FairnessErrorResponse;
    return typeof payload.error === "string" ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

async function readFairnessSeed(
  response: Response,
  fallback: string,
): Promise<FairnessSeed> {
  if (!response.ok) {
    throw new Error(await safeErrorMessage(response, fallback));
  }

  const payload = (await response.json()) as unknown;

  if (!isFairnessSeed(payload)) {
    throw new Error("Fairness seed response is invalid.");
  }

  return payload;
}

export async function getFairnessSeed(): Promise<FairnessSeed> {
  const response = await fetch("/api/fairness/seed", {
    method: "GET",
  });

  return readFairnessSeed(
    response,
    "Fairness seed is unavailable. Please try again later.",
  );
}

export async function changeClientSeed(
  request: ChangeClientSeedRequest,
): Promise<FairnessSeed> {
  const response = await fetch("/api/fairness/seed", {
    body: JSON.stringify({ clientSeed: request.clientSeed }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

  return readFairnessSeed(
    response,
    "Client seed could not be changed. Please try again later.",
  );
}
