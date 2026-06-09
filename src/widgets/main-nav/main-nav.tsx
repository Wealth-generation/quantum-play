"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, LayoutGrid } from "lucide-react";
import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/primitives/collapsible";
import { cn } from "@/shared/lib";
import { primaryNavItems, gamesNavItems } from "./nav-items";

// Resting background plate for top-level nav items (Figma: 180deg gradient, surface-3/40 → border-2/40).
// Uses existing tokens via color-mix — no raw rgba values, no globals.css changes.
// border-radius uses the existing --radius-md (8px) token, already applied via rounded-md className.
// Nested game sub-items intentionally receive no plate (plate-less, transparent).
const NAV_PLATE_BG =
  "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-3) 40%, transparent) 0%, color-mix(in srgb, var(--color-border-2) 40%, transparent) 100%)";

interface MainNavProps {
  collapsed: boolean;
  onToggle: () => void;
  /** Optional override applied to the root <nav> via cn(). Used by the mobile drawer to
   *  force full-width and remove the right border. */
  className?: string;
}

export function MainNav({ collapsed, onToggle, className }: MainNavProps) {
  const pathname = usePathname();
  const [gamesOpen, setGamesOpen] = React.useState(true);
  const isGamesPath = pathname === "/games" || pathname.startsWith("/games/");

  return (
    <nav
      className={cn(
        "flex h-full flex-col border-r border-border bg-bg transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Logo + collapse toggle — hidden on mobile (drawer has top-bar above it) */}
      <div className="hidden h-14 shrink-0 items-center border-b border-border px-3 lg:flex">
        {!collapsed && (
          <span className="flex-1 text-sm font-bold uppercase tracking-widest text-text">
            Quantum Play
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn("h-8 w-8 shrink-0", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Daily Claimer placeholder */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <Card variant="surface" padding="sm">
            <p className="text-xs font-semibold text-text">Daily Claimer</p>
            <p className="mt-0.5 text-xs text-text-muted">Available soon.</p>
          </Card>
        </div>
      )}

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Primary nav items */}
        <ul className="space-y-0.5 px-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-surface-3 text-text"
                      : "text-text-muted hover:bg-surface-3 hover:text-text",
                    collapsed && "justify-center",
                  )}
                  style={!isActive ? { backgroundImage: NAV_PLATE_BG } : undefined}
                  aria-current={isActive ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Games collapsible group */}
        <div className="mt-1 px-2">
          <Collapsible
            open={!collapsed && gamesOpen}
            onOpenChange={(v) => {
              if (!collapsed) setGamesOpen(v);
            }}
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-text-muted transition-colors hover:bg-surface-3 hover:text-text",
                isGamesPath && "bg-surface-3 text-text",
                collapsed && "justify-center",
              )}
              style={!isGamesPath ? { backgroundImage: NAV_PLATE_BG } : undefined}
              title={collapsed ? "Games" : undefined}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Games</span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 shrink-0 transition-transform duration-200",
                      gamesOpen && "rotate-180",
                    )}
                  />
                </>
              )}
            </CollapsibleTrigger>

            <CollapsibleContent>
              <ul className="mt-0.5 space-y-0.5 pl-3">
                {gamesNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-surface-3 text-text"
                            : "text-text-muted hover:bg-surface-3 hover:text-text",
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

    </nav>
  );
}
