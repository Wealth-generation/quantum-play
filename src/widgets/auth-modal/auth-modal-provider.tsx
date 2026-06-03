"use client";

import * as React from "react";
import { AuthModal } from "./auth-modal";

interface AuthModalContextValue {
  setOpen: (open: boolean) => void;
}

const AuthModalContext = React.createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <AuthModalContext.Provider value={{ setOpen }}>
      {children}
      <AuthModal open={open} onOpenChange={setOpen} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = React.useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
