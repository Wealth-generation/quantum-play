export type GameSlug = "dice" | "roulette" | "keno" | "plinko";

export interface GameInfo {
  slug: GameSlug;
  label: string;
  route: `/games/${GameSlug}`;
  imageSrc: `/images/${GameSlug}.webp`;
  accentClassName: string;
}

export const games: GameInfo[] = [
  {
    slug: "dice",
    label: "Dice",
    route: "/games/dice",
    imageSrc: "/images/dice.webp",
    accentClassName: "from-accent/80 to-accent",
  },
  {
    slug: "roulette",
    label: "Roulette",
    route: "/games/roulette",
    imageSrc: "/images/roulette.webp",
    accentClassName: "from-danger/80 to-danger",
  },
  {
    slug: "keno",
    label: "Keno",
    route: "/games/keno",
    imageSrc: "/images/keno.webp",
    accentClassName: "from-yellow-400/80 to-yellow-500",
  },
  {
    slug: "plinko",
    label: "Plinko",
    route: "/games/plinko",
    imageSrc: "/images/plinko.webp",
    accentClassName: "from-primary/80 to-primary",
  },
];

export function isGameSlug(value: string): value is GameSlug {
  return games.some((game) => game.slug === value);
}

export function getGameBySlug(slug: GameSlug): GameInfo {
  return games.find((game) => game.slug === slug)!;
}
