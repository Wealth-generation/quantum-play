"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/shared/ui/primitives/button";
import { useAuthSession, useLogoutMutation } from "@/features/auth";
import { useAuthModal } from "@/widgets/auth-modal";

interface TopBarProps {
  onOpenDrawer: () => void;
}

export function TopBar({ onOpenDrawer }: TopBarProps) {
  const { setOpen } = useAuthModal();
  const { data: session, isLoading } = useAuthSession();
  const logoutMutation = useLogoutMutation();
  const authenticated = session?.authenticated === true;

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-surface px-4">
      <Button
        aria-label="Open navigation"
        className="mr-2 h-8 w-8 lg:hidden"
        onClick={onOpenDrawer}
        size="icon"
        variant="ghost"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <span className="flex-1 text-center text-sm font-bold uppercase tracking-widest text-text lg:hidden">
        Quantum Play
      </span>

      <div className="hidden flex-1 lg:block" />

      {authenticated ? (
        <div className="flex items-center gap-2">
          <span className="hidden max-w-40 truncate rounded-pill bg-control px-3 py-1 text-xs font-medium text-text-muted sm:inline">
            {session.user.username}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-3 text-text-muted">
            <Bell className="h-4 w-4" />
          </span>
          <Button
            aria-label="Log out"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            size="icon"
            type="button"
            variant="ghost"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          disabled={isLoading}
          onClick={() => setOpen(true)}
          size="sm"
          variant="primary"
        >
          Log In
        </Button>
      )}
    </header>
  );
}
