import * as React from "react";
import { cn } from "@/shared/lib";

export type InputProps = React.ComponentProps<"input">;

function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-md border border-border bg-control px-3 py-2 text-sm text-text placeholder:text-text-placeholder",
        "outline-none focus-visible:border-primary focus-visible:shadow-glow",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
