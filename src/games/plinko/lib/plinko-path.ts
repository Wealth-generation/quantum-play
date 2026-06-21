import type { PlinkoRows } from "../config";
import type { PlinkoPathStep } from "../model";
import { getPlinkoBucketIndex, toPlinkoPathStep } from "./plinko-result";

export interface PlinkoPoint {
  x: number;
  y: number;
}

export interface PlinkoBucketGeometry {
  centerX: number;
  height: number;
  index: number;
  radius: number;
  width: number;
  x: number;
  y: number;
}

export interface PlinkoPegGeometry extends PlinkoPoint {
  index: number;
  row: number;
}

export interface PlinkoBoardGeometry {
  ballCollisionRadius: number;
  ballHaloRadius: number;
  ballImpactHaloRadius: number;
  ballRadius: number;
  boardSize: "compact" | "desktop" | "expanded";
  bucketCount: number;
  bucketGap: number;
  bucketHeight: number;
  bucketY: number;
  buckets: PlinkoBucketGeometry[];
  height: number;
  laneSpacing: number;
  pegCollisionRadius: number;
  pegImpactRadius: number;
  pegRadius: number;
  pegRows: PlinkoPegGeometry[][];
  pocketDividerThickness: number;
  pocketEntryY: number;
  pocketFloorY: number;
  pocketSettleSamples: number;
  pocketSettleSpeed: number;
  pocketSettleY: number;
  rowSpacing: number;
  rowsCount: PlinkoRows;
  startPoint: PlinkoPoint;
  width: number;
}

export interface PlinkoBoardGeometryMetrics {
  ballCollisionRadius: number;
  ballPassageClearance: number;
  ballToLaneRatio: number;
  ballVisualRadius: number;
  boardSize: PlinkoBoardGeometry["boardSize"];
  collisionRadiusSumToLaneRatio: number;
  height: number;
  impactHaloRadius: number;
  laneSpacing: number;
  pegCollisionRadius: number;
  pegVisualRadius: number;
  restHaloRadius: number;
  rowSpacing: number;
  width: number;
}

export interface CreatePlinkoBoardGeometryInput {
  height: number;
  rowsCount: PlinkoRows;
  width: number;
}

export interface CreatePlinkoPathPlanInput {
  geometry: PlinkoBoardGeometry;
  results: readonly number[];
  rowsCount: PlinkoRows;
}

export interface PlinkoBallWaypoint extends PlinkoPoint {
  lane: number;
  row: number;
  step: PlinkoPathStep | null;
}

export interface PlinkoPathPlan {
  bucketIndex: number;
  results: PlinkoPathStep[];
  targetBucket: PlinkoBucketGeometry;
  waypoints: PlinkoBallWaypoint[];
}

export function createPlinkoBoardGeometry({
  height,
  rowsCount,
  width,
}: CreatePlinkoBoardGeometryInput): PlinkoBoardGeometry {
  const safeWidth = Math.max(width, 1);
  const safeHeight = Math.max(height, 1);
  const bucketCount = rowsCount + 1;
  const sidePadding = Math.max(safeWidth * 0.08, 18);
  const bucketHeight = Math.max(Math.min(safeHeight * 0.1, 42), 26);
  const bucketGap = Math.max(Math.min(safeWidth * 0.006, 6), 2);
  const bucketWidth =
    (safeWidth - sidePadding * 2 - bucketGap * (bucketCount - 1)) /
    bucketCount;
  const laneSpacing = bucketWidth + bucketGap;
  const bucketRowWidth =
    bucketWidth * bucketCount + bucketGap * (bucketCount - 1);
  const bucketStartX = safeWidth / 2 - bucketRowWidth / 2;
  const bottomPadding = Math.max(safeHeight * 0.055, 16);
  const bucketY = safeHeight - bucketHeight - bottomPadding;
  const topPadding = Math.max(safeHeight * 0.08, 20);
  const pegBottomY = bucketY - Math.max(bucketHeight * 0.62, 20);
  const usableHeight = Math.max(pegBottomY - topPadding, 1);
  const rowSpacing = usableHeight / Math.max(rowsCount - 1, 1);
  // These tokens deliberately scale from the lane rather than a fixed ball
  // minimum. Compact fourteen-row boards otherwise become a collision lattice.
  const pegRadius = clamp(laneSpacing * 0.18, 2.6, 10.5);
  const ballRadius = clamp(laneSpacing * 0.18, 2.6, 10.2);
  const pegCollisionRadius = pegRadius * 0.95;
  const ballCollisionRadius = ballRadius * 0.96;
  const ballHaloRadius = Math.min(ballRadius * 1.18, laneSpacing * 0.25);
  const ballImpactHaloRadius = Math.min(
    ballRadius * 1.42,
    laneSpacing * 0.34,
  );
  const pegImpactRadius = Math.min(pegRadius * 1.75, laneSpacing * 0.35);
  const pocketDividerThickness = Math.max(1.5, ballCollisionRadius * 0.2);
  const pocketEntryY = bucketY - bucketHeight * 0.12;
  const pocketFloorY = bucketY + bucketHeight * 0.85;
  const pocketSettleY = bucketY + bucketHeight * 0.62;
  const boardSize = getBoardSize({ height: safeHeight, width: safeWidth });
  const startPoint = {
    x: safeWidth / 2,
    y: Math.max(topPadding - ballRadius * 2.4, ballRadius + 4),
  };
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const x = bucketStartX + index * laneSpacing;

    return {
      centerX: x + bucketWidth / 2,
      height: bucketHeight,
      index,
      radius: Math.max(Math.min(bucketHeight * 0.28, 11), 7),
      width: bucketWidth,
      x,
      y: bucketY,
    };
  });
  const pegRows = Array.from({ length: rowsCount }, (_, row) => {
    const pegsInRow = row + 3;
    const y = topPadding + rowSpacing * row;
    const rowWidth = laneSpacing * (pegsInRow - 1);
    const startX = safeWidth / 2 - rowWidth / 2;

    return Array.from({ length: pegsInRow }, (_, index) => ({
      index,
      row,
      x: startX + laneSpacing * index,
      y,
    }));
  });

  return {
    ballCollisionRadius,
    ballHaloRadius,
    ballImpactHaloRadius,
    ballRadius,
    boardSize,
    bucketCount,
    bucketGap,
    bucketHeight,
    bucketY,
    buckets,
    height: safeHeight,
    laneSpacing,
    pegCollisionRadius,
    pegImpactRadius,
    pegRadius,
    pegRows,
    pocketDividerThickness,
    pocketEntryY,
    pocketFloorY,
    pocketSettleSamples: 7,
    pocketSettleSpeed: laneSpacing * 0.085,
    pocketSettleY,
    rowSpacing,
    rowsCount,
    startPoint,
    width: safeWidth,
  };
}

export function getPlinkoBoardGeometryMetrics(
  geometry: PlinkoBoardGeometry,
): PlinkoBoardGeometryMetrics {
  const collisionRadiusSum =
    geometry.ballCollisionRadius + geometry.pegCollisionRadius;

  return {
    ballCollisionRadius: geometry.ballCollisionRadius,
    ballPassageClearance: geometry.laneSpacing - collisionRadiusSum * 2,
    ballToLaneRatio: geometry.ballCollisionRadius / geometry.laneSpacing,
    ballVisualRadius: geometry.ballRadius,
    boardSize: geometry.boardSize,
    collisionRadiusSumToLaneRatio:
      collisionRadiusSum / geometry.laneSpacing,
    height: geometry.height,
    impactHaloRadius: geometry.ballImpactHaloRadius,
    laneSpacing: geometry.laneSpacing,
    pegCollisionRadius: geometry.pegCollisionRadius,
    pegVisualRadius: geometry.pegRadius,
    restHaloRadius: geometry.ballHaloRadius,
    rowSpacing: geometry.rowSpacing,
    width: geometry.width,
  };
}

export function createPlinkoPathPlan({
  geometry,
  results,
  rowsCount,
}: CreatePlinkoPathPlanInput): PlinkoPathPlan {
  if (results.length !== rowsCount) {
    throw new Error(
      `Plinko path result length ${results.length} does not match rowsCount ${rowsCount}.`,
    );
  }

  const path = results.map((result, index) => {
    const step = toPlinkoPathStep(result);

    if (step === null) {
      throw new Error(
        `Plinko path result step at index ${index} was ${String(result)} instead of 0 or 1.`,
      );
    }

    return step;
  });
  const bucketIndex = getPlinkoBucketIndex(path);
  const targetBucket = geometry.buckets[bucketIndex];

  if (!targetBucket) {
    throw new Error(`Plinko bucket index ${bucketIndex} is outside the board.`);
  }

  let lane = 0;
  const waypoints: PlinkoBallWaypoint[] = [
    {
      lane: 0,
      row: -1,
      step: null,
      ...geometry.startPoint,
    },
  ];

  for (const [index, step] of path.entries()) {
    lane += step;
    const stepNumber = index + 1;
    const pegRow = geometry.pegRows[index];
    const rowY = pegRow?.[Math.min(lane + 1, pegRow.length - 1)]?.y;

    waypoints.push({
      lane,
      row: index,
      step,
      x: geometry.width / 2 + (lane - stepNumber / 2) * geometry.laneSpacing,
      y: rowY ?? geometry.startPoint.y,
    });
  }

  waypoints.push({
    lane: bucketIndex,
    row: rowsCount,
    step: null,
    x: targetBucket.centerX,
    y: targetBucket.y + targetBucket.height * 0.5,
  });

  return {
    bucketIndex,
    results: path,
    targetBucket,
    waypoints,
  };
}

function getBoardSize({
  height,
  width,
}: {
  height: number;
  width: number;
}): PlinkoBoardGeometry["boardSize"] {
  if (width < 420 || height < 420) {
    return "compact";
  }

  if (width >= 840 || height >= 620) {
    return "expanded";
  }

  return "desktop";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
