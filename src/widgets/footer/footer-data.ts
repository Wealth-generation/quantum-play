// Slugs are inferred naming conventions matching nav-items.ts (design audit §4).
// Confirm all hrefs before Phase 4 routing. Social hrefs are placeholder "#".

export interface FooterLink {
  label: string;
  href: string;
}

export const aboutLinks: FooterLink[] = [
  { label: "Pointshop", href: "/pointshop" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Games", href: "/games" },
  { label: "Rewards", href: "/rewards" },
  { label: "Bonuses", href: "/bonuses" },
];

export const termsLinks: FooterLink[] = [
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export interface SocialLink {
  label: string;
  href: string;
  /** Key used to select the inline SVG in footer.tsx. Brand icons are not in lucide-react
   *  1.x; minimal inline SVGs are used instead. */
  icon: "facebook" | "instagram" | "x" | "telegram" | "discord";
}

export const socialLinks: SocialLink[] = [
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "X", href: "#", icon: "x" },
  { label: "Telegram", href: "#", icon: "telegram" },
  { label: "Discord", href: "#", icon: "discord" },
];
