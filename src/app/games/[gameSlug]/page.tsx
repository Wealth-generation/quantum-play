import { notFound } from "next/navigation";
import { getGameBySlug, isGameSlug } from "@/entities/game/model";
import { DiceGame } from "@/games/dice";
import { KenoGame } from "@/games/keno";
import { PlinkoGame } from "@/games/plinko";
import { RouletteGame } from "@/games/roulette";
import { GameDetail } from "@/widgets/game-detail";

interface GamePageProps {
  params: Promise<{
    gameSlug: string;
  }>;
}

export function generateStaticParams() {
  return [
    { gameSlug: "keno" },
    { gameSlug: "dice" },
    { gameSlug: "plinko" },
    { gameSlug: "roulette" },
  ];
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameSlug } = await params;

  if (!isGameSlug(gameSlug)) {
    notFound();
  }

  const game = getGameBySlug(gameSlug);

  return (
    <GameDetail game={game}>
      {game.slug === "dice" ? <DiceGame /> : undefined}
      {game.slug === "keno" ? <KenoGame /> : undefined}
      {game.slug === "plinko" ? <PlinkoGame /> : undefined}
      {game.slug === "roulette" ? <RouletteGame /> : undefined}
    </GameDetail>
  );
}
