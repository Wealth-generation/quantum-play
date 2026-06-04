import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader } from "../../_lib/auth-cookies";

interface BackendUser {
  id?: unknown;
  email?: unknown;
  username?: unknown;
  profileImgUrl?: unknown;
  hasPassword?: unknown;
}

function unauthenticated() {
  return NextResponse.json({
    authenticated: false,
    user: null,
  });
}

export async function GET() {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return unauthenticated();
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/user/query/me", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch {
    return unauthenticated();
  }

  if (!backendResponse.ok) {
    return unauthenticated();
  }

  const user = (await backendResponse.json()) as BackendUser;

  if (
    typeof user.id !== "string" ||
    typeof user.email !== "string" ||
    typeof user.username !== "string"
  ) {
    return unauthenticated();
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      profileImgUrl:
        typeof user.profileImgUrl === "string" ? user.profileImgUrl : null,
      hasPassword:
        typeof user.hasPassword === "boolean" ? user.hasPassword : undefined,
    },
  });
}
