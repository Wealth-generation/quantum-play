import { NextResponse } from "next/server";
import { backendFetch } from "../../../_lib/auth-backend";

interface DiceConfigResponse {
  rtp: number;
  maxBet: number;
  minBet: number;
  maxMultiplier: number;
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Dice configuration is unavailable. Please try again later." },
    { status: 503 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Dice configuration response was invalid." },
    { status: 502 },
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isDiceConfigResponse(value: unknown): value is DiceConfigResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const config = value as Record<string, unknown>;

  return (
    isFiniteNumber(config.rtp) &&
    isFiniteNumber(config.maxBet) &&
    isFiniteNumber(config.minBet) &&
    isFiniteNumber(config.maxMultiplier)
  );
}

export async function GET() {
  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/games/house/dice/config", {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    return serviceUnavailable();
  }

  if (!backendResponse.ok) {
    return serviceUnavailable();
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return invalidBackendResponse();
  }

  if (!isDiceConfigResponse(payload)) {
    return invalidBackendResponse();
  }

  return NextResponse.json(payload);
}
