import * as React from "react";
import { cn } from "@/shared/lib";

export type CheckboxProps = React.ComponentProps<"input">;

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 cursor-pointer rounded-sm border border-border bg-control accent-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Checkbox };
