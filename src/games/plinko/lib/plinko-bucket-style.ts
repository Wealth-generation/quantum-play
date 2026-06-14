export type PlinkoBucketTone =
  | "red"
  | "deepOrange"
  | "amberOrange"
  | "yellow"
  | "green";

export interface PlinkoBucketVisualStyle {
  darkColor: number;
  highlightColor: number;
  labelColor: string;
  midColor: number;
  tone: PlinkoBucketTone;
}

const BUCKET_STYLES: Record<PlinkoBucketTone, PlinkoBucketVisualStyle> = {
  red: {
    darkColor: 0x891111,
    highlightColor: 0xf13636,
    labelColor: "#161111",
    midColor: 0xd82626,
    tone: "red",
  },
  deepOrange: {
    darkColor: 0x8e3010,
    highlightColor: 0xfc6e16,
    labelColor: "#15100b",
    midColor: 0xd75413,
    tone: "deepOrange",
  },
  amberOrange: {
    darkColor: 0xa93e00,
    highlightColor: 0xfcaf16,
    labelColor: "#161205",
    midColor: 0xe28010,
    tone: "amberOrange",
  },
  yellow: {
    darkColor: 0xbc840c,
    highlightColor: 0xf2dc15,
    labelColor: "#141304",
    midColor: 0xd9b913,
    tone: "yellow",
  },
  green: {
    darkColor: 0x0f903e,
    highlightColor: 0x28f774,
    labelColor: "#07170c",
    midColor: 0x18c957,
    tone: "green",
  },
};

export function getPlinkoBucketStyle(
  bucketIndex: number,
  bucketCount: number,
): PlinkoBucketVisualStyle {
  return BUCKET_STYLES[getPlinkoBucketTone(bucketIndex, bucketCount)];
}

export function getPlinkoBucketTone(
  bucketIndex: number,
  bucketCount: number,
): PlinkoBucketTone {
  const maxDistance = (bucketCount - 1) / 2;
  const distanceFromCenter = Math.abs(bucketIndex - maxDistance);

  if (distanceFromCenter < 1) {
    return "green";
  }

  if (distanceFromCenter === maxDistance) {
    return "red";
  }

  const normalizedDistance = distanceFromCenter / Math.max(maxDistance, 1);

  if (normalizedDistance >= 0.68) {
    return "deepOrange";
  }

  if (normalizedDistance >= 0.54) {
    return "amberOrange";
  }

  return "yellow";
}
