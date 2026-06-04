"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center font-medium transition-colors outline-none focus-visible:shadow-glow disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-primary-tint to-primary text-on-primary shadow-btn hover:from-primary hover:to-primary-hover active:from-primary-hover active:to-primary-press",
        secondary:
          "border border-border bg-surface-3 text-text hover:border-border-2",
        ghost: "bg-transparent text-text-muted hover:bg-surface-3 hover:text-text",
      },
      size: {
        sm: "h-8 gap-1.5 rounded-sm px-3 text-sm",
        md: "h-10 gap-2 rounded-md px-6 text-base",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
