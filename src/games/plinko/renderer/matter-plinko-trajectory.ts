import type MatterNamespace from "matter-js";
import type { PlinkoRows } from "../config";
import type { PlinkoPathStep } from "../model";
import {
  createPlinkoPathPlan,
  type PlinkoBoardGeometry,
  type PlinkoPegGeometry,
  type PlinkoPoint,
} from "../lib/plinko-path";
import {
  type PlinkoBucketImpact,
  type PlinkoContactEvent,
} from "../lib/plinko-motion-plan";
import { getPlinkoBucketIndex } from "../lib/plinko-result";

export interface MatterPlinkoTrajectorySample extends PlinkoPoint {
  timeMs: number;
}

export interface MatterPlinkoTrajectoryResult {
  bucketImpact: PlinkoBucketImpact | null;
  bucketIndex: number;
  contacts: PlinkoContactEvent[];
  durationMs: number;
  fallbackReason: string | null;
  samples: MatterPlinkoTrajectorySample[];
  valid: boolean;
}

export interface BuildMatterPlinkoTrajectoryInput {
  bucketIndex?: number;
  geometry: PlinkoBoardGeometry;
  results: readonly PlinkoPathStep[];
  rowsCount: PlinkoRows;
}

type MatterApi = typeof MatterNamespace;
type MatterBody = MatterNamespace.Body;

interface SimulationAttemptResult {
  bucketImpact: PlinkoBucketImpact | null;
  finalBucketIndex: number;
  contacts: PlinkoContactEvent[];
  samples: MatterPlinkoTrajectorySample[];
}

interface RowContactTarget {
  laneAfter: number;
  laneBefore: number;
  peg: PlinkoPegGeometry;
  row: number;
  step: PlinkoPathStep;
}

const MAX_ATTEMPTS = 5;
const FIXED_STEP_MS = 1000 / 60;
const MAX_COLLISION_CONTACTS = 34;

export async function buildMatterPlinkoTrajectory({
  bucketIndex,
  geometry,
  results,
  rowsCount,
}: BuildMatterPlinkoTrajectoryInput): Promise<MatterPlinkoTrajectoryResult> {
  const expectedBucketIndex = bucketIndex ?? getPlinkoBucketIndex(results);
  const targetBucket = geometry.buckets[expectedBucketIndex];

  if (results.length !== rowsCount) {
    return createInvalidResult(
      expectedBucketIndex,
      `result-length-${results.length}-does-not-match-${rowsCount}`,
    );
  }

  if (!targetBucket) {
    return createInvalidResult(expectedBucketIndex, "target-bucket-missing");
  }

  const Matter = await loadMatter();
  const route = createPlinkoPathPlan({ geometry, results, rowsCount });
  const maxDurationMs = Math.round(geometry.rowsCount * 218 + 820);
  const attemptSeeds = [-0.18, 0.16, -0.08, 0.08, 0];
  let fallbackReason = "no-valid-attempt";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const result = simulateAttempt({
      Matter,
      attempt,
      geometry,
      initialVelocityX: attemptSeeds[attempt] ?? 0,
      maxDurationMs,
      route,
      results,
      targetBucketIndex: expectedBucketIndex,
    });

    if (result.finalBucketIndex === expectedBucketIndex && result.bucketImpact) {
      const polishedTrajectory = createPolishedTrajectory({
        bucketImpact: result.bucketImpact,
        contacts: result.contacts,
        geometry,
        samples: result.samples,
      });

      return {
        bucketImpact: polishedTrajectory.bucketImpact,
        bucketIndex: expectedBucketIndex,
        contacts: polishedTrajectory.contacts,
        durationMs:
          polishedTrajectory.samples.at(-1)?.timeMs ?? maxDurationMs,
        fallbackReason: null,
        samples: polishedTrajectory.samples,
        valid: true,
      };
    }

    fallbackReason = `bucket-${result.finalBucketIndex}-did-not-match-${expectedBucketIndex}`;
  }

  return createInvalidResult(expectedBucketIndex, fallbackReason);
}

function simulateAttempt({
  Matter,
  attempt,
  geometry,
  initialVelocityX,
  maxDurationMs,
  route,
  results,
  targetBucketIndex,
}: {
  Matter: MatterApi;
  attempt: number;
  geometry: PlinkoBoardGeometry;
  initialVelocityX: number;
  maxDurationMs: number;
  route: ReturnType<typeof createPlinkoPathPlan>;
  results: readonly PlinkoPathStep[];
  targetBucketIndex: number;
}): SimulationAttemptResult {
  const { Bodies, Body, Composite, Engine, Events } = Matter;
  const engine = Engine.create({ enableSleeping: false });
  const samples: MatterPlinkoTrajectorySample[] = [];
  const contacts: PlinkoContactEvent[] = [];
  const seenPegContacts = new Map<string, number>();
  const rowContactTargets = createRowContactTargets(geometry, results);
  const ball = Bodies.circle(
    geometry.startPoint.x,
    geometry.startPoint.y,
    geometry.ballRadius,
    {
      friction: 0.004,
      frictionAir: 0.015,
      label: "ball",
      restitution: 0.54,
    },
  );

  engine.gravity.y = 1;
  engine.gravity.scale = 0.00125 + attempt * 0.00004;
  Body.setVelocity(ball, {
    x: initialVelocityX * geometry.laneSpacing,
    y: geometry.laneSpacing * 0.018,
  });

  const pegBodies = geometry.pegRows.flatMap((pegRow) =>
    pegRow.map((peg) =>
      Bodies.circle(peg.x, peg.y, geometry.pegRadius * 1.1, {
        isStatic: true,
        label: `peg:${peg.row}:${peg.index}`,
        friction: 0.02,
        restitution: 0.62,
      }),
    ),
  );
  const bounds = createStaticBounds(Matter, geometry);

  Composite.add(engine.world, [ball, ...pegBodies, ...bounds]);
  Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      const pegBody = getPegBody(pair.bodyA, pair.bodyB);

      if (!pegBody || contacts.length >= MAX_COLLISION_CONTACTS) {
        continue;
      }

      const pegInfo = parsePegLabel(pegBody.label);
      const timeMs = engine.timing.timestamp;
      const contactKey = pegInfo
        ? `collision:${pegInfo.row}:${pegInfo.index}`
        : pegBody.label;
      const lastContactMs = seenPegContacts.get(contactKey) ?? -Infinity;

      if (!pegInfo || timeMs - lastContactMs < 92) {
        continue;
      }

      const peg = geometry.pegRows[pegInfo.row]?.[pegInfo.index];

      if (!peg) {
        continue;
      }

      recordPegContact({
        ball,
        contacts,
        geometry,
        peg,
        pegIndex: pegInfo.index,
        row: pegInfo.row,
        seenPegContacts,
        source: "collision",
        timeMs,
        results,
      });
    }
  });

  let finalBucketIndex = -1;
  let bucketImpact: PlinkoBucketImpact | null = null;

  for (let elapsedMs = 0; elapsedMs <= maxDurationMs; elapsedMs += FIXED_STEP_MS) {
    applyRouteSteering(Matter, ball, geometry, route, targetBucketIndex);
    Engine.update(engine, FIXED_STEP_MS);
    applyRowContactAssist({
      Matter,
      ball,
      contacts,
      geometry,
      rowContactTargets,
      results,
      seenPegContacts,
      timeMs: engine.timing.timestamp,
    });
    clampBallVelocity(Matter, ball, geometry);
    samples.push({
      timeMs: Math.round(elapsedMs),
      x: ball.position.x,
      y: ball.position.y,
    });

    if (ball.position.y >= geometry.bucketY + geometry.bucketHeight * 0.42) {
      finalBucketIndex = getVisualBucketIndex(geometry, ball.position.x);

      if (finalBucketIndex === targetBucketIndex) {
        const bucket = geometry.buckets[targetBucketIndex];

        bucketImpact = {
          bucket,
          bucketIndex: targetBucketIndex,
          flashDurationMs: 240,
          impactStrength: 1,
          point: {
            x: ball.position.x,
            y: Math.min(
              ball.position.y,
              bucket.y + bucket.height * 0.58,
            ),
          },
          timeMs: Math.round(elapsedMs),
        };
        break;
      }
    }
  }

  if (finalBucketIndex < 0) {
    finalBucketIndex = getVisualBucketIndex(geometry, ball.position.x);
  }

  Composite.clear(engine.world, false, true);
  Engine.clear(engine);

  return {
    bucketImpact,
    contacts,
    finalBucketIndex,
    samples,
  };
}

function createStaticBounds(
  Matter: MatterApi,
  geometry: PlinkoBoardGeometry,
): MatterBody[] {
  const { Bodies } = Matter;
  const wallThickness = Math.max(geometry.laneSpacing * 0.52, 18);
  const guideHeight = geometry.height * 1.25;
  const floorY = geometry.bucketY + geometry.bucketHeight * 0.72;

  return [
    Bodies.rectangle(
      -wallThickness * 0.5,
      geometry.height * 0.5,
      wallThickness,
      guideHeight,
      { isStatic: true, label: "side-guide:left" },
    ),
    Bodies.rectangle(
      geometry.width + wallThickness * 0.5,
      geometry.height * 0.5,
      wallThickness,
      guideHeight,
      { isStatic: true, label: "side-guide:right" },
    ),
    Bodies.rectangle(
      geometry.width * 0.5,
      floorY + wallThickness * 0.5,
      geometry.width,
      wallThickness,
      { isStatic: true, label: "bucket-floor" },
    ),
  ];
}

function createPolishedTrajectory({
  bucketImpact,
  contacts,
  geometry,
  samples,
}: {
  bucketImpact: PlinkoBucketImpact;
  contacts: PlinkoContactEvent[];
  geometry: PlinkoBoardGeometry;
  samples: MatterPlinkoTrajectorySample[];
}) {
  if (contacts.length === 0 || samples.length < 2) {
    return {
      bucketImpact,
      contacts,
      samples,
    };
  }

  const perchContactIds = new Set(
    selectPerchContacts(contacts, geometry).map((contact) => contact.id),
  );
  let accumulatedDelayMs = 0;
  const nextSamples: MatterPlinkoTrajectorySample[] = [];
  const nextContacts = contacts.map((contact) => {
    const contactDelayMs = accumulatedDelayMs;

    if (perchContactIds.has(contact.id)) {
      accumulatedDelayMs += getPerchDwellMs(contact, geometry);
    }

    return {
      ...contact,
      pulseDurationMs: perchContactIds.has(contact.id)
        ? Math.round(contact.pulseDurationMs * 1.08)
        : contact.pulseDurationMs,
      timeMs: contact.timeMs + contactDelayMs,
    };
  });

  let contactIndex = 0;
  let appliedDelayMs = 0;

  for (const sample of samples) {
    while (
      contactIndex < contacts.length &&
      contacts[contactIndex].timeMs <= sample.timeMs
    ) {
      const contact = contacts[contactIndex];

      if (perchContactIds.has(contact.id)) {
        addPerchSamples({
          contact,
          dwellMs: getPerchDwellMs(contact, geometry),
          geometry,
          samples: nextSamples,
          timeOffsetMs: appliedDelayMs,
        });
        appliedDelayMs += getPerchDwellMs(contact, geometry);
      }

      contactIndex += 1;
    }

    nextSamples.push({
      timeMs: sample.timeMs + appliedDelayMs,
      x: sample.x,
      y: sample.y,
    });
  }

  return {
    bucketImpact: {
      ...bucketImpact,
      timeMs: bucketImpact.timeMs + appliedDelayMs,
    },
    contacts: nextContacts,
    samples: removeDuplicateSampleTimes(nextSamples),
  };
}

function selectPerchContacts(
  contacts: readonly PlinkoContactEvent[],
  geometry: PlinkoBoardGeometry,
) {
  const maxPerches = geometry.rowsCount <= 10 ? 3 : 2;
  const minRowGap = geometry.rowsCount <= 10 ? 2 : 4;
  const selected: PlinkoContactEvent[] = [];

  for (const contact of contacts) {
    if (selected.length >= maxPerches) {
      break;
    }

    if (
      contact.impactStrength < 0.5 ||
      selected.some((candidate) => Math.abs(candidate.row - contact.row) < minRowGap)
    ) {
      continue;
    }

    if (contact.row === 0 || contact.row >= geometry.rowsCount - 1) {
      continue;
    }

    selected.push(contact);
  }

  return selected;
}

function addPerchSamples({
  contact,
  dwellMs,
  geometry,
  samples,
  timeOffsetMs,
}: {
  contact: PlinkoContactEvent;
  dwellMs: number;
  geometry: PlinkoBoardGeometry;
  samples: MatterPlinkoTrajectorySample[];
  timeOffsetMs: number;
}) {
  const sideOffset = contact.pegContact.side === "left" ? -1 : 1;
  const peg = contact.pegContact.peg;
  const perchPoint = {
    x: peg.x + sideOffset * geometry.pegRadius * 0.52,
    y: peg.y - geometry.pegRadius - geometry.ballRadius * 0.32,
  };
  const contactTimeMs = contact.timeMs + timeOffsetMs;
  const approachPoint = {
    x: mix(contact.point.x, perchPoint.x, 0.42),
    y: mix(contact.point.y, perchPoint.y, 0.42),
  };
  const rollOffPoint = {
    x:
      perchPoint.x +
      (contact.step === 0 ? -1 : 1) *
        geometry.laneSpacing *
        (geometry.rowsCount <= 10 ? 0.13 : 0.1),
    y: perchPoint.y + geometry.pegRadius * 0.8,
  };

  samples.push(
    {
      timeMs: Math.round(contactTimeMs - 18),
      x: approachPoint.x,
      y: approachPoint.y,
    },
    {
      timeMs: Math.round(contactTimeMs + dwellMs * 0.34),
      x: perchPoint.x,
      y: perchPoint.y,
    },
    {
      timeMs: Math.round(contactTimeMs + dwellMs),
      x: rollOffPoint.x,
      y: rollOffPoint.y,
    },
  );
}

function getPerchDwellMs(
  contact: PlinkoContactEvent,
  geometry: PlinkoBoardGeometry,
) {
  const sparseBoost = geometry.rowsCount <= 10 ? 12 : 0;
  const impactBoost = Math.round(contact.impactStrength * 12);

  return Math.min(78, 34 + sparseBoost + impactBoost);
}

function removeDuplicateSampleTimes(
  samples: MatterPlinkoTrajectorySample[],
) {
  const sortedSamples = samples
    .filter((sample) => Number.isFinite(sample.timeMs))
    .sort((a, b) => a.timeMs - b.timeMs);
  const deduped: MatterPlinkoTrajectorySample[] = [];

  for (const sample of sortedSamples) {
    const previous = deduped[deduped.length - 1];

    if (previous && previous.timeMs >= sample.timeMs) {
      sample.timeMs = previous.timeMs + 1;
    }

    deduped.push(sample);
  }

  return deduped;
}

function applyRouteSteering(
  Matter: MatterApi,
  ball: MatterBody,
  geometry: PlinkoBoardGeometry,
  route: ReturnType<typeof createPlinkoPathPlan>,
  targetBucketIndex: number,
) {
  const { Body } = Matter;
  const target = getCurrentRouteTarget(ball.position.y, route.waypoints);
  const targetBucket = geometry.buckets[targetBucketIndex];
  const finalZoneStart = geometry.bucketY - geometry.bucketHeight * 2.2;
  const finalZoneProgress = clamp01(
    (ball.position.y - finalZoneStart) /
      Math.max(geometry.bucketY - finalZoneStart, 1),
  );
  const targetX = mix(target.x, targetBucket.centerX, finalZoneProgress);
  const horizontalDelta = targetX - ball.position.x;
  const correctionScale = 0.012 + finalZoneProgress * 0.018;
  const nextVelocityX =
    ball.velocity.x * (0.94 - finalZoneProgress * 0.08) +
    clamp(horizontalDelta * correctionScale, -3.4, 3.4);
  const minimumFallSpeed = geometry.laneSpacing * 0.055;
  const nextVelocityY = Math.max(
    ball.velocity.y,
    minimumFallSpeed * (0.65 + finalZoneProgress * 0.35),
  );

  Body.setVelocity(ball, {
    x: nextVelocityX,
    y: nextVelocityY,
  });
}

function clampBallVelocity(
  Matter: MatterApi,
  ball: MatterBody,
  geometry: PlinkoBoardGeometry,
) {
  const { Body } = Matter;
  const maxX = geometry.laneSpacing * 0.15;
  const maxY = geometry.laneSpacing * 0.19;

  Body.setVelocity(ball, {
    x: clamp(ball.velocity.x, -maxX, maxX),
    y: clamp(ball.velocity.y, -maxY * 0.38, maxY),
  });
}

function applyRowContactAssist({
  Matter,
  ball,
  contacts,
  geometry,
  rowContactTargets,
  results,
  seenPegContacts,
  timeMs,
}: {
  Matter: MatterApi;
  ball: MatterBody;
  contacts: PlinkoContactEvent[];
  geometry: PlinkoBoardGeometry;
  rowContactTargets: RowContactTarget[];
  results: readonly PlinkoPathStep[];
  seenPegContacts: Map<string, number>;
  timeMs: number;
}) {
  if (contacts.length >= MAX_COLLISION_CONTACTS) {
    return;
  }

  const nearest = findReadableRowContact({
    ball,
    contacts,
    geometry,
    rowContactTargets,
  });

  if (!nearest) {
    return;
  }

  const key = `assist:${nearest.row}:${nearest.peg.index}`;
  const lastContactMs = seenPegContacts.get(key) ?? -Infinity;

  if (timeMs - lastContactMs < 118) {
    return;
  }

  seenPegContacts.set(key, timeMs);
  recordPegContact({
    ball,
    contacts,
    geometry,
    peg: nearest.peg,
    pegIndex: nearest.peg.index,
    row: nearest.row,
    seenPegContacts,
    source: "assist",
    timeMs,
    results,
  });

  const { Body } = Matter;
  const resultDirection = nearest.step === 0 ? -1 : 1;
  const away = ball.position.x < nearest.peg.x ? -1 : 1;
  const direction = Math.sign(resultDirection + away) || resultDirection;
  const rowDensityBoost = geometry.rowsCount <= 10 ? 1.18 : 1;
  const lateralKick = clamp(
    (1 - nearest.distanceRatio) *
      geometry.laneSpacing *
      0.034 *
      rowDensityBoost,
    0.12,
    geometry.laneSpacing * (geometry.rowsCount <= 10 ? 0.064 : 0.052),
  );
  const verticalDamping =
    (nearest.recovered ? 0.88 : 0.82) - (1 - nearest.distanceRatio) * 0.06;

  Body.setVelocity(ball, {
    x: clamp(
      ball.velocity.x + direction * lateralKick,
      -geometry.laneSpacing * 0.14,
      geometry.laneSpacing * 0.14,
    ),
    y: Math.max(
      ball.velocity.y * verticalDamping,
      geometry.laneSpacing * 0.048,
    ),
  });
}

function findReadableRowContact({
  ball,
  contacts,
  geometry,
  rowContactTargets,
}: {
  ball: MatterBody;
  contacts: readonly PlinkoContactEvent[];
  geometry: PlinkoBoardGeometry;
  rowContactTargets: readonly RowContactTarget[];
}) {
  const rowWindow = Math.max(
    geometry.ballRadius * 2.25,
    Math.min(geometry.laneSpacing * 0.32, 24),
  );
  const recoveryWindow = Math.max(rowWindow, geometry.laneSpacing * 0.5);
  const horizontalWindow =
    geometry.laneSpacing * (geometry.rowsCount <= 10 ? 0.88 : 0.66);
  let best:
    | {
        distanceRatio: number;
        peg: PlinkoBoardGeometry["pegRows"][number][number];
        recovered: boolean;
        row: number;
        step: PlinkoPathStep;
      }
    | null = null;

  for (const target of rowContactTargets) {
    if (rowHasReadableContact(contacts, target.row)) {
      continue;
    }

    const dy = ball.position.y - target.peg.y;

    if (dy < -rowWindow || dy > recoveryWindow) {
      continue;
    }

    const peg = getReadablePegForRow(geometry, ball, target);
    const dx = Math.abs(ball.position.x - peg.x);

    if (dx > horizontalWindow) {
      continue;
    }

    const distanceRatio = clamp01(
      Math.hypot(dx, Math.abs(dy)) /
        Math.max(Math.hypot(horizontalWindow, recoveryWindow), 1),
    );
    const recovered = dy > rowWindow;

    if (!best || distanceRatio < best.distanceRatio) {
      best = {
        distanceRatio,
        peg,
        recovered,
        row: target.row,
        step: target.step,
      };
    }
  }

  return best;
}

function createRowContactTargets(
  geometry: PlinkoBoardGeometry,
  results: readonly PlinkoPathStep[],
): RowContactTarget[] {
  const targets: RowContactTarget[] = [];
  let lane = 0;

  for (const [row, step] of results.entries()) {
    const laneBefore = lane;
    const laneAfter = laneBefore + step;
    const pegRow = geometry.pegRows[row] ?? [];
    const pegIndex = Math.max(
      0,
      Math.min(laneBefore + 1, pegRow.length - 1),
    );
    const peg = pegRow[pegIndex];

    if (peg) {
      targets.push({
        laneAfter,
        laneBefore,
        peg,
        row,
        step,
      });
    }

    lane = laneAfter;
  }

  return targets;
}

function getReadablePegForRow(
  geometry: PlinkoBoardGeometry,
  ball: MatterBody,
  target: RowContactTarget,
) {
  const pegRow = geometry.pegRows[target.row] ?? [];
  let bestPeg = target.peg;
  let bestDistance = Math.abs(ball.position.x - target.peg.x);

  for (const peg of pegRow) {
    const distance = Math.abs(ball.position.x - peg.x);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestPeg = peg;
    }
  }

  return bestPeg;
}

function rowHasReadableContact(
  contacts: readonly PlinkoContactEvent[],
  row: number,
) {
  return contacts.some((contact) => contact.row === row);
}

function recordPegContact({
  ball,
  contacts,
  geometry,
  peg,
  pegIndex,
  row,
  seenPegContacts,
  source,
  timeMs,
  results,
}: {
  ball: MatterBody;
  contacts: PlinkoContactEvent[];
  geometry: PlinkoBoardGeometry;
  peg: PlinkoBoardGeometry["pegRows"][number][number];
  pegIndex: number;
  row: number;
  seenPegContacts: Map<string, number>;
  source: "assist" | "collision";
  timeMs: number;
  results: readonly PlinkoPathStep[];
}) {
  if (contacts.length >= MAX_COLLISION_CONTACTS) {
    return;
  }

  const step = results[row] ?? 0;
  const impactStrength = Math.min(
    1,
    Math.max(
      source === "collision" ? 0.56 : 0.48,
      ball.speed / Math.max(geometry.laneSpacing * 0.105, 1),
    ),
  );
  const side = ball.position.x < peg.x ? "left" : "right";
  const sourceKey = `${source}:${row}:${pegIndex}`;

  seenPegContacts.set(sourceKey, timeMs);
  contacts.push({
    id: `matter-${source}-${row}-${pegIndex}-${Math.round(timeMs)}`,
    impactStrength,
    pegContact: {
      laneAfter: pegIndex,
      laneBefore: Math.max(pegIndex - step, 0),
      normal: {
        x: side === "left" ? -1 : 1,
        y: -0.42,
      },
      peg,
      side,
    },
    point: {
      x: mix(ball.position.x, peg.x, source === "collision" ? 0.2 : 0.36),
      y: mix(ball.position.y, peg.y, source === "collision" ? 0.18 : 0.28),
    },
    pulseDurationMs: Math.round(120 + impactStrength * 64),
    pulseRadius:
      geometry.pegRadius *
      (source === "collision" ? 1.86 + impactStrength * 0.42 : 1.58),
    row,
    step,
    timeMs,
  });
}

function getCurrentRouteTarget(
  currentY: number,
  waypoints: ReturnType<typeof createPlinkoPathPlan>["waypoints"],
) {
  for (const waypoint of waypoints) {
    if (waypoint.y >= currentY) {
      return waypoint;
    }
  }

  return waypoints[waypoints.length - 1];
}

function getVisualBucketIndex(
  geometry: PlinkoBoardGeometry,
  x: number,
) {
  let bestIndex = 0;
  let bestDistance = Infinity;

  for (const bucket of geometry.buckets) {
    const distance = Math.abs(bucket.centerX - x);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = bucket.index;
    }
  }

  return bestIndex;
}

function getPegBody(bodyA: MatterBody, bodyB: MatterBody) {
  if (bodyA.label.startsWith("peg:")) {
    return bodyA;
  }

  if (bodyB.label.startsWith("peg:")) {
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

  return {
    index: parsedIndex,
    row: parsedRow,
  };
}

async function loadMatter(): Promise<MatterApi> {
  const MatterModule = await import("matter-js");

  return ("default" in MatterModule
    ? MatterModule.default
    : MatterModule) as MatterApi;
}

function createInvalidResult(
  bucketIndex: number,
  fallbackReason: string,
): MatterPlinkoTrajectoryResult {
  return {
    bucketImpact: null,
    bucketIndex,
    contacts: [],
    durationMs: 0,
    fallbackReason,
    samples: [],
    valid: false,
  };
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function mix(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}
