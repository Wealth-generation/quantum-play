import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib";

const cardVariants = cva("rounded-lg border", {
  variants: {
    variant: {
      surface: "border-border bg-surface-3",
      panel: "border-border bg-surface",
      elevated: "border-border-2 bg-surface-3 shadow-overlay",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "surface",
    padding: "md",
  },
});

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
  );
}

export { Card, cardVariants };
