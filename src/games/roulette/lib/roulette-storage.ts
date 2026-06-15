import type { RouletteBetColor } from "../config/roulette-defaults";
import { isValidMoney } from "./roulette-decimal";
import {
  EMPTY_PLACEMENTS,
  isStraightNumber,
  type RoulettePlacements,
} from "./roulette-bets";

// Persistence layer ONLY. The Zustand store is the runtime source of truth;
// this module just mirrors placements to localStorage and rehydrates them.
// Bet `params` are always built from the store, never from this layer.

const STORAGE_KEY = "roulette:bets:v1";

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    // Access can throw (e.g. disabled storage / sandboxed contexts).
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Defensive parse: any corrupt/invalid shape is discarded and the caller
// starts empty.
function parsePlacements(raw: string): RoulettePlacements {
  const parsed: unknown = JSON.parse(raw);

  if (!isPlainObject(parsed)) {
    return EMPTY_PLACEMENTS;
  }

  const straight: Record<string, string> = {};
  const color: Partial<Record<RouletteBetColor, string>> = {};

  if (isPlainObject(parsed.straight)) {
    for (const [key, amount] of Object.entries(parsed.straight)) {
      const numberKey = Number(key);

      if (
        isStraightNumber(numberKey) &&
        typeof amount === "string" &&
        isValidMoney(amount)
      ) {
        straight[String(numberKey)] = amount;
      }
    }
  }

  if (isPlainObject(parsed.color)) {
    for (const key of ["red", "black"] as RouletteBetColor[]) {
      const amount = parsed.color[key];

      if (typeof amount === "string" && isValidMoney(amount)) {
        color[key] = amount;
      }
    }
  }

  return { straight, color };
}

export function loadPlacements(): RoulettePlacements {
  const storage = getStorage();

  if (!storage) {
    return EMPTY_PLACEMENTS;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? parsePlacements(raw) : EMPTY_PLACEMENTS;
  } catch {
    return EMPTY_PLACEMENTS;
  }
}

export function savePlacements(placements: RoulettePlacements): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(placements));
  } catch {
    // Best-effort persistence; ignore quota/serialization failures.
  }
}

export function clearPlacements(): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
