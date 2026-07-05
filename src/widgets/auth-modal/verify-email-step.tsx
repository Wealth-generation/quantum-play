"use client";

import * as React from "react";
import { Button } from "@/shared/ui/primitives/button";
import { cn } from "@/shared/lib";

interface VerifyEmailStepProps {
  email: string;
  error: string | null;
  pending: boolean;
  onBack: () => void;
  onClearError: () => void;
  onSubmit: (code: string) => void;
}

const CODE_LENGTH = 6;

export function VerifyEmailStep({
  email,
  error,
  pending,
  onBack,
  onClearError,
  onSubmit,
}: VerifyEmailStepProps) {
  const [digits, setDigits] = React.useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => ""),
  );
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const code = digits.join("");
  const complete = code.length === CODE_LENGTH && /^\d{6}$/.test(code);

  function setCode(nextDigits: string[]) {
    setDigits(nextDigits);
    if (error) {
      onClearError();
    }
  }

  function focusInput(index: number) {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }

  function handleChange(index: number, value: string) {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    setCode(nextDigits);

    if (nextDigit && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      setCode(nextDigits);
      focusInput(index - 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (pastedCode.length !== CODE_LENGTH) {
      return;
    }

    event.preventDefault();
    setCode(pastedCode.split(""));
    focusInput(CODE_LENGTH - 1);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (complete && !pending) {
      onSubmit(code);
    }
  }

  return (
    <form className="flex flex-1 flex-col justify-center gap-6" onSubmit={handleSubmit}>
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-black text-text">Your code is on the way!</h2>
        <p className="text-sm text-text-muted">
          Enter the 6-digit code we emailed to{" "}
          <span className="font-semibold text-primary">{email}</span>.
        </p>
        <p className="text-sm text-text-muted">It may take a minute to arrive.</p>
      </div>

      <div
        aria-label="Email verification code"
        className="grid grid-cols-6 gap-2 sm:gap-3"
        role="group"
      >
        {digits.map((digit, index) => (
          <label className="block" key={index}>
            <span className="sr-only">Digit {index + 1}</span>
            <input
              ref={(node) => {
                inputRefs.current[index] = node;
              }}
              aria-invalid={Boolean(error)}
              autoComplete={index === 0 ? "one-time-code" : undefined}
              className={cn(
                "h-12 w-full rounded-md border border-border bg-control text-center text-xl font-bold text-text",
                "outline-none focus-visible:border-primary focus-visible:shadow-glow",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
              disabled={pending}
              inputMode="numeric"
              maxLength={1}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              pattern="[0-9]*"
              type="text"
              value={digit}
            />
          </label>
        ))}
      </div>

      {error ? (
        <p className="text-center text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <Button
          className="w-full"
          disabled={!complete || pending}
          type="submit"
          variant="primary"
        >
          {pending ? "Confirming..." : "Confirm"}
        </Button>
        <Button
          className="w-full"
          disabled={pending}
          onClick={onBack}
          type="button"
          variant="ghost"
        >
          Back to Sign In
        </Button>
      </div>
    </form>
  );
}
