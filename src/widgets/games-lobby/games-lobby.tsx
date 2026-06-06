import { games } from "@/entities/game/model";
import { BetLive } from "@/widgets/bet-live";
import { GameCard } from "./game-card";
import { GamesFaq } from "./games-faq";

export function GamesLobby() {
  return (
    <div className="bg-bg">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-black uppercase leading-tight text-text md:text-5xl">
            <span className="text-accent">Play with The Doctor!</span>
            <br />
            Bet on games and get rewards
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-medium text-text-muted md:text-lg">
            Explore different game modes and get a chance to win instant rewards
            every time you play.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {games.map((game) => (
            <GameCard game={game} key={game.slug} />
          ))}
        </div>

        <BetLive variant="lobby" />
        <GamesFaq />
      </section>
    </div>
  );
}
