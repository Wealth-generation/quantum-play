"use client";

import * as React from "react";
import Link from "next/link";
import type ReCAPTCHA from "react-google-recaptcha";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/primitives/tabs";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Checkbox } from "@/shared/ui/primitives/checkbox";
import { DiscordIcon, GoogleIcon } from "@/shared/ui/icons/social-icons";
import {
  authSessionQueryKey,
  login,
  register as registerAccount,
  verifyEmail,
} from "@/features/auth";
import { AuthRecaptcha } from "./auth-recaptcha";
import { VerifyEmailStep } from "./verify-email-step";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LoginFormValues {
  email: string;
  password: string;
  termsAccepted: boolean;
  ageConfirmed: boolean;
}

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  ageConfirmed: boolean;
}

type AuthTab = "login" | "register";

interface VerificationState {
  email: string;
  verificationToken: string;
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Authentication request failed. Please try again.";
}

function isRecaptchaFrame(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLIFrameElement)) {
    return false;
  }

  const title = target.title.toLowerCase();
  const src = target.src.toLowerCase();

  return title.includes("recaptcha") || src.includes("google.com/recaptcha");
}

function SocialAuthBlock() {
  const providers = [
    { label: "Google", icon: <GoogleIcon /> },
    { label: "Steam", icon: null },
    { label: "Discord", icon: <DiscordIcon /> },
    { label: "Kick", icon: null },
  ];

  return (
    <div className="mt-2 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-text-subtle">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {providers.map((provider) => (
          <button
            aria-label={`Continue with ${provider.label} (coming soon)`}
            className="flex h-10 items-center justify-center rounded-md bg-surface-3 px-2 text-xs font-semibold text-text-muted transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            key={provider.label}
            type="button"
          >
            {provider.icon ?? provider.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [tab, setTab] = React.useState<AuthTab>("login");
  const [verification, setVerification] =
    React.useState<VerificationState | null>(null);
  const [verificationError, setVerificationError] = React.useState<string | null>(
    null,
  );
  const queryClient = useQueryClient();
  const loginCaptchaRef = React.useRef<ReCAPTCHA>(null);
  const registerCaptchaRef = React.useRef<ReCAPTCHA>(null);

  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      termsAccepted: false,
      ageConfirmed: false,
    },
  });
  const registerForm = useForm<RegisterFormValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      termsAccepted: false,
      ageConfirmed: false,
    },
  });

  const loginMutation = useMutation({ mutationFn: login });
  const registerMutation = useMutation({ mutationFn: registerAccount });
  const verifyEmailMutation = useMutation({ mutationFn: verifyEmail });
  const loginTermsAccepted = useWatch({
    control: loginForm.control,
    name: "termsAccepted",
  });
  const loginAgeConfirmed = useWatch({
    control: loginForm.control,
    name: "ageConfirmed",
  });
  const registerTermsAccepted = useWatch({
    control: registerForm.control,
    name: "termsAccepted",
  });
  const registerAgeConfirmed = useWatch({
    control: registerForm.control,
    name: "ageConfirmed",
  });

  const loginReady = loginTermsAccepted && loginAgeConfirmed;
  const registerReady = registerTermsAccepted && registerAgeConfirmed;

  function resetModalState() {
    setTab("login");
    setVerification(null);
    setVerificationError(null);
    loginForm.reset();
    registerForm.reset();
    loginCaptchaRef.current?.reset();
    registerCaptchaRef.current?.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetModalState();
    }
    onOpenChange(nextOpen);
  }

  async function closeAfterAuth() {
    await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
    resetModalState();
    onOpenChange(false);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginForm.clearErrors("root");
    const valid = await loginForm.trigger();

    if (!valid) {
      return;
    }

    const values = loginForm.getValues();
    const captchaToken = loginCaptchaRef.current?.getValue();

    if (!captchaToken) {
      loginForm.setError("root", {
        message: "Missing reCAPTCHA token",
        type: "manual",
      });
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
        captchaToken,
      });
      await closeAfterAuth();
    } catch (error) {
      loginCaptchaRef.current?.reset();
      loginForm.setError("root", {
        message: errorMessage(error),
        type: "server",
      });
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerForm.clearErrors("root");
    const valid = await registerForm.trigger();

    if (!valid) {
      return;
    }

    const values = registerForm.getValues();
    const captchaToken = registerCaptchaRef.current?.getValue();

    if (!captchaToken) {
      registerForm.setError("root", {
        message: "Missing reCAPTCHA token",
        type: "manual",
      });
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        username: values.username,
        email: values.email,
        password: values.password,
        captchaToken,
      });
      registerCaptchaRef.current?.reset();
      setVerification({
        email: values.email,
        verificationToken: result.verificationToken,
      });
    } catch (error) {
      registerCaptchaRef.current?.reset();
      registerForm.setError("root", {
        message: errorMessage(error),
        type: "server",
      });
    }
  }

  async function handleVerifyEmail(code: string) {
    if (!verification) {
      return;
    }

    setVerificationError(null);

    try {
      await verifyEmailMutation.mutateAsync({
        verificationToken: verification.verificationToken,
        code,
      });
      await closeAfterAuth();
    } catch (error) {
      setVerificationError(errorMessage(error));
    }
  }

  function handleBackToSignIn() {
    setVerification(null);
    setVerificationError(null);
    setTab("login");
  }

  return (
    <Dialog modal={false} open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-hidden p-0"
        onFocusOutside={(event) => {
          if (isRecaptchaFrame(event.target)) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (isRecaptchaFrame(event.target)) {
            event.preventDefault();
          }
        }}
      >
        <div className="flex min-h-[420px]">
          <div className="hidden flex-col items-center justify-center gap-4 bg-surface-2 p-10 text-center md:flex md:w-5/12">
            <div className="flex h-20 w-20 items-center justify-center rounded-pill bg-primary/20">
              <span className="text-3xl font-black text-primary">Q</span>
            </div>
            <p className="text-base font-bold text-text">Quantum Play</p>
            <p className="text-sm text-text-muted">
              Provably fair iGaming - Plinko, Keno, Dice &amp; Roulette.
            </p>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
            <DialogTitle className="sr-only">Sign in to Quantum Play</DialogTitle>
            <DialogDescription className="sr-only">
              Log in, create an account, or verify your email address.
            </DialogDescription>

            {verification ? (
              <VerifyEmailStep
                email={verification.email}
                error={verificationError}
                onBack={handleBackToSignIn}
                onClearError={() => setVerificationError(null)}
                onSubmit={handleVerifyEmail}
                pending={verifyEmailMutation.isPending}
              />
            ) : (
              <Tabs
                className="flex flex-1 flex-col"
                onValueChange={(value) => setTab(value as AuthTab)}
                value={tab}
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <div className="space-y-1.5">
                      <label
                        className="text-sm font-medium text-text-muted"
                        htmlFor="login-email"
                      >
                        Email
                      </label>
                      <Input
                        id="login-email"
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                        {...loginForm.register("email", { required: true })}
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
                        placeholder="Enter your password"
                        type="password"
                        autoComplete="current-password"
                        {...loginForm.register("password", { required: true })}
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex cursor-pointer items-start gap-2">
                        <Checkbox
                          className="mt-0.5"
                          {...loginForm.register("termsAccepted")}
                        />
                        <span className="text-xs text-text-muted">
                          I agree to the Terms of Service
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-2">
                        <Checkbox
                          className="mt-0.5"
                          {...loginForm.register("ageConfirmed")}
                        />
                        <span className="text-xs text-text-muted">
                          I confirm I am 18 years or older
                        </span>
                      </label>
                    </div>

                    <AuthRecaptcha ref={loginCaptchaRef} />

                    {loginForm.formState.errors.root?.message ? (
                      <p className="text-sm font-medium text-danger" role="alert">
                        {loginForm.formState.errors.root.message}
                      </p>
                    ) : null}

                    <Button
                      className="mt-2 w-full"
                      disabled={!loginReady || loginMutation.isPending}
                      type="submit"
                      variant="primary"
                    >
                      {loginMutation.isPending ? "Logging in..." : "Log In"}
                    </Button>

                    <SocialAuthBlock />
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                    <div className="space-y-1.5">
                      <label
                        className="text-sm font-medium text-text-muted"
                        htmlFor="reg-username"
                      >
                        Username
                      </label>
                      <Input
                        id="reg-username"
                        placeholder="Enter your username"
                        type="text"
                        autoComplete="username"
                        {...registerForm.register("username", { required: true })}
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
                        placeholder="Enter your email"
                        type="email"
                        autoComplete="email"
                        {...registerForm.register("email", { required: true })}
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
                        placeholder="Enter your password"
                        type="password"
                        autoComplete="new-password"
                        {...registerForm.register("password", { required: true })}
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-medium text-text-muted">
                        To access the platform, please confirm:
                      </p>
                      <label className="flex cursor-pointer items-start gap-2">
                        <Checkbox
                          className="mt-0.5"
                          {...registerForm.register("termsAccepted")}
                        />
                        <span className="text-xs text-text-muted">
                          I agree to the{" "}
                          <Link href="/terms" className="underline hover:text-text">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="underline hover:text-text"
                          >
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-2">
                        <Checkbox
                          className="mt-0.5"
                          {...registerForm.register("ageConfirmed")}
                        />
                        <span className="text-xs text-text-muted">
                          I am 18 years old or older
                        </span>
                      </label>
                    </div>

                    <AuthRecaptcha ref={registerCaptchaRef} />

                    {registerForm.formState.errors.root?.message ? (
                      <p className="text-sm font-medium text-danger" role="alert">
                        {registerForm.formState.errors.root.message}
                      </p>
                    ) : null}

                    <Button
                      className="mt-2 w-full"
                      disabled={!registerReady || registerMutation.isPending}
                      type="submit"
                      variant="primary"
                    >
                      {registerMutation.isPending ? "Registering..." : "Register"}
                    </Button>

                    <SocialAuthBlock />
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
