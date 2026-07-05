export const profileTabs = [
  {
    id: "profile",
    icon: "/images/profile.svg",
    label: "Profile",
    href: "/user",
  },
  {
    id: "connections",
    icon: "/images/connections.svg",
    label: "Connections",
    href: "/user?tab=connections",
  },
  {
    id: "bets-history",
    icon: "/images/bet-history.svg",
    label: "Bets History",
    href: "/user?tab=bets-history",
  },
  {
    id: "seed-history",
    icon: "/images/seed-history.svg",
    label: "Seed History",
    href: "/user?tab=seed-history",
  },
] as const;

export type UserProfileTab = (typeof profileTabs)[number]["id"];

export function resolveUserProfileTab(
  tab: string | string[] | undefined,
): UserProfileTab {
  if (typeof tab !== "string") {
    return "profile";
  }

  return profileTabs.some((profileTab) => profileTab.id === tab)
    ? (tab as UserProfileTab)
    : "profile";
}

export function activeTabLabel(activeTab: UserProfileTab): string {
  return profileTabs.find((tab) => tab.id === activeTab)?.label ?? "Profile";
}
