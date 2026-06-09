"use client";

import { BookOpen, Expand, Settings, ShieldCheck, Volume2 } from "lucide-react";
import { Button } from "@/shared/ui/primitives/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/primitives/popover";

function VisualSwitch({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      <span
        aria-hidden="true"
        className="relative h-5 w-9 rounded-pill bg-border-2"
      >
        <span className="absolute left-1 top-1 h-3 w-3 rounded-pill bg-text" />
      </span>
    </div>
  );
}

export function GameActions() {
  return (
    <div className="mt-3 flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-3 py-3 shadow-inset-hi">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button aria-label="Open game settings" size="icon" variant="secondary">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="z-[80] w-[min(17rem,calc(100vw-2rem))] p-4"
            collisionPadding={12}
            side="top"
            sideOffset={10}
          >
            <div className="flex flex-col gap-4">
              <Button className="w-full" size="sm" type="button" variant="primary">
                <BookOpen className="h-4 w-4" />
                Game Rules
              </Button>
              <VisualSwitch label="Turbo Mode" />
              <VisualSwitch label="Max Bet" />
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-text-muted" />
                <input
                  aria-label="Volume"
                  className="h-1 flex-1 accent-primary"
                  defaultValue="78"
                  max="100"
                  min="0"
                  type="range"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button aria-label="Fullscreen shell" size="icon" type="button" variant="secondary">
          <Expand className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <span>Provably Fair</span>
        <ShieldCheck className="h-4 w-4" />
      </div>
    </div>
  );
}
