"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/primitives/tabs";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Checkbox } from "@/shared/ui/primitives/checkbox";
import { GoogleIcon, DiscordIcon, XIcon } from "@/shared/ui/icons/social-icons";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── OR + Social auth block ───────────────────────────────────────────────────
// Shared between both tabs. Static UI placeholders — social-login is NOT a
// committed feature; these buttons have no onClick and perform no action.

function SocialAuthBlock() {
  return (
    <div className="mt-2 flex flex-col gap-3">
      {/* OR divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-text-subtle">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Social placeholder buttons — no onClick, no auth logic */}
      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Continue with Google (coming soon)"
          className="flex flex-1 items-center justify-center rounded-md bg-surface-3 py-2 text-text-muted transition-colors hover:bg-border-2 hover:text-text"
        >
          <GoogleIcon />
        </button>
        <button
          type="button"
          aria-label="Continue with Discord (coming soon)"
          className="flex flex-1 items-center justify-center rounded-md bg-surface-3 py-2 text-text-muted transition-colors hover:bg-border-2 hover:text-text"
        >
          <DiscordIcon />
        </button>
        <button
          type="button"
          aria-label="Continue with X (coming soon)"
          className="flex flex-1 items-center justify-center rounded-md bg-surface-3 py-2 text-text-muted transition-colors hover:bg-border-2 hover:text-text"
        >
          <XIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="flex min-h-[420px]">
          {/* Art pane — desktop only; static placeholder, no brand asset */}
          <div className="hidden flex-col items-center justify-center gap-4 bg-surface-2 p-10 text-center md:flex md:w-5/12">
            <div className="flex h-20 w-20 items-center justify-center rounded-pill bg-primary/20">
              <span className="text-3xl font-black text-primary">Q</span>
            </div>
            <p className="text-base font-bold text-text">Quantum Play</p>
            <p className="text-sm text-text-muted">
              Provably fair iGaming — Plinko, Keno, Dice &amp; Roulette.
            </p>
          </div>

          {/* Form pane */}
          <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
            <DialogTitle className="sr-only">Sign in to Quantum Play</DialogTitle>

            <Tabs defaultValue="login" className="flex flex-1 flex-col">
              <TabsList className="mb-6">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* ── Log In tab ── */}
              <TabsContent value="login" className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium text-text-muted"
                    htmlFor="login-email"
                  >
                    Email
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium text-text-muted"
                    htmlFor="login-password"
                  >
                    Password
                  </label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex cursor-pointer items-start gap-2">
                    <Checkbox className="mt-0.5" />
                    <span className="text-xs text-text-muted">
                      I agree to the Terms of Service
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2">
                    <Checkbox className="mt-0.5" />
                    <span className="text-xs text-text-muted">
                      I confirm I am 18 years or older
                    </span>
                  </label>
                </div>

                {/* Submit disabled — auth not wired in 8b */}
                <Button
                  type="button"
                  variant="primary"
                  className="mt-2 w-full"
                  disabled
                  aria-label="Log in (coming soon)"
                >
                  Log In
                </Button>

                <SocialAuthBlock />
              </TabsContent>

              {/* ── Register tab ── */}
              <TabsContent value="register" className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium text-text-muted"
                    htmlFor="reg-username"
                  >
                    Username
                  </label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium text-text-muted"
                    htmlFor="reg-email"
                  >
                    Email
                  </label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    className="text-sm font-medium text-text-muted"
                    htmlFor="reg-password"
                  >
                    Password
                  </label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium text-text-muted">
                    To access the platform, please confirm:
                  </p>
                  <label className="flex cursor-pointer items-start gap-2">
                    <Checkbox className="mt-0.5" />
                    <span className="text-xs text-text-muted">
                      I agree to the{" "}
                      <Link href="/terms" className="underline hover:text-text">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="underline hover:text-text">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2">
                    <Checkbox className="mt-0.5" />
                    <span className="text-xs text-text-muted">
                      I am 18 years old or older
                    </span>
                  </label>
                </div>

                {/* Submit disabled — auth not wired in 8b */}
                <Button
                  type="button"
                  variant="primary"
                  className="mt-2 w-full"
                  disabled
                  aria-label="Register (coming soon)"
                >
                  Register
                </Button>

                <SocialAuthBlock />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
