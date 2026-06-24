import type { PlinkoRendererRound } from "../plinko-renderer-types";
import type {
  CanvasPlaybackFailureReason,
  CanvasPlaybackSelection,
  CanvasTrajectorySelection,
  PlinkoAnimationLibrary,
} from "./types";

export function selectCanvasTrajectory({
  library,
  round,
  turboEnabled,
}: {
  library: PlinkoAnimationLibrary;
  round: PlinkoRendererRound;
  turboEnabled: boolean;
}): CanvasTrajectorySelection {
  const { result } = round;
  const pathIsValid =
    result.results.length === result.rowsCount &&
    result.results.every((step) => step === 0 || step === 1);
  const targetBucket = pathIsValid
    ? result.results.reduce<number>((sum, step) => sum + step, 0)
    : result.bucketIndex;

  if (!pathIsValid || library.rowsCount !== result.rowsCount) {
    return failure({
      failureReason: "canvas-result-invalid",
      round,
      targetBucket,
      turboEnabled,
    });
  }

  if (targetBucket !== result.bucketIndex) {
    return failure({
      failureReason: "canvas-bucket-mismatch",
      round,
      targetBucket,
      turboEnabled,
    });
  }

  const variants = library.buckets.get(targetBucket);

  if (!variants || variants.length === 0) {
    return failure({
      failureReason: "canvas-trajectory-missing",
      round,
      targetBucket,
      turboEnabled,
    });
  }

  const variantIndex = hashIdentity(
    `${result.betId || round.id}:${result.rowsCount}:${targetBucket}`,
  ) % variants.length;
  const path = variants[variantIndex];

  if (!path || path.length === 0) {
    return failure({
      failureReason: "canvas-trajectory-missing",
      round,
      targetBucket,
      turboEnabled,
    });
  }

  return {
    kind: "success",
    path,
    selection: {
      animationStatus: "canvas-ready",
      failureReason: null,
      pathLength: path.length,
      pathValid: true,
      risk: result.risk,
      rowsCount: result.rowsCount,
      source: "canvas-json",
      targetBucket,
      turboEnabled,
      variantIndex,
    },
  };
}

function failure({
  failureReason,
  round,
  targetBucket,
  turboEnabled,
}: {
  failureReason: CanvasPlaybackFailureReason;
  round: PlinkoRendererRound;
  targetBucket: number;
  turboEnabled: boolean;
}): CanvasTrajectorySelection {
  const selection: CanvasPlaybackSelection = {
    animationStatus: "canvas-invalid",
    failureReason,
    pathLength: 0,
    pathValid: false,
    risk: round.result.risk,
    rowsCount: round.result.rowsCount,
    source: "canvas-json",
    targetBucket,
    turboEnabled,
    variantIndex: null,
  };

  return { kind: "failure", selection };
}

function hashIdentity(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }

  return hash >>> 0;
}
