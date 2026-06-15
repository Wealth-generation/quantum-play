"use client";

import * as React from "react";
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
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — hidden on mobile, persistent on lg+ */}
      <div className="hidden lg:flex lg:shrink-0">
        <MainNav
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Mobile drawer scrim — sits below the drawer panel (z-40 < z-50), above page content.
           Closes the drawer on tap. Only rendered when drawerOpen; hidden ≥lg so it never
           intercepts desktop interactions. No window/document access — SSR-safe. */}
      {drawerOpen && (
        <div
          aria-hidden="true"
          className="fixed bottom-0 left-0 right-0 top-14 z-40 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer — full viewport width, below top bar (top-14 = 3.5rem = h-14) */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 top-14 z-50 transition-transform duration-200 lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Full-width nav: overrides the default w-64 and removes the right border */}
        <MainNav
          collapsed={false}
          onToggle={() => setDrawerOpen(false)}
          className="w-full border-r-0"
        />
      </div>

      {/* Main content column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* onOpenDrawer now toggles: opens when closed, closes when open */}
        <TopBar onOpenDrawer={() => setDrawerOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
          {/* Site-wide footer — static Server Component, safe to import from Client Component
              (no server-only APIs used in Footer). */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
