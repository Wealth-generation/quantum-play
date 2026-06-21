import type MatterNamespace from "matter-js";
import {
  getPlinkoBoardGeometryMetrics,
  type PlinkoBoardGeometry,
  type PlinkoPoint,
} from "../lib/plinko-path";
import type { PlinkoPlaybackProfile } from "./plinko-playback-profile";
import type { PlinkoVisualTarget } from "./plinko-renderer-types";
import type {
  PlinkoBounceCandidateBatch,
  PlinkoBounceCandidateFailureReason,
  PlinkoBounceCandidateDiagnostics,
  PlinkoBounceCandidateRejectionCounts,
  PlinkoBounceContact,
  PlinkoBounceCandidateTimeoutDiagnostics,
  PlinkoBounceEnvelopeBounds,
  PlinkoBounceEnvelopeDiagnostics,
  PlinkoBounceEnvelopeEscape,
  PlinkoBounceEnvelopeEscapeSide,
  PlinkoBounceEnvelopeStage,
  PlinkoBounceSettleDiagnostics,
  PlinkoBounceTrajectoryResult,
  PlinkoBounceTrajectorySample,
  PlinkoBounceTrajectoryExtrema,
  PlinkoBounceTimeoutKind,
} from "./plinko-bounce-playback-types";

export interface BuildMatterPlinkoBounceTrajectoryInput {
  geometry: PlinkoBoardGeometry;
  profile: PlinkoPlaybackProfile;
  target: PlinkoVisualTarget;
}

type MatterApi = typeof MatterNamespace;
type MatterBody = MatterNamespace.Body;

interface BounceCandidate {
  batch: PlinkoBounceCandidateBatch;
  batchIndex: number;
  launchOffsetX: number;
  launchVelocityX: number;
  launchVelocityY: number;
}

interface BounceCandidateBatch {
  candidates: readonly BounceCandidate[];
  kind: PlinkoBounceCandidateBatch;
}

interface BounceCandidateResult {
  bucketImpact: PlinkoBounceTrajectoryResult["bucketImpact"];
  contacts: PlinkoBounceContact[];
  envelopeEscape: PlinkoBounceEnvelopeEscape | null;
  escapedEnvelope: boolean;
  finalBucketIndex: number;
  failureReason: PlinkoBounceCandidateFailureReason | null;
  qualityScore: number;
  samples: PlinkoBounceTrajectorySample[];
  settleDiagnostics: PlinkoBounceSettleDiagnostics;
  spawnPosition: PlinkoPoint;
  timedOutOrSampleCapped: boolean;
  timeoutDiagnostics: PlinkoBounceCandidateTimeoutDiagnostics | null;
  targetDistanceLanes: number | null;
  trajectoryExtrema: PlinkoBounceTrajectoryExtrema;
}

interface PlinkoDrawableEnvelope {
  activePlayfield: PlinkoBounceEnvelopeBounds;
  activePlayfieldEntryY: number;
  pocketFloor: PlinkoBounceEnvelopeBounds;
  spawnCorridor: PlinkoBounceEnvelopeBounds;
  spawnEntry: PlinkoBounceEnvelopeBounds;
}

interface BounceResponse {
  airFriction: number;
  maxContacts: number;
  microStallMs: number;
  pegResponseDurationMs: number;
  pegResponseScale: number;
  pulseDurationMs: number;
  terminalSpeedLanes: number;
}

const FIXED_STEP_MS = 1000 / 60;
const CANDIDATE_COUNT = 17;
const TARGET_AWARE_CANDIDATE_COUNT = 8;
const FALLBACK_CANDIDATE_COUNT =
  CANDIDATE_COUNT - TARGET_AWARE_CANDIDATE_COUNT;
const MAX_SAMPLES = 480;
const LAUNCH_OFFSET_LANES = 1.6;
const LAUNCH_VELOCITY_LANES = 0.44;
const PEG_RESTITUTION = 0.68;
const BOUNCE_RESPONSE: Record<
  "production",
  BounceResponse
> = {
  production: {
    airFriction: 0.0032,
    maxContacts: 52,
    microStallMs: 72,
    pegResponseDurationMs: 184,
    pegResponseScale: 0.32,
    pulseDurationMs: 178,
    terminalSpeedLanes: 1.46,
  },
};

export async function buildMatterPlinkoBounceTrajectory({
  geometry,
  profile,
  target,
}: BuildMatterPlinkoBounceTrajectoryInput): Promise<PlinkoBounceTrajectoryResult> {
  const targetBucket = geometry.buckets[target.targetBucketIndex];
  const envelope = createDrawableEnvelope(geometry);
  const diagnostics: PlinkoBounceCandidateDiagnostics = {
    attempted: 0,
    bestRejectedFinalBucket: null,
    bestRejectedIndex: null,
    bestRejectedScore: null,
    bestRejectedTargetDistanceLanes: null,
    bestRejectedTrajectoryExtrema: null,
    envelope: toEnvelopeDiagnostics(envelope),
    fallbackBatchAttempts: 0,
    fallbackBatchSimulationMs: null,
    fallbackBatchUsed: false,
    failureReason: null,
    firstCandidateSpawnPosition: null,
    firstEnvelopeEscape: null,
    firstTimeoutCandidate: null,
    noValidCandidate: false,
    rejections: createCandidateRejectionCounts(),
    selectedBatch: null,
    selectedBatchIndex: null,
    selectedIndex: null,
    selectedScore: null,
    selectedTrajectoryExtrema: null,
    bestTimeoutCandidate: null,
    targetAwareBatchAttempts: 0,
    targetAwareBatchFoundValid: false,
    targetAwareBatchSimulationMs: 0,
    totalSimulationMs: 0,
    valid: 0,
  };

  if (!targetBucket) {
    diagnostics.failureReason = "target-bucket-missing";
    diagnostics.noValidCandidate = true;
    return createInvalidResult(
      target.targetBucketIndex,
      "target-bucket-missing",
      diagnostics,
      geometry,
    );
  }

  const Matter = await loadMatter();
  const candidateBatches = createBounceCandidateBatches(
    target.visualSeed,
    geometry,
    target.targetBucketIndex,
  );
  let selected:
    | {
        candidate: BounceCandidate;
        candidateIndex: number;
        result: BounceCandidateResult;
      }
    | undefined;
  const simulationStartedAt = getSimulationTimestamp();

  for (const batch of candidateBatches) {
    if (batch.kind === "fallback") {
      diagnostics.fallbackBatchUsed = true;
    }

    const batchStartedAt = getSimulationTimestamp();

    for (const candidate of batch.candidates) {
      const candidateIndex = diagnostics.attempted;
      diagnostics.attempted += 1;

      if (batch.kind === "target-aware") {
        diagnostics.targetAwareBatchAttempts += 1;
      } else {
        diagnostics.fallbackBatchAttempts += 1;
      }

      let result: BounceCandidateResult;

      try {
        result = simulateBounceCandidate({
          Matter,
          candidate,
          candidateIndex,
          envelope,
          geometry,
          profile,
          targetBucketIndex: target.targetBucketIndex,
        });
      } catch {
        diagnostics.rejections.simulationError += 1;
        continue;
      }

      diagnostics.firstCandidateSpawnPosition ??= result.spawnPosition;

      if (
        result.bucketImpact &&
        result.settleDiagnostics.physicallySettledBucket ===
          target.targetBucketIndex
      ) {
        diagnostics.valid += 1;
        selected = { candidate, candidateIndex, result };
        break;
      }

      recordCandidateRejection(diagnostics.rejections, result.failureReason);
      recordRejectedCandidateDiagnostics(diagnostics, result, candidateIndex);
    }

    const batchSimulationMs = roundSimulationDuration(
      getSimulationTimestamp() - batchStartedAt,
    );

    if (batch.kind === "target-aware") {
      diagnostics.targetAwareBatchSimulationMs = batchSimulationMs;
      diagnostics.targetAwareBatchFoundValid = selected !== undefined;
    } else {
      diagnostics.fallbackBatchSimulationMs = batchSimulationMs;
    }

    if (selected) {
      break;
    }
  }

  diagnostics.totalSimulationMs = roundSimulationDuration(
    getSimulationTimestamp() - simulationStartedAt,
  );

  if (!selected) {
    diagnostics.noValidCandidate = true;
    diagnostics.failureReason = getAggregateFailureReason(
      diagnostics.rejections,
    );
    return createInvalidResult(
      target.targetBucketIndex,
      diagnostics.failureReason,
      diagnostics,
      geometry,
    );
  }

  diagnostics.selectedBatch = selected.candidate.batch;
  diagnostics.selectedBatchIndex = selected.candidate.batchIndex;
  diagnostics.selectedIndex = selected.candidateIndex;
  diagnostics.selectedScore = selected.result.qualityScore;
  diagnostics.selectedTrajectoryExtrema = selected.result.trajectoryExtrema;

  return {
    bucketImpact: selected.result.bucketImpact,
    bucketIndex: target.targetBucketIndex,
    candidateDiagnostics: diagnostics,
    contacts: selected.result.contacts,
    durationMs: selected.result.samples.at(-1)?.timeMs ?? 0,
    fallbackReason: null,
    geometryMetrics: getPlinkoBoardGeometryMetrics(geometry),
    samples: selected.result.samples,
    settleDiagnostics: selected.result.settleDiagnostics,
    valid: true,
  };
}

function simulateBounceCandidate({
  Matter,
  candidate,
  candidateIndex,
  envelope,
  geometry,
  profile,
  targetBucketIndex,
}: {
  Matter: MatterApi;
  candidate: BounceCandidate;
  candidateIndex: number;
  envelope: PlinkoDrawableEnvelope;
  geometry: PlinkoBoardGeometry;
  profile: PlinkoPlaybackProfile;
  targetBucketIndex: number;
}): BounceCandidateResult {
  const { Bodies, Body, Composite, Engine, Events } = Matter;
  const response = BOUNCE_RESPONSE[profile.contactResponse];
  const engine = Engine.create({ enableSleeping: false });
  const contacts: PlinkoBounceContact[] = [];
  const samples: PlinkoBounceTrajectorySample[] = [];
  const seenPegContacts = new Map<string, number>();
  const spawn = getSafeSpawnPoint(geometry, candidate, envelope);
  const ball = Bodies.circle(
    spawn.x,
    spawn.y,
    geometry.ballCollisionRadius,
    {
      friction: 0.004,
      frictionAir: response.airFriction,
      label: "bounce-ball",
      restitution: PEG_RESTITUTION,
    },
  );
  let preStepVelocity = clonePoint(ball.velocity);

  engine.gravity.y = 1;
  engine.gravity.scale = 0.00122;
  Body.setVelocity(ball, {
    x: candidate.launchVelocityX,
    y: candidate.launchVelocityY,
  });
  Composite.add(engine.world, [ball, ...createStaticBoardBodies(Matter, geometry)]);

  Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      if (contacts.length >= response.maxContacts) {
        continue;
      }

      const pegBody = getPegBody(pair.bodyA, pair.bodyB);
      const pegIdentity = pegBody ? parsePegLabel(pegBody.label) : null;

      if (!pegBody || !pegIdentity) {
        continue;
      }

      const peg = geometry.pegRows[pegIdentity.row]?.[pegIdentity.index];

      if (!peg) {
        continue;
      }

      const timeMs = engine.timing.timestamp;
      const contactKey = `${pegIdentity.row}:${pegIdentity.index}`;
      const previousTime = seenPegContacts.get(contactKey) ?? -Infinity;

      if (timeMs - previousTime < 72) {
        continue;
      }

      seenPegContacts.set(contactKey, timeMs);
      const normal = getContactNormal(ball.position, peg);
      const incomingVelocity = clonePoint(preStepVelocity);
      const outgoingVelocity = clonePoint(ball.velocity);
      const incomingNormalSpeed = Math.max(0, -dot(incomingVelocity, normal));
      const outgoingNormalSpeed = Math.max(0, dot(outgoingVelocity, normal));
      const relativeNormalSpeed = incomingNormalSpeed + outgoingNormalSpeed;
      const directionChange = getDirectionChange(
        incomingVelocity,
        outgoingVelocity,
      );
      const velocityDelta = distance(incomingVelocity, outgoingVelocity);
      const impactStrength = clamp(
        (relativeNormalSpeed + velocityDelta * 0.3) /
          Math.max(geometry.laneSpacing * 0.095, 1),
        0.08,
        1,
      );
      const isGlancing =
        relativeNormalSpeed < geometry.laneSpacing * 0.045 ||
        directionChange < 0.16;
      const isLowEnergyPerch =
        profile.microStalls === "allowed" &&
        !isGlancing &&
        incomingNormalSpeed < geometry.laneSpacing * 0.035 &&
        Math.abs(outgoingVelocity.y) < geometry.laneSpacing * 0.09 &&
        contacts.filter((contact) => contact.microStallMs !== null).length < 1;

      contacts.push({
        directionChange,
        id: `bounce-${candidateIndex}-${pegIdentity.row}-${pegIdentity.index}-${Math.round(timeMs)}`,
        impactStrength,
        incomingVelocity,
        isGlancing,
        microStallMs: isLowEnergyPerch ? response.microStallMs : null,
        normal,
        outgoingVelocity,
        peg,
        point: {
          x: mix(ball.position.x, peg.x, 0.3),
          y: mix(ball.position.y, peg.y, 0.3),
        },
        pulseDurationMs: Math.round(
          response.pulseDurationMs * (0.72 + impactStrength * 0.42),
        ),
        pulseRadius: Math.min(
          geometry.pegImpactRadius,
          geometry.pegRadius * (1.24 + impactStrength * 0.46),
        ),
        relativeNormalSpeed,
        responseDurationMs: Math.round(
          response.pegResponseDurationMs * (0.72 + impactStrength * 0.38),
        ),
        responseScale:
          1 + response.pegResponseScale * (0.42 + impactStrength * 0.58),
        side: normal.x < 0 ? "left" : "right",
        timeMs: Math.round(timeMs),
      });
    }
  });

  const maxDurationMs = getSimulationDuration(geometry);
  let bucketImpact: PlinkoBounceTrajectoryResult["bucketImpact"] = null;
  let enteredAnyPocket = false;
  let finalBucketIndex = -1;
  let enteredTargetPocket = false;
  let exitedTargetPocket = false;
  let settledPocketIndex: number | null = null;
  let settleSamples = 0;
  let settleStartedAt: number | null = null;
  let settlingPocketIndex: number | null = null;
  let escapedEnvelope = false;
  let envelopeEscape: PlinkoBounceEnvelopeEscape | null = null;
  let hasEnteredActivePlayfield = false;
  let lastKnownBucketIndex = getVisualBucketIndex(geometry, ball.position.x);
  let lastPocketIndex: number | null = null;
  let timedOutOrSampleCapped = false;
  const trajectoryExtrema = createTrajectoryExtrema(ball.position);

  for (
    let elapsedMs = 0;
    elapsedMs <= maxDurationMs && samples.length < MAX_SAMPLES;
    elapsedMs += FIXED_STEP_MS
  ) {
    preStepVelocity = clonePoint(ball.velocity);
    Engine.update(engine, FIXED_STEP_MS);
    applyTerminalSpeedSafeguard(Matter, ball, geometry, response);
    const sample = {
      timeMs: Math.round(elapsedMs),
      velocity: clonePoint(ball.velocity),
      x: ball.position.x,
      y: ball.position.y,
    } satisfies PlinkoBounceTrajectorySample;
    updateTrajectoryExtrema(trajectoryExtrema, sample, envelope);

    hasEnteredActivePlayfield ||=
      sample.y >= envelope.activePlayfieldEntryY;
    envelopeEscape = getEnvelopeEscape({
      candidateIndex,
      envelope,
      hasEnteredActivePlayfield,
      sample,
      sampleIndex: samples.length,
      spawnPosition: spawn,
    });

    if (envelopeEscape) {
      escapedEnvelope = true;
      break;
    }

    samples.push(sample);
    lastKnownBucketIndex = getVisualBucketIndex(geometry, ball.position.x);

    const pocketIndex = getPocketIndex(geometry, ball);

    if (pocketIndex === null) {
      if (lastPocketIndex === targetBucketIndex) {
        exitedTargetPocket = true;
      }
      settleSamples = 0;
      settleStartedAt = null;
      settlingPocketIndex = null;
      continue;
    }

    enteredAnyPocket = true;

    if (lastPocketIndex === targetBucketIndex && pocketIndex !== targetBucketIndex) {
      exitedTargetPocket = true;
    }

    lastPocketIndex = pocketIndex;
    finalBucketIndex = pocketIndex;

    if (pocketIndex === targetBucketIndex) {
      enteredTargetPocket = true;
    }

    const isSettled =
      ball.position.y >= geometry.pocketSettleY &&
      length(ball.velocity) <= geometry.pocketSettleSpeed;

    if (!isSettled) {
      settleSamples = 0;
      settleStartedAt = null;
      settlingPocketIndex = null;
      continue;
    }

    if (settlingPocketIndex !== pocketIndex) {
      settlingPocketIndex = pocketIndex;
      settleSamples = 0;
      settleStartedAt = elapsedMs;
    }

    settleSamples += 1;

    if (settleSamples < geometry.pocketSettleSamples) {
      continue;
    }

    settledPocketIndex = pocketIndex;

    if (settledPocketIndex !== targetBucketIndex) {
      break;
    }

    const bucket = geometry.buckets[settledPocketIndex];

    if (!bucket) {
      break;
    }

    bucketImpact = {
      bucket,
      bucketIndex: settledPocketIndex,
      flashDurationMs: 200,
      impactStrength: 1,
      point: {
        x: ball.position.x,
        y: ball.position.y,
      },
      timeMs: Math.round(elapsedMs),
    };
    break;
  }

  const timedOutBy: PlinkoBounceTimeoutKind | null =
    samples.length >= MAX_SAMPLES
      ? "sample-cap"
      : engine.timing.timestamp >= maxDurationMs
        ? "duration"
        : null;
  timedOutOrSampleCapped =
    !escapedEnvelope &&
    bucketImpact === null &&
    timedOutBy !== null;

  if (!escapedEnvelope && finalBucketIndex < 0) {
    finalBucketIndex = getVisualBucketIndex(geometry, ball.position.x);
  }

  const settleDurationMs =
    settleStartedAt === null
      ? 0
      : Math.round(Math.max(0, engine.timing.timestamp - settleStartedAt));
  const finalSample = samples.at(-1) ?? null;
  const finalPocketIndex = getPocketIndex(geometry, ball);
  const timeoutDiagnostics =
    timedOutOrSampleCapped && finalSample && timedOutBy
      ? {
          candidateIndex,
          enteredAnyPocket,
          enteredTargetPocket,
          exitedTargetPocket,
          finalPocketIndex,
          finalPosition: { x: finalSample.x, y: finalSample.y },
          finalSpeed: length(finalSample.velocity),
          finalVelocity: finalSample.velocity,
          lastKnownBucketIndex,
          lastPocketIndex,
          lowVelocityOutsideSettleDepth:
            length(finalSample.velocity) <= geometry.pocketSettleSpeed &&
            finalSample.y < geometry.pocketSettleY,
          maxDurationMs,
          maxSamples: MAX_SAMPLES,
          qualityScore: scoreBounceCandidate({ contacts, geometry, samples }),
          remainedAbovePocketZone: finalSample.y < geometry.pocketEntryY,
          sampleCount: samples.length,
          settleDurationMs,
          settleSamples,
          timedOutBy,
          trajectoryExtrema,
        }
      : null;

  Composite.clear(engine.world, false, true);
  Engine.clear(engine);

  return {
    bucketImpact,
    contacts,
    envelopeEscape,
    escapedEnvelope,
    finalBucketIndex,
    failureReason: getCandidateFailureReason({
      bucketImpact,
      escapedEnvelope,
      settleDiagnostics: {
        enteredTargetPocket,
        physicallySettledBucket: settledPocketIndex,
        settleDurationMs,
        settleSamples,
      },
      timedOutOrSampleCapped,
    }),
    qualityScore: scoreBounceCandidate({ contacts, geometry, samples }),
    samples,
    settleDiagnostics: {
      enteredTargetPocket,
      physicallySettledBucket: settledPocketIndex,
      settleDurationMs,
      settleSamples,
    },
    spawnPosition: spawn,
    timedOutOrSampleCapped,
    timeoutDiagnostics,
    targetDistanceLanes:
      finalSample && !escapedEnvelope
        ? Math.abs(
            finalSample.x -
              (geometry.buckets[targetBucketIndex]?.centerX ?? finalSample.x),
          ) / Math.max(geometry.laneSpacing, 1)
        : null,
    trajectoryExtrema,
  };
}

function createBounceCandidateBatches(
  seed: number,
  geometry: PlinkoBoardGeometry,
  targetBucketIndex: number,
): readonly BounceCandidateBatch[] {
  const targetBias = getTargetLaunchBias(geometry, targetBucketIndex);

  return [
    {
      candidates: createTargetAwareBounceCandidates(
        createSeededRandom(seed),
        geometry,
        targetBias,
      ),
      kind: "target-aware",
    },
    {
      candidates: createFallbackBounceCandidates(
        createSeededRandom(seed ^ 0x9e3779b9),
        geometry,
        targetBias,
      ),
      kind: "fallback",
    },
  ];
}

function createTargetAwareBounceCandidates(
  random: () => number,
  geometry: PlinkoBoardGeometry,
  targetBias: number,
) {
  const strata = createSeededPermutation(
    TARGET_AWARE_CANDIDATE_COUNT,
    random,
  );
  const targetSpread = 0.58 - Math.abs(targetBias) * 0.14;

  return strata.map((stratum, batchIndex) => {
    const normalizedStratum = getNormalizedStratum(
      stratum,
      TARGET_AWARE_CANDIDATE_COUNT,
    );
    const offset = clamp(
      targetBias * 0.62 +
        normalizedStratum * targetSpread +
        (random() - 0.5) * 0.3,
      -1,
      1,
    );
    const launchVelocity = clamp(
      targetBias * 0.55 +
        normalizedStratum * (0.46 - Math.abs(targetBias) * 0.08) +
        (random() - 0.5) * 0.54,
      -1,
      1,
    );

    return createBounceCandidate({
      batch: "target-aware",
      batchIndex,
      geometry,
      launchVelocity,
      offset,
      random,
    });
  });
}

function createFallbackBounceCandidates(
  random: () => number,
  geometry: PlinkoBoardGeometry,
  targetBias: number,
) {
  const strata = createSeededPermutation(FALLBACK_CANDIDATE_COUNT, random);

  return strata.map((stratum, batchIndex) => {
    const normalizedStratum = getNormalizedStratum(
      stratum,
      FALLBACK_CANDIDATE_COUNT,
    );
    const offset = clamp(
      normalizedStratum * 0.64 + targetBias * 0.25 + (random() - 0.5) * 0.72,
      -1,
      1,
    );
    const launchVelocity = clamp(
      normalizedStratum * 0.28 + targetBias * 0.22 + (random() - 0.5) * 1.1,
      -1,
      1,
    );

    return createBounceCandidate({
      batch: "fallback",
      batchIndex,
      geometry,
      launchVelocity,
      offset,
      random,
    });
  });
}

function createBounceCandidate({
  batch,
  batchIndex,
  geometry,
  launchVelocity,
  offset,
  random,
}: {
  batch: PlinkoBounceCandidateBatch;
  batchIndex: number;
  geometry: PlinkoBoardGeometry;
  launchVelocity: number;
  offset: number;
  random: () => number;
}) {
  return {
    batch,
    batchIndex,
    launchOffsetX: offset * LAUNCH_OFFSET_LANES * geometry.laneSpacing,
    launchVelocityX:
      launchVelocity * LAUNCH_VELOCITY_LANES * geometry.laneSpacing,
    launchVelocityY: geometry.laneSpacing * (0.008 + random() * 0.018),
  } satisfies BounceCandidate;
}

function getTargetLaunchBias(
  geometry: PlinkoBoardGeometry,
  targetBucketIndex: number,
) {
  const targetBucket = geometry.buckets[targetBucketIndex];

  if (!targetBucket) {
    return 0;
  }

  const expectedLateralTravel = Math.max(geometry.rowsCount * 0.5, 1);

  return clamp(
    (targetBucket.centerX - geometry.startPoint.x) /
      Math.max(geometry.laneSpacing * expectedLateralTravel, 1),
    -1,
    1,
  );
}

function getNormalizedStratum(stratum: number, count: number) {
  return -1 + ((stratum + 0.5) / count) * 2;
}

function roundSimulationDuration(durationMs: number) {
  return Math.round(Math.max(durationMs, 0) * 100) / 100;
}

function getSimulationTimestamp() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function createCandidateRejectionCounts(): PlinkoBounceCandidateRejectionCounts {
  return {
    noPocketSettle: 0,
    outOfBounds: 0,
    simulationError: 0,
    targetEnteredNoStableSettle: 0,
    timeoutOrSampleCap: 0,
    wrongPocket: 0,
  };
}

function recordCandidateRejection(
  counts: PlinkoBounceCandidateRejectionCounts,
  reason: PlinkoBounceCandidateFailureReason | null,
) {
  switch (reason) {
    case "out-of-bounds":
      counts.outOfBounds += 1;
      return;
    case "target-pocket-did-not-stabilize":
      counts.targetEnteredNoStableSettle += 1;
      return;
    case "timeout-or-sample-cap":
      counts.timeoutOrSampleCap += 1;
      return;
    case "wrong-pocket":
      counts.wrongPocket += 1;
      return;
    case "no-pocket-settle":
      counts.noPocketSettle += 1;
      return;
    default:
      return;
  }
}

function recordRejectedCandidateDiagnostics(
  diagnostics: PlinkoBounceCandidateDiagnostics,
  result: BounceCandidateResult,
  candidateIndex: number,
) {
  if (
    diagnostics.bestRejectedScore === null ||
    result.qualityScore > diagnostics.bestRejectedScore
  ) {
    diagnostics.bestRejectedIndex = candidateIndex;
    diagnostics.bestRejectedScore = result.qualityScore;
    diagnostics.bestRejectedTrajectoryExtrema = result.trajectoryExtrema;
  }

  if (
    result.targetDistanceLanes !== null &&
    (diagnostics.bestRejectedTargetDistanceLanes === null ||
      result.targetDistanceLanes < diagnostics.bestRejectedTargetDistanceLanes)
  ) {
    diagnostics.bestRejectedFinalBucket =
      result.finalBucketIndex >= 0 ? result.finalBucketIndex : null;
    diagnostics.bestRejectedTargetDistanceLanes = result.targetDistanceLanes;
  }

  diagnostics.firstEnvelopeEscape ??= result.envelopeEscape;
  diagnostics.firstTimeoutCandidate ??= result.timeoutDiagnostics;

  if (
    result.timeoutDiagnostics &&
    (diagnostics.bestTimeoutCandidate === null ||
      result.timeoutDiagnostics.qualityScore >
        diagnostics.bestTimeoutCandidate.qualityScore)
  ) {
    diagnostics.bestTimeoutCandidate = result.timeoutDiagnostics;
  }
}

function getAggregateFailureReason(
  counts: PlinkoBounceCandidateRejectionCounts,
): PlinkoBounceCandidateFailureReason {
  const aggregateReasons = [
    ["out-of-bounds", counts.outOfBounds],
    ["target-pocket-did-not-stabilize", counts.targetEnteredNoStableSettle],
    ["wrong-pocket", counts.wrongPocket],
    ["timeout-or-sample-cap", counts.timeoutOrSampleCap],
    ["no-pocket-settle", counts.noPocketSettle],
    ["simulation-error", counts.simulationError],
  ] as const;
  const dominant = aggregateReasons.reduce(
    (current, candidate) => (candidate[1] > current[1] ? candidate : current),
  );

  return dominant[1] > 0 ? dominant[0] : "no-valid-candidate";
}

function scoreBounceCandidate({
  contacts,
  geometry,
  samples,
}: {
  contacts: readonly PlinkoBounceContact[];
  geometry: PlinkoBoardGeometry;
  samples: readonly PlinkoBounceTrajectorySample[];
}) {
  const meaningfulContacts = contacts.filter(
    (contact) => !contact.isGlancing && contact.impactStrength >= 0.24,
  );
  const contactEnergy = meaningfulContacts.reduce(
    (total, contact) => total + contact.impactStrength,
    0,
  );
  const directionChange = meaningfulContacts.reduce(
    (total, contact) => total + contact.directionChange,
    0,
  );
  const rebounds = meaningfulContacts.filter(
    (contact) =>
      contact.outgoingVelocity.y < contact.incomingVelocity.y - geometry.laneSpacing * 0.025,
  ).length;
  const lateralTravel = samples.slice(1).reduce(
    (total, sample, index) =>
      total + Math.abs(sample.x - (samples[index]?.x ?? sample.x)),
    0,
  );
  const lateralRange = getLateralRange(samples);
  const nearStaticSamples = samples.filter(
    (sample) => length(sample.velocity) < geometry.laneSpacing * 0.02,
  ).length;
  const durationMs = samples.at(-1)?.timeMs ?? 0;
  const minimumContactPenalty = Math.max(0, 4 - meaningfulContacts.length) * 4;
  const lowVariationPenalty = Math.max(
    0,
    1.4 - lateralRange / Math.max(geometry.laneSpacing, 1),
  ) * 5;

  return roundScore(
    Math.min(meaningfulContacts.length, 10) * 2.4 +
      contactEnergy * 2.8 +
      directionChange * 4.2 +
      Math.min(lateralTravel / Math.max(geometry.laneSpacing, 1), 12) * 0.65 +
      Math.min(lateralRange / Math.max(geometry.laneSpacing, 1), 5) * 1.8 +
      rebounds * 1.35 -
      minimumContactPenalty -
      lowVariationPenalty -
      nearStaticSamples * 0.08 -
      Math.max(0, durationMs - 3200) / 420,
  );
}

function createDrawableEnvelope(
  geometry: PlinkoBoardGeometry,
): PlinkoDrawableEnvelope {
  const tolerance = Math.max(
    geometry.ballCollisionRadius * 0.55,
    geometry.laneSpacing * 0.06,
  );
  const firstPegRow = geometry.pegRows[0] ?? [];
  const firstPegLeft = firstPegRow[0]?.x ?? geometry.startPoint.x;
  const firstPegRight = firstPegRow.at(-1)?.x ?? geometry.startPoint.x;
  const spawnClearance = Math.max(
    geometry.ballCollisionRadius + geometry.pegCollisionRadius,
    geometry.laneSpacing * 0.22,
  );
  const horizontalLeft = -geometry.ballCollisionRadius - tolerance;
  const horizontalRight =
    geometry.width + geometry.ballCollisionRadius + tolerance;
  const activePlayfieldEntryY = Math.max(
    geometry.ballCollisionRadius + tolerance,
    firstPegRow[0]?.y - spawnClearance,
  );
  const pocketFloorTop =
    geometry.pocketEntryY - geometry.ballCollisionRadius - tolerance;

  return {
    activePlayfield: {
      bottom: pocketFloorTop,
      left: horizontalLeft,
      right: horizontalRight,
      top: -geometry.ballCollisionRadius - tolerance,
    },
    activePlayfieldEntryY,
    pocketFloor: {
      bottom: Math.min(
        geometry.height + geometry.ballCollisionRadius + tolerance,
        geometry.pocketFloorY + geometry.ballCollisionRadius + tolerance,
      ),
      left: horizontalLeft,
      right: horizontalRight,
      top: pocketFloorTop,
    },
    spawnEntry: {
      bottom: activePlayfieldEntryY,
      left: horizontalLeft,
      right: horizontalRight,
      top: geometry.ballCollisionRadius - tolerance,
    },
    spawnCorridor: {
      bottom: activePlayfieldEntryY,
      left: clamp(
        firstPegLeft - geometry.laneSpacing * 0.35,
        -geometry.ballCollisionRadius - tolerance,
        geometry.width + geometry.ballCollisionRadius + tolerance,
      ),
      right: clamp(
        firstPegRight + geometry.laneSpacing * 0.35,
        -geometry.ballCollisionRadius - tolerance,
        geometry.width + geometry.ballCollisionRadius + tolerance,
      ),
      top: geometry.ballCollisionRadius - tolerance,
    },
  };
}

function getSafeSpawnPoint(
  geometry: PlinkoBoardGeometry,
  candidate: BounceCandidate,
  envelope: PlinkoDrawableEnvelope,
) {
  const { spawnCorridor } = envelope;
  const spawnBottom = Math.max(spawnCorridor.top, spawnCorridor.bottom);

  return {
    x: clamp(
      geometry.startPoint.x + candidate.launchOffsetX,
      spawnCorridor.left,
      spawnCorridor.right,
    ),
    y: clamp(geometry.startPoint.y, spawnCorridor.top, spawnBottom),
  };
}

function toEnvelopeDiagnostics(
  envelope: PlinkoDrawableEnvelope,
): PlinkoBounceEnvelopeDiagnostics {
  return {
    activePlayfield: envelope.activePlayfield,
    activePlayfieldEntryY: envelope.activePlayfieldEntryY,
    pocketFloor: envelope.pocketFloor,
    spawnEntry: envelope.spawnEntry,
  };
}

function createTrajectoryExtrema(
  point: PlinkoPoint,
): PlinkoBounceTrajectoryExtrema {
  return {
    maxX: point.x,
    maxY: point.y,
    minX: point.x,
    minY: point.y,
    touchedEnvelopeBoundary: false,
  };
}

function updateTrajectoryExtrema(
  extrema: PlinkoBounceTrajectoryExtrema,
  point: PlinkoPoint,
  envelope: PlinkoDrawableEnvelope,
) {
  extrema.minX = Math.min(extrema.minX, point.x);
  extrema.maxX = Math.max(extrema.maxX, point.x);
  extrema.minY = Math.min(extrema.minY, point.y);
  extrema.maxY = Math.max(extrema.maxY, point.y);

  const boundaryTolerance = Math.max(
    (envelope.activePlayfield.right - envelope.activePlayfield.left) * 0.003,
    0.5,
  );
  extrema.touchedEnvelopeBoundary ||=
    point.x <= envelope.activePlayfield.left + boundaryTolerance ||
    point.x >= envelope.activePlayfield.right - boundaryTolerance ||
    point.y <= envelope.activePlayfield.top + boundaryTolerance ||
    point.y >= envelope.pocketFloor.bottom - boundaryTolerance;
}

function getEnvelopeEscape({
  candidateIndex,
  envelope,
  hasEnteredActivePlayfield,
  sample,
  sampleIndex,
  spawnPosition,
}: {
  candidateIndex: number;
  envelope: PlinkoDrawableEnvelope;
  hasEnteredActivePlayfield: boolean;
  sample: PlinkoBounceTrajectorySample;
  sampleIndex: number;
  spawnPosition: PlinkoPoint;
}): PlinkoBounceEnvelopeEscape | null {
  const stage = getEnvelopeStage(
    sample,
    envelope,
    hasEnteredActivePlayfield,
  );
  const bounds = getEnvelopeBoundsForStage(envelope, stage);
  const side = getEnvelopeEscapeSide(sample, bounds, stage);

  return side
    ? {
        candidateIndex,
        point: { x: sample.x, y: sample.y },
        sampleIndex,
        side,
        spawnPosition,
        stage,
        timeMs: sample.timeMs,
      }
    : null;
}

function getEnvelopeStage(
  point: PlinkoPoint,
  envelope: PlinkoDrawableEnvelope,
  hasEnteredActivePlayfield: boolean,
): PlinkoBounceEnvelopeStage {
  if (!hasEnteredActivePlayfield) {
    return "spawn-entry";
  }

  return point.y >= envelope.pocketFloor.top
    ? "pocket-floor"
    : "active-playfield";
}

function getEnvelopeBoundsForStage(
  envelope: PlinkoDrawableEnvelope,
  stage: PlinkoBounceEnvelopeStage,
) {
  switch (stage) {
    case "spawn-entry":
      return envelope.spawnEntry;
    case "pocket-floor":
      return envelope.pocketFloor;
    case "active-playfield":
      return envelope.activePlayfield;
  }
}

function getEnvelopeEscapeSide(
  point: PlinkoPoint,
  bounds: PlinkoBounceEnvelopeBounds,
  stage: PlinkoBounceEnvelopeStage,
): PlinkoBounceEnvelopeEscapeSide | null {
  if (point.x < bounds.left) {
    return "left";
  }

  if (point.x > bounds.right) {
    return "right";
  }

  if (point.y < bounds.top) {
    return "top";
  }

  if (point.y > bounds.bottom) {
    return stage === "pocket-floor" ? "pocket-floor-mismatch" : "bottom";
  }

  return null;
}

function createStaticBoardBodies(
  Matter: MatterApi,
  geometry: PlinkoBoardGeometry,
) {
  const { Bodies } = Matter;
  const wallThickness = Math.max(geometry.laneSpacing * 0.52, 18);
  const dividerHeight = geometry.pocketFloorY - geometry.pocketEntryY;
  const dividers = geometry.buckets.slice(0, -1).map((bucket) =>
    Bodies.rectangle(
      bucket.x + bucket.width + geometry.bucketGap * 0.5,
      geometry.pocketEntryY + dividerHeight * 0.5,
      geometry.pocketDividerThickness,
      dividerHeight,
      { isStatic: true, label: `bounce-divider:${bucket.index}` },
    ),
  );

  return [
    ...geometry.pegRows.flatMap((pegRow) =>
      pegRow.map((peg) =>
        Bodies.circle(peg.x, peg.y, geometry.pegCollisionRadius, {
          friction: 0.012,
          isStatic: true,
          label: `bounce-peg:${peg.row}:${peg.index}`,
          restitution: PEG_RESTITUTION,
        }),
      ),
    ),
    ...dividers,
    Bodies.rectangle(
      -wallThickness * 0.5,
      geometry.height * 0.5,
      wallThickness,
      geometry.height * 1.25,
      { isStatic: true, label: "bounce-wall:left" },
    ),
    Bodies.rectangle(
      geometry.width + wallThickness * 0.5,
      geometry.height * 0.5,
      wallThickness,
      geometry.height * 1.25,
      { isStatic: true, label: "bounce-wall:right" },
    ),
    Bodies.rectangle(
      geometry.width * 0.5,
      geometry.pocketFloorY + geometry.pocketDividerThickness * 0.5,
      geometry.width + wallThickness * 2,
      geometry.pocketDividerThickness,
      { isStatic: true, label: "bounce-floor" },
    ),
  ];
}

function applyTerminalSpeedSafeguard(
  Matter: MatterApi,
  ball: MatterBody,
  geometry: PlinkoBoardGeometry,
  response: BounceResponse,
) {
  const terminalSpeed = geometry.laneSpacing * response.terminalSpeedLanes;
  const speed = length(ball.velocity);

  if (speed <= terminalSpeed) {
    return;
  }

  const scale = terminalSpeed / speed;

  Matter.Body.setVelocity(ball, {
    x: ball.velocity.x * scale,
    y: ball.velocity.y * scale,
  });
}

function getSimulationDuration(geometry: PlinkoBoardGeometry) {
  // Turbo changes replay pacing only. Physics keeps the same opportunity to
  // find an expressive, physically settled candidate as normal playback.
  const rowDuration = 235;
  const settleAllowance = 1060;

  return geometry.rowsCount * rowDuration + settleAllowance;
}

function getContactNormal(ball: PlinkoPoint, peg: PlinkoPoint) {
  const deltaX = ball.x - peg.x;
  const deltaY = ball.y - peg.y;
  const distanceFromPeg = Math.max(Math.hypot(deltaX, deltaY), 0.001);

  return { x: deltaX / distanceFromPeg, y: deltaY / distanceFromPeg };
}

function getDirectionChange(
  incomingVelocity: PlinkoPoint,
  outgoingVelocity: PlinkoPoint,
) {
  const incomingLength = length(incomingVelocity);
  const outgoingLength = length(outgoingVelocity);

  if (incomingLength < 0.001 || outgoingLength < 0.001) {
    return 0;
  }

  return clamp(
    (1 - dot(incomingVelocity, outgoingVelocity) / (incomingLength * outgoingLength)) /
      2,
    0,
    1,
  );
}

function getLateralRange(samples: readonly PlinkoBounceTrajectorySample[]) {
  if (!samples.length) {
    return 0;
  }

  let minX = samples[0].x;
  let maxX = samples[0].x;

  for (const sample of samples) {
    minX = Math.min(minX, sample.x);
    maxX = Math.max(maxX, sample.x);
  }

  return maxX - minX;
}

function getVisualBucketIndex(geometry: PlinkoBoardGeometry, x: number) {
  let bestIndex = 0;
  let bestDistance = Infinity;

  for (const bucket of geometry.buckets) {
    const distanceToBucket = Math.abs(bucket.centerX - x);

    if (distanceToBucket < bestDistance) {
      bestDistance = distanceToBucket;
      bestIndex = bucket.index;
    }
  }

  return bestIndex;
}

function getPocketIndex(geometry: PlinkoBoardGeometry, ball: MatterBody) {
  if (
    ball.position.y < geometry.pocketEntryY ||
    ball.position.y > geometry.pocketFloorY
  ) {
    return null;
  }

  return (
    geometry.buckets.find((bucket) => {
      const left =
        bucket.x + geometry.pocketDividerThickness * 0.5 + geometry.ballCollisionRadius;
      const right =
        bucket.x +
        bucket.width -
        geometry.pocketDividerThickness * 0.5 -
        geometry.ballCollisionRadius;

      return ball.position.x >= left && ball.position.x <= right;
    })?.index ?? null
  );
}

function getPegBody(bodyA: MatterBody, bodyB: MatterBody) {
  if (bodyA.label.startsWith("bounce-peg:")) {
    return bodyA;
  }

  if (bodyB.label.startsWith("bounce-peg:")) {
    return bodyB;
  }

  return null;
}

function parsePegLabel(label: string) {
  const [, row, index] = label.split(":");
  const parsedRow = Number(row);
  const parsedIndex = Number(index);

  if (!Number.isInteger(parsedRow) || !Number.isInteger(parsedIndex)) {
    return null;
  }

  return { index: parsedIndex, row: parsedRow };
}

function createInvalidResult(
  bucketIndex: number,
  fallbackReason: PlinkoBounceCandidateFailureReason,
  candidateDiagnostics: PlinkoBounceCandidateDiagnostics,
  geometry: PlinkoBoardGeometry,
) {
  return {
    bucketImpact: null,
    bucketIndex,
    candidateDiagnostics,
    contacts: [],
    durationMs: 0,
    fallbackReason,
    geometryMetrics: getPlinkoBoardGeometryMetrics(geometry),
    samples: [],
    settleDiagnostics: {
      enteredTargetPocket: false,
      physicallySettledBucket: null,
      settleDurationMs: 0,
      settleSamples: 0,
    },
    valid: false,
  } satisfies PlinkoBounceTrajectoryResult;
}

function getCandidateFailureReason({
  bucketImpact,
  escapedEnvelope,
  settleDiagnostics,
  timedOutOrSampleCapped,
}: Pick<
  BounceCandidateResult,
  | "bucketImpact"
  | "escapedEnvelope"
  | "settleDiagnostics"
  | "timedOutOrSampleCapped"
>): PlinkoBounceCandidateFailureReason | null {
  if (bucketImpact) {
    return null;
  }

  if (escapedEnvelope) {
    return "out-of-bounds";
  }

  if (settleDiagnostics.physicallySettledBucket !== null) {
    return "wrong-pocket";
  }

  if (settleDiagnostics.enteredTargetPocket) {
    return "target-pocket-did-not-stabilize";
  }

  if (timedOutOrSampleCapped) {
    return "timeout-or-sample-cap";
  }

  return "no-pocket-settle";
}

function createSeededPermutation(
  count: number,
  random: () => number,
) {
  const values = Array.from({ length: count }, (_, index) => index);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values;
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

async function loadMatter(): Promise<MatterApi> {
  const MatterModule = await import("matter-js");

  return ("default" in MatterModule
    ? MatterModule.default
    : MatterModule) as MatterApi;
}

function clonePoint(point: PlinkoPoint) {
  return { x: point.x, y: point.y };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function distance(left: PlinkoPoint, right: PlinkoPoint) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function dot(left: PlinkoPoint, right: PlinkoPoint) {
  return left.x * right.x + left.y * right.y;
}

function length(point: PlinkoPoint) {
  return Math.hypot(point.x, point.y);
}

function mix(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function roundScore(score: number) {
  return Math.round(score * 1000) / 1000;
}
