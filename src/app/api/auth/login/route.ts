import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { normalizeBackendAuthCookies } from "../../_lib/auth-cookies";
import {
  authError,
  authServiceUnavailable,
  backendAuthError,
} from "../../_lib/auth-errors";

interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
  captchaToken?: unknown;
}

export async function POST(request: Request) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return authError("Authentication request failed. Please try again.");
  }

  if (
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    typeof body.captchaToken !== "string" ||
    body.captchaToken.length === 0
  ) {
    return authError("Missing reCAPTCHA token");
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/auth/local/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Recaptcha-Token": body.captchaToken,
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });
  } catch {
    return authServiceUnavailable();
  }

  if (!backendResponse.ok) {
    return backendAuthError(backendResponse);
  }

  const response = NextResponse.json({
    message: "Login successful",
    success: true,
  });

  normalizeBackendAuthCookies(response, backendResponse.headers);

  return response;
}
