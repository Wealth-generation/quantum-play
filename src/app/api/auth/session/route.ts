import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import {
  backendAuthCookieHeaderFromHeaders,
  backendCookieHeader,
  normalizeBackendAuthCookies,
} from "../../_lib/auth-cookies";

interface BackendUser {
  id?: unknown;
  email?: unknown;
  username?: unknown;
  profileImgUrl?: unknown;
  hasPassword?: unknown;
}

interface AuthenticatedBackendUser {
  id: string;
  email: string;
  username: string;
  profileImgUrl?: unknown;
  hasPassword?: unknown;
}

function unauthenticated() {
  return NextResponse.json({
    authenticated: false,
    user: null,
  });
}

function authenticated(user: AuthenticatedBackendUser) {
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

async function fetchBackendSession(cookieHeader: string): Promise<Response | null> {
  try {
    return await backendFetch("/user/query/me", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

async function parseBackendUser(
  backendResponse: Response,
): Promise<AuthenticatedBackendUser | null> {
  const user = (await backendResponse.json()) as BackendUser;

  if (
    typeof user.id !== "string" ||
    typeof user.email !== "string" ||
    typeof user.username !== "string"
  ) {
    return null;
  }

  return {
    email: user.email,
    hasPassword: user.hasPassword,
    id: user.id,
    profileImgUrl: user.profileImgUrl,
    username: user.username,
  };
}

async function authenticatedFromCookieHeader(cookieHeader: string) {
  const backendResponse = await fetchBackendSession(cookieHeader);

  if (!backendResponse?.ok) {
    return null;
  }

  const user = await parseBackendUser(backendResponse);

  return user ? authenticated(user) : null;
}

async function refreshAuthCookies(refreshCookieHeader: string) {
  try {
    const backendResponse = await backendFetch("/auth/refresh", {
      method: "GET",
      headers: {
        Cookie: refreshCookieHeader,
      },
      cache: "no-store",
    });

    return backendResponse.ok ? backendResponse : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const accessCookieHeader = await backendCookieHeader(["access_token"]);

  if (accessCookieHeader) {
    const sessionResponse =
      await authenticatedFromCookieHeader(accessCookieHeader);

    if (sessionResponse) {
      return sessionResponse;
    }
  }

  const refreshCookieHeader = await backendCookieHeader(["refresh_token"]);

  if (!refreshCookieHeader) {
    return unauthenticated();
  }

  const refreshResponse = await refreshAuthCookies(refreshCookieHeader);

  if (!refreshResponse) {
    return unauthenticated();
  }

  const refreshedAccessCookieHeader = backendAuthCookieHeaderFromHeaders(
    refreshResponse.headers,
    ["access_token"],
  );

  if (!refreshedAccessCookieHeader) {
    return unauthenticated();
  }

  const sessionResponse = await authenticatedFromCookieHeader(
    refreshedAccessCookieHeader,
  );

  if (!sessionResponse) {
    return unauthenticated();
  }

  normalizeBackendAuthCookies(sessionResponse, refreshResponse.headers);

  return sessionResponse;
}
