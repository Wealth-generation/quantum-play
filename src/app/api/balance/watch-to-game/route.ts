import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader } from "../../_lib/auth-cookies";

interface PointsExchangeRequestBody {
  amount?: unknown;
}

interface PointsExchangeResponse {
  exchangeRate: string;
  gamePoints: string;
  gamePointsReceived: string;
  watchPoints: string;
  watchPointsSpent: string;
}

interface SafeExchangeErrorBody {
  backendCode?: string;
  backendDetails?: string[];
  backendMessage?: string;
  backendStatus?: number;
  error: string;
  reason?: "invalid-amount";
}

interface SafeBackendDiagnostics {
  backendCode?: string;
  backendDetails?: string[];
  backendMessage?: string;
  backendStatus: number;
}

const SENSITIVE_BACKEND_MESSAGE_PATTERN =
  /(?:access[_-]?token|refresh[_-]?token|socket[_-]?token|authorization|cookie|bearer|jwt|secret|password=|hash|stack|trace|backend[_-]?base[_-]?url)/i;
const MAX_DIAGNOSTIC_MESSAGE_LENGTH = 240;
const MAX_DIAGNOSTIC_DETAILS = 5;

function authRequired() {
  return NextResponse.json(
    { error: "Your session expired. Please log in again." },
    { status: 401 },
  );
}

function badRequest() {
  return NextResponse.json(
    { error: "Enter a valid amount.", reason: "invalid-amount" },
    { status: 400 },
  );
}

function exchangeFailed(status = 400, diagnostics?: SafeBackendDiagnostics) {
  return NextResponse.json(
    { ...diagnostics, error: "Exchange failed. Please try again." },
    { status: status >= 400 && status < 600 ? status : 400 },
  );
}

function backendExchangeError(
  status: number,
  diagnostics: SafeBackendDiagnostics,
) {
  return NextResponse.json(
    {
      ...diagnostics,
      error: diagnostics.backendMessage ?? "Exchange failed. Please try again.",
    } satisfies SafeExchangeErrorBody,
    { status: status >= 400 && status < 600 ? status : 400 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Exchange failed. Please try again." },
    { status: 502 },
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSafeDiagnosticMessage(value: string): boolean {
  const message = value.trim();

  return (
    message.length > 0 &&
    !SENSITIVE_BACKEND_MESSAGE_PATTERN.test(message)
  );
}

function truncateDiagnosticMessage(value: string): string {
  const message = value.trim();

  return message.length > MAX_DIAGNOSTIC_MESSAGE_LENGTH
    ? `${message.slice(0, MAX_DIAGNOSTIC_MESSAGE_LENGTH)}...`
    : message;
}

function safeDiagnosticString(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const message = String(value);

  return isSafeDiagnosticMessage(message)
    ? truncateDiagnosticMessage(message)
    : null;
}

function collectErrorStrings(value: unknown): string[] {
  if (typeof value === "string") {
    const message = safeDiagnosticString(value);

    return message ? [message] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectErrorStrings);
  }

  if (!isObjectRecord(value)) {
    return [];
  }

  return ["error", "message", "reason", "code"]
    .flatMap((key) => collectErrorStrings(value[key]))
    .filter((message) => message.trim().length > 0);
}

function collectSafeDetails(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap(collectSafeDetails)
      .slice(0, MAX_DIAGNOSTIC_DETAILS);
  }

  const directMessage = safeDiagnosticString(value);
  if (directMessage) {
    return [directMessage];
  }

  if (!isObjectRecord(value)) {
    return [];
  }

  return ["details", "errors", "violations"]
    .flatMap((key) => collectSafeDetails(value[key]))
    .slice(0, MAX_DIAGNOSTIC_DETAILS);
}

async function readBackendErrorPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return await response.text();
  } catch {
    return null;
  }
}

function backendDiagnostics(
  status: number,
  payload: unknown,
): SafeBackendDiagnostics {
  const errorStrings = collectErrorStrings(payload);
  const directMessage = isObjectRecord(payload)
    ? (safeDiagnosticString(payload.message) ??
      safeDiagnosticString(payload.error) ??
      safeDiagnosticString(payload.reason))
    : null;
  const fallbackMessage =
    errorStrings.length > 0
      ? truncateDiagnosticMessage(errorStrings.join(" "))
      : null;
  const backendMessage = directMessage ?? fallbackMessage;
  const backendCode =
    isObjectRecord(payload) ? safeDiagnosticString(payload.code) : null;
  const backendDetails = collectSafeDetails(payload);

  return {
    ...(backendCode ? { backendCode } : {}),
    ...(backendDetails.length > 0 ? { backendDetails } : {}),
    ...(backendMessage ? { backendMessage } : {}),
    backendStatus: status,
  };
}

function isSafePositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
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

function normalizeDecimalLike(value: unknown): string | null {
  if (isFiniteNumber(value) || isNumericString(value)) {
    return String(value);
  }

  return null;
}

function normalizeExchangeResponse(
  value: unknown,
): PointsExchangeResponse | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const watchPointsSpent = normalizeDecimalLike(value.watchPointsSpent);
  const gamePointsReceived = normalizeDecimalLike(value.gamePointsReceived);
  const exchangeRate = normalizeDecimalLike(value.exchangeRate);
  const watchPoints = normalizeDecimalLike(value.watchPointsBalance);
  const gamePoints = normalizeDecimalLike(value.gamePointsBalance);

  if (
    !watchPointsSpent ||
    !gamePointsReceived ||
    !exchangeRate ||
    !watchPoints ||
    !gamePoints
  ) {
    return null;
  }

  return {
    exchangeRate,
    gamePoints,
    gamePointsReceived,
    watchPoints,
    watchPointsSpent,
  };
}

export async function POST(request: Request) {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let requestBody: PointsExchangeRequestBody;

  try {
    requestBody = (await request.json()) as PointsExchangeRequestBody;
  } catch {
    return badRequest();
  }

  if (!isSafePositiveInteger(requestBody.amount)) {
    return badRequest();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/balance/watch-to-game", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ amount: String(requestBody.amount) }),
      cache: "no-store",
    });
  } catch {
    return exchangeFailed(503);
  }

  if (!backendResponse.ok) {
    if (backendResponse.status === 401 || backendResponse.status === 403) {
      return authRequired();
    }

    const backendErrorPayload = await readBackendErrorPayload(backendResponse);
    const diagnostics = backendDiagnostics(
      backendResponse.status,
      backendErrorPayload,
    );

    return backendExchangeError(backendResponse.status, diagnostics);
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return invalidBackendResponse();
  }

  const exchange = normalizeExchangeResponse(payload);

  if (!exchange) {
    return invalidBackendResponse();
  }

  return NextResponse.json(exchange);
}
