"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib";
import {
  activeTabLabel,
  profileTabs,
  type UserProfileTab,
} from "../model/profile-tabs";

export function ProfileTabNavigation({
  activeTab,
}: {
  activeTab: UserProfileTab;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const activeTabConfig =
    profileTabs.find((tab) => tab.id === activeTab) ?? profileTabs[0];

  return (
    <div>
      <nav
        aria-label="User profile sections"
        className="hidden overflow-x-auto rounded-md bg-surface/80 p-2 shadow-inset-hi scrollbar-hide md:block"
      >
        <div className="grid w-full grid-cols-4 gap-2">
          {profileTabs.map((tab) => (
            <Link
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={cn(
                "flex h-10 min-w-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition-colors",
                activeTab === tab.id
                  ? "bg-surface-3 text-primary-soft shadow-inset-hi"
                  : "text-text-muted hover:bg-surface-3/70 hover:text-text",
              )}
              href={tab.href}
              key={tab.id}
            >
              <Image alt="" aria-hidden="true" height={20} src={tab.icon} width={20} />
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="relative md:hidden">
        <button
          aria-expanded={mobileOpen}
          className="flex h-12 w-full items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 text-sm font-bold text-text shadow-inset-hi"
          onClick={() => setMobileOpen((open) => !open)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Image
              alt=""
              aria-hidden="true"
              height={20}
              src={activeTabConfig.icon}
              width={20}
            />
            <span className="truncate">{activeTabLabel(activeTab)}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "h-4 w-4 shrink-0 text-text-muted transition-transform",
              mobileOpen && "rotate-180",
            )}
          />
        </button>

        {mobileOpen ? (
          <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-md border border-border bg-surface shadow-overlay">
            {profileTabs.map((tab) => (
              <button
                className={cn(
                  "flex h-12 w-full items-center gap-3 px-4 text-left text-sm font-bold transition-colors",
                  activeTab === tab.id
                    ? "bg-surface-3 text-primary-soft"
                    : "text-text-muted hover:bg-surface-3 hover:text-text",
                )}
                key={tab.id}
                onClick={() => {
                  setMobileOpen(false);
                  router.push(tab.href);
                }}
                type="button"
              >
                <Image alt="" aria-hidden="true" height={20} src={tab.icon} width={20} />
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
