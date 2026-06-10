import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader } from "../../_lib/auth-cookies";

interface FairnessSeedRequestBody {
  clientSeed?: unknown;
}

interface FairnessSeedResponse {
  clientSeed: string;
  hashedServerSeed: string;
  nextHashedServerSeed: string;
  nonce: number;
}

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function badRequest() {
  return NextResponse.json(
    { error: "Fairness seed request was invalid." },
    { status: 400 },
  );
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Fairness seed is unavailable. Please try again later." },
    { status: 503 },
  );
}

function backendSeedError(status: number) {
  return NextResponse.json(
    { error: "Fairness seed request failed. Please try again." },
    { status: status || 400 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Fairness seed response was invalid." },
    { status: 502 },
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isFairnessSeedResponse(value: unknown): value is FairnessSeedResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const seed = value as Record<string, unknown>;

  return (
    typeof seed.clientSeed === "string" &&
    typeof seed.hashedServerSeed === "string" &&
    typeof seed.nextHashedServerSeed === "string" &&
    isFiniteNumber(seed.nonce)
  );
}

async function seedResponse(
  path: string,
  init: RequestInit,
): Promise<NextResponse> {
  let backendResponse: Response;

  try {
    backendResponse = await backendFetch(path, init);
  } catch {
    return serviceUnavailable();
  }

  if (!backendResponse.ok) {
    return backendSeedError(backendResponse.status);
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return invalidBackendResponse();
  }

  if (!isFairnessSeedResponse(payload)) {
    return invalidBackendResponse();
  }

  return NextResponse.json(payload);
}

export async function GET() {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  return seedResponse("/fairness/seed", {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });
}

export async function PUT(request: Request) {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let body: FairnessSeedRequestBody;

  try {
    body = (await request.json()) as FairnessSeedRequestBody;
  } catch {
    return badRequest();
  }

  if (
    typeof body.clientSeed !== "string" ||
    body.clientSeed.trim().length === 0
  ) {
    return badRequest();
  }

  return seedResponse("/fairness/seed", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      clientSeed: body.clientSeed.trim(),
    }),
    cache: "no-store",
  });
}
