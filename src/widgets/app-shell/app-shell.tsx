"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { MainNav } from "@/widgets/main-nav";
import { TopBar } from "@/widgets/top-bar";
import { BottomNav } from "@/widgets/bottom-nav";
import { Footer } from "@/widgets/footer";
import { cn } from "@/shared/lib";
import { PageLoader, PageLoaderFallback } from "./page-loader";


interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = () => setDrawerOpen((v) => !v);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <React.Suspense fallback={<PageLoaderFallback />}>
        <PageLoader />
      </React.Suspense>

      {/* Top bar — spans full width above sidebar and content */}
      <TopBar drawerOpen={drawerOpen} onCloseDrawer={closeDrawer} />

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

        {/* Mobile drawer scrim — stops above bottom bar */}
        {drawerOpen && (
          <div
            aria-hidden="true"
            className="fixed left-0 right-0 top-16 z-40 bg-black/40 lg:hidden"
            style={{ bottom: "var(--bottom-bar-h)" }}
            onClick={closeDrawer}
          />
        )}

        {/* Mobile drawer — stops above bottom bar so it doesn't render behind it */}
        <div
          className={cn(
            "fixed left-0 top-16 z-50 w-full transition-transform duration-200 sm:w-[227px] lg:hidden",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ bottom: "var(--bottom-bar-h)" }}
        >
          <MainNav
            collapsed={false}
            className="w-full border-r-0"
            onClose={closeDrawer}
          />
        </div>

        {/* Main content — padded so fixed bottom bar doesn't cover content on mobile; none on lg+ */}
        <main
          className="flex-1 overflow-y-auto scrollbar-hide pb-[var(--bottom-bar-h)] lg:pb-0"
        >
          {children}
          <Footer />
        </main>
      </div>

      {/* Bottom nav — mobile only, sits above the drawer (z-[60] > z-50) */}
      <BottomNav
        drawerOpen={drawerOpen}
        onCloseDrawer={closeDrawer}
        onToggleDrawer={toggleDrawer}
      />
    </div>
  );
}
