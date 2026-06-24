import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  RegisterResult,
  VerifyEmailPayload,
} from "../types/auth-types";

interface AuthErrorResponse {
  error?: unknown;
}

export class AuthRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthRequestError";
  }
}

async function requestJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = "Authentication request failed. Please try again.";

    try {
      const payload = (await response.json()) as AuthErrorResponse;
      if (typeof payload.error === "string") {
        message = payload.error;
      }
    } catch {
      message = "Authentication request failed. Please try again.";
    }

    throw new AuthRequestError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function getAuthSession(): Promise<AuthSession> {
  return requestJson<AuthSession>("/api/auth/session", {
    method: "GET",
  });
}

export function login(payload: LoginPayload): Promise<{ success: true }> {
  return requestJson<{ success: true }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(
  payload: RegisterPayload,
): Promise<RegisterResult> {
  return requestJson<RegisterResult>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyEmail(
  payload: VerifyEmailPayload,
): Promise<{ success: true }> {
  return requestJson<{ success: true }>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshAuth(): Promise<{ success: true }> {
  return requestJson<{ success: true }>("/api/auth/refresh", {
    method: "POST",
  });
}

export function logout(): Promise<{ success: true }> {
  return requestJson<{ success: true }>("/api/auth/logout", {
    method: "POST",
  });
}
