/**
 * Pure ball-motion model for European roulette.
 * No Pixi imports, no DOM, no pixels.
 *
 * All radial values are expressed as ratios of the wheel radius R.
 * Reference scale: wheel = 300 px → R = 150 px; ratio = ref_px / 150.
 * Renderer converts: pixelRadius = radiusRatio × min(canvasW, canvasH) / 2.
 */

// ── Cell order ────────────────────────────────────────────────────────────────
// European single-zero pocket order, clockwise from pocket 0.
// Identical to EUROPEAN_POCKETS in roulette-wheel-geometry.ts.
// Keep both arrays in sync with the disc sprite asset.
export const ROULETTE_CELLS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
  11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
  22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;

/** Angular width of one pocket in degrees (European wheel, 37 pockets). */
export const ANGLE_PER_CELL = 360 / 37;

/**
 * The disc sprite places pocket 0 at 12 o'clock.
 * In screen-space trig (y-down, 0° = 3 o'clock), 12 o'clock = −90°.
 * Add this offset to every pocket screen-angle calculation.
 * If the disc asset is replaced with pocket 0 at a different position, update here only.
 */
export const SPRITE_ZERO_OFFSET_DEG = -90;

// ── Reference radial ratios (ref_px / R, reference R = 150 px) ───────────────
export const R_OUTER    = 137 / 150; // 0.9133 — outer ball-track groove
export const R_MID      = 112 / 150; // 0.7467 — mid-track deflector level
export const R_INNER    =  98 / 150; // 0.6533 — pocket depth, final resting radius
export const R_CLAMP_LO =  95 / 150; // 0.6333 — hard radial floor

// ── Radial phase time boundaries (raw ∈ [0, 1] = elapsed / spinDuration) ─────
const FALL_START  = 0.50; // outer → mid begins
const FALL_END    = 0.65; // mid reached
const BOUNCE_END  = 0.76; // bounce back to outer complete
const SETTLE_END  = 0.84; // outer → inner complete; jitter begins
// Jitter: SETTLE_END → 1.00

// ── Outer-track high-frequency wave (raw < 0.50) ─────────────────────────────
const WAVE_AMP = 0.008; // 0.008 · R

// Three deflector bumps within the outer-track phase.
// Each bump: amp · sin(d · π) for d = (raw − c) / w, active when d ∈ [0, 1].
const DEFLECTORS = [
  { c: 0.09, w: 0.045, amp: 0.0867 },
  { c: 0.26, w: 0.050, amp: 0.1067 },
  { c: 0.41, w: 0.045, amp: 0.0733 },
] as const;

// ── Jitter parameters (raw ∈ [SETTLE_END, 1.0]) ──────────────────────────────
const JITTER_AMP  = 0.04; // 0.04 · R
const JITTER_FREQ = 6;    // sin(t · π · 6) = 3 full oscillations; (1−t)² dampens to 0

// ── Post-spin idle constants ──────────────────────────────────────────────────
/** Duration (ms) the ball co-rotates with the wheel in the pocket after spin end. */
export const FOLLOW_DURATION_MS = 2_000;

/**
 * Rate at which the ball's radius returns from R_INNER to R_OUTER during free idle
 * (after the follow window). Units: R-ratio per second.
 * Reference: ~60 px/s on R=150 → 60/150 = 0.4 R/s.
 * At this rate the R_INNER → R_OUTER gap (~0.26 R) takes ~0.65 s.
 */
export const RETURN_RATE_PER_SEC = 0.4;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SpinContext {
  /** Ball screen angle at spin trigger (degrees). */
  startAngleDeg: number;
  /** Index into ROULETTE_CELLS for the winning pocket (0–36). */
  cellIndex: number;
  /** Wheel/disc rotation angle at trigger time (degrees). */
  wheelAngleDeg: number;
  /** Wheel idle rotation speed (deg/s). CCW = negative. */
  idleDegPerSec: number;
  /** Total spin duration (seconds). */
  spinDurationSec: number;
}

/**
 * Ball polar state returned by every motion function.
 * Renderer converts: pixelRadius = radiusRatio × wheelRadiusPx
 * where wheelRadiusPx = min(canvasWidth, canvasHeight) / 2.
 */
export interface BallPolarState {
  angleDeg: number;
  radiusRatio: number;
}

/**
 * Per-frame input for the stateful idle integrator.
 * The renderer owns prevAngleDeg / prevRadiusRatio and feeds them back each frame.
 */
export interface IdleStepContext {
  prevAngleDeg: number;
  prevRadiusRatio: number;
  /** Frame delta in ms, already clamped (e.g. max 100 ms). */
  dtMs: number;
  /** Wheel idle rotation speed (deg/s). CCW = negative. */
  idleDegPerSec: number;
  /** Disc angle change this frame (degrees). CCW = negative. */
  discDeltaDeg: number;
  /** True while the post-spin follow window is active. */
  inFollowWindow: boolean;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function radiusAtRaw(raw: number): number {
  if (raw < FALL_START) {
    let r = R_OUTER + WAVE_AMP * Math.sin(raw * Math.PI * 10);
    for (const { c, w, amp } of DEFLECTORS) {
      const d = (raw - c) / w;
      if (d >= 0 && d <= 1) r += amp * Math.sin(d * Math.PI);
    }
    return Math.max(R_CLAMP_LO, Math.min(R_OUTER, r));
  }
  if (raw < FALL_END) {
    const t = (raw - FALL_START) / (FALL_END - FALL_START);
    return R_OUTER + (R_MID - R_OUTER) * smoothstep(t);
  }
  if (raw < BOUNCE_END) {
    const t = (raw - FALL_END) / (BOUNCE_END - FALL_END);
    return R_MID + (R_OUTER - R_MID) * smoothstep(t);
  }
  if (raw < SETTLE_END) {
    const t = (raw - BOUNCE_END) / (SETTLE_END - BOUNCE_END);
    return R_OUTER + (R_INNER - R_OUTER) * smoothstep(t);
  }
  // Jitter phase: SETTLE_END → 1.0; ends at R_INNER (jitter(t=1) = 0).
  const t = (raw - SETTLE_END) / (1 - SETTLE_END);
  const jitter = JITTER_AMP * Math.sin(t * Math.PI * JITTER_FREQ) * Math.pow(1 - t, 2);
  return Math.max(R_CLAMP_LO, Math.min(R_OUTER, R_INNER + jitter));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Pure spin trajectory. raw = elapsed / spinDuration ∈ [0, 1].
 *
 * ANGLE — ease-out via sin(π/2 · raw):
 *   finalWheelAngleDeg = wheelAngleDeg + idleDegPerSec · spinDurationSec
 *   finalBallAngleDeg  = SPRITE_ZERO_OFFSET_DEG + cellIndex · ANGLE_PER_CELL + finalWheelAngleDeg
 *   totalDelta = natural CCW arc from startAngle to finalBallAngle + one full CCW lap (negative).
 *                Guarantees ≥ 1 full CCW revolution; ball lands exactly at finalBallAngleDeg.
 *   angleDeg = startAngleDeg + totalDelta · sin(π/2 · raw)
 *
 * RADIUS — 5-phase radial profile, clamped to [R_CLAMP_LO, R_OUTER]:
 *   0.00–0.50  outer-track orbit: high-freq wave (0.008 · R) + 3 deflector bumps
 *   0.50–0.65  smoothstep outer → mid (first fall in)
 *   0.65–0.76  smoothstep mid → outer (bounce out)
 *   0.76–0.84  smoothstep outer → inner (settle)
 *   0.84–1.00  R_INNER + 0.04·R · sin(t·π·6) · (1−t)²  damped jitter; ends at R_INNER
 */
export function getSpinBallState(raw: number, ctx: SpinContext): BallPolarState {
  const r = Math.max(0, Math.min(1, raw));

  const finalWheelAngleDeg = ctx.wheelAngleDeg + ctx.idleDegPerSec * ctx.spinDurationSec;
  const targetAngleDeg     = SPRITE_ZERO_OFFSET_DEG + ctx.cellIndex * ANGLE_PER_CELL;
  const finalBallAngleDeg  = targetAngleDeg + finalWheelAngleDeg;

  // Minimum CCW arc (degrees, ≥ 0) from startAngleDeg to finalBallAngleDeg,
  // then add one full extra CCW lap → total CCW travel ∈ [360°, 720°].
  const naturalCCW = ((ctx.startAngleDeg - finalBallAngleDeg) % 360 + 360) % 360;
  const totalDelta = -(naturalCCW + 360);

  const eased = Math.sin((Math.PI / 2) * r);

  if (process.env.NODE_ENV === "development" && r >= 1) {
    // Landing assertion: ball angle at raw=1 must equal finalBallAngleDeg (mod 360°).
    const landed = ctx.startAngleDeg + totalDelta;
    const diff   = (((landed - finalBallAngleDeg) % 360) + 360) % 360;
    const err    = diff > 180 ? diff - 360 : diff;
    if (Math.abs(err) > 0.01) {
      console.warn(
        `[roulette-ball-motion] Landing assertion: pocket ${ctx.cellIndex}, ` +
        `expected ${finalBallAngleDeg.toFixed(2)}°, got ${landed.toFixed(2)}°, err ${err.toFixed(4)}°`,
      );
    }
  }

  return {
    angleDeg:    ctx.startAngleDeg + totalDelta * eased,
    radiusRatio: radiusAtRaw(r),
  };
}

/**
 * Stateful idle integrator — advance ball position by one frame.
 * The renderer owns prevAngleDeg / prevRadiusRatio and feeds them back each frame.
 *
 * Follow window (inFollowWindow = true):
 *   Ball drifts WITH the disc (CCW at discDeltaDeg per frame); radius locked at R_INNER.
 *
 * Free idle (inFollowWindow = false):
 *   Ball creeps CW at 30 % of the disc idle speed (opposite sign of idleDegPerSec).
 *   Radius eases back to R_OUTER at RETURN_RATE_PER_SEC (R-ratio per second).
 *   Both angle and radius change continuously — no snap to any home position.
 */
export function getIdleBallState(ctx: IdleStepContext): BallPolarState {
  if (ctx.inFollowWindow) {
    return {
      angleDeg:    ctx.prevAngleDeg + ctx.discDeltaDeg,
      radiusRatio: R_INNER,
    };
  }

  // CW creep: negate idleDegPerSec direction, at 30 % of disc speed.
  const creepDeg   = -ctx.idleDegPerSec * 0.3 * (ctx.dtMs / 1_000);
  const nextRadius = Math.min(
    ctx.prevRadiusRatio + RETURN_RATE_PER_SEC * (ctx.dtMs / 1_000),
    R_OUTER,
  );
  return {
    angleDeg:    ctx.prevAngleDeg + creepDeg,
    radiusRatio: nextRadius,
  };
}
