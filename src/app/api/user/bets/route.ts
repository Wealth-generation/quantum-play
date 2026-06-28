import { type NextRequest, NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader } from "../../_lib/auth-cookies";

const VALID_GAME_SLUGS = new Set([
  "thedoctor_dice",
  "thedoctor_keno",
  "thedoctor_plinko",
  "thedoctor_roulette",
]);

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function badRequest() {
  return NextResponse.json(
    { error: "Bet history request was invalid." },
    { status: 400 },
  );
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Bet history is unavailable. Please try again later." },
    { status: 503 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Bet history response was invalid." },
    { status: 502 },
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
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

function normalizeBet(value: unknown) {
  if (
    !isObjectRecord(value) ||
    typeof value.id !== "string" ||
    !isNumericStringOrNumber(value.betSize) ||
    !isNumericStringOrNumber(value.payout) ||
    typeof value.settledAt !== "string" ||
    typeof value.gameName !== "string" ||
    typeof value.providerName !== "string"
  ) {
    return null;
  }

  return {
    betSize: String(value.betSize),
    gameName: value.gameName,
    id: value.id,
    payout: String(value.payout),
    providerName: value.providerName,
    settledAt: value.settledAt,
  };
}

function normalizeBetsResponse(value: unknown) {
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

  const data = value.data.map(normalizeBet);

  if (data.some((bet) => bet === null)) {
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
  const gameSlug = request.nextUrl.searchParams.get("gameSlug");

  if (!page || !take || take > 50) {
    return badRequest();
  }

  if (gameSlug !== null && !VALID_GAME_SLUGS.has(gameSlug)) {
    return badRequest();
  }

  const backendParams = new URLSearchParams({
    page: String(page),
    take: String(take),
  });

  if (gameSlug) {
    backendParams.set("gameSlug", gameSlug);
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch(`/bets/my?${backendParams.toString()}`, {
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

  const bets = normalizeBetsResponse(payload);

  if (!bets) {
    return invalidBackendResponse();
  }

  return NextResponse.json(bets);
}
