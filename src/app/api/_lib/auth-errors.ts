import "server-only";

import { NextResponse } from "next/server";

const SAFE_AUTH_MESSAGES = new Set([
  "Invalid email or password.",
  "Invalid verification code.",
]);
const SENSITIVE_MESSAGE_PATTERN =
  /(?:access[_-]?token|refresh[_-]?token|socket[_-]?token|authorization|cookie|bearer|secret|password=)/i;

export interface AuthErrorBody {
  error: string;
}

interface BackendErrorPayload {
  error?: unknown;
  message?: unknown;
}

function safeMessage(message: unknown, status: number): string | null {
  if (typeof message !== "string") {
    return null;
  }

  const normalizedMessage = message.trim();

  if (!normalizedMessage || normalizedMessage.length > 200) {
    return null;
  }

  if (SAFE_AUTH_MESSAGES.has(normalizedMessage)) {
    return normalizedMessage;
  }

  if (
    status >= 400 &&
    status < 500 &&
    !SENSITIVE_MESSAGE_PATTERN.test(normalizedMessage)
  ) {
    return normalizedMessage;
  }

  return null;
}

function safeMessageFromUnknown(value: unknown, status: number): string | null {
  const directMessage = safeMessage(value, status);
  if (directMessage) {
    return directMessage;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const itemMessage = safeMessageFromUnknown(item, status);
      if (itemMessage) {
        return itemMessage;
      }
    }
  }

  if (value && typeof value === "object") {
    const payload = value as BackendErrorPayload;
    return (
      safeMessageFromUnknown(payload.message, status) ??
      safeMessageFromUnknown(payload.error, status)
    );
  }

  return null;
}

function parseBackendErrorText(text: string): unknown {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function authError(message: string, status = 400) {
  return NextResponse.json<AuthErrorBody>({ error: message }, { status });
}

export function authServiceUnavailable() {
  return authError("Authentication service is unavailable. Please try again.", 502);
}

export async function backendAuthError(response: Response, context?: string) {
  const fallback = response.status >= 500
    ? "Authentication service is unavailable. Please try again."
    : "Authentication request failed. Please try again.";

  let message = fallback;
  let rawBody = "";

  try {
    rawBody = await response.text();
    const payload = parseBackendErrorText(rawBody);
    const safeMessage = safeMessageFromUnknown(payload, response.status);
    if (safeMessage) {
      message = safeMessage;
    }
  } catch {
    message = fallback;
  }

  if (context) {
    console.warn("[auth-bff] backend auth error", {
      context,
      mappedMessage: message,
      status: response.status,
    });
  }

  return authError(message, response.status || 400);
}
