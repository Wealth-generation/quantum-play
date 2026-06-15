"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { MainNav } from "@/widgets/main-nav";
import { TopBar } from "@/widgets/top-bar";
import { Footer } from "@/widgets/footer";
import { cn } from "@/shared/lib";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top bar — spans full width above sidebar and content */}
      <TopBar onOpenDrawer={() => setDrawerOpen((v) => !v)} />

      {/* Below top bar: sidebar + main content side by side */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — hidden on mobile, persistent on lg+ */}
        <div className="hidden overflow-x-hidden lg:flex lg:shrink-0">
          <MainNav
            collapsed={collapsed}
            onExpandRequest={() => setCollapsed(false)}
          />
        </div>

        {/* Desktop collapse toggle — fixed, straddles sidebar right edge */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="fixed z-20 hidden h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-text-muted shadow-sm transition-[left] duration-150 ease-in-out hover:bg-surface-3 hover:text-text lg:flex"
          style={{ left: collapsed ? 94 : 196, top: 72 }}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-150",
              collapsed && "rotate-180",
            )}
          />
        </button>

        {/* Mobile drawer scrim */}
        {drawerOpen && (
          <div
            aria-hidden="true"
            className="fixed bottom-0 left-0 right-0 top-16 z-40 bg-black/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Mobile drawer — w-full on mobile, 227px on sm+ */}
        <div
          className={cn(
            "fixed bottom-0 left-0 top-16 z-50 w-full transition-transform duration-200 sm:w-[227px] lg:hidden",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <MainNav
            collapsed={false}
            className="w-full border-r-0"
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
