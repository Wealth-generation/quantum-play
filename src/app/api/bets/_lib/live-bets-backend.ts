import "server-only";

import { NextResponse } from "next/server";
import { isLiveBetDto, type LiveBetDto } from "@/entities/bet/model";

function getBackendBaseUrl(): string {
  const baseUrl = process.env.BACKEND_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error("BACKEND_BASE_URL is not configured");
  }

  return baseUrl.replace(/\/+$/, "");
}

function backendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
}

async function fetchLiveBets(path: string): Promise<Response> {
  return fetch(backendUrl(path), {
    method: "GET",
    cache: "no-store",
  });
}

export async function liveBetsResponse(path: string) {
  let backendResponse: Response;

  try {
    backendResponse = await fetchLiveBets(path);
  } catch {
    return NextResponse.json(
      { error: "Live bets are unavailable. Please try again later." },
      { status: 503 },
    );
  }

  if (!backendResponse.ok) {
    return NextResponse.json(
      { error: "Live bets are unavailable. Please try again later." },
      { status: backendResponse.status },
    );
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return NextResponse.json(
      { error: "Live bets response was invalid." },
      { status: 502 },
    );
  }

  if (!Array.isArray(payload) || !payload.every(isLiveBetDto)) {
    return NextResponse.json(
      { error: "Live bets response was invalid." },
      { status: 502 },
    );
  }

  return NextResponse.json(payload as LiveBetDto[]);
}
