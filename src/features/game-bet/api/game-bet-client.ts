import { refreshAuthSingleFlight } from "@/features/auth/api/auth-refresh-manager";

interface GameBetErrorResponse {
  error?: unknown;
}

interface PostLocalGameBetOptions {
  invalidResponseMessage: string;
  requestFailedMessage: string;
}

export class GameBetRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GameBetRequestError";
  }
}

const LOCAL_GAME_BET_ROUTE_PATTERN = /^\/api\/games\/[^/]+\/bet$/;

function assertLocalGameBetRoute(url: string) {
  if (!LOCAL_GAME_BET_ROUTE_PATTERN.test(url)) {
    throw new Error("Game bet retry is limited to local /api/games/*/bet routes.");
  }
}

async function safeErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as GameBetErrorResponse;

    return typeof payload.error === "string" ? payload.error : fallback;
  } catch {
    return fallback;
  }
}

async function parseGameBetResponse<Result>(
  response: Response,
  invalidResponseMessage: string,
): Promise<Result> {
  try {
    return (await response.json()) as Result;
  } catch {
    throw new GameBetRequestError(invalidResponseMessage, response.status);
  }
}

function postLocalGameBet(url: string, body: string) {
  return fetch(url, {
    body,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

function redirectToMainPage() {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign("/");
}

export async function postLocalGameBetWithAuthRetry<Result>(
  url: string,
  payload: unknown,
  {
    invalidResponseMessage,
    requestFailedMessage,
  }: PostLocalGameBetOptions,
): Promise<Result> {
  assertLocalGameBetRoute(url);

  const body = JSON.stringify(payload);
  const firstResponse = await postLocalGameBet(url, body);

  if (firstResponse.status === 401) {
    const refreshResult = await refreshAuthSingleFlight();

    if (refreshResult.success) {
      const retryResponse = await postLocalGameBet(url, body);

      if (!retryResponse.ok) {
        throw new GameBetRequestError(
          await safeErrorMessage(retryResponse, requestFailedMessage),
          retryResponse.status,
        );
      }

      return parseGameBetResponse<Result>(
        retryResponse,
        invalidResponseMessage,
      );
    }

    if (refreshResult.reason === "auth-failed") {
      redirectToMainPage();
    }
  }

  if (!firstResponse.ok) {
    throw new GameBetRequestError(
      await safeErrorMessage(firstResponse, requestFailedMessage),
      firstResponse.status,
    );
  }

  return parseGameBetResponse<Result>(firstResponse, invalidResponseMessage);
}
