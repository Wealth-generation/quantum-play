import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

type NormalizedCookieName = "access_token" | "refresh_token";

interface ParsedSetCookie {
  name: string;
  value: string;
  maxAge?: number;
}

const AUTH_COOKIE_DEFAULT_MAX_AGE: Record<NormalizedCookieName, number> = {
  access_token: 600,
  refresh_token: 259200,
};

const AUTH_COOKIE_PATH: Record<NormalizedCookieName, string> = {
  access_token: "/",
  refresh_token: "/api/auth",
};
const LEGACY_AUTH_COOKIE_NAMES = ["accessToken", "refreshToken"] as const;
const LEGACY_AUTH_COOKIE_PATHS = ["/", "/api/auth"] as const;

function isNormalizedCookieName(name: string): name is NormalizedCookieName {
  return name === "access_token" || name === "refresh_token";
}

function secureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

function splitSetCookieHeader(header: string): string[] {
  return header.split(/,(?=\s*[^;,=\s]+=)/).map((value) => value.trim());
}

function getSetCookieHeaders(headers: Headers): string[] {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof withGetSetCookie.getSetCookie === "function") {
    return withGetSetCookie.getSetCookie();
  }

  const combinedHeader = headers.get("set-cookie");
  return combinedHeader ? splitSetCookieHeader(combinedHeader) : [];
}

function parseSetCookie(header: string): ParsedSetCookie | null {
  const [nameValue, ...attributes] = header.split(";").map((part) => part.trim());
  const separatorIndex = nameValue.indexOf("=");

  if (separatorIndex <= 0) {
    return null;
  }

  const name = nameValue.slice(0, separatorIndex);
  const value = nameValue.slice(separatorIndex + 1);
  const maxAgeAttribute = attributes.find((attribute) =>
    attribute.toLowerCase().startsWith("max-age="),
  );
  const maxAge = maxAgeAttribute
    ? Number(maxAgeAttribute.split("=")[1])
    : undefined;

  return {
    name,
    value,
    maxAge: Number.isFinite(maxAge) ? maxAge : undefined,
  };
}

export function normalizeBackendAuthCookies(
  response: NextResponse,
  backendHeaders: Headers,
) {
  for (const header of getSetCookieHeaders(backendHeaders)) {
    const parsed = parseSetCookie(header);

    if (!parsed || !isNormalizedCookieName(parsed.name)) {
      continue;
    }

    response.cookies.set(parsed.name, parsed.value, {
      httpOnly: true,
      maxAge: parsed.maxAge ?? AUTH_COOKIE_DEFAULT_MAX_AGE[parsed.name],
      path: AUTH_COOKIE_PATH[parsed.name],
      sameSite: "strict",
      secure: secureCookie(),
    });
  }
}

export function backendAuthCookieHeaderFromHeaders(
  backendHeaders: Headers,
  names: NormalizedCookieName[],
): string {
  const allowedNames = new Set<NormalizedCookieName>(names);

  return getSetCookieHeaders(backendHeaders)
    .map(parseSetCookie)
    .filter(
      (cookie): cookie is ParsedSetCookie & { name: NormalizedCookieName } =>
        Boolean(
          cookie &&
            isNormalizedCookieName(cookie.name) &&
            allowedNames.has(cookie.name),
        ),
    )
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export function clearAuthCookies(response: NextResponse) {
  for (const name of Object.keys(AUTH_COOKIE_PATH) as NormalizedCookieName[]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      maxAge: 0,
      path: AUTH_COOKIE_PATH[name],
      sameSite: "strict",
      secure: secureCookie(),
    });
  }

  for (const name of LEGACY_AUTH_COOKIE_NAMES) {
    for (const path of LEGACY_AUTH_COOKIE_PATHS) {
      response.cookies.set(name, "", {
        httpOnly: true,
        maxAge: 0,
        path,
        sameSite: "strict",
        secure: secureCookie(),
      });
    }
  }
}

export async function backendCookieHeader(
  names: NormalizedCookieName[],
): Promise<string> {
  const cookieStore = await cookies();

  return names
    .map((name) => {
      const value = cookieStore.get(name)?.value;
      return value ? `${name}=${value}` : null;
    })
    .filter((value): value is string => Boolean(value))
    .join("; ");
}
