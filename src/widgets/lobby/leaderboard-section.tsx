import Image from "next/image";
import leaderboardBg from "@/shared/assets/landing/leaderboard/images/leaderboard-bg.webp";
import leftChips from "@/shared/assets/landing/leaderboard/images/left-bg-chips.webp";
import rightChips from "@/shared/assets/landing/leaderboard/images/right-bg-chips.webp";
import rightRocket from "@/shared/assets/landing/leaderboard/images/right-bg-rocket.webp";
import { LeaderboardCard } from "./leaderboard-card";

/**
 * Leaderboard section — Figma "leaderboard" node 4632:13755.
 *
 * Header (title + subtitle) → 3 podium cards → "View all" button.
 * Desktop (md+): cards in a row — 2nd left, 1st centred & raised, 3rd right.
 * Mobile (375): single column, order 1 / 2 / 3 top-to-bottom (CSS order on the cards).
 *
 * STATIC PLACEHOLDER: usernames, wagered totals and prize amounts are demo data — the
 * real leaderboard is backend-authoritative (Track B endpoint). The subtitle code/
 * platform names are neutral placeholders, never the Figma reference's competitor brand.
 *
 * Decorative chips/rocket are percentage-positioned and hidden on mobile.
 */

// STATIC PLACEHOLDER rows (no backend authority).
const PLAYERS = [
  { place: 1 as const, username: "Username", wagered: "1,234.567", reward: "1,500.00" },
  { place: 2 as const, username: "Username", wagered: "1,234.567", reward: "1,500.00" },
  { place: 3 as const, username: "Username", wagered: "1,234.567", reward: "1,500.00" },
];

export function LeaderboardSection() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-10">
      {/* Background — bottom layer (behind decor, cards and all content) */}
      <Image
        src={leaderboardBg}
        alt=""
        fill
        sizes="100vw"
        priority
        className="z-0 object-cover"
      />

      <div className="relative z-10 mx-auto flex max-w-[1175px] flex-col items-center gap-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-black uppercase leading-tight text-text text-[clamp(28px,4vw,40px)]">
            Monthly Leaderboard
          </h2>
          {/* STATIC PLACEHOLDER — neutral code/platform, not the Figma reference brand */}
          <p className="text-text-muted text-[clamp(14px,1.5vw,18px)] leading-6">
            Players who wager using code{" "}
            <span className="font-semibold text-[clamp(16px,1.6vw,20px)]">QUANTUM</span>{" "}
            on Quantum Play are automatically entered
          </p>
        </div>

        {/* Cards block + View all */}
        <div className="flex w-full flex-col items-center gap-5">
          {/* The cards row is the positioning anchor (md:w-fit hugs the cards), so the
              decoratives sit flush against the OUTER side-card edges via right-full /
              left-full, with the small Figma overlap as a translate. */}
          <div className="relative isolate mx-auto flex w-full flex-col items-center gap-5 md:w-fit md:flex-row md:items-start md:justify-center md:gap-4">
            {/* left chips — right edge against the 2nd-place (left) card (~7px overlap) */}
            <Image
              src={leftChips}
              alt=""
              aria-hidden="true"
              className="absolute right-full top-[18%] -z-10 hidden h-auto w-[clamp(70px,9vw,140px)] translate-x-[7px] md:block"
            />
            {/* rocket — left edge against the 3rd-place (right) card (~33px overlap) */}
            <Image
              src={rightRocket}
              alt=""
              aria-hidden="true"
              className="absolute left-full top-[2%] -z-10 hidden h-auto w-[clamp(80px,10vw,170px)] -translate-x-[33px] md:block"
            />
            {/* right chips — left edge against the 3rd-place (right) card (~9px overlap) */}
            <Image
              src={rightChips}
              alt=""
              aria-hidden="true"
              className="absolute bottom-[2%] left-full -z-10 hidden h-auto w-[clamp(55px,7vw,100px)] -translate-x-[9px] md:block"
            />

            {PLAYERS.map((player) => (
              <LeaderboardCard
                key={player.place}
                place={player.place}
                username={player.username}
                wagered={player.wagered}
                reward={player.reward}
              />
            ))}
          </div>

          {/* View all — routing deferred (Track B / route decisions) */}
          <button
            type="button"
            className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-md border border-border bg-gradient-to-b from-surface-3 to-border-2 px-6 font-semibold text-text outline-none transition-colors text-[clamp(16px,1.5vw,20px)] hover:border-border-2 focus-visible:shadow-glow"
          >
            View all
          </button>
        </div>
      </div>
    </section>
  );
}
