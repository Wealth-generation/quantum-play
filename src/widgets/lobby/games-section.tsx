import Link from "next/link";
import GamesIcon from "@/shared/assets/landing/games/icons/games-title-icon.svg";
import rouletteImg from "@/shared/assets/landing/games/images/roulette.webp";
import diceImg from "@/shared/assets/landing/games/images/dice.webp";
import kenoImg from "@/shared/assets/landing/games/images/keno.webp";
import plinkoImg from "@/shared/assets/landing/games/images/plinko.webp";
import { GameCard } from "./game-card";

/**
 * Games section — Figma "block" node 4511:45147.
 *
 * Header: puzzle icon + "Games" (20px). Then a card grid:
 *   375 / 768 → 2 in a row
 *   1024+     → 4 in a row (cards shrink to fit)
 *
 * Each card (Figma 275×230, aspect 275/230) has a per-game accent colour on the
 * 3px bottom border. The complex Figma art (game render + plus-lighter glows +
 * union shape) is baked into a single exported WebP per card.
 *
 * Token mapping: card #0e1519 → bg-row · title #fdfdfd → text-text · accent borders
 * #dc2626 → border-danger · #7e22ce → border-accent · #22c55e → border-primary ·
 * #facc15 (no token) → arbitrary. Inset highlight → shadow-inset-hi.
 *
 * Routing: each card links to /games/<slug> (all confirmed to exist).
 */
const GAMES = [
  { key: "roulette", title: "Roulette", image: rouletteImg, accentClass: "border-danger" },
  { key: "dice", title: "Dice", image: diceImg, accentClass: "border-accent" },
  { key: "keno", title: "Keno", image: kenoImg, accentClass: "border-[#facc15]" },
  { key: "plinko", title: "Plinko", image: plinkoImg, accentClass: "border-primary" },
] as const;

export function GamesSection() {
  return (
    <section className="w-full px-4 py-8">
      <div className="mx-auto flex max-w-[1175px] flex-col gap-4">
        {/* Header — puzzle icon (SVGR component) + label */}
        <div className="flex items-center gap-2">
          <GamesIcon aria-hidden="true" className="h-5 w-auto" />
          <h2 className="font-semibold leading-6 text-text text-[clamp(18px,1.8vw,20px)]">
            Games
          </h2>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {GAMES.map((game) => (
            <Link key={game.key} href={`/games/${game.key}`} className="block">
              <GameCard
                title={game.title}
                image={game.image}
                accentClass={game.accentClass}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
