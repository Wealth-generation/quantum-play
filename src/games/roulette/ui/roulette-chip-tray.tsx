"use client";

import Image from "next/image";
import selectedChipGlow from "@/shared/assets/games/roulette/images/selected-chip-glow.webp";
import { cn } from "@/shared/lib";
import { ROULETTE_CHIPS } from "../config/roulette-defaults";

interface RouletteChipTrayProps {
  selectedChip: number;
  onSelectChip: (chip: number) => void;
  disabled?: boolean;
}

// 5×2 chip grid (Figma: chips 48×48, row/col gap 16). The denomination is baked
// into the coin art, so the label is used only for a11y, not an overlay.
export function RouletteChipTray({
  disabled = false,
  onSelectChip,
  selectedChip,
}: RouletteChipTrayProps) {
  return (
    // Fixed 5×48px grid (5×48 + 4×16 gap = 304px content). Fixed columns can never
    // reflow to 4-per-row, and the absolutely-positioned glow stays out of flow so a
    // selected chip occupies the same 48px slot as an unselected one.
    <div className="mx-auto grid w-max grid-cols-[repeat(5,48px)] gap-4">
      {ROULETTE_CHIPS.map((chip) => {
        const active = chip.value === selectedChip;

        return (
          <button
            aria-label={`Select ${chip.label} chip`}
            aria-pressed={active}
            className={cn(
              "relative h-12 w-12 rounded-pill transition-transform",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              disabled
                ? "cursor-not-allowed opacity-60"
                : "hover:scale-105",
            )}
            disabled={disabled}
            key={chip.value}
            onClick={() => onSelectChip(chip.value)}
            type="button"
          >
            {/* Selected-chip indicator — one shared brand-green halo (Figma
                3973-62490), a transparent webp BEHIND the chip only. Absolute /
                out of flow; ~60px so it hugs the 48px chip without inflating the
                grid cell. */}
            {active ? (
              <Image
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60px] w-[60px] max-w-none -translate-x-1/2 -translate-y-1/2"
                src={selectedChipGlow}
              />
            ) : null}
            <Image
              alt=""
              className="relative z-10 h-12 w-12 rounded-pill"
              height={48}
              src={chip.image}
              width={48}
            />
          </button>
        );
      })}
    </div>
  );
}
