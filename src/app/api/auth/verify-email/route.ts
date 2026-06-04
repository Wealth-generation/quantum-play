import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { normalizeBackendAuthCookies } from "../../_lib/auth-cookies";
import {
  authError,
  authServiceUnavailable,
  backendAuthError,
} from "../../_lib/auth-errors";

interface VerifyEmailRequestBody {
  verificationToken?: unknown;
  code?: unknown;
}

export async function POST(request: Request) {
  let body: VerifyEmailRequestBody;

  try {
    body = (await request.json()) as VerifyEmailRequestBody;
  } catch {
    return authError("Authentication request failed. Please try again.");
  }

  if (
    typeof body.verificationToken !== "string" ||
    typeof body.code !== "string" ||
    !/^\d{6}$/.test(body.code)
  ) {
    return authError("Authentication request failed. Please try again.");
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/auth/local/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        verificationToken: body.verificationToken,
        code: body.code,
      }),
    });
  } catch {
    return authServiceUnavailable();
  }

  if (!backendResponse.ok) {
    return backendAuthError(backendResponse);
  }

  const response = NextResponse.json({
    message: "Email verified successfully",
    success: true,
  });

  normalizeBackendAuthCookies(response, backendResponse.headers);

  return response;
}
