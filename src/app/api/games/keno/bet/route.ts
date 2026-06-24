import { NextResponse } from "next/server";
import { backendFetch } from "../../../_lib/auth-backend";
import { backendCookieHeader } from "../../../_lib/auth-cookies";

// ASSUMED-BY-ANALOGY: derived from roulette's "/games/house/roulette/bet".
// Verify against backend docs/Swagger before first production deployment.
const BACKEND_KENO_BET_PATH = "/games/house/keno/bet";

const VALID_RISK_LEVELS = new Set(["CLASSIC", "LOW", "MEDIUM", "HIGH"]);

interface KenoBetResponse {
  createdAt: string;
  betId: string;
  betSize: string;
  payout: string;
  multiplier: number;
  results: number[];
}

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function badRequest() {
  return NextResponse.json(
    { error: "Keno bet request was invalid." },
    { status: 400 },
  );
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Keno betting is unavailable. Please try again later." },
    { status: 503 },
  );
}

function backendBetError(status: number) {
  return NextResponse.json(
    { error: "Keno bet failed. Please try again." },
    { status: status || 400 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Keno bet response was invalid." },
    { status: 502 },
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPositiveNumericString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  const n = Number(trimmed);
  return Number.isFinite(n) && n > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNumericStringOrNumber(value: unknown): value is string | number {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && Number.isFinite(Number(trimmed));
}

function validateRequest(body: unknown): {
  betSize: string;
  risk: string;
  selected: number[];
} | null {
  if (!isObjectRecord(body)) return null;

  if (!isPositiveNumericString(body.betSize)) return null;

  if (typeof body.risk !== "string" || !VALID_RISK_LEVELS.has(body.risk)) {
    return null;
  }

  if (!Array.isArray(body.selected)) return null;

  const selected = body.selected as unknown[];

  if (selected.length < 1 || selected.length > 10) return null;

  for (const item of selected) {
    if (
      typeof item !== "number" ||
      !Number.isInteger(item) ||
      item < 0 ||
      item > 39
    ) {
      return null;
    }
  }

  // Uniqueness: duplicate indices would corrupt the bet.
  if (new Set(selected).size !== selected.length) return null;

  return {
    betSize: (body.betSize as string).trim(),
    risk: body.risk,
    selected: selected as number[],
  };
}

function normalizeBetResponse(value: unknown): KenoBetResponse | null {
  if (!isObjectRecord(value)) return null;

  const betId =
    typeof value.betId === "string"
      ? value.betId
      : typeof value.id === "string"
        ? value.id
        : null;

  if (
    !betId ||
    typeof value.createdAt !== "string" ||
    !isNumericStringOrNumber(value.betSize) ||
    !isNumericStringOrNumber(value.payout) ||
    !isFiniteNumber(value.multiplier) ||
    !Array.isArray(value.results) ||
    value.results.length !== 10 ||
    !(value.results as unknown[]).every(
      (n) =>
        typeof n === "number" &&
        Number.isInteger(n) &&
        n >= 0 &&
        n <= 39,
    )
  ) {
    return null;
  }

  return {
    betId,
    createdAt: value.createdAt,
    betSize: String(value.betSize),
    payout: String(value.payout),
    multiplier: value.multiplier,
    results: value.results as number[],
  };
}

export async function POST(request: Request) {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return badRequest();
  }

  const validated = validateRequest(requestBody);

  if (!validated) {
    return badRequest();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch(BACKEND_KENO_BET_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(validated),
      cache: "no-store",
    });
  } catch {
    return serviceUnavailable();
  }

  if (!backendResponse.ok) {
    return backendBetError(backendResponse.status);
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return invalidBackendResponse();
  }

  const normalized = normalizeBetResponse(payload);

  if (!normalized) {
    return invalidBackendResponse();
  }

  return NextResponse.json(normalized, { status: 201 });
}
