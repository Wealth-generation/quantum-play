import { type NextRequest, NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader } from "../../_lib/auth-cookies";

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function badRequest() {
  return NextResponse.json(
    { error: "Fairness history request was invalid." },
    { status: 400 },
  );
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Fairness history is unavailable. Please try again later." },
    { status: 503 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Fairness history response was invalid." },
    { status: 502 },
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonce(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function readPositiveInteger(
  searchParams: URLSearchParams,
  key: string,
  fallback: number,
): number | null {
  const value = searchParams.get(key);

  if (value === null) {
    return fallback;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeHistoryRow(value: unknown) {
  if (
    !isObjectRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.serverSeed !== "string" ||
    typeof value.hashedServerSeed !== "string" ||
    typeof value.clientSeed !== "string" ||
    !isNonce(value.nonce) ||
    typeof value.userId !== "string"
  ) {
    return null;
  }

  return {
    clientSeed: value.clientSeed,
    createdAt: value.createdAt,
    nonce: value.nonce,
    serverSeed: value.serverSeed,
  };
}

function normalizeHistoryResponse(value: unknown) {
  if (
    !isObjectRecord(value) ||
    !isFiniteNumber(value.take) ||
    !isFiniteNumber(value.page) ||
    !isFiniteNumber(value.total) ||
    !isFiniteNumber(value.totalPages) ||
    !Array.isArray(value.data)
  ) {
    return null;
  }

  const data = value.data.map(normalizeHistoryRow);

  if (data.some((row) => row === null)) {
    return null;
  }

  return {
    data,
    page: value.page,
    take: value.take,
    total: value.total,
    totalPages: value.totalPages,
  };
}

export async function GET(request: NextRequest) {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  const page = readPositiveInteger(request.nextUrl.searchParams, "page", 1);
  const take = readPositiveInteger(request.nextUrl.searchParams, "take", 10);

  if (!page || !take || take > 50) {
    return badRequest();
  }

  const backendParams = new URLSearchParams({
    page: String(page),
    take: String(take),
  });

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch(
      `/fairness/history?${backendParams.toString()}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );
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

  const history = normalizeHistoryResponse(payload);

  if (!history) {
    return invalidBackendResponse();
  }

  return NextResponse.json(history);
}
