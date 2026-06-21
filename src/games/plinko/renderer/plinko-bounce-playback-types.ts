import type { PlinkoBucketImpact } from "../lib/plinko-motion-plan";
import type {
  PlinkoBoardGeometryMetrics,
  PlinkoPegGeometry,
  PlinkoPoint,
} from "../lib/plinko-path";

export interface PlinkoBounceContact {
  directionChange: number;
  id: string;
  impactStrength: number;
  incomingVelocity: PlinkoPoint;
  isGlancing: boolean;
  microStallMs: number | null;
  normal: PlinkoPoint;
  outgoingVelocity: PlinkoPoint;
  peg: PlinkoPegGeometry;
  point: PlinkoPoint;
  pulseDurationMs: number;
  pulseRadius: number;
  relativeNormalSpeed: number;
  responseDurationMs: number;
  responseScale: number;
  side: "left" | "right";
  timeMs: number;
}

export interface PlinkoBounceTrajectorySample extends PlinkoPoint {
  timeMs: number;
  velocity: PlinkoPoint;
}

export type PlinkoBounceEnvelopeStage =
  | "active-playfield"
  | "pocket-floor"
  | "spawn-entry";

export type PlinkoBounceEnvelopeEscapeSide =
  | "bottom"
  | "left"
  | "pocket-floor-mismatch"
  | "right"
  | "top";

export interface PlinkoBounceEnvelopeBounds {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface PlinkoBounceEnvelopeDiagnostics {
  activePlayfield: PlinkoBounceEnvelopeBounds;
  activePlayfieldEntryY: number;
  pocketFloor: PlinkoBounceEnvelopeBounds;
  spawnEntry: PlinkoBounceEnvelopeBounds;
}

export interface PlinkoBounceEnvelopeEscape {
  candidateIndex: number;
  point: PlinkoPoint;
  sampleIndex: number;
  side: PlinkoBounceEnvelopeEscapeSide;
  spawnPosition: PlinkoPoint;
  stage: PlinkoBounceEnvelopeStage;
  timeMs: number;
}

export type PlinkoBounceCandidateFailureReason =
  | "no-pocket-settle"
  | "no-valid-candidate"
  | "out-of-bounds"
  | "simulation-error"
  | "target-bucket-missing"
  | "target-pocket-did-not-stabilize"
  | "timeout-or-sample-cap"
  | "wrong-pocket";

export type PlinkoBounceCandidateBatch = "fallback" | "target-aware";

export interface PlinkoBounceCandidateRejectionCounts {
  noPocketSettle: number;
  outOfBounds: number;
  simulationError: number;
  targetEnteredNoStableSettle: number;
  timeoutOrSampleCap: number;
  wrongPocket: number;
}

export interface PlinkoBounceTrajectoryExtrema {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
  touchedEnvelopeBoundary: boolean;
}

export type PlinkoBounceTimeoutKind = "duration" | "sample-cap";

export interface PlinkoBounceCandidateTimeoutDiagnostics {
  candidateIndex: number;
  enteredAnyPocket: boolean;
  enteredTargetPocket: boolean;
  exitedTargetPocket: boolean;
  finalPocketIndex: number | null;
  finalPosition: PlinkoPoint;
  finalSpeed: number;
  finalVelocity: PlinkoPoint;
  lastKnownBucketIndex: number;
  lastPocketIndex: number | null;
  lowVelocityOutsideSettleDepth: boolean;
  maxDurationMs: number;
  maxSamples: number;
  qualityScore: number;
  remainedAbovePocketZone: boolean;
  sampleCount: number;
  settleDurationMs: number;
  settleSamples: number;
  timedOutBy: PlinkoBounceTimeoutKind;
  trajectoryExtrema: PlinkoBounceTrajectoryExtrema;
}

export interface PlinkoBounceCandidateDiagnostics {
  attempted: number;
  bestRejectedFinalBucket: number | null;
  bestRejectedIndex: number | null;
  bestRejectedScore: number | null;
  bestRejectedTargetDistanceLanes: number | null;
  bestRejectedTrajectoryExtrema: PlinkoBounceTrajectoryExtrema | null;
  envelope: PlinkoBounceEnvelopeDiagnostics;
  fallbackBatchAttempts: number;
  fallbackBatchSimulationMs: number | null;
  fallbackBatchUsed: boolean;
  failureReason: PlinkoBounceCandidateFailureReason | null;
  firstCandidateSpawnPosition: PlinkoPoint | null;
  firstEnvelopeEscape: PlinkoBounceEnvelopeEscape | null;
  firstTimeoutCandidate: PlinkoBounceCandidateTimeoutDiagnostics | null;
  noValidCandidate: boolean;
  rejections: PlinkoBounceCandidateRejectionCounts;
  selectedBatch: PlinkoBounceCandidateBatch | null;
  selectedBatchIndex: number | null;
  selectedIndex: number | null;
  selectedScore: number | null;
  selectedTrajectoryExtrema: PlinkoBounceTrajectoryExtrema | null;
  bestTimeoutCandidate: PlinkoBounceCandidateTimeoutDiagnostics | null;
  targetAwareBatchAttempts: number;
  targetAwareBatchFoundValid: boolean;
  targetAwareBatchSimulationMs: number;
  totalSimulationMs: number;
  valid: number;
}

export interface PlinkoBounceSettleDiagnostics {
  enteredTargetPocket: boolean;
  physicallySettledBucket: number | null;
  settleDurationMs: number;
  settleSamples: number;
}

export interface PlinkoBounceTrajectoryResult {
  bucketImpact: PlinkoBucketImpact | null;
  bucketIndex: number;
  candidateDiagnostics: PlinkoBounceCandidateDiagnostics;
  contacts: PlinkoBounceContact[];
  durationMs: number;
  fallbackReason: PlinkoBounceCandidateFailureReason | null;
  geometryMetrics: PlinkoBoardGeometryMetrics;
  samples: PlinkoBounceTrajectorySample[];
  settleDiagnostics: PlinkoBounceSettleDiagnostics;
  valid: boolean;
}
