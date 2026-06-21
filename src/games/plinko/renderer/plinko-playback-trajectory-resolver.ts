import {
  getPlinkoBoardGeometryMetrics,
  type PlinkoBoardGeometry,
} from "../lib/plinko-path";
import { buildMatterPlinkoBounceTrajectory } from "./matter-plinko-bounce-trajectory";
import type {
  PlinkoBounceCandidateBatch,
  PlinkoBounceCandidateRejectionCounts,
  PlinkoBounceCandidateFailureReason,
  PlinkoBounceCandidateTimeoutDiagnostics,
  PlinkoBounceEnvelopeDiagnostics,
  PlinkoBounceEnvelopeEscape,
  PlinkoBounceTrajectoryExtrema,
  PlinkoBounceTrajectoryResult,
} from "./plinko-bounce-playback-types";
import { getPlinkoPlaybackProfile } from "./plinko-playback-profile";
import type { PlinkoRendererRound } from "./plinko-renderer-types";
import { createPlinkoVisualTarget } from "./plinko-visual-target";

export type PlinkoPlaybackTrajectorySource =
  | "no-valid-production-animation"
  | "production-bounce-core";

export type PlinkoProductionAnimationStatus =
  | "production-error"
  | "production-no-valid-candidate"
  | "production-no-valid-settle"
  | "production-valid";

export interface PlinkoPlaybackSourceSelection {
  animationStatus: PlinkoProductionAnimationStatus;
  candidateAttempts: number | null;
  candidateBestRejectedFinalBucket: number | null;
  candidateBestRejectedIndex: number | null;
  candidateBestRejectedScore: number | null;
  candidateBestRejectedTargetDistanceLanes: number | null;
  candidateBestRejectedTrajectoryExtrema: PlinkoBounceTrajectoryExtrema | null;
  candidateBestTimeoutCandidate: PlinkoBounceCandidateTimeoutDiagnostics | null;
  candidateEnvelope: PlinkoBounceEnvelopeDiagnostics | null;
  candidateFallbackBatchAttempts: number | null;
  candidateFallbackBatchSimulationMs: number | null;
  candidateFallbackBatchUsed: boolean | null;
  candidateFirstEnvelopeEscape: PlinkoBounceEnvelopeEscape | null;
  candidateFirstSpawnPosition: { x: number; y: number } | null;
  candidateFirstTimeoutCandidate: PlinkoBounceCandidateTimeoutDiagnostics | null;
  candidateRejections: PlinkoBounceCandidateRejectionCounts | null;
  candidateSelectedBatch: PlinkoBounceCandidateBatch | null;
  candidateSelectedBatchIndex: number | null;
  candidateSelectedIndex: number | null;
  candidateSelectedScore: number | null;
  candidateSelectedTrajectoryExtrema: PlinkoBounceTrajectoryExtrema | null;
  candidateTargetAwareBatchAttempts: number | null;
  candidateTargetAwareBatchFoundValid: boolean | null;
  candidateTargetAwareBatchSimulationMs: number | null;
  candidateTotalSimulationMs: number | null;
  candidateValid: number | null;
  failureReason: PlinkoBounceCandidateFailureReason | null;
  geometry: ReturnType<typeof getPlinkoBoardGeometryMetrics>;
  physicallySettledBucket: number | null;
  risk: PlinkoRendererRound["result"]["risk"];
  rowsCount: PlinkoRendererRound["result"]["rowsCount"];
  settleDurationMs: number | null;
  settleSamples: number | null;
  source: PlinkoPlaybackTrajectorySource;
  targetBucket: number;
  turboEnabled: boolean;
}

export interface ResolvePlinkoPlaybackTrajectoryInput {
  geometry: PlinkoBoardGeometry;
  round: PlinkoRendererRound;
  turboEnabled?: boolean;
}

export type PlinkoPlaybackTrajectoryResolution =
  | {
      kind: "production-bounce-core";
      selection: PlinkoPlaybackSourceSelection;
      trajectory: PlinkoBounceTrajectoryResult;
    }
  | {
      kind: "no-valid-production-animation";
      selection: PlinkoPlaybackSourceSelection;
    };

/**
 * Resolves the only normal-runtime visual path. A failed candidate search is
 * intentionally observable; it never delegates to the rejected route core.
 */
export async function resolvePlinkoPlaybackTrajectory({
  geometry,
  round,
  turboEnabled = false,
}: ResolvePlinkoPlaybackTrajectoryInput): Promise<PlinkoPlaybackTrajectoryResolution> {
  const target = createPlinkoVisualTarget(round);
  const fallbackGeometry = getPlinkoBoardGeometryMetrics(geometry);

  try {
    const trajectory = await buildMatterPlinkoBounceTrajectory({
      geometry,
      profile: getPlinkoPlaybackProfile(turboEnabled),
      target,
    });
    const selection = createSelection({
      geometry: trajectory.geometryMetrics,
      round,
      source: trajectory.valid
        ? "production-bounce-core"
        : "no-valid-production-animation",
      targetBucket: target.targetBucketIndex,
      trajectory,
      turboEnabled,
    });

    if (
      !trajectory.valid ||
      !trajectory.bucketImpact ||
      trajectory.settleDiagnostics.physicallySettledBucket !==
        target.targetBucketIndex
    ) {
      return {
        kind: "no-valid-production-animation",
        selection,
      };
    }

    return {
      kind: "production-bounce-core",
      selection,
      trajectory,
    };
  } catch {
    return {
      kind: "no-valid-production-animation",
      selection: {
        animationStatus: "production-error",
        candidateAttempts: 0,
        candidateBestRejectedFinalBucket: null,
        candidateBestRejectedIndex: null,
        candidateBestRejectedScore: null,
        candidateBestRejectedTargetDistanceLanes: null,
        candidateBestRejectedTrajectoryExtrema: null,
        candidateBestTimeoutCandidate: null,
        candidateEnvelope: null,
        candidateFallbackBatchAttempts: 0,
        candidateFallbackBatchSimulationMs: null,
        candidateFallbackBatchUsed: false,
        candidateFirstEnvelopeEscape: null,
        candidateFirstSpawnPosition: null,
        candidateFirstTimeoutCandidate: null,
        candidateRejections: {
          noPocketSettle: 0,
          outOfBounds: 0,
          simulationError: 1,
          targetEnteredNoStableSettle: 0,
          timeoutOrSampleCap: 0,
          wrongPocket: 0,
        },
        candidateSelectedBatch: null,
        candidateSelectedBatchIndex: null,
        candidateSelectedIndex: null,
        candidateSelectedScore: null,
        candidateSelectedTrajectoryExtrema: null,
        candidateTargetAwareBatchAttempts: 0,
        candidateTargetAwareBatchFoundValid: false,
        candidateTargetAwareBatchSimulationMs: 0,
        candidateTotalSimulationMs: 0,
        candidateValid: 0,
        failureReason: "simulation-error",
        geometry: fallbackGeometry,
        physicallySettledBucket: null,
        risk: round.result.risk,
        rowsCount: round.result.rowsCount,
        settleDurationMs: null,
        settleSamples: null,
        source: "no-valid-production-animation",
        targetBucket: target.targetBucketIndex,
        turboEnabled,
      },
    };
  }
}

function createSelection({
  geometry,
  round,
  source,
  targetBucket,
  trajectory,
  turboEnabled,
}: {
  geometry: ReturnType<typeof getPlinkoBoardGeometryMetrics>;
  round: PlinkoRendererRound;
  source: PlinkoPlaybackTrajectorySource;
  targetBucket: number;
  trajectory: PlinkoBounceTrajectoryResult;
  turboEnabled: boolean;
}): PlinkoPlaybackSourceSelection {
  const settledBucket = trajectory.settleDiagnostics.physicallySettledBucket;
  const isValid =
    trajectory.valid &&
    settledBucket === targetBucket &&
    trajectory.bucketImpact?.bucketIndex === targetBucket;

  return {
    animationStatus: isValid
      ? "production-valid"
      : settledBucket === null
        ? "production-no-valid-settle"
        : "production-no-valid-candidate",
    candidateAttempts: trajectory.candidateDiagnostics.attempted,
    candidateBestRejectedFinalBucket:
      trajectory.candidateDiagnostics.bestRejectedFinalBucket,
    candidateBestRejectedIndex:
      trajectory.candidateDiagnostics.bestRejectedIndex,
    candidateBestRejectedScore:
      trajectory.candidateDiagnostics.bestRejectedScore,
    candidateBestRejectedTargetDistanceLanes:
      trajectory.candidateDiagnostics.bestRejectedTargetDistanceLanes,
    candidateBestRejectedTrajectoryExtrema:
      trajectory.candidateDiagnostics.bestRejectedTrajectoryExtrema,
    candidateBestTimeoutCandidate:
      trajectory.candidateDiagnostics.bestTimeoutCandidate,
    candidateEnvelope: trajectory.candidateDiagnostics.envelope,
    candidateFallbackBatchAttempts:
      trajectory.candidateDiagnostics.fallbackBatchAttempts,
    candidateFallbackBatchSimulationMs:
      trajectory.candidateDiagnostics.fallbackBatchSimulationMs,
    candidateFallbackBatchUsed:
      trajectory.candidateDiagnostics.fallbackBatchUsed,
    candidateFirstEnvelopeEscape:
      trajectory.candidateDiagnostics.firstEnvelopeEscape,
    candidateFirstSpawnPosition:
      trajectory.candidateDiagnostics.firstCandidateSpawnPosition,
    candidateFirstTimeoutCandidate:
      trajectory.candidateDiagnostics.firstTimeoutCandidate,
    candidateRejections: trajectory.candidateDiagnostics.rejections,
    candidateSelectedBatch: trajectory.candidateDiagnostics.selectedBatch,
    candidateSelectedBatchIndex:
      trajectory.candidateDiagnostics.selectedBatchIndex,
    candidateSelectedIndex: trajectory.candidateDiagnostics.selectedIndex,
    candidateSelectedScore: trajectory.candidateDiagnostics.selectedScore,
    candidateSelectedTrajectoryExtrema:
      trajectory.candidateDiagnostics.selectedTrajectoryExtrema,
    candidateTargetAwareBatchAttempts:
      trajectory.candidateDiagnostics.targetAwareBatchAttempts,
    candidateTargetAwareBatchFoundValid:
      trajectory.candidateDiagnostics.targetAwareBatchFoundValid,
    candidateTargetAwareBatchSimulationMs:
      trajectory.candidateDiagnostics.targetAwareBatchSimulationMs,
    candidateTotalSimulationMs:
      trajectory.candidateDiagnostics.totalSimulationMs,
    candidateValid: trajectory.candidateDiagnostics.valid,
    failureReason:
      trajectory.candidateDiagnostics.failureReason ?? trajectory.fallbackReason,
    geometry,
    physicallySettledBucket: settledBucket,
    risk: round.result.risk,
    rowsCount: round.result.rowsCount,
    settleDurationMs: trajectory.settleDiagnostics.settleDurationMs,
    settleSamples: trajectory.settleDiagnostics.settleSamples,
    source,
    targetBucket,
    turboEnabled,
  };
}
