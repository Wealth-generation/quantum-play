import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader } from "../../_lib/auth-cookies";

interface BackendUserBalance {
  value: string;
  balanceType: "GAME_POINTS" | "WATCH_POINTS";
}

interface BackendUser {
  userBalances?: unknown;
}

interface BalanceResponse {
  gamePoints: string;
  watchPoints: string;
}

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Balance is unavailable. Please try again later." },
    { status: 503 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Balance response was invalid." },
    { status: 502 },
  );
}

function isBackendUserBalance(value: unknown): value is BackendUserBalance {
  if (!value || typeof value !== "object") {
    return false;
  }

  const balance = value as BackendUserBalance;

  return (
    typeof balance.value === "string" &&
    (balance.balanceType === "GAME_POINTS" ||
      balance.balanceType === "WATCH_POINTS")
  );
}

function toBalanceResponse(value: BackendUser): BalanceResponse | null {
  if (!Array.isArray(value.userBalances)) {
    return null;
  }

  let gamePoints: string | null = null;
  let watchPoints: string | null = null;

  for (const balance of value.userBalances) {
    if (!isBackendUserBalance(balance)) {
      continue;
    }

    if (balance.balanceType === "GAME_POINTS") {
      gamePoints = balance.value;
    }

    if (balance.balanceType === "WATCH_POINTS") {
      watchPoints = balance.value;
    }
  }

  if (gamePoints === null || watchPoints === null) {
    return null;
  }

  return {
    gamePoints,
    watchPoints,
  };
}

export async function GET() {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/user/query/me", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch {
    return serviceUnavailable();
  }

  if (!backendResponse.ok) {
    return backendResponse.status === 401
      ? authRequired()
      : serviceUnavailable();
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return invalidBackendResponse();
  }

  const balance = toBalanceResponse(payload as BackendUser);

  if (!balance) {
    return invalidBackendResponse();
  }

  return NextResponse.json(balance);
}
