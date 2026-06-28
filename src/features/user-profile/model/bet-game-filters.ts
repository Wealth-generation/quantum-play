export const betGameFilters = [
  { icon: "/images/game-point.svg", label: "All", value: "all" },
  { icon: "/images/roulette.webp", label: "Roulette", value: "thedoctor_roulette" },
  { icon: "/images/keno.webp", label: "Keno", value: "thedoctor_keno" },
  { icon: "/images/plinko.webp", label: "Plinko", value: "thedoctor_plinko" },
  { icon: "/images/dice.webp", label: "Dice", value: "thedoctor_dice" },
] as const;

export type BetGameFilter = (typeof betGameFilters)[number]["value"];
