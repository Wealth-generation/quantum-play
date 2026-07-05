import { NextResponse } from "next/server";
import { backendFetch } from "../../_lib/auth-backend";
import { backendCookieHeader } from "../../_lib/auth-cookies";

type BalanceType = "GAME_POINTS" | "WATCH_POINTS";

interface NormalizedBalance {
  balanceType: BalanceType;
  value: string;
}

function authRequired() {
  return NextResponse.json({ error: "Authentication required." }, { status: 401 });
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Profile is unavailable. Please try again later." },
    { status: 503 },
  );
}

function invalidBackendResponse() {
  return NextResponse.json(
    { error: "Profile response was invalid." },
    { status: 502 },
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNumericStringOrNumber(value: unknown): value is string | number {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 && Number.isFinite(Number(trimmed));
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : null;
}

function isBalanceType(value: unknown): value is BalanceType {
  return value === "GAME_POINTS" || value === "WATCH_POINTS";
}

function providerLabel(value: Record<string, unknown>): string | null {
  for (const key of ["provider", "authProvider", "providerName", "type", "name"]) {
    const label = optionalString(value[key]);

    if (label) {
      return label;
    }
  }

  return null;
}

function normalizeAuthProviders(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((provider) => {
      if (typeof provider === "string" && provider.trim().length > 0) {
        return { provider: provider.trim() };
      }

      if (isObjectRecord(provider)) {
        return { provider: providerLabel(provider) ?? "Connected account" };
      }

      return null;
    })
    .filter((provider): provider is { provider: string } => provider !== null);
}

function normalizeCryptoAddresses(value: unknown) {
  if (!isObjectRecord(value)) {
    return {
      btcAddress: null,
      ethAddress: null,
      ltcAddress: null,
    };
  }

  return {
    btcAddress: optionalString(value.btcAddress),
    ethAddress: optionalString(value.ethAddress),
    ltcAddress: optionalString(value.ltcAddress),
  };
}

function normalizeBalances(value: unknown): {
  userBalances: NormalizedBalance[];
  gamePoints: string;
  watchPoints: string;
} | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const userBalances: NormalizedBalance[] = [];
  let gamePoints: string | null = null;
  let watchPoints: string | null = null;

  for (const item of value) {
    if (!isObjectRecord(item) || !isNumericStringOrNumber(item.value)) {
      continue;
    }

    const balanceType = item.balanceType;

    if (!isBalanceType(balanceType)) {
      continue;
    }

    const balance: NormalizedBalance = {
      balanceType,
      value: String(item.value),
    };

    userBalances.push(balance);

    if (balanceType === "GAME_POINTS") {
      gamePoints = balance.value;
    }

    if (balanceType === "WATCH_POINTS") {
      watchPoints = balance.value;
    }
  }

  if (gamePoints === null || watchPoints === null) {
    return null;
  }

  return {
    gamePoints,
    userBalances,
    watchPoints,
  };
}

function normalizeDegenCity(value: unknown) {
  if (!value) {
    return {
      connected: false,
      label: null,
      status: null,
    };
  }

  if (!isObjectRecord(value)) {
    return {
      connected: true,
      label: null,
      status: null,
    };
  }

  const label =
    optionalString(value.username) ??
    optionalString(value.name) ??
    optionalString(value.label);

  return {
    connected: true,
    label,
    status: optionalString(value.status),
  };
}

function normalizeProfile(value: unknown) {
  if (!isObjectRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.email !== "string" ||
    typeof value.username !== "string"
  ) {
    return null;
  }

  const balances = normalizeBalances(value.userBalances);

  if (!balances) {
    return null;
  }

  return {
    authProviders: normalizeAuthProviders(value.userAuthProvider),
    balances: {
      gamePoints: balances.gamePoints,
      watchPoints: balances.watchPoints,
    },
    createdAt: optionalString(value.createdAt),
    cryptoAddresses: normalizeCryptoAddresses(value.userCryptoAddresses),
    degenCity: normalizeDegenCity(value.userDegenCity),
    email: value.email,
    hasPassword: value.hasPassword === true,
    hasVerifiedRoleOnDiscord: value.hasVerifiedRoleOnDiscord === true,
    id: value.id,
    isBanned: value.isBanned === true,
    profileImgUrl: optionalString(value.profileImgUrl),
    userBalances: balances.userBalances,
    username: value.username,
  };
}

export async function GET() {
  const cookieHeader = await backendCookieHeader(["access_token"]);

  if (!cookieHeader) {
    return authRequired();
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
    return serviceUnavailable();
  }

  if (!backendResponse.ok) {
    return backendResponse.status === 401
      ? authRequired()
      : serviceUnavailable();
  }

  let payload: unknown;

  try {
    payload = await backendResponse.json();
  } catch {
    return invalidBackendResponse();
  }

  const profile = normalizeProfile(payload);

  if (!profile) {
    return invalidBackendResponse();
  }

  return NextResponse.json(profile);
}
