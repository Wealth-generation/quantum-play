"use client";

import Image from "next/image";
import rouletteBallSrc from "@/shared/assets/games/roulette/images/roullete-ball.webp";

// Raster ball element — roullete-ball.webp (20 × 20 px, VP8X with alpha).
// Rendered at 12 × 12 px to match the CSS-circle footprint and keep the orbit
// radius tuning (top: 5.5 %, left: 50 %) unchanged.
// Position is held by the orbit container div (roulette-wheel.tsx) which rotates
// CW at 60 s/rev; the container's rotation carries this element around the wheel.
// During a post-bet spin the orbit container is hidden (visibility: hidden) and
// RoulettePixiBallStage renders the ball via PixiJS instead.
//
// Open note: if the asset renders too bright or too dim at this size, add a
// CSS filter or opacity here. The asset brightness was not pre-evaluated against
// the wheel background — flag for visual QA.
export function RouletteWheelBall() {
  return (
    <Image
      alt=""
      aria-hidden
      className="pointer-events-none absolute"
      height={12}
      src={rouletteBallSrc}
      style={{
        // Geometry-derived 12-o'clock position within the orbit container (absolute inset-0).
        // Tuned in the Pass 0 fix-up passes: top nudged to 5.5 % (≈ 160 px from center
        // at 360 px container) to sit mid-gap between disc edge and ball-track groove.
        top: "5.5%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
      width={12}
    />
  );
}
