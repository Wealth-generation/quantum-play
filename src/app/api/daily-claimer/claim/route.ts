import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader } from "../../_lib/auth-cookies";

interface DailyClaimResponse {
  pointsAmount: number;
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

function backendClaimError(status: number) {
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
    { error: "Daily Claim failed. Please try again." },
    { status: status >= 400 && status < 600 ? status : 400 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Daily Claim response was invalid." },
    { status: 502 },
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeDailyClaimResponse(
  value: unknown,
): DailyClaimResponse | null {
  if (!isObjectRecord(value) || !isFiniteNumber(value.pointsAmount)) {
    return null;
  }

  return {
    pointsAmount: value.pointsAmount,
  };
}

export async function POST() {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/daily-claimer/claim", {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch {
    return serviceUnavailable();
  }

  if (!backendResponse.ok) {
    return backendClaimError(backendResponse.status);
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return invalidBackendResponse();
  }

  const claim = normalizeDailyClaimResponse(payload);

  if (!claim) {
    return invalidBackendResponse();
  }

  return NextResponse.json(claim, { status: 201 });
}
