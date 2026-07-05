import type { PlinkoAnimationPoint } from "./types";

export function drawPlinkoBall(
  context: CanvasRenderingContext2D,
  point: PlinkoAnimationPoint,
  radius: number,
) {
  const shading = context.createRadialGradient(
    point.x - radius * 0.28,
    point.y - radius * 0.34,
    radius * 0.12,
    point.x,
    point.y,
    radius,
  );
  shading.addColorStop(0, "#39b17d");
  shading.addColorStop(0.55, "#167048");
  shading.addColorStop(1, "#0a271a");

  context.save();
  context.shadowBlur = radius * 1.25;
  context.shadowColor = "rgba(57, 177, 125, 0.44)";
  context.beginPath();
  context.arc(point.x, point.y, radius, 0, Math.PI * 2);
  context.fillStyle = shading;
  context.fill();
  context.lineWidth = Math.max(radius * 0.12, 1);
  context.strokeStyle = "rgba(116, 247, 168, 0.64)";
  context.stroke();
  context.restore();
}
