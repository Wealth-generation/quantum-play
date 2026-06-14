"use client";

import * as React from "react";
import { cn } from "@/shared/lib";
import type { PlinkoRisk, PlinkoRows } from "../config";
import type { PlinkoRendererRound } from "../renderer";
import { PlinkoPixiStage } from "./plinko-pixi-stage";

interface PlinkoBoardPanelProps {
  bucketMultipliers: readonly number[];
  isExpanded: boolean;
  onRoundSettled?: (round: PlinkoRendererRound) => void;
  previewRound?: PlinkoRendererRound | null;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
}

export function PlinkoBoardPanel({
  bucketMultipliers,
  isExpanded,
  onRoundSettled,
  previewRound,
  risk,
  rowsCount,
}: PlinkoBoardPanelProps) {
  const rendererOptions = React.useMemo(
    () => ({
      board: {
        bucketMultipliers,
        risk,
        rowsCount,
      },
      onRoundSettled,
    }),
    [bucketMultipliers, onRoundSettled, risk, rowsCount],
  );

  return (
    <section
      className={cn(
        "relative order-1 flex min-w-0 flex-col justify-end overflow-hidden bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_64%)] px-3 pb-5 pt-4 md:order-2 md:px-8 md:pb-7 md:pt-8",
        isExpanded ? "min-h-0" : "min-h-[360px] md:min-h-[560px]",
      )}
    >
      <PlinkoPixiStage
        className="min-h-[300px] flex-1 md:min-h-[460px]"
        rendererOptions={rendererOptions}
        roundToVisualize={previewRound}
      />

      <div className="sr-only" aria-live="polite">
        Showing {rowsCount} Plinko rows with {risk.toLowerCase()} risk.
      </div>
    </section>
  );
}
