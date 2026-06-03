import { LobbyHeroCta } from "./lobby-hero-cta";

export function LobbyHero() {
  return (
    <section className="bg-bg px-4 py-16 text-center md:py-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-black uppercase leading-tight tracking-wide text-text md:text-6xl">
          The Future of{" "}
          <span className="text-primary">iGaming</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-text-muted md:text-lg">
          Provably fair games, instant rewards, and a community built for winners.
          Play Plinko, Keno, Dice, and Roulette.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <LobbyHeroCta />
          <a
            href="#how-to-get-started"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text"
          >
            How it works →
          </a>
        </div>
      </div>
    </section>
  );
}
