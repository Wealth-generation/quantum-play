"use client";

import * as React from "react";
import { AuthModal } from "./auth-modal";

type AuthTab = "login" | "register";

interface AuthModalContextValue {
  setOpen: (open: boolean) => void;
  openToTab: (tab: AuthTab) => void;
}

const AuthModalContext = React.createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpenState] = React.useState(false);
  const [tab, setTab] = React.useState<AuthTab>("login");

  function setOpen(nextOpen: boolean) {
    if (!nextOpen) setTab("login"); // reset tab to default when closing
    setOpenState(nextOpen);
  }

  function openToTab(nextTab: AuthTab) {
    setTab(nextTab);
    setOpenState(true);
  }

  return (
    <AuthModalContext.Provider value={{ setOpen, openToTab }}>
      {children}
      <AuthModal
        open={open}
        onOpenChange={setOpen}
        tab={tab}
        onTabChange={setTab}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = React.useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
