import type { GameInfo } from "@/entities/game/model";
import { BetLive } from "@/widgets/bet-live";
import { GameActions } from "./game-actions";

interface GameDetailProps {
  game: GameInfo;
}

export function GameDetail({ game }: GameDetailProps) {
  return (
    <div className="bg-bg">
      <section className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 md:px-6 md:py-12">
        <div className="overflow-hidden rounded-md border border-border bg-surface-2 shadow-inset-hi">
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent_58%)] px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">
              {game.label}
            </p>
            <h1 className="text-4xl font-black text-text md:text-5xl">
              Game coming soon
            </h1>
            <p className="max-w-md text-sm font-medium text-text-muted">
              A playable {game.label} experience will arrive in a later approved
              game implementation task.
            </p>
          </div>
        </div>

        <GameActions />

        <BetLive className="mt-6" variant="game" />
      </section>
    </div>
  );
}
