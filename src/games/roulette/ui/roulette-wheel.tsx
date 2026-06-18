"use client";

import Image from "next/image";
import wheelBallTrack from "@/shared/assets/games/roulette/images/wheel-ball-track.webp";
import wheelCrown from "@/shared/assets/games/roulette/images/wheel-crown.webp";
import wheelDisc from "@/shared/assets/games/roulette/images/wheel-disc.webp";
import wheelOuterBg from "@/shared/assets/games/roulette/images/wheel-outer-bg.webp";
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

export function RouletteWheel() {
  return (
    // Fluid width capped at 360 px so the wheel sits compactly above the betting board.
    <div className="mx-auto w-full max-w-[360px] select-none">
      {/* Square bounding box. All layers are absolutely positioned inside, stacked in
          DOM order (later = higher). No explicit z-index needed. */}
      <div className="relative aspect-square w-full">

        {/* ── Layer 1 (bottom): outer background ring — fills container exactly, static ── */}
        {/* outer-bg is the reference size (566 × 566 = square = matches container ratio). */}
        <Image
          alt=""
          className="object-contain"
          fill
          priority
          src={wheelOuterBg}
        />

        {/* ── Layer 2: ball-track groove — 96.8 % of container, static ── */}
        {/* Centering wrapper: does not rotate. Inner div carries the proportional size. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="relative aspect-square"
            style={{
              // Not a token — proportional size: 548 px / 566 px ≈ 96.8 %.
              width: "96.8%",
            }}
          >
            <Image alt="" className="object-contain" fill src={wheelBallTrack} />
          </div>
        </div>

        {/* ── Layer 3: numbered pocket disc — 91.7 % wide, rotates CCW continuously ── */}
        {/* Centering wrapper does NOT rotate — only the inner proportional div does,
            so transform-origin stays at the disc center = wheel center. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="relative"
            style={{
              // Not a token — proportional size: 519 px / 566 px ≈ 91.7 %; height follows
              // the source aspect ratio (519 × 530) so the disc is not forced square.
              width: "91.7%",
              aspectRatio: "519 / 530",
              // Not a token — CSS keyframe idle rotation; duration tunable here.
              animation: "roulette-disc-ccw 24s linear infinite",
            }}
          >
            <Image alt="" className="object-contain" fill src={wheelDisc} />
          </div>
        </div>

        {/* ── Layer 4: crown center hub — 27.6 % wide, rotates CW, independent of disc ── */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="relative aspect-square"
            style={{
              // Not a token — proportional size: 156 px / 566 px ≈ 27.6 %.
              width: "27.6%",
              // Not a token — CSS keyframe idle rotation; duration tunable here.
              animation: "roulette-crown-cw 18s linear infinite",
            }}
          >
            <Image alt="" className="object-contain" fill src={wheelCrown} />
          </div>
        </div>

        {/* ── Ball: orbits CW on the ball-track groove (idle CSS only, Pass 0) ── */}
        {/* Orbit wrapper: absolute inset-0, rotates CW around the wheel center.
            transform-origin defaults to 50 % 50 % of this element = wheel center.
            Ball inside is offset to the 12-o'clock track position; the rotating
            wrapper carries it around the orbit without the ball visually self-spinning
            (it is a symmetric circle). Pass B will remove this wrapper and drive
            position via the rAF renderer, attaching a ref to the ball element. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            // Not a token — CSS keyframe idle orbit; duration tunable here.
            animation: "roulette-ball-orbit-cw 60s linear infinite",
          }}
        >
          <RouletteWheelBall />
        </div>
      </div>
    </div>
  );
}
