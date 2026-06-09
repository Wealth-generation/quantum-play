"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/shared/lib";

type SliderRootProps = React.ComponentProps<typeof SliderPrimitive.Root>;
type SliderTrackProps = React.ComponentProps<typeof SliderPrimitive.Track>;
type SliderRangeProps = React.ComponentProps<typeof SliderPrimitive.Range>;
type SliderThumbProps = React.ComponentProps<typeof SliderPrimitive.Thumb>;

interface SliderProps extends SliderRootProps {
  rangeClassName?: string;
  thumbClassName?: string;
  trackClassName?: string;
}

function SliderRoot({ className, ...props }: SliderRootProps) {
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-3 data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function SliderTrack({ className, ...props }: SliderTrackProps) {
  return (
    <SliderPrimitive.Track
      className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-pill bg-surface-3",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2",
        className,
      )}
      {...props}
    />
  );
}

function SliderRange({ className, ...props }: SliderRangeProps) {
  return (
    <SliderPrimitive.Range
      className={cn(
        "absolute h-full rounded-pill bg-primary",
        "data-[orientation=vertical]:w-full",
        className,
      )}
      {...props}
    />
  );
}

function SliderThumb({ className, ...props }: SliderThumbProps) {
  return (
    <SliderPrimitive.Thumb
      className={cn(
        "block h-5 w-5 rounded-sm border border-border-2 bg-control shadow-overlay outline-none",
        "transition-colors hover:border-primary focus-visible:border-primary focus-visible:shadow-glow",
        "disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function thumbCount(value?: number[], defaultValue?: number[]) {
  return Math.max(value?.length ?? defaultValue?.length ?? 1, 1);
}

function Slider({
  className,
  rangeClassName,
  thumbClassName,
  trackClassName,
  value,
  defaultValue,
  ...props
}: SliderProps) {
  return (
    <SliderRoot
      className={className}
      value={value}
      defaultValue={defaultValue}
      {...props}
    >
      <SliderTrack className={trackClassName}>
        <SliderRange className={rangeClassName} />
      </SliderTrack>
      {Array.from({ length: thumbCount(value, defaultValue) }, (_, index) => (
        <SliderThumb className={thumbClassName} key={index} />
      ))}
    </SliderRoot>
  );
}

export {
  Slider,
  SliderRoot,
  SliderTrack,
  SliderRange,
  SliderThumb,
};
export type {
  SliderProps,
  SliderRootProps,
  SliderTrackProps,
  SliderRangeProps,
  SliderThumbProps,
};
