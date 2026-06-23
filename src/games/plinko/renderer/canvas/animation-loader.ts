import type { PlinkoRows } from "../../config";
import type {
  PlinkoAnimationLibrary,
  PlinkoAnimationPath,
  PlinkoAnimationPoint,
} from "./types";

export const PLINKO_ANIMATION_FILES: Record<PlinkoRows, string> = {
  8: "eight-rows-animation.json",
  9: "nine-rows-animation.json",
  10: "ten-rows-animation.json",
  11: "eleven-rows-animation.json",
  12: "twelve-rows-animation.json",
  13: "thirteen-rows-animation.json",
  14: "fourteen-rows-animation.json",
};

export class PlinkoAnimationAssetError extends Error {
  constructor(
    readonly code: "canvas-animation-load-failed" | "canvas-animation-parse-failed",
    message: string,
  ) {
    super(message);
    this.name = "PlinkoAnimationAssetError";
  }
}

const libraryCache = new Map<PlinkoRows, Promise<PlinkoAnimationLibrary>>();

export function loadPlinkoAnimationLibrary(rowsCount: PlinkoRows) {
  const cached = libraryCache.get(rowsCount);

  if (cached) {
    return cached;
  }

  const loading = fetchPlinkoAnimationLibrary(rowsCount).catch((error) => {
    libraryCache.delete(rowsCount);
    throw error;
  });

  libraryCache.set(rowsCount, loading);
  return loading;
}

export function preloadPlinkoAnimationLibrary(rowsCount: PlinkoRows) {
  return loadPlinkoAnimationLibrary(rowsCount);
}

async function fetchPlinkoAnimationLibrary(rowsCount: PlinkoRows) {
  const response = await fetch(
    `/animations/plinko/${PLINKO_ANIMATION_FILES[rowsCount]}`,
  );

  if (!response.ok) {
    throw new PlinkoAnimationAssetError(
      "canvas-animation-load-failed",
      `Plinko animation asset for ${rowsCount} rows was unavailable.`,
    );
  }

  let outerPayload: unknown;

  try {
    outerPayload = await response.json();
  } catch {
    throw new PlinkoAnimationAssetError(
      "canvas-animation-parse-failed",
      `Plinko animation asset for ${rowsCount} rows was not JSON.`,
    );
  }

  if (typeof outerPayload !== "string") {
    throw new PlinkoAnimationAssetError(
      "canvas-animation-parse-failed",
      `Plinko animation asset for ${rowsCount} rows was not double-encoded.`,
    );
  }

  try {
    return parsePlinkoAnimationLibrary(JSON.parse(outerPayload), rowsCount);
  } catch (error) {
    if (error instanceof PlinkoAnimationAssetError) {
      throw error;
    }

    throw new PlinkoAnimationAssetError(
      "canvas-animation-parse-failed",
      `Plinko animation asset for ${rowsCount} rows had an invalid shape.`,
    );
  }
}

function parsePlinkoAnimationLibrary(
  value: unknown,
  rowsCount: PlinkoRows,
): PlinkoAnimationLibrary {
  if (!isRecord(value)) {
    throw new PlinkoAnimationAssetError(
      "canvas-animation-parse-failed",
      "Plinko animation library was not an object.",
    );
  }

  const rows = value[String(rowsCount)];

  if (!isRecord(rows)) {
    throw new PlinkoAnimationAssetError(
      "canvas-animation-parse-failed",
      `Plinko animation library was missing rows ${rowsCount}.`,
    );
  }

  const buckets = new Map<number, readonly PlinkoAnimationPath[]>();

  for (let bucketIndex = 0; bucketIndex <= rowsCount; bucketIndex += 1) {
    const variants = rows[String(bucketIndex)];

    if (!Array.isArray(variants) || variants.length === 0) {
      throw new PlinkoAnimationAssetError(
        "canvas-animation-parse-failed",
        `Plinko animation library was missing bucket ${bucketIndex}.`,
      );
    }

    const parsedVariants = variants.map((variant) => parsePath(variant));
    buckets.set(bucketIndex, parsedVariants);
  }

  return { buckets, rowsCount };
}

function parsePath(value: unknown): PlinkoAnimationPath {
  if (!Array.isArray(value) || value.length === 0) {
    throw new PlinkoAnimationAssetError(
      "canvas-animation-parse-failed",
      "Plinko animation trajectory was empty.",
    );
  }

  return value.map((point) => {
    if (!isRecord(point) || !isFiniteNumber(point.x) || !isFiniteNumber(point.y)) {
      throw new PlinkoAnimationAssetError(
        "canvas-animation-parse-failed",
        "Plinko animation trajectory had an invalid point.",
      );
    }

    return { x: point.x, y: point.y } satisfies PlinkoAnimationPoint;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
