"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, User } from "lucide-react";
import { useAuthSession } from "@/features/auth";
import { useAuthModal } from "@/widgets/auth-modal";
import { cn } from "@/shared/lib";

interface BottomNavProps {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
}

export function BottomNav({ drawerOpen, onToggleDrawer, onCloseDrawer }: BottomNavProps) {
  const pathname = usePathname();
  const { data: session } = useAuthSession();
  const { setOpen } = useAuthModal();
  const authenticated = session?.authenticated === true;
  const isProfileActive = pathname === "/user";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[60] flex h-[60px] items-center border-t border-border bg-surface lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Burger */}
      <button
        aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
          drawerOpen ? "text-primary" : "text-text-muted hover:text-text",
        )}
        onClick={onToggleDrawer}
        type="button"
      >
        <Menu className="h-5 w-5" />
        <span className="text-[10px] leading-none">Menu</span>
      </button>

      {/* Bell — non-functional placeholder */}
      <span
        aria-hidden="true"
        className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs text-text-muted"
      >
        <Bell className="h-5 w-5" />
        <span className="text-[10px] leading-none">Alerts</span>
      </span>

      {/* Profile */}
      {authenticated ? (
        <Link
          aria-current={isProfileActive ? "page" : undefined}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
            isProfileActive ? "text-primary" : "text-text-muted hover:text-text",
          )}
          href="/user"
          onClick={onCloseDrawer}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] leading-none">Profile</span>
        </Link>
      ) : (
        <button
          aria-label="Log in"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs text-text-muted hover:text-text transition-colors"
          onClick={() => { onCloseDrawer(); setOpen(true); }}
          type="button"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] leading-none">Log In</span>
        </button>
      )}
    </nav>
  );
}
