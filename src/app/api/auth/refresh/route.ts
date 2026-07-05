import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import {
  backendCookieHeader,
  normalizeBackendAuthCookies,
} from "../../_lib/auth-cookies";

export async function POST() {
  const cookieHeader = await backendCookieHeader(["refresh_token"]);

  if (!cookieHeader) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/auth/refresh", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 502 });
  }

  if (backendResponse.status === 401 || backendResponse.status === 403) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  if (!backendResponse.ok) {
    return NextResponse.json({ success: false }, { status: 502 });
  }

  const response = NextResponse.json({ success: true });
  normalizeBackendAuthCookies(response, backendResponse.headers);

  return response;
}
