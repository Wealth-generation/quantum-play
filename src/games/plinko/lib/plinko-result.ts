import {
  getPlinkoMultiplier,
  isPlinkoRows,
  type PlinkoRisk,
  type PlinkoRows,
} from "../config";
import type {
  PlinkoPathStep,
  PlinkoResultContractWarning,
} from "../model";

const MULTIPLIER_EPSILON = 0.000000001;

interface PlinkoResultContractInput {
  multiplier: number;
  results: readonly number[];
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
}

export interface PlinkoResultContractCheck {
  bucketIndex: number;
  expectedMultiplier: number | null;
  path: PlinkoPathStep[];
  warnings: PlinkoResultContractWarning[];
}

function multiplierMatches(expected: number, actual: number) {
  return Math.abs(expected - actual) <= MULTIPLIER_EPSILON;
}

export function toPlinkoPathStep(value: number): PlinkoPathStep | null {
  return value === 0 || value === 1 ? value : null;
}

export function getPlinkoBucketIndex(
  results: readonly PlinkoPathStep[],
): number {
  return results.reduce<number>((sum, step) => sum + step, 0);
}

export function checkPlinkoResultContract({
  multiplier,
  results,
  risk,
  rowsCount,
}: PlinkoResultContractInput): PlinkoResultContractCheck {
  const warnings: PlinkoResultContractWarning[] = [];
  const path: PlinkoPathStep[] = [];

  if (results.length !== rowsCount) {
    warnings.push({
      code: "RESULT_LENGTH_MISMATCH",
      message: `Plinko result length ${results.length} does not match rowsCount ${rowsCount}.`,
    });
  }

  for (const [index, value] of results.entries()) {
    const step = toPlinkoPathStep(value);

    if (step === null) {
      warnings.push({
        code: "INVALID_PATH_STEP",
        message: `Plinko result step at index ${index} was ${String(value)} instead of 0 or 1.`,
      });
      continue;
    }

    path.push(step);
  }

  const bucketIndex = getPlinkoBucketIndex(path);
  const expectedMultiplier = isPlinkoRows(rowsCount)
    ? getPlinkoMultiplier(risk, rowsCount, bucketIndex)
    : null;

  if (expectedMultiplier === null) {
    warnings.push({
      code: "BUCKET_OUT_OF_RANGE",
      message: `Plinko bucket index ${bucketIndex} is outside the multiplier table for ${risk}/${rowsCount}.`,
    });
  } else if (!multiplierMatches(expectedMultiplier, multiplier)) {
    warnings.push({
      code: "MULTIPLIER_MISMATCH",
      message: `Backend multiplier ${multiplier} does not match local ${risk}/${rowsCount} bucket ${bucketIndex} multiplier ${expectedMultiplier}.`,
    });
  }

  return {
    bucketIndex,
    expectedMultiplier,
    path,
    warnings,
  };
}
