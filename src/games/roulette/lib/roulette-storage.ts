import type { RouletteBetColor } from "../config/roulette-defaults";
import type {
  ColumnBetKey,
  DozenBetKey,
  HalfBetKey,
  ParityBetKey,
  PlacedBetEntry,
} from "../model/roulette-types";
import { isValidMoney } from "./roulette-decimal";
import {
  EMPTY_PLACEMENTS,
  isStraightNumber,
  type RoulettePlacements,
} from "./roulette-bets";

// Persistence layer ONLY. The Zustand store is the runtime source of truth;
// this module just mirrors placements and the undo stack to localStorage and
// rehydrates them. Bet `params` are always built from the store, never here.

const STORAGE_KEY = "roulette:bets:v1";
const STACK_KEY = "roulette:bets:stack:v1";

const VALID_CATEGORIES = new Set([
  "straight",
  "color",
  "dozen",
  "column",
  "parity",
  "half",
]);

function parseStack(raw: string): PlacedBetEntry[] {
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    return [];
  }

  const result: PlacedBetEntry[] = [];

  for (const item of parsed) {
    if (
      typeof item !== "object" ||
      item === null ||
      Array.isArray(item) ||
      !VALID_CATEGORIES.has(item.category) ||
      typeof item.key !== "string" ||
      item.key === "" ||
      typeof item.amount !== "number" ||
      !Number.isFinite(item.amount) ||
      item.amount <= 0
    ) {
      return [];
    }

    result.push({
      category: item.category as PlacedBetEntry["category"],
      key: item.key,
      amount: item.amount,
    });
  }

  return result;
}

export function loadStack(): PlacedBetEntry[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(STACK_KEY);
    return raw ? parseStack(raw) : [];
  } catch {
    return [];
  }
}

export function saveStack(stack: PlacedBetEntry[]): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(STACK_KEY, JSON.stringify(stack));
  } catch {
    // Best-effort persistence; ignore quota/serialization failures.
  }
}

export function clearStack(): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STACK_KEY);
  } catch {
    // Ignore.
  }
}

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
  const dozen: Partial<Record<DozenBetKey, string>> = {};
  const column: Partial<Record<ColumnBetKey, string>> = {};
  const parity: Partial<Record<ParityBetKey, string>> = {};
  const half: Partial<Record<HalfBetKey, string>> = {};

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

  if (isPlainObject(parsed.dozen)) {
    for (const key of ["FIRST", "SECOND", "THIRD"] as DozenBetKey[]) {
      const amount = parsed.dozen[key];

      if (typeof amount === "string" && isValidMoney(amount)) {
        dozen[key] = amount;
      }
    }
  }

  if (isPlainObject(parsed.column)) {
    for (const key of ["TOP", "MIDDLE", "BOTTOM"] as ColumnBetKey[]) {
      const amount = parsed.column[key];

      if (typeof amount === "string" && isValidMoney(amount)) {
        column[key] = amount;
      }
    }
  }

  if (isPlainObject(parsed.parity)) {
    for (const key of ["EVEN", "ODD"] as ParityBetKey[]) {
      const amount = parsed.parity[key];

      if (typeof amount === "string" && isValidMoney(amount)) {
        parity[key] = amount;
      }
    }
  }

  if (isPlainObject(parsed.half)) {
    for (const key of ["LOW", "HIGH"] as HalfBetKey[]) {
      const amount = parsed.half[key];

      if (typeof amount === "string" && isValidMoney(amount)) {
        half[key] = amount;
      }
    }
  }

  return { straight, color, dozen, column, parity, half };
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
