import { NextResponse } from "next/server";
import { backendFetch } from "../_lib/auth-backend";

interface TotalRewardsPayload {
  totalMoneyGiven: string;
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Total rewards are unavailable. Please try again later." },
    { status: 503 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Total rewards response was invalid." },
    { status: 502 },
  );
}

function isTotalRewardsPayload(value: unknown): value is TotalRewardsPayload {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.totalMoneyGiven === "string" &&
    candidate.totalMoneyGiven.length > 0 &&
    Number.isFinite(parseFloat(candidate.totalMoneyGiven))
  );
}

// Public endpoint — no session cookie required or forwarded.
export async function GET() {
  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/stats/total-money-given", {
      method: "GET",
    });
  } catch {
    return serviceUnavailable();
  }

  // Safety check: backend must not require auth for this public endpoint.
  if (backendResponse.status === 401 || backendResponse.status === 403) {
    return NextResponse.json(
      {
        error:
          "Total rewards endpoint returned an unexpected auth error. Cookie forwarding is not implemented — report this to the backend team.",
      },
      { status: 502 },
    );
  }

  if (!backendResponse.ok) {
    return serviceUnavailable();
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return invalidBackendResponse();
  }

  if (!isTotalRewardsPayload(payload)) {
    return invalidBackendResponse();
  }

  return NextResponse.json({ totalMoneyGiven: payload.totalMoneyGiven });
}
