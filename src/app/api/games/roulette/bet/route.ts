import { NextResponse } from "next/server";
import { backendFetch } from "../../../_lib/auth-backend";
import { backendCookieHeader } from "../../../_lib/auth-cookies";

// All 10 bet-type arrays must be present in `params` (empty allowed).
const BET_TYPE_KEYS = [
  "straightValues",
  "splitValues",
  "streetValues",
  "cornerValues",
  "doubleStreetValues",
  "columnValues",
  "dozenValues",
  "colorValues",
  "parityValues",
  "halfValues",
] as const;

interface RouletteBetResponse {
  betId: string;
  createdAt: string;
  betSize: string;
  payout: string;
  randomPosition: number;
  multiplier: string;
}

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function badRequest() {
  return NextResponse.json(
    { error: "Roulette bet request was invalid." },
    { status: 400 },
  );
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Roulette betting is unavailable. Please try again later." },
    { status: 503 },
  );
}

function backendBetError(status: number) {
  return NextResponse.json(
    { error: "Roulette bet failed. Please try again." },
    { status: status || 400 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Roulette bet response was invalid." },
    { status: 502 },
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNumericString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 && Number.isFinite(Number(trimmed));
}

function isStraightEntry(value: unknown): boolean {
  return (
    isObjectRecord(value) &&
    isFiniteNumber(value.straightNumber) &&
    Number.isInteger(value.straightNumber) &&
    value.straightNumber >= 0 &&
    value.straightNumber <= 36 &&
    isNumericString(value.amount)
  );
}

function isColorEntry(value: unknown): boolean {
  return (
    isObjectRecord(value) &&
    typeof value.color === "string" &&
    value.color.trim().length > 0 &&
    isNumericString(value.amount)
  );
}

// Out-of-scope bet types are sent empty this slice; if any entry is present we
// still require a numeric-string amount.
function isGenericEntry(value: unknown): boolean {
  return isObjectRecord(value) && isNumericString(value.amount);
}

function validateParams(params: unknown): Record<string, unknown> | null {
  if (!isObjectRecord(params)) {
    return null;
  }

  for (const key of BET_TYPE_KEYS) {
    const arrayValue = params[key];

    if (!Array.isArray(arrayValue)) {
      return null;
    }

    const validator =
      key === "straightValues"
        ? isStraightEntry
        : key === "colorValues"
          ? isColorEntry
          : isGenericEntry;

    if (!arrayValue.every(validator)) {
      return null;
    }
  }

  return params;
}

function normalizeBetResponse(value: unknown): RouletteBetResponse | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const betId =
    typeof value.betId === "string"
      ? value.betId
      : typeof value.id === "string"
        ? value.id
        : null;

  if (
    !betId ||
    typeof value.createdAt !== "string" ||
    !(isFiniteNumber(value.betSize) || isNumericString(value.betSize)) ||
    !(isFiniteNumber(value.payout) || isNumericString(value.payout)) ||
    !(isFiniteNumber(value.multiplier) || isNumericString(value.multiplier)) ||
    !isFiniteNumber(value.randomPosition) ||
    !Number.isInteger(value.randomPosition) ||
    value.randomPosition < 0 ||
    value.randomPosition > 36
  ) {
    return null;
  }

  return {
    betId,
    createdAt: value.createdAt,
    betSize: String(value.betSize),
    payout: String(value.payout),
    multiplier: String(value.multiplier),
    randomPosition: value.randomPosition,
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

  if (!isObjectRecord(requestBody)) {
    return badRequest();
  }

  const params = validateParams(requestBody.params);

  if (!params) {
    return badRequest();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/games/house/roulette/bet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ params }),
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
