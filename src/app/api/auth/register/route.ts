import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import {
  authError,
  authServiceUnavailable,
  backendAuthError,
} from "../../_lib/auth-errors";

interface RegisterRequestBody {
  username?: unknown;
  email?: unknown;
  password?: unknown;
  affiliateCode?: unknown;
}

interface BackendRegisterBody {
  username: string;
  email: string;
  password: string;
  affiliateCode?: string;
}

export async function POST(request: Request) {
  let body: RegisterRequestBody;

  try {
    body = (await request.json()) as RegisterRequestBody;
  } catch {
    return authError("Authentication request failed. Please try again.");
  }

  if (
    typeof body.username !== "string" ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return authError("Authentication request failed. Please try again.");
  }

  let backendResponse: Response;
  const backendBody: BackendRegisterBody = {
    username: body.username,
    email: body.email,
    password: body.password,
  };

  if (
    typeof body.affiliateCode === "string" &&
    body.affiliateCode.trim().length > 0
  ) {
    backendBody.affiliateCode = body.affiliateCode.trim();
  }

  try {
    backendResponse = await backendFetch("/auth/local/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendBody),
    });
  } catch {
    return authServiceUnavailable();
  }

  if (!backendResponse.ok) {
    return backendAuthError(backendResponse, "register");
  }

  const payload = (await backendResponse.json()) as {
    verificationToken?: unknown;
  };

  if (typeof payload.verificationToken !== "string") {
    return authError("Authentication request failed. Please try again.", 502);
  }

  return NextResponse.json({
    verificationToken: payload.verificationToken,
  });
}
