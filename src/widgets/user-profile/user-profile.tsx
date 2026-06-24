import Link from "next/link";
import { Card } from "@/shared/ui/primitives/card";
import { cn } from "@/shared/lib";

const profileTabs = [
  {
    id: "profile",
    label: "Profile",
    href: "/user",
    placeholder: "Profile details will appear here when profile data is available.",
  },
  {
    id: "connections",
    label: "Connections",
    href: "/user?tab=connections",
    placeholder: "Connections will appear here when that feature is available.",
  },
  {
    id: "bets-history",
    label: "Bets History",
    href: "/user?tab=bets-history",
    placeholder: "Bet history will appear here when that feature is available.",
  },
  {
    id: "seed-history",
    label: "Seed History",
    href: "/user?tab=seed-history",
    placeholder: "Seed history will appear here when that feature is available.",
  },
] as const;

export type UserProfileTab = (typeof profileTabs)[number]["id"];

export function resolveUserProfileTab(
  tab: string | string[] | undefined,
): UserProfileTab {
  if (typeof tab !== "string") {
    return "profile";
  }

  const matchedTab = profileTabs.find((profileTab) => profileTab.id === tab);

  return matchedTab?.id ?? "profile";
}

interface UserProfileProps {
  activeTab: UserProfileTab;
}

export function UserProfile({ activeTab }: UserProfileProps) {
  const selectedTab = profileTabs.find((tab) => tab.id === activeTab) ?? profileTabs[0];

  return (
    <div className="min-h-full bg-bg">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6 md:py-14">
        <div>
          <h1 className="text-3xl font-bold text-text md:text-4xl">User Profile</h1>
          <p className="mt-2 text-sm text-text-muted md:text-base">
            Manage your account sections from one place.
          </p>
        </div>

        <Card padding="lg" variant="panel">
          <nav
            aria-label="User profile sections"
            className="-mx-2 overflow-x-auto px-2 pb-1 scrollbar-hide"
          >
            <div className="flex min-w-max items-center gap-2">
              {profileTabs.map((tab) => (
                <Link
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-surface-3 text-text shadow-inset-hi"
                      : "text-text-muted hover:bg-surface-3 hover:text-primary",
                  )}
                  href={tab.href}
                  key={tab.id}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="mt-6 rounded-md border border-border bg-surface-3/50 p-6">
            <h2 className="text-lg font-semibold text-text">{selectedTab.label}</h2>
            <p className="mt-2 text-sm text-text-muted">{selectedTab.placeholder}</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
