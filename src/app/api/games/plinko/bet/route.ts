import { NextResponse } from "next/server";
import {
  checkPlinkoResultContract,
  isPlinkoRisk,
  isPlinkoRows,
  type PlinkoRisk,
  type PlinkoRows,
} from "@/games/plinko";
import { backendFetch } from "../../../_lib/auth-backend";
import { backendCookieHeader } from "../../../_lib/auth-cookies";

interface PlinkoBetRequestBody {
  betSize?: unknown;
  risk?: unknown;
  rowsCount?: unknown;
}

interface PlinkoBetBackendBody {
  betSize: number | string;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
}

interface PlinkoBetBackendDtoBase {
  createdAt: string;
  betSize: string | number;
  payout: string | number;
  multiplier: string | number;
  results: number[];
}

type PlinkoBetBackendDto =
  | (PlinkoBetBackendDtoBase & { id: string; betId?: string })
  | (PlinkoBetBackendDtoBase & { id?: string; betId: string });

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function badRequest() {
  return NextResponse.json(
    { error: "Plinko bet request was invalid." },
    { status: 400 },
  );
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Plinko betting is unavailable. Please try again later." },
    { status: 503 },
  );
}

function backendBetError(status: number) {
  return NextResponse.json(
    { error: "Plinko bet failed. Please try again." },
    { status: status || 400 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Plinko bet response was invalid." },
    { status: 502 },
  );
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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function parseRequestBody(
  body: PlinkoBetRequestBody,
): PlinkoBetBackendBody | null {
  const betSize =
    isFiniteNumber(body.betSize) || isNumericString(body.betSize)
      ? body.betSize
      : null;

  if (
    betSize === null ||
    !isPlinkoRows(body.rowsCount) ||
    !isPlinkoRisk(body.risk)
  ) {
    return null;
  }

  return {
    betSize,
    risk: body.risk,
    rowsCount: body.rowsCount,
  };
}

function parsePlinkoBetBackendDto(value: unknown): PlinkoBetBackendDto | null {
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
    betId &&
    typeof value.createdAt === "string" &&
    (isFiniteNumber(value.betSize) || isNumericString(value.betSize)) &&
    (isFiniteNumber(value.payout) || isNumericString(value.payout)) &&
    (isFiniteNumber(value.multiplier) || isNumericString(value.multiplier)) &&
    Array.isArray(value.results) &&
    value.results.every(isFiniteNumber)
  ) {
    return {
      createdAt: value.createdAt,
      betId,
      betSize: value.betSize,
      payout: value.payout,
      multiplier: value.multiplier,
      results: value.results,
    };
  }

  return null;
}

function normalizePlinkoBetResponse(
  bet: PlinkoBetBackendDto,
  request: PlinkoBetBackendBody,
) {
  const betId = bet.betId ?? bet.id;

  if (!betId) {
    throw new Error("Plinko bet id is missing.");
  }

  const multiplier = Number(bet.multiplier);
  const contractCheck = checkPlinkoResultContract({
    multiplier,
    results: bet.results,
    risk: request.risk,
    rowsCount: request.rowsCount,
  });

  return {
    bucketIndex: contractCheck.bucketIndex,
    contractWarnings: contractCheck.warnings,
    createdAt: bet.createdAt,
    betId,
    betSize: String(bet.betSize),
    expectedMultiplier: contractCheck.expectedMultiplier,
    multiplier,
    payout: String(bet.payout),
    results: contractCheck.path,
    risk: request.risk,
    rowsCount: request.rowsCount,
  };
}

export async function POST(request: Request) {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let requestBody: PlinkoBetRequestBody;

  try {
    requestBody = (await request.json()) as PlinkoBetRequestBody;
  } catch {
    return badRequest();
  }

  const backendBody = parseRequestBody(requestBody);

  if (!backendBody) {
    return badRequest();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/games/house/plinko/bet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(backendBody),
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

  const backendBet = parsePlinkoBetBackendDto(payload);

  if (!backendBet) {
    return invalidBackendResponse();
  }

  return NextResponse.json(
    normalizePlinkoBetResponse(backendBet, backendBody),
    { status: 201 },
  );
}
