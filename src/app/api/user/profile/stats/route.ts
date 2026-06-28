import { NextResponse } from "next/server";
import { backendFetch } from "../../../_lib/auth-backend";
import { backendCookieHeader } from "../../../_lib/auth-cookies";

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Profile statistics are unavailable. Please try again later." },
    { status: 503 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Profile statistics response was invalid." },
    { status: 502 },
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNumericStringOrNumber(value: unknown): value is string | number {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 && Number.isFinite(Number(trimmed));
}

function normalizeStats(value: unknown) {
  if (
    !isObjectRecord(value) ||
    !isNumericStringOrNumber(value.watchPointSpent) ||
    !isNumericStringOrNumber(value.bets) ||
    !isNumericStringOrNumber(value.currentLeaderboardPosition)
  ) {
    return null;
  }

  return {
    bets: String(value.bets),
    currentLeaderboardPosition: String(value.currentLeaderboardPosition),
    watchPointSpent: String(value.watchPointSpent),
  };
}

export async function GET() {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/user/query/me/stats", {
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

  const stats = normalizeStats(payload);

  if (!stats) {
    return invalidBackendResponse();
  }

  return NextResponse.json(stats);
}
