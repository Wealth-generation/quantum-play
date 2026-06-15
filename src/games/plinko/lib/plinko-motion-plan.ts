import type { PlinkoRows } from "../config";
import type { PlinkoPathStep } from "../model";
import type {
  PlinkoBoardGeometry,
  PlinkoBucketGeometry,
  PlinkoPegGeometry,
  PlinkoPoint,
} from "./plinko-path";
import { getPlinkoBucketIndex } from "./plinko-result";

export interface PlinkoMotionVector {
  x: number;
  y: number;
}

export interface PlinkoPegContact {
  laneAfter: number;
  laneBefore: number;
  normal: PlinkoMotionVector;
  peg: PlinkoPegGeometry;
  side: "left" | "right";
}

export interface PlinkoContactEvent {
  id: string;
  impactStrength: number;
  pegContact: PlinkoPegContact;
  point: PlinkoPoint;
  pulseDurationMs: number;
  pulseRadius: number;
  row: number;
  step: PlinkoPathStep;
  timeMs: number;
}

export interface PlinkoBucketImpact {
  bucket: PlinkoBucketGeometry;
  bucketIndex: number;
  flashDurationMs: number;
  impactStrength: number;
  point: PlinkoPoint;
  timeMs: number;
}

export interface PlinkoMotionSegment {
  contactId: string | null;
  contactPoint: PlinkoPoint;
  correctionStrength: number;
  damping: number;
  durationMs: number;
  endPoint: PlinkoPoint;
  gravity: number;
  inboundVelocity: PlinkoMotionVector;
  index: number;
  lateralImpulse: number;
  outboundVelocity: PlinkoMotionVector;
  row: number;
  startPoint: PlinkoPoint;
  startTimeMs: number;
}

export interface PlinkoMotionTimingConfig {
  bucketSettleMs: number;
  maxSegmentDurationMs: number;
  minSegmentDurationMs: number;
  rowAccelerationMs: number;
  startSegmentDurationMs: number;
}

export interface PlinkoMotionQualityConfig {
  correctionStrength: number;
  damping: number;
  gravityScale: number;
  lateralImpulseScale: number;
  pegPulseScale: number;
  reboundScale: number;
}

export interface PlinkoMotionPlan {
  bucketImpact: PlinkoBucketImpact;
  bucketIndex: number;
  contacts: PlinkoContactEvent[];
  durationMs: number;
  quality: PlinkoMotionQualityConfig;
  rowsCount: PlinkoRows;
  segments: PlinkoMotionSegment[];
  timing: PlinkoMotionTimingConfig;
}

export interface CreatePlinkoMotionPlanInput {
  geometry: PlinkoBoardGeometry;
  results: readonly PlinkoPathStep[];
  rowsCount: PlinkoRows;
  timing?: Partial<PlinkoMotionTimingConfig>;
  quality?: Partial<PlinkoMotionQualityConfig>;
}

const defaultTiming: PlinkoMotionTimingConfig = {
  bucketSettleMs: 240,
  maxSegmentDurationMs: 188,
  minSegmentDurationMs: 132,
  rowAccelerationMs: 3.4,
  startSegmentDurationMs: 184,
};

const defaultQuality: PlinkoMotionQualityConfig = {
  correctionStrength: 0.56,
  damping: 0.74,
  gravityScale: 1.34,
  lateralImpulseScale: 0.28,
  pegPulseScale: 2.15,
  reboundScale: 0.34,
};

export function createPlinkoMotionPlan({
  geometry,
  quality,
  results,
  rowsCount,
  timing,
}: CreatePlinkoMotionPlanInput): PlinkoMotionPlan {
  if (results.length !== rowsCount) {
    throw new Error(
      `Plinko motion result length ${results.length} does not match rowsCount ${rowsCount}.`,
    );
  }

  const motionTiming = { ...defaultTiming, ...timing };
  const motionQuality = { ...defaultQuality, ...quality };
  const bucketIndex = getPlinkoBucketIndex(results);
  const bucket = geometry.buckets[bucketIndex];

  if (!bucket) {
    throw new Error(`Plinko bucket index ${bucketIndex} is outside the board.`);
  }

  const segments: PlinkoMotionSegment[] = [];
  const contacts: PlinkoContactEvent[] = [];
  let lane = 0;
  let timeMs = 0;
  let startPoint = geometry.startPoint;
  let inboundVelocity = {
    x: 0,
    y: geometry.laneSpacing / 10,
  };

  for (const [row, step] of results.entries()) {
    if (step !== 0 && step !== 1) {
      throw new Error(`Plinko motion result step at row ${row} is invalid.`);
    }

    const laneBefore = lane;
    const laneAfter = laneBefore + step;
    const durationMs = getSegmentDuration(row, motionTiming);
    const contactPoint = getContactPoint(geometry, row, laneBefore, step);
    const endPoint = getSegmentEndPoint(geometry, row, laneAfter);
    const side = step === 0 ? "left" : "right";
    const direction = step === 0 ? -1 : 1;
    const impactStrength = getImpactStrength(row, rowsCount);
    const lateralImpulse =
      direction * geometry.laneSpacing * motionQuality.lateralImpulseScale;
    const outboundVelocity = {
      x: lateralImpulse * motionQuality.damping,
      y:
        geometry.laneSpacing *
        (0.42 + row * 0.018) *
        motionQuality.reboundScale,
    };
    const contactTimeRatio = 0.66;
    const contact = {
      id: `row-${row}`,
      impactStrength,
      pegContact: {
        laneAfter,
        laneBefore,
        normal: {
          x: -direction,
          y: -0.45,
        },
        peg: contactPoint.peg,
        side,
      },
      point: contactPoint.point,
      pulseDurationMs: Math.round(132 + impactStrength * 44),
      pulseRadius: geometry.pegRadius * motionQuality.pegPulseScale,
      row,
      step,
      timeMs: timeMs + durationMs * contactTimeRatio,
    } satisfies PlinkoContactEvent;

    contacts.push(contact);
    segments.push({
      contactId: contact.id,
      contactPoint: contact.point,
      correctionStrength: motionQuality.correctionStrength,
      damping: motionQuality.damping,
      durationMs,
      endPoint,
      gravity:
        geometry.laneSpacing *
        (0.42 + row * 0.025) *
        motionQuality.gravityScale,
      inboundVelocity,
      index: row,
      lateralImpulse,
      outboundVelocity,
      row,
      startPoint,
      startTimeMs: timeMs,
    });

    timeMs += durationMs;
    lane = laneAfter;
    startPoint = endPoint;
    inboundVelocity = outboundVelocity;
  }

  const bucketDurationMs = Math.max(
    motionTiming.minSegmentDurationMs,
    motionTiming.startSegmentDurationMs - rowsCount * motionTiming.rowAccelerationMs,
  );
  const bucketPoint = {
    x: bucket.centerX,
    y: bucket.y + bucket.height * 0.5,
  };
  const bucketContactPoint = {
    x: startPoint.x + (bucketPoint.x - startPoint.x) * 0.52,
    y: startPoint.y + (bucketPoint.y - startPoint.y) * 0.58,
  };

  segments.push({
    contactId: null,
    contactPoint: bucketContactPoint,
    correctionStrength: 0.9,
    damping: motionQuality.damping,
    durationMs: bucketDurationMs,
    endPoint: bucketPoint,
    gravity: geometry.laneSpacing * 0.7 * motionQuality.gravityScale,
    inboundVelocity,
    index: rowsCount,
    lateralImpulse: (bucketPoint.x - startPoint.x) * 0.34,
      outboundVelocity: {
      x: 0,
      y: geometry.laneSpacing * 0.14,
    },
    row: rowsCount,
    startPoint,
    startTimeMs: timeMs,
  });

  timeMs += bucketDurationMs;

  return {
    bucketImpact: {
      bucket,
      bucketIndex,
      flashDurationMs: motionTiming.bucketSettleMs,
      impactStrength: 1,
      point: bucketPoint,
      timeMs,
    },
    bucketIndex,
    contacts,
    durationMs: timeMs,
    quality: motionQuality,
    rowsCount,
    segments,
    timing: motionTiming,
  };
}

function getSegmentDuration(
  row: number,
  timing: PlinkoMotionTimingConfig,
) {
  return Math.max(
    timing.minSegmentDurationMs,
    Math.min(
      timing.maxSegmentDurationMs,
      timing.startSegmentDurationMs - row * timing.rowAccelerationMs,
    ),
  );
}

function getImpactStrength(row: number, rowsCount: PlinkoRows) {
  return Math.min(1, 0.62 + (row / Math.max(rowsCount - 1, 1)) * 0.28);
}

function getContactPoint(
  geometry: PlinkoBoardGeometry,
  row: number,
  laneBefore: number,
  step: PlinkoPathStep,
) {
  const pegRow = geometry.pegRows[row] ?? [];
  const pegIndex = Math.max(
    0,
    Math.min(laneBefore + 1, pegRow.length - 1),
  );
  const peg = pegRow[pegIndex] ?? {
    index: pegIndex,
    row,
    x:
      geometry.width / 2 +
      (laneBefore + (step === 0 ? -0.12 : 0.12) - (row + 1) / 2) *
        geometry.laneSpacing,
    y: geometry.startPoint.y + (row + 1) * geometry.laneSpacing,
  };
  const sideOffset = step === 0 ? -1 : 1;

  return {
    peg,
    point: {
      x: peg.x + sideOffset * geometry.pegRadius * 0.42,
      y: peg.y - geometry.pegRadius * 0.34,
    },
  };
}

function getSegmentEndPoint(
  geometry: PlinkoBoardGeometry,
  row: number,
  laneAfter: number,
): PlinkoPoint {
  const nextPegRow = geometry.pegRows[row + 1];
  const nextY =
    nextPegRow?.[Math.min(laneAfter + 1, nextPegRow.length - 1)]?.y ??
    geometry.bucketY - geometry.bucketHeight * 0.45;
  const nextStepNumber = row + 2;

  return {
    x:
      geometry.width / 2 +
      (laneAfter - nextStepNumber / 2) * geometry.laneSpacing,
    y: nextY - geometry.pegRadius * 0.42,
  };
}
