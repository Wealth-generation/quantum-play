import { notFound } from "next/navigation";
import { getGameBySlug, isGameSlug } from "@/entities/game/model";
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

  return <GameDetail game={getGameBySlug(gameSlug)} />;
}
