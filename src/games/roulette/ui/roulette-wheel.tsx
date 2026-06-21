"use client";

import * as React from "react";
import Image from "next/image";
import wheelBallTrack from "@/shared/assets/games/roulette/images/wheel-ball-track.webp";
import wheelCrown from "@/shared/assets/games/roulette/images/wheel-crown.webp";
import wheelOuterBg from "@/shared/assets/games/roulette/images/wheel-outer-bg.webp";
import type {
  RouletteRendererSettlementReason,
  RouletteRendererSpin,
} from "../renderer/roulette-renderer-types";
import type { RouletteBetResult } from "../model/roulette-types";
import { RoulettePixiBallStage } from "./roulette-pixi-ball-stage";
import { RouletteWheelBall } from "./roulette-wheel-ball";

// Idle rotation/orbit speeds — tunable; final chosen values in roulette-wheel-pass0.md.
// Keyframes defined in src/app/globals.css.
//   Disc:  24 s / rev CCW  (roulette-disc-ccw)
//   Crown: 18 s / rev CW   (roulette-crown-cw)
//   Ball:  60 s / rev CW   (roulette-ball-orbit-cw) — clock second-hand pace

// Source image dimensions and proportional widths relative to outer-bg (566 × 566 = 100 %):
//   wheel-ball-track.webp: 548 × 548 → 548 / 566 ≈ 96.8 %
//   wheel-disc.webp:       519 × 530 → 519 / 566 ≈ 91.7 % wide, aspect-ratio 519/530
//   wheel-crown.webp:      156 × 156 → 156 / 566 ≈ 27.6 %
// Sizing each layer to its proportional width keeps the outer-bg border ring visible.

interface RouletteWheelProps {
  pendingSpin: RouletteBetResult | null;
  onSpinSettled: (
    spin: RouletteRendererSpin,
    reason: RouletteRendererSettlementReason,
  ) => void;
  /** Mobile/overlay path only: skip the 500 ms return-to-rim tail and suppress
   * the idle-orbit animation-delay sync (overlay unmounts on settlement). */
  skipReturnTail?: boolean;
}

export function RouletteWheel({ pendingSpin, onSpinSettled, skipReturnTail }: RouletteWheelProps) {
  // Ref to the idle-ball orbit wrapper — read at trigger time for live ball start angle.
  // The ball sits at 12 o'clock in the orbit's local frame; orbit rotation shifts it from -π/2.
  const orbitRef = React.useRef<HTMLDivElement | null>(null);
  const spinning = pendingSpin !== null;

  // Tracks CSS animation-delay and a React key to restart the orbit animation from the exact
  // rim position where the Pixi ball arrived, achieving a seamless idle handoff.
  const [orbitAnimState, setOrbitAnimState] = React.useState<{ key: number; delay: string }>({
    key: 0,
    delay: "0s",
  });

  // Intercepts the renderer's onSpinSettled to compute the CSS animation-delay from the
  // ball's exit angle before forwarding to the parent. The exit angle is the screen-space
  // angle (rad) where the Pixi ball stopped after its dwell+return tail. Converting it to
  // CW progress on the 60s orbit gives a negative delay that places the CSS animation at
  // exactly that point, so the ball appears continuous when visibility switches back to visible.
  const handleSpinSettledInternal = React.useCallback(
    (spin: RouletteRendererSpin, reason: RouletteRendererSettlementReason) => {
      // skipReturnTail path: the overlay unmounts immediately after this fires —
      // no idle orbit to resume, so skip the animation-delay sync.
      if (!skipReturnTail && spin.exitBallAngleRad !== undefined) {
        const TWO_PI = 2 * Math.PI;
        // exitBallAngleRad is a CCW screen angle; the CSS orbit is CW.
        // cwAngle = how far CW the orbit wrapper must have rotated to place the ball at exitAngle.
        // Ball starts at 12 o'clock (-π/2) in the orbit's local frame, so:
        //   screenAngle = -π/2 + cwRotation  →  cwRotation = exitAngle + π/2  (mod 2π, positive)
        const cwAngle = ((spin.exitBallAngleRad + Math.PI / 2) % TWO_PI + TWO_PI) % TWO_PI;
        const delaySec = -(cwAngle / TWO_PI) * 60;
        setOrbitAnimState((prev) => ({ key: prev.key + 1, delay: `${delaySec.toFixed(3)}s` }));
      }
      onSpinSettled(spin, reason);
    },
    [onSpinSettled, skipReturnTail],
  );

  return (
    // Fluid width capped at 360 px so the wheel sits compactly above the betting board.
    <div className="mx-auto w-full max-w-[360px] select-none">
      {/* Square bounding box. All layers are absolutely positioned inside, stacked in
          DOM order (later = higher). No explicit z-index needed. */}
      <div className="relative aspect-square w-full">

        {/* ── Layer 1 (bottom): outer background ring — fills container exactly, static ── */}
        <Image
          alt=""
          className="object-contain"
          fill
          priority
          sizes="360px"
          src={wheelOuterBg}
        />

        {/* ── Layer 2: ball-track groove — 96.8 % of container, static ── */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="relative aspect-square"
            style={{ width: "96.8%" }}
          >
            <Image alt="" className="object-contain" fill sizes="348px" src={wheelBallTrack} />
          </div>
        </div>

        {/* ── Layer 3: Pixi canvas — disc (bottom) + ball (top) ── */}
        {/* The disc sprite replaces the CSS-animated disc div. Both disc and ball
            are rendered in one Pixi scene so the ball can co-rotate with the disc
            after convergence, eliminating the dwell drift bug.
            The Pixi canvas sits below the crown div in DOM order; since the ball
            always orbits at R_RIM (~44 % radius) it is never covered by the crown
            hub (13.8 % radius). */}
        <RoulettePixiBallStage
          onSpinSettled={handleSpinSettledInternal}
          orbitRef={orbitRef}
          pendingSpin={pendingSpin}
          skipReturnTail={skipReturnTail}
        />

        {/* ── Layer 4: crown center hub — 27.6 % wide, rotates CW, independent of disc ── */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="relative aspect-square"
            style={{
              width: "27.6%",
              animation: "roulette-crown-cw 18s linear infinite",
            }}
          >
            <Image alt="" className="object-contain" fill sizes="100px" src={wheelCrown} />
          </div>
        </div>

        {/* ── Idle CSS ball orbit — hidden while Pixi drives the spin ── */}
        {/* visibility: hidden keeps the element in the layout but invisible,
            avoiding reflow. The Pixi canvas below renders the spinning ball.
            key increments after each spin to restart the CSS animation from the new
            animation-delay, placing the ball at the exact rim exit point. */}
        <div
          key={orbitAnimState.key}
          ref={orbitRef}
          className="pointer-events-none absolute inset-0"
          style={{
            animation: `roulette-ball-orbit-cw 60s ${orbitAnimState.delay} linear infinite`,
            visibility: spinning ? "hidden" : "visible",
          }}
        >
          <RouletteWheelBall />
        </div>
      </div>
    </div>
  );
}
