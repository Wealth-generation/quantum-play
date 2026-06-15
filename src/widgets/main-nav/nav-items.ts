import type { ComponentType } from "react";
import {
  IconHome,
  IconCart,
  IconCup,
  IconStarFild,
  IconCrown,
  IconRoulette,
  IconKeno,
  IconPlinko,
  IconDice,
} from "./nav-icons";

export type NavIconComponent = ComponentType<{ className?: string }>;

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconComponent;
}

export const primaryNavItems: NavItem[] = [
  { label: "Lobby", href: "/", icon: IconHome },
  { label: "Pointshop", href: "/pointshop", icon: IconCart },
  { label: "Leaderboard", href: "/leaderboard", icon: IconCup },
  { label: "Rewards", href: "/rewards", icon: IconStarFild },
  { label: "Bonuses", href: "/bonuses", icon: IconCrown },
];

// "All Games" removed — sub-items are game-specific only.
export const gamesNavItems: NavItem[] = [
  { label: "Roulette", href: "/games/roulette", icon: IconRoulette },
  { label: "Keno", href: "/games/keno", icon: IconKeno },
  { label: "Plinko", href: "/games/plinko", icon: IconPlinko },
  { label: "Dice", href: "/games/dice", icon: IconDice },
];
