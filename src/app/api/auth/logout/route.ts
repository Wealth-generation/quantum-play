import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader, clearAuthCookies } from "../../_lib/auth-cookies";

export async function POST() {
  const cookieHeader = await backendCookieHeader(["access_token", "refresh_token"]);

  if (cookieHeader) {
    try {
      await backendFetch("/auth/logout", {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      });
    } catch {
      // Local cookie clearing must still happen even if backend logout is unavailable.
    }
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);

  return response;
}
