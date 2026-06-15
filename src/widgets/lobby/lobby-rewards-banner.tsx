import Image from "next/image";
import dollarCoins from "@/shared/assets/landing/rewards/dollar-coins.png";
import vectorPattern from "@/shared/assets/landing/rewards/vector.png";
import { RewardsCounter } from "./rewards-counter";

/**
 * Rewards Banner — Figma "block" nodes 4775:112034 (375) and 4599:9719 (768).
 *
 * base (<md , 375): column — title stacked above the counter.
 * md   (768)      : row — title (flex-1) left, counter right.
 *
 * The counter is the animated <RewardsCounter /> (flip digits, fluid sizing).
 *
 * STATIC PLACEHOLDER: the displayed total is demo content (no backend authority — the
 * real total is Track B). The community line is neutral ("Quantum Play").
 *
 * Token mapping: banner #11121a → bg-surface-2 · title/$ #22c55e → text-primary ·
 * subtitle #c7cbd4 → text-text-muted.
 */
export function LobbyRewardsBanner() {
  return (
    <section className="px-4 py-4">
      <div
        className="relative isolate mx-auto flex w-full max-w-[1175px] flex-col gap-2 overflow-hidden rounded-lg bg-surface-2 py-4 pl-[72px] pr-4 md:flex-row md:items-center md:gap-4 md:pl-[94px]"
        style={{
          // Not a token — one-off Figma green tint (rgba 27,209,103) over the base surface.
          backgroundImage:
            "linear-gradient(96deg, rgba(27,209,103,0.1) 0%, rgba(0,0,0,0) 53.02%)",
        }}
      >
        {/* Decorative: dark glow behind the coins (Figma "Ellipse", reproduced in CSS) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[128px] top-[112px] -z-10 h-[94px] w-[291px] rounded-full"
          style={{
            // Not a token — one-off Figma dark glow scoped here.
            background: "#040f06",
            filter: "blur(50px)",
          }}
        />

        {/* Decorative: faint vector pattern (Figma "vector", opacity ~2%) */}
        <Image
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-[40px] right-0 -z-10 h-[260px] w-auto opacity-[0.03]"
          src={vectorPattern}
        />

        {/* Decorative: dollar coins (top-left). High-res 3x asset; rotated per Figma. */}
        <Image
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-[30px] -top-[18px] -z-10 h-[120px] w-[120px] rotate-[8.72deg] md:-left-[40px] md:-top-[22px] md:h-[148px] md:w-[148px]"
          src={dollarCoins}
        />

        {/* Game title — base: fixed 233px · md: flex-1 (fills, pushes counter right) */}
        <div className="flex w-[233px] flex-col gap-0.5 md:w-auto md:flex-1 md:justify-center">
          <p className="text-[20px] font-black uppercase leading-tight text-primary">
            TOTAL REWARDS GIVEN BACK!
          </p>
          {/* STATIC PLACEHOLDER — neutral brand copy, not the Figma reference text */}
          <p className="whitespace-nowrap text-[14px] font-medium leading-[18px] text-text-muted">
            to the Quantum Play community!
          </p>
        </div>

        {/* Animated counter (flip digits) */}
        <RewardsCounter />
      </div>
    </section>
  );
}
