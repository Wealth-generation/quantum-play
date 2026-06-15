import { NextResponse } from "next/server";
import { plinkoLocalConfig } from "@/games/plinko/config";
import { backendFetch } from "../../../_lib/auth-backend";

interface PlinkoBackendConfigResponse {
  maxBet: number;
  minBet: number;
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Plinko configuration is unavailable. Please try again later." },
    { status: 503 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Plinko configuration response was invalid." },
    { status: 502 },
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPlinkoBackendConfigResponse(
  value: unknown,
): value is PlinkoBackendConfigResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const config = value as Record<string, unknown>;

  return isFiniteNumber(config.maxBet) && isFiniteNumber(config.minBet);
}

export async function GET() {
  let backendResponse: Response;

  try {
    backendResponse = await backendFetch("/games/house/plinko/config", {
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

  if (!isPlinkoBackendConfigResponse(payload)) {
    return invalidBackendResponse();
  }

  return NextResponse.json({
    maxBet: payload.maxBet,
    minBet: payload.minBet,
    multipliers: plinkoLocalConfig.multipliers,
    risks: plinkoLocalConfig.risks,
    rows: plinkoLocalConfig.rows,
  });
}
