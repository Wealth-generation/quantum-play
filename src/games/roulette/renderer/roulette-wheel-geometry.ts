// European single-zero pocket order, clockwise around the wheel starting from 0.
// Verified against the standard European layout; must match the physical disc asset
// pocket sequence before Pass B lands (flag for visual QA).
export const EUROPEAN_POCKETS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
  11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
  22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;

/** Returns the array index of `number` in EUROPEAN_POCKETS. */
export function pocketIndexForNumber(number: number): number {
  const idx = (EUROPEAN_POCKETS as readonly number[]).indexOf(number);
  if (idx === -1) throw new RangeError(`${number} is not a valid European roulette number`);
  return idx;
}

/** Angular width of one pocket in degrees (European wheel, 37 pockets). */
export const ANGLE_PER_CELL_DEG = 360 / 37;

/**
 * The disc sprite places pocket 0 at 12 o'clock.
 * In screen-space trig (y-down, 0° = 3 o'clock), 12 o'clock = −90°.
 * Degree equivalent of POCKET_ZERO_INITIAL_ANGLE_RAD.
 * If the disc asset is replaced with pocket 0 at a different position, update here only.
 */
export const SPRITE_ZERO_OFFSET_DEG = -90;

/**
 * Fixed angular offset of pocketIndex on the disc face, in radians.
 * Pocket 0 is at angle 0; each pocket spans 2π/37 rad.
 */
export function pocketAngleRad(pocketIndex: number): number {
  return (pocketIndex / 37) * 2 * Math.PI;
}

/**
 * Disc idle angular velocity in rad/ms, CCW (negative in standard trig convention).
 * Derived from the CSS animation: roulette-disc-ccw 24s linear infinite (roulette-wheel.tsx).
 * SYNC REQUIRED: if the animation-duration in roulette-wheel.tsx ever changes, update this.
 */
export const DISC_OMEGA_RAD_PER_MS = -(2 * Math.PI) / 24_000;

/**
 * Angle of pocket 0 (green) in the disc image at CSS rotate(0).
 * The disc image has pocket 0 at 12 o'clock; in screen trig (y-down) that is -π/2.
 * Add this to every pocket screen-angle calculation so the reference aligns with the image.
 * SYNC REQUIRED: if the disc asset is replaced with pocket 0 at a different position, update this.
 */
export const POCKET_ZERO_INITIAL_ANGLE_RAD = -Math.PI / 2;

/**
 * Normalized ball radii — Pass B maps these to actual pixel radii using the
 * rendered container size at the moment the spin is triggered.
 *
 * R_RIM         = 1.0  → outermost ball-track groove (idle orbit radius)
 * R_DISC_SURFACE = 0.6 → pocket region on the spinning disc surface
 */
export const R_RIM = 1.0;
export const R_DISC_SURFACE = 0.6;
