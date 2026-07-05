import * as React from "react";
import { cn } from "@/shared/lib";

export type CheckboxProps = React.ComponentProps<"input">;

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-border bg-control",
        "bg-center bg-no-repeat [background-size:65%_65%]",
        "checked:border-primary checked:bg-primary checked:bg-[image:var(--check-icon)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Checkbox };
