import { R_RIM } from "./roulette-wheel-geometry";

/**
 * Fixed post-bet spin duration. All ball travel is CCW.
 * The idle ball orbit (roulette-wheel-ball.tsx) is CW — separate system, do not conflate.
 */
export const SPIN_DURATION_MS = 4_000;

// ── Radial geometry ─────────────────────────────────────────────────────────────
// All radii are normalized: 1.0 = outer rim orbit radius = container_height × RIM_HEIGHT_FRACTION.
// R_RIM is the canonical source in roulette-wheel-geometry.ts; the pocket band constants below are
// trajectory-local and should be tuned against the actual disc asset during visual QA.
// SYNC REQUIRED: if the disc image's pocket band position changes, update R_POCKET_OUTER / R_POCKET_INNER.
export { R_RIM };
export const R_POCKET_OUTER = 0.82; // outer edge of the red/black pocket band — first contact on descent
const R_POCKET_INNER = 0.62; // inner edge of the pocket band — HARD FLOOR, never crossed

// ── Phase time boundaries (fractions of SPIN_DURATION_MS) ──────────────────────
// Radial and angular behaviors are DECOUPLED: radial uses all four phases; angular completes at P3_END.
//
// RADIAL (all four phases):
// Phase 1: 0 %–70 % (2800 ms) — ball at R_RIM (rim lap)
// Phase 2: 70 %–90 % ( 800 ms) — descent + decaying bounces in [R_POCKET_INNER, R_POCKET_OUTER]
// Phase 3: 90 %–97 % ( 280 ms) — smooth outward return from R_POCKET_INNER back to R_RIM
// Phase 4: 97 %–100% ( 120 ms) — inward roll from R_RIM into winning pocket at R_POCKET_OUTER
//                                  with a small settle wobble
//
// ANGULAR (phases 1–3 only; phase 4 = FROZEN at targetPocketAngleRad):
// Phases 1–2: near-constant angular speed covering the bulk of the arc.
// Phase 3: cubic deceleration, angular velocity easing to exactly zero at P3_END.
// The ball arrives at the correct pocket angle with zero angular velocity, then the
// radial-only roll-in begins — no last-instant lateral jump across the pocket band.
export const P1_END = 0.70;
const P2_END = 0.90;
export const P3_END = 0.97;

// ── Angular displacement weights (phases 1–3 only; sum = 1.0) ──────────────────
// Phase 4 contributes ZERO angular displacement — the ball is angularly frozen.
// W1_ANG absorbs the former W4 (0.07) allocation, extending the rim-arc phase.
// Phase 3 covers the remaining 8 % implicitly (1 − 0.72 − 0.20 = 0.08).
const W1_ANG = 0.72; // phase 1: 72 % of arc over 70 % of time
const W2_ANG = 0.20; // phase 2: 20 % of arc over 20 % of time

// ── Phase-2 bounce parameters ───────────────────────────────────────────────────
// Bounce oscillates within [R_POCKET_INNER, R_POCKET_OUTER]; the hard floor is guaranteed
// because cos²(…) ≥ 0 and exp(…) ≥ 0 — the formula never subtracts from R_POCKET_INNER.
//
// P2_FREQ = 1.5  → 2 pocket-inner landings (cos²=0 at t2=1/3 and t2=1): gentle, well-spaced hops.
// P2_DAMP = 3.0  → exp(−3·t2): ~95 % amplitude lost by phase exit; tiny residual bounce.
// P2_RIM_DECAY   → exp(−20·t2): rim height fades to ~0 in the first ~50 ms of phase 2.
const P2_FREQ = 1.5;
const P2_DAMP = 3.0;
const P2_RIM_DECAY = 20.0;

// ── Phase-3 angular deceleration cubic ─────────────────────────────────────────
// Decelerates angular velocity from the phase-2 rate to zero at P3_END.
// p3(t3) = P3_ANG_A·t3³ + P3_ANG_B·t3² + P3_ANG_C·t3, t3 ∈ [0, 1]
//
// Constraints (W3_ANG = 1 − W1_ANG − W2_ANG = 0.08; Δs3 = P3_END − P2_END = 0.07):
//   p3(0)  = 0                            C0 at P2→P3 ✓
//   p3(1)  = 0.08                         covers W3_ANG ✓
//   p3'(0) = Δs3 × (W2_ANG / (P2_END−P1_END)) = 0.07 × 1.0 = 0.07  C1 match ✓
//   p3'(1) = 0                            smooth angular stop at P3_END ✓
//
// Solution: A = −0.09, B = 0.10, C = 0.07.
// Monotonicity: p3'(t3) = −0.27t3² + 0.20t3 + 0.07; roots at t3 = −0.259 and t3 = 1.0
//   → p3' > 0 for all t3 ∈ (0, 1), zero only at the endpoint. Monotone ✓
const P3_ANG_A = -0.09;
const P3_ANG_B =  0.10;
const P3_ANG_C =  0.07;

// ── Phase-4 settle wobble ───────────────────────────────────────────────────────
// Small oscillation on top of the inward-roll curve, decaying quickly to zero.
// Amplitude expressed as a fraction of the pocket band gap (R_POCKET_OUTER − R_POCKET_INNER).
// Result is clamped to [R_POCKET_INNER, R_RIM] so the floor is never violated.
const P4_WOBBLE_AMP = 0.12;
const P4_WOBBLE_FREQ = 3.0; // 1.5 oscillation cycles in 120 ms settle window
const P4_WOBBLE_DAMP = 6.0;

// Gap between pocket band edges — used in phases 2 and 4.
const POCKET_GAP = R_POCKET_OUTER - R_POCKET_INNER;

export interface BallState {
  angleRad: number;
  radius: number;
  phase: 1 | 2 | 3 | 4;
  settled: boolean;
}

/**
 * Maps s ∈ [0, 1] to cumulative ANGULAR progress ∈ [0, 1].
 * ANGULAR MOTION IS COMPLETE AT s = P3_END (0.97). For s > P3_END returns 1.0 —
 * the ball is angularly frozen at targetPocketAngleRad while phase 4 rolls it radially inward.
 *
 * Phases 1–2: near-constant angular speed (linear within each phase).
 * Phase 3: cubic deceleration — C1-continuous at P2→P3, eases to zero angular velocity at P3_END.
 */
export function easedProgress(s: number): number {
  if (s <= P1_END) {
    return (s / P1_END) * W1_ANG;
  }
  if (s <= P2_END) {
    return W1_ANG + ((s - P1_END) / (P2_END - P1_END)) * W2_ANG;
  }
  if (s <= P3_END) {
    const t3 = (s - P2_END) / (P3_END - P2_END);
    return W1_ANG + W2_ANG + (P3_ANG_A * t3 * t3 * t3 + P3_ANG_B * t3 * t3 + P3_ANG_C * t3);
  }
  return 1.0; // phase 4: angular motion complete — ball stays at targetPocketAngleRad
}

function phaseAtS(s: number): 1 | 2 | 3 | 4 {
  if (s <= P1_END) return 1;
  if (s <= P2_END) return 2;
  if (s <= P3_END) return 3;
  return 4;
}

/**
 * Radial position of the ball.  Radii: R_RIM = 1.0, R_POCKET_OUTER = 0.82, R_POCKET_INNER = 0.62.
 * The ball is always within [R_POCKET_INNER, R_RIM]; R_POCKET_INNER is a hard floor.
 *
 * Phase 1: R_RIM constant — rim lap.
 *
 * Phase 2: descent + decaying pocket-band bounces.
 *   At t2=0 the formula evaluates to R_RIM (continuous from phase 1).
 *   A fast-decaying rim-height term (`rimExtra`) handles the brief descent from R_RIM to
 *   R_POCKET_OUTER in the first ~50 ms; after that it is effectively zero.
 *   The bounce term `POCKET_GAP · exp(−P2_DAMP·t2) · cos²(P2_FREQ·π·t2)` oscillates the ball
 *   within [0, POCKET_GAP] above R_POCKET_INNER: cos²=0 means ball is at R_POCKET_INNER (landing),
 *   cos²=1 means full gap amplitude (approaching R_POCKET_OUTER, damped over time).
 *   With P2_FREQ=1.5, cos²=0 at t2=1/3 (first landing) and t2=1 (phase exit) → 2 landings.
 *   Because cos²≥0 and exp≥0, radius is always ≥ R_POCKET_INNER. Hard floor guaranteed.
 *
 * Phase 3: smooth outward return.
 *   Phase 2 exits at R_POCKET_INNER (cos²(1.5π)=0, rimExtra≈0).
 *   Smoothstep from R_POCKET_INNER to R_RIM — continuous at both endpoints.
 *
 * Phase 4: inward settle roll.
 *   Smoothstep from R_RIM to R_POCKET_OUTER (the pocket resting depth), plus a small damped
 *   wobble representing the ball settling into the pocket.  Clamped to [R_POCKET_INNER, R_RIM].
 */
export function radiusAtS(s: number): number {
  if (s <= P1_END) return R_RIM;

  if (s <= P2_END) {
    const t2 = (s - P1_END) / (P2_END - P1_END);
    // Quick rim-height fade (R_RIM → R_POCKET_OUTER region) — gone within ~50 ms.
    const rimExtra = (R_RIM - R_POCKET_OUTER) * Math.exp(-P2_RIM_DECAY * t2);
    // Pocket-band bounce: always ≥ 0, so radius ≥ R_POCKET_INNER always.
    const bounce = POCKET_GAP * Math.exp(-P2_DAMP * t2) * Math.pow(Math.cos(P2_FREQ * Math.PI * t2), 2);
    return R_POCKET_INNER + bounce + rimExtra;
  }

  if (s <= P3_END) {
    // Phase 2 exits at R_POCKET_INNER (verified: cos²(1.5π)=0, rimExtra≈0 at t2=1).
    // Smoothstep from R_POCKET_INNER to R_RIM: continuous at t3=0 and t3=1.
    const t3 = (s - P2_END) / (P3_END - P2_END);
    return R_POCKET_INNER + (R_RIM - R_POCKET_INNER) * (3 * t3 * t3 - 2 * t3 * t3 * t3);
  }

  // Phase 3 exits at R_RIM (smoothstep(1)=1 → R_POCKET_INNER + (R_RIM−R_POCKET_INNER) = R_RIM).
  // Phase 4: smoothstep roll from R_RIM down to R_POCKET_OUTER, plus settle wobble.
  const t4 = (s - P3_END) / (1.0 - P3_END);
  const roll = R_POCKET_OUTER + (R_RIM - R_POCKET_OUTER) * (1 - t4 * t4 * (3 - 2 * t4));
  const wobble = POCKET_GAP * P4_WOBBLE_AMP * Math.sin(P4_WOBBLE_FREQ * Math.PI * t4) * Math.exp(-P4_WOBBLE_DAMP * t4);
  return Math.max(R_POCKET_INNER, Math.min(R_RIM, roll + wobble));
}

/**
 * Pure trajectory function for the post-bet ball spin. No React, no DOM, no rAF.
 *
 * Caller pre-computes startBallAngleRad and targetPocketAngleRad:
 *   targetPocketAngleRad = POCKET_ZERO_INITIAL_ANGLE_RAD
 *                        + discAngle0                                   // disc CSS angle at t=0
 *                        + pocketAngleRad(pocketIndexForNumber(result)) // pocket offset on disc
 *                        + discOmegaRadPerMs * totalDurationMs           // disc co-rotation
 *                        - SPIN_EXTRA_REVOLUTIONS * 2π                  // extra CCW ball revs
 *   startBallAngleRad  = −π/2 + Math.atan2(orbitMatrix.m12, orbitMatrix.m11)  // live orbit angle
 *
 * @param elapsedMs            ms since spin was triggered
 * @param totalDurationMs      total spin duration; use SPIN_DURATION_MS
 * @param startBallAngleRad    ball angle (rad) at trigger time — read from live orbit CSS transform
 * @param targetPocketAngleRad pocket screen angle (rad) at t = totalDurationMs
 * @param discOmegaRadPerMs    disc angular velocity (rad/ms, negative = CCW); unused —
 *                             the ball's angular motion completes at P3_END, so phase 4
 *                             (purely radial) has no angular component to co-rotate
 */
export function computeBallState(
  elapsedMs: number,
  totalDurationMs: number,
  startBallAngleRad: number,
  targetPocketAngleRad: number,
  discOmegaRadPerMs: number,
): BallState {
  void discOmegaRadPerMs; // phase 4 is purely radial — no angular co-rotation needed

  if (elapsedMs >= totalDurationMs) {
    return { angleRad: targetPocketAngleRad, radius: R_POCKET_OUTER, phase: 4, settled: true };
  }

  const s = Math.max(0, elapsedMs / totalDurationMs);
  const delta = targetPocketAngleRad - startBallAngleRad;

  return {
    angleRad: startBallAngleRad + easedProgress(s) * delta,
    radius: radiusAtS(s),
    phase: phaseAtS(s),
    settled: false,
  };
}
