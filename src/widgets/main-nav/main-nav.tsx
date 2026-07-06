"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DailyClaimCard } from "@/features/daily-claim";
import { useAuthSession, useLogoutMutation } from "@/features/auth";
import { useAuthModal } from "@/widgets/auth-modal";
import { Button } from "@/shared/ui/primitives/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/shared/ui/primitives/collapsible";
import { cn } from "@/shared/lib";
import { primaryNavItems, gamesNavItems } from "./nav-items";
import { IconGamepad } from "./nav-icons";
import dailyClaimerClosedBg from "@/shared/assets/nav/images/daily-claimer-closed-bg.png";

// ─── Daily Claimer (collapsed thumbnail) ──────────────────────────────────────

function DailyClaimerClosed() {
  return (
    <div
      className="relative overflow-hidden rounded-md shadow-btn"
      style={{ width: "52px", height: "56px" }}
    >
      <div className="absolute inset-0 bg-bg" />
      <Image
        alt=""
        className="object-cover"
        fill
        sizes="52px"
        src={dailyClaimerClosedBg}
      />
    </div>
  );
}

function CaretIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="12"
      viewBox="0 0 12 12"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 4L10 8H2L6 4Z" fill="currentColor" />
    </svg>
  );
}

interface MainNavProps {
  collapsed: boolean;
  onExpandRequest?: () => void;
  onClose?: () => void;
  className?: string;
}

export function MainNav({
  collapsed,
  onClose,
  className,
}: MainNavProps) {
  const pathname = usePathname();
  const [gamesOpen, setGamesOpen] = React.useState(false);
  const isGamesPath = pathname === "/games" || pathname.startsWith("/games/");
  // Submenu is only visually open when we're inside the games section.
  // This auto-hides the mini icons when navigating away without needing an effect.
  const effectiveGamesOpen = isGamesPath && gamesOpen;
  const { data: session } = useAuthSession();
  const logoutMutation = useLogoutMutation();
  const { setOpen: openAuthModal } = useAuthModal();
  const authenticated = session?.authenticated === true;

  return (
    <nav
      className={cn(
        "relative flex h-full flex-col overflow-x-hidden border-r border-border bg-surface transition-[width] duration-150 ease-in-out",
        collapsed ? "w-[84px]" : "w-[186px]",
        className,
      )}
    >
      <div className="nav-scroll flex-1 overflow-x-hidden overflow-y-auto px-4 py-6">
        {collapsed ? (
          <div className="mb-4 flex justify-center">
            <DailyClaimerClosed />
          </div>
        ) : (
          <div className="mb-4">
            <DailyClaimCard />
          </div>
        )}

        <ul className="space-y-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center rounded-md border border-border px-4 py-3 text-base leading-5 transition-colors duration-200 ease-in-out",
                    isActive
                      ? "bg-primary/10 text-text"
                      : "bg-gradient-to-b from-surface-3/40 to-border-2/40 text-text-muted hover:bg-surface-3 hover:text-primary",
                    collapsed ? "justify-center" : "gap-2",
                  )}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                >
                  {!collapsed ? (
                    <span className="flex items-center gap-2 transition-transform duration-200 ease-in-out group-hover:translate-x-1">
                      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                      <span>{item.label}</span>
                    </span>
                  ) : (
                    <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-2">
          <Collapsible
            onOpenChange={(value) => {
              setGamesOpen(value);
            }}
            open={effectiveGamesOpen}
          >
            {!collapsed ? (
              <div className={cn(
                "flex w-full items-center rounded-md border border-border text-base leading-5 transition-colors duration-200 ease-in-out",
                isGamesPath
                  ? "bg-primary/10"
                  : "bg-gradient-to-b from-surface-3/40 to-border-2/40 hover:bg-surface-3",
              )}>
                <Link
                  aria-current={isGamesPath ? "page" : undefined}
                  className={cn(
                    "group flex flex-1 items-center gap-2 px-4 py-3 transition-colors duration-200 ease-in-out",
                    isGamesPath
                      ? "text-text"
                      : "text-text-muted hover:text-primary",
                  )}
                  href="/games"
                  onClick={onClose}
                >
                  <span className="flex items-center gap-2 transition-transform duration-200 ease-in-out group-hover:translate-x-1">
                    <IconGamepad className={cn("h-5 w-5 shrink-0", isGamesPath && "text-primary")} />
                    <span>Games</span>
                  </span>
                </Link>
                <button
                  aria-controls="games-submenu"
                  aria-expanded={effectiveGamesOpen}
                  aria-label="Toggle games menu"
                  className="flex items-center px-3 py-3 text-text-muted hover:text-primary"
                  onClick={() => setGamesOpen((value) => !value)}
                  type="button"
                >
                  <CaretIcon
                    className={cn(
                      "h-3 w-3 shrink-0 transition-transform duration-200",
                      !effectiveGamesOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>
            ) : (
              <Link
                aria-current={isGamesPath ? "page" : undefined}
                aria-expanded={effectiveGamesOpen}
                className={cn(
                  "flex w-full justify-center rounded-md border border-border px-4 py-3 text-base leading-5 transition-colors duration-200 ease-in-out",
                  isGamesPath
                    ? "bg-primary/10 text-text"
                    : "bg-gradient-to-b from-surface-3/40 to-border-2/40 text-text-muted hover:bg-surface-3 hover:text-primary",
                )}
                href="/games"
                onClick={() => {
                  setGamesOpen((v) => !v);
                  onClose?.();
                }}
                title="Games"
              >
                <IconGamepad className={cn("h-5 w-5 shrink-0", isGamesPath && "text-primary")} />
              </Link>
            )}

            <CollapsibleContent>
              <ul id="games-submenu" className="mt-0.5 space-y-0.5">
                {gamesNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group flex items-center rounded-md py-3 text-base leading-5 transition-colors duration-200 ease-in-out",
                          isActive
                            ? "bg-primary/10 text-text"
                            : "text-text-muted hover:bg-surface-3 hover:text-primary",
                          collapsed ? "justify-center px-4" : "pl-8 pr-4",
                        )}
                        href={item.href}
                        onClick={onClose}
                        title={collapsed ? item.label : undefined}
                      >
                        {!collapsed ? (
                          <span className="flex items-center gap-2 transition-transform duration-200 ease-in-out group-hover:translate-x-1">
                            <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                            <span>{item.label}</span>
                          </span>
                        ) : (
                          <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Bottom slot — pinned to bottom of drawer flex column.
          Rendered only when onClose is provided (mobile drawer instance).
          Desktop sidebar passes no onClose so this slot is absent there. */}
      {onClose && (
        <div className="shrink-0 px-4 pb-4 pt-2">
          {authenticated ? (
            <button
              className="flex w-full items-center rounded-md border border-border bg-gradient-to-b from-surface-3/40 to-border-2/40 px-4 py-3 text-base leading-5 text-text-muted transition-colors duration-200 ease-in-out hover:bg-surface-3 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
              disabled={logoutMutation.isPending}
              onClick={() => {
                logoutMutation.mutate();
                onClose();
              }}
              type="button"
            >
              <span className="flex items-center gap-2">
                <Image alt="" height={20} src="/images/logout.svg" width={20} />
                Log out
              </span>
            </button>
          ) : (
            <Button
              className="h-10 w-full"
              onClick={() => {
                openAuthModal(true);
                onClose();
              }}
              type="button"
              variant="primary"
            >
              Log In
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}