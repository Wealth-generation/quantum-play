import type { PlinkoRows } from "../../config";

export const PLINKO_SOURCE_HEIGHT = 1073;
export const PLINKO_SOURCE_WIDTH = 1336;
const SOURCE_CENTER_X = PLINKO_SOURCE_WIDTH / 2;
const BUCKET_HEIGHT = 56;
const BUCKET_Y = 1017;

export interface PlinkoSourceBucket {
  centerX: number;
  height: number;
  index: number;
  radius: number;
  width: number;
  x: number;
  y: number;
}

export interface PlinkoSourcePeg {
  id: string;
  radius: number;
  x: number;
  y: number;
}

export interface PlinkoSourceLayout {
  ballRadius: number;
  buckets: readonly PlinkoSourceBucket[];
  pegs: readonly PlinkoSourcePeg[];
  rowsCount: PlinkoRows;
}

export interface PlinkoCanvasTransform {
  cssHeight: number;
  cssWidth: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function createPlinkoSourceLayout(rowsCount: PlinkoRows): PlinkoSourceLayout {
  const pegRadius = 932 / ((rowsCount - 1) * 8 + 2);
  const spacing = pegRadius * 8;
  const pegs: PlinkoSourcePeg[] = [];

  for (let row = 0; row < rowsCount; row += 1) {
    const pegsInRow = row + 3;
    const startX = SOURCE_CENTER_X - ((pegsInRow - 1) * spacing) / 2;

    for (let index = 0; index < pegsInRow; index += 1) {
      pegs.push({
        id: `${row}:${index}`,
        radius: pegRadius,
        x: startX + index * spacing,
        y: 50 + pegRadius + row * spacing,
      });
    }
  }

  const bucketCount = rowsCount + 1;
  const bucketGap = Math.max(spacing * 0.035, 3);
  const bucketWidth = spacing - bucketGap;
  const bucketStartX = SOURCE_CENTER_X - (bucketCount * spacing) / 2;
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const x = bucketStartX + index * spacing + bucketGap / 2;

    return {
      centerX: x + bucketWidth / 2,
      height: BUCKET_HEIGHT,
      index,
      radius: Math.max(Math.min(bucketWidth * 0.18, 11), 6),
      width: bucketWidth,
      x,
      y: BUCKET_Y,
    } satisfies PlinkoSourceBucket;
  });

  return {
    ballRadius: (Math.sqrt(rowsCount) / 2) * pegRadius,
    buckets,
    pegs,
    rowsCount,
  };
}

export function getPlinkoCanvasTransform(
  cssWidth: number,
  cssHeight: number,
): PlinkoCanvasTransform {
  const safeWidth = Math.max(cssWidth, 1);
  const safeHeight = Math.max(cssHeight, 1);
  const scale = Math.min(
    safeWidth / PLINKO_SOURCE_WIDTH,
    safeHeight / PLINKO_SOURCE_HEIGHT,
  );

  return {
    cssHeight: safeHeight,
    cssWidth: safeWidth,
    offsetX: (safeWidth - PLINKO_SOURCE_WIDTH * scale) / 2,
    offsetY: (safeHeight - PLINKO_SOURCE_HEIGHT * scale) / 2,
    scale,
  };
}
