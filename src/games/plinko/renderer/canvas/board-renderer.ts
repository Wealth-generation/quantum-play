import { formatPlinkoMultiplier } from "../../lib/plinko-format";
import { getPlinkoBucketStyle } from "../../lib/plinko-bucket-style";
import {
  PLINKO_BUCKET_FEEDBACK_DURATION_MS,
  PLINKO_PEG_FEEDBACK_DURATION_MS,
  type BucketFeedbacks,
  type PegFeedbacks,
} from "./feedback";
import {
  PLINKO_SOURCE_HEIGHT,
  PLINKO_SOURCE_WIDTH,
  type PlinkoSourceLayout,
} from "./source-layout";

export function drawPlinkoBoard({
  bucketFeedbacks,
  context,
  multipliers,
  now,
  pegFeedbacks,
  source,
}: {
  bucketFeedbacks: BucketFeedbacks;
  context: CanvasRenderingContext2D;
  multipliers: readonly number[];
  now: number;
  pegFeedbacks: PegFeedbacks;
  source: PlinkoSourceLayout;
}) {
  const background = context.createRadialGradient(668, 420, 20, 668, 520, 820);
  background.addColorStop(0, "rgba(27, 75, 49, 0.22)");
  background.addColorStop(1, "rgba(8, 13, 22, 0)");
  context.fillStyle = background;
  context.fillRect(0, 0, PLINKO_SOURCE_WIDTH, PLINKO_SOURCE_HEIGHT);

  for (const bucket of source.buckets) {
    drawBucket(context, bucket, multipliers[bucket.index] ?? 1, bucketFeedbacks.get(bucket.index), now, source.buckets.length);
  }

  for (const peg of source.pegs) {
    drawPeg(context, peg, pegFeedbacks.get(peg.id), now);
  }
}

function drawPeg(
  context: CanvasRenderingContext2D,
  peg: PlinkoSourceLayout["pegs"][number],
  startedAt: number | undefined,
  now: number,
) {
  const elapsed = startedAt === undefined ? null : now - startedAt;
  const progress = elapsed === null ? 0 : Math.min(Math.max(elapsed / PLINKO_PEG_FEEDBACK_DURATION_MS, 0), 1);

  context.save();

  if (elapsed !== null && progress < 1) {
    const primaryAlpha = 0.55 * Math.max(0, 1 - progress * 2);
    const secondaryProgress = Math.max(0, progress - 0.18);
    const secondaryAlpha = 0.32 * Math.max(0, 1 - secondaryProgress * 2.4);
    const glow = Math.sin(Math.PI * progress * 0.9) * Math.exp(-1.7 * progress);

    if (primaryAlpha > 0.01) {
      context.beginPath();
      context.arc(peg.x, peg.y, peg.radius * (1 + progress * 3.2), 0, Math.PI * 2);
      context.strokeStyle = `rgba(34, 197, 94, ${primaryAlpha})`;
      context.lineWidth = 1.4;
      context.stroke();
    }

    if (secondaryAlpha > 0.01) {
      context.beginPath();
      context.arc(peg.x, peg.y, peg.radius * (1 + secondaryProgress * 2.4), 0, Math.PI * 2);
      context.strokeStyle = `rgba(36, 201, 98, ${secondaryAlpha})`;
      context.lineWidth = 0.9;
      context.stroke();
    }

    context.shadowColor = "#24c962";
    context.shadowBlur = peg.radius * 5 * glow;
    context.strokeStyle = "#22c55e";
    context.lineWidth = Math.max(peg.radius * 0.33, 2.2);
  } else {
    context.strokeStyle = "#3f4a59";
    context.lineWidth = Math.max(peg.radius * 0.32, 2);
  }

  context.beginPath();
  context.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawBucket(
  context: CanvasRenderingContext2D,
  bucket: PlinkoSourceLayout["buckets"][number],
  multiplier: number,
  startedAt: number | undefined,
  now: number,
  bucketCount: number,
) {
  const style = getPlinkoBucketStyle(bucket.index, bucketCount);
  const elapsed = startedAt === undefined ? null : now - startedAt;
  const progress = elapsed === null ? 0 : Math.min(Math.max(elapsed / PLINKO_BUCKET_FEEDBACK_DURATION_MS, 0), 1);
  const pulse = elapsed === null ? 0 : Math.sin(Math.PI * progress) * (1 - progress * 0.28);
  const scale = 1 + pulse * 0.035;
  const centerY = bucket.y + bucket.height / 2;

  context.save();
  context.translate(bucket.centerX, centerY);
  context.scale(scale, scale);
  context.translate(-bucket.centerX, -centerY);

  const fill = context.createLinearGradient(bucket.x, bucket.y, bucket.x, bucket.y + bucket.height);
  fill.addColorStop(0, toHex(style.highlightColor));
  fill.addColorStop(0.5, toHex(style.midColor));
  fill.addColorStop(1, toHex(style.darkColor));
  context.fillStyle = fill;
  roundRect(context, bucket.x, bucket.y, bucket.width, bucket.height, bucket.radius);
  context.fill();

  if (pulse > 0) {
    context.shadowColor = "rgba(74, 222, 128, 0.9)";
    context.shadowBlur = 16 * pulse;
    context.strokeStyle = `rgba(244, 255, 248, ${0.24 + pulse * 0.48})`;
    context.lineWidth = 2;
    roundRect(context, bucket.x, bucket.y, bucket.width, bucket.height, bucket.radius);
    context.stroke();
  }

  context.fillStyle = style.labelColor;
  context.font = `900 ${Math.max(Math.min(bucket.width * 0.3, 19), 10)}px Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(formatPlinkoMultiplier(multiplier), bucket.centerX, centerY + 1);
  context.restore();
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function toHex(value: number) {
  return `#${value.toString(16).padStart(6, "0")}`;
}
