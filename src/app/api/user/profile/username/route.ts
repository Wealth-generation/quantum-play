import { NextResponse } from "next/server";
import { backendFetch } from "../../../_lib/auth-backend";
import { backendCookieHeader } from "../../../_lib/auth-cookies";

interface UsernameRequestBody {
  username?: unknown;
}

interface BackendErrorPayload {
  error?: unknown;
  message?: unknown;
}

const SENSITIVE_MESSAGE_PATTERN =
  /(?:access[_-]?token|refresh[_-]?token|socket[_-]?token|authorization|cookie|bearer|secret|password=|hash)/i;

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function badRequest(message = "Username update request was invalid.") {
  return NextResponse.json({ error: message }, { status: 400 });
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Username update is unavailable. Please try again later." },
    { status: 503 },
  );
}

function updateFailed(status = 400) {
  return NextResponse.json(
    { error: "Username update failed. Please try again." },
    { status },
  );
}

function safeMessage(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const message = value.trim();

  if (
    message.length === 0 ||
    message.length > 200 ||
    SENSITIVE_MESSAGE_PATTERN.test(message)
  ) {
    return null;
  }

  return message;
}

function safeMessageFromPayload(value: unknown): string | null {
  const directMessage = safeMessage(value);
  if (directMessage) {
    return directMessage;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const itemMessage = safeMessageFromPayload(item);
      if (itemMessage) {
        return itemMessage;
      }
    }
  }

  if (value && typeof value === "object") {
    const payload = value as BackendErrorPayload;
    return (
      safeMessageFromPayload(payload.message) ??
      safeMessageFromPayload(payload.error)
    );
  }

  return null;
}

async function backendUpdateError(response: Response) {
  let message: string | null = null;

  try {
    const payload = (await response.json()) as unknown;
    message = safeMessageFromPayload(payload);
  } catch {
    message = null;
  }

  return NextResponse.json(
    { error: message ?? "Username update failed. Please try again." },
    { status: response.status || 400 },
  );
}

export async function PATCH(request: Request) {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
  }

  let body: UsernameRequestBody;

  try {
    body = (await request.json()) as UsernameRequestBody;
  } catch {
    return badRequest();
  }

  if (typeof body.username !== "string") {
    return badRequest();
  }

  const username = body.username.trim();

  if (!username) {
    return badRequest("Username is required.");
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/user/command/update/user-info", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ username }),
      cache: "no-store",
    });
  } catch {
    return serviceUnavailable();
  }

  if (!backendResponse.ok) {
    if (backendResponse.status === 401) {
      return authRequired();
    }

    if (backendResponse.status >= 400 && backendResponse.status < 500) {
      return backendUpdateError(backendResponse);
    }

    return backendResponse.status >= 500
      ? serviceUnavailable()
      : updateFailed(backendResponse.status);
  }

  return NextResponse.json({
    success: true,
    username,
  });
}
