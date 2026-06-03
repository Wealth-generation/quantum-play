"use client";

import { Menu, Bell } from "lucide-react";
import { Button } from "@/shared/ui/primitives/button";
import { useAuthModal } from "@/widgets/auth-modal";

interface TopBarProps {
  onOpenDrawer: () => void;
}

export function TopBar({ onOpenDrawer }: TopBarProps) {
  const { setOpen } = useAuthModal();

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-surface px-4">
      {/* Mobile: drawer toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 h-8 w-8 lg:hidden"
        onClick={onOpenDrawer}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile: centered wordmark */}
      <span className="flex-1 text-center text-sm font-bold uppercase tracking-widest text-text lg:hidden">
        Quantum Play
      </span>

      {/* Desktop spacer */}
      <div className="hidden flex-1 lg:block" />

      {/* Logged-in placeholder — hidden until auth state is real */}
      <div className="mr-3 hidden items-center gap-2" aria-hidden="true">
        <span className="rounded-pill bg-control px-3 py-1 text-xs text-text-muted">
          —
        </span>
        <span className="rounded-pill bg-control px-3 py-1 text-xs text-text-muted">
          —
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-3 text-text-muted">
          <Bell className="h-4 w-4" />
        </span>
        <span className="h-8 w-8 rounded-pill bg-surface-3" />
      </div>

      {/* Logged-out: Log In */}
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        Log In
      </Button>
    </header>
  );
}
