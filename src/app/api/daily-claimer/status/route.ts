import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader } from "../../_lib/auth-cookies";

interface DailyClaimStatusResponse {
  available: boolean;
  enabled: boolean;
  pointsAmount: number;
  invalidConfig: boolean;
  nextClaimAt: string | null;
  secondsUntilNextClaim: number;
}

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Daily Claim is unavailable. Please try again later." },
    { status: 503 },
  );
}

function backendStatusError(status: number) {
  if (status === 401 || status === 403) {
    return authRequired();
  }

  if (status === 429) {
    return NextResponse.json(
      { error: "Daily Claim is temporarily rate limited. Please try again soon." },
      { status: 429 },
    );
  }

  return NextResponse.json(
    { error: "Daily Claim status is unavailable. Please try again later." },
    { status: status >= 400 && status < 600 ? status : 400 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Daily Claim status response was invalid." },
    { status: 502 },
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidDateString(value: string) {
  return Number.isFinite(Date.parse(value));
}

function normalizeDailyClaimStatus(
  value: unknown,
): DailyClaimStatusResponse | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (
    typeof value.available !== "boolean" ||
    typeof value.enabled !== "boolean" ||
    !isFiniteNumber(value.pointsAmount) ||
    typeof value.invalidConfig !== "boolean"
  ) {
    return null;
  }

  const nextClaimAt = value.nextClaimAt;
  let normalizedNextClaimAt: string | null = null;

  if (nextClaimAt !== undefined && nextClaimAt !== null) {
    if (typeof nextClaimAt !== "string" || !isValidDateString(nextClaimAt)) {
      return null;
    }

    normalizedNextClaimAt = nextClaimAt;
  }

  const secondsUntilNextClaim = value.secondsUntilNextClaim;
  let normalizedSecondsUntilNextClaim = 0;

  if (secondsUntilNextClaim !== undefined && secondsUntilNextClaim !== null) {
    if (!isFiniteNumber(secondsUntilNextClaim)) {
      return null;
    }

    normalizedSecondsUntilNextClaim = Math.max(0, secondsUntilNextClaim);
  }

  return {
    available: value.available,
    enabled: value.enabled,
    pointsAmount: value.pointsAmount,
    invalidConfig: value.invalidConfig,
    nextClaimAt: normalizedNextClaimAt,
    secondsUntilNextClaim: normalizedSecondsUntilNextClaim,
  };
}

export async function GET() {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/daily-claimer/status", {
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
    return backendStatusError(backendResponse.status);
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return invalidBackendResponse();
  }

  const status = normalizeDailyClaimStatus(payload);

  if (!status) {
    return invalidBackendResponse();
  }

  return NextResponse.json(status);
}
