"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSoundContract } from "@/features/sound";

// Real mute toggle, sized to match the 40×40 history badge footprint so the
// left column (icon + badge strip) shares a consistent edge width.
export function RouletteSoundToggle() {
  const sound = useSoundContract();

  return (
    <button
      aria-label={sound.muted ? "Unmute sound" : "Mute sound"}
      aria-pressed={sound.muted}
      className="flex size-10 items-center justify-center"
      onClick={() => sound.setMuted(!sound.muted)}
      type="button"
    >
      {sound.muted ? (
        <VolumeX className="size-5 shrink-0 text-text-muted" strokeWidth={1.5} />
      ) : (
        <Volume2 className="size-5 shrink-0 text-text-muted" strokeWidth={1.5} />
      )}
    </button>
  );
}
