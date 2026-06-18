"use client";

import { Volume2 } from "lucide-react";

// Static visual placeholder — sound toggle functionality is deferred to a later task.
// No click handler, no state, no store wiring. Sized to match the 40×40 history badge
// footprint so the left column (icon + badge strip) shares a consistent edge width.
export function RouletteSoundToggle() {
  return (
    <div
      aria-hidden
      className="flex size-10 items-center justify-center"
    >
      <Volume2 className="size-5 shrink-0 text-text-muted" strokeWidth={1.5} />
    </div>
  );
}
