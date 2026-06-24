"use client";

import type {
  RouletteRendererSettlementReason,
  RouletteRendererSpin,
} from "../renderer/roulette-renderer-types";
import type { RouletteBetResult } from "../model/roulette-types";
import { RouletteWheel } from "./roulette-wheel";

interface RouletteSpinOverlayProps {
  pendingSpin: RouletteBetResult | null;
  onSpinSettled: (spin: RouletteRendererSpin, reason: RouletteRendererSettlementReason) => void;
}

// Mobile-only (<md) spin overlay. Mounts a scrim + wheel while a spin is active;
// auto-dismisses when onSpinSettled fires and the parent sets pendingSpin to null.
// Pixi Application lifecycle is scoped to each spin — no persistent canvas at rest.
export function RouletteSpinOverlay({ pendingSpin, onSpinSettled }: RouletteSpinOverlayProps) {
  if (!pendingSpin) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      role="dialog"
    >
      <div className="w-full max-w-[360px] px-6">
        <RouletteWheel
          onSpinSettled={onSpinSettled}
          pendingSpin={pendingSpin}
          skipReturnTail
        />
      </div>
    </div>
  );
}
