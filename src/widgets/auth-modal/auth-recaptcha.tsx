"use client";

import { forwardRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { cn } from "@/shared/lib";

interface AuthRecaptchaProps {
  className?: string;
}

export const AuthRecaptcha = forwardRef<ReCAPTCHA, AuthRecaptchaProps>(
  function AuthRecaptcha({ className }, ref) {
    return (
      <div className={cn("flex justify-center overflow-hidden", className)}>
        <ReCAPTCHA
          ref={ref}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}
          theme="dark"
        />
      </div>
    );
  },
);
