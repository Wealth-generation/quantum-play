import { NextResponse } from "next/server";
import { backendFetch } from "../../../_lib/auth-backend";
import { backendCookieHeader } from "../../../_lib/auth-cookies";

interface DiceBetRequestBody {
  betSize?: unknown;
  threshold?: unknown;
  above?: unknown;
}

interface DiceBetBackendBody {
  betSize: number | string;
  threshold: number;
  above: boolean;
}

interface DiceBetResponse {
  createdAt: string;
  betId: string;
  betSize: string;
  payout: string;
  multiplier: string;
  randomValue: number;
  threshold: number;
  above: boolean;
  didWin: boolean;
}

interface DiceBetBackendDtoBase {
  createdAt: string;
  betSize: string | number;
  payout: string | number;
  multiplier: string | number;
  randomValue: number;
  threshold: number;
  above: boolean;
  didWin: boolean;
}

type DiceBetBackendDto =
  | (DiceBetBackendDtoBase & { id: string; betId?: string })
  | (DiceBetBackendDtoBase & { id?: string; betId: string });

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function badRequest() {
  return NextResponse.json(
    { error: "Dice bet request was invalid." },
    { status: 400 },
  );
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Dice betting is unavailable. Please try again later." },
    { status: 503 },
  );
}

function backendBetError(status: number) {
  return NextResponse.json(
    { error: "Dice bet failed. Please try again." },
    { status: status || 400 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Dice bet response was invalid." },
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

function parseRequestBody(body: DiceBetRequestBody): DiceBetBackendBody | null {
  const betSize =
    isFiniteNumber(body.betSize) || isNumericString(body.betSize)
      ? body.betSize
      : null;

  if (
    betSize === null ||
    !isFiniteNumber(body.threshold) ||
    typeof body.above !== "boolean"
  ) {
    return null;
  }

  return {
    betSize,
    threshold: body.threshold,
    above: body.above,
  };
}

function parseDiceBetBackendDto(value: unknown): DiceBetBackendDto | null {
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
    isFiniteNumber(value.randomValue) &&
    isFiniteNumber(value.threshold) &&
    typeof value.above === "boolean" &&
    typeof value.didWin === "boolean"
  ) {
    return {
      createdAt: value.createdAt,
      betId,
      betSize: value.betSize,
      payout: value.payout,
      multiplier: value.multiplier,
      randomValue: value.randomValue,
      threshold: value.threshold,
      above: value.above,
      didWin: value.didWin,
    };
  }

  return null;
}

function normalizeDiceBetResponse(bet: DiceBetBackendDto): DiceBetResponse {
  const betId = bet.betId ?? bet.id;

  if (!betId) {
    throw new Error("Dice bet id is missing.");
  }

  return {
    createdAt: bet.createdAt,
    betId,
    betSize: String(bet.betSize),
    payout: String(bet.payout),
    multiplier: String(bet.multiplier),
    randomValue: bet.randomValue,
    threshold: bet.threshold,
    above: bet.above,
    didWin: bet.didWin,
  };
}

export async function POST(request: Request) {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let requestBody: DiceBetRequestBody;

  try {
    requestBody = (await request.json()) as DiceBetRequestBody;
  } catch {
    return badRequest();
  }

  const backendBody = parseRequestBody(requestBody);

  if (!backendBody) {
    return badRequest();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/games/house/dice/bet", {
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

  const backendBet = parseDiceBetBackendDto(payload);

  if (!backendBet) {
    return invalidBackendResponse();
  }

  return NextResponse.json(normalizeDiceBetResponse(backendBet), { status: 201 });
}
