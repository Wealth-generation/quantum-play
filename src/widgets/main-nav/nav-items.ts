import {
  Home,
  ShoppingBag,
  Trophy,
  Star,
  Gift,
  LayoutGrid,
  Circle,
  Hash,
  Triangle,
  Dices,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Slugs are inferred naming conventions (design audit §4). Confirm before Phase 4 routing.
export const primaryNavItems: NavItem[] = [
  { label: "Lobby", href: "/", icon: Home },
  { label: "Pointshop", href: "/pointshop", icon: ShoppingBag },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Rewards", href: "/rewards", icon: Star },
  { label: "Bonuses", href: "/bonuses", icon: Gift },
];

export const gamesNavItems: NavItem[] = [
  { label: "All Games", href: "/games", icon: LayoutGrid },
  { label: "Roulette", href: "/games/roulette", icon: Circle },
  { label: "Keno", href: "/games/keno", icon: Hash },
  { label: "Plinko", href: "/games/plinko", icon: Triangle },
  { label: "Dice", href: "/games/dice", icon: Dices },
];

// Help & Support excluded from this project — not deferred, removed permanently.
