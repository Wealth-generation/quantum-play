import Image from "next/image";
import Link from "next/link";
import type { GameInfo } from "@/entities/game/model";
import { cn } from "@/shared/lib";

interface GameCardProps {
  game: GameInfo;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      className="group relative block overflow-hidden rounded-md border border-border bg-surface shadow-inset-hi transition-transform hover:-translate-y-0.5 focus-visible:shadow-glow"
      href={game.route}
    >
      <div className="relative aspect-[16/7] min-h-40">
        <Image
          alt={`${game.label} game`}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 44vw, 92vw"
          src={game.imageSrc}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/30 to-transparent" />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r",
            game.accentClassName,
          )}
        />
        <h2 className="absolute left-5 top-5 text-2xl font-black text-text">
          {game.label}
        </h2>
      </div>
    </Link>
  );
}
