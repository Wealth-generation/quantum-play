"use client";

import * as React from "react";
import { cn } from "@/shared/lib";
import type { PlinkoRisk, PlinkoRows } from "../config";
import type { PlinkoMiniHistoryItem } from "../model";
import type {
  PlinkoPlaybackLifecycleEvent,
  PlinkoRendererRound,
  PlinkoRendererSettlementReason,
} from "../renderer";
import { PlinkoMiniHistory } from "./plinko-mini-history";
import { PlinkoPixiStage } from "./plinko-pixi-stage";

interface PlinkoBoardPanelProps {
  bucketMultipliers: readonly number[];
  isExpanded: boolean;
  miniHistoryItems?: readonly PlinkoMiniHistoryItem[];
  onPlaybackLifecycle?: (event: PlinkoPlaybackLifecycleEvent) => void;
  onRoundSettled?: (
    round: PlinkoRendererRound,
    reason: PlinkoRendererSettlementReason,
  ) => void;
  roundsToVisualize?: readonly PlinkoRendererRound[];
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
  turboEnabled: boolean;
}

export function PlinkoBoardPanel({
  bucketMultipliers,
  isExpanded,
  miniHistoryItems = [],
  onPlaybackLifecycle,
  onRoundSettled,
  roundsToVisualize,
  risk,
  rowsCount,
  turboEnabled,
}: PlinkoBoardPanelProps) {
  const rendererOptions = React.useMemo(
    () => ({
      board: {
        bucketMultipliers,
        risk,
        rowsCount,
      },
      onPlaybackLifecycle,
      onRoundSettled,
      turboEnabled,
    }),
    [
      bucketMultipliers,
      onPlaybackLifecycle,
      onRoundSettled,
      risk,
      rowsCount,
      turboEnabled,
    ],
  );

  return (
    <section
      className={cn(
        "relative order-1 flex min-w-0 flex-col justify-end overflow-hidden bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_64%)] px-2.5 pb-4 pt-3 md:order-2 md:px-8 md:pb-7 md:pt-8",
        isExpanded ? "h-full min-h-0" : "h-[360px] min-h-0 md:h-[560px]",
      )}
    >
      <PlinkoPixiStage
        className={cn(
          "min-h-0 flex-1",
          isExpanded ? "md:min-h-[460px]" : "md:min-h-0",
        )}
        rendererOptions={rendererOptions}
        roundsToVisualize={roundsToVisualize}
      />

      <PlinkoMiniHistory items={miniHistoryItems} />

      <div className="sr-only" aria-live="polite">
        Showing {rowsCount} Plinko rows with {risk.toLowerCase()} risk.
      </div>
    </section>
  );
}
