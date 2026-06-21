import type {
  PlinkoRendererRound,
  PlinkoVisualTarget,
} from "./plinko-renderer-types";

export function createPlinkoVisualTarget(
  round: PlinkoRendererRound,
): PlinkoVisualTarget {
  const { id: roundId, result } = round;
  const targetBucketIndex = result.results.reduce<number>(
    (bucketIndex, step) => bucketIndex + step,
    0,
  );

  return {
    betId: result.betId,
    risk: result.risk,
    roundId,
    rowsCount: result.rowsCount,
    targetBucketIndex,
    visualSeed: createVisualSeed(
      `${roundId}:${result.betId}:${result.rowsCount}:${result.risk}:${targetBucketIndex}`,
    ),
  };
}

function createVisualSeed(identity: string) {
  let hash = 2166136261;

  for (let index = 0; index < identity.length; index += 1) {
    hash = Math.imul(hash ^ identity.charCodeAt(index), 16777619);
  }

  return hash >>> 0;
}
