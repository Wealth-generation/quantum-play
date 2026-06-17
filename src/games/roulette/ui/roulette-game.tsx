"use client";

import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { cn } from "@/shared/lib";
import { useRouletteGameController } from "../model/use-roulette-game-controller";
import { RouletteBetPanel } from "./roulette-bet-panel";
import { RouletteResult } from "./roulette-result";
import { RouletteTable } from "./roulette-table";

export function RouletteGame() {
  const { isExpanded } = useGameExpandedMode();
  const {
    autoBetCountDraft,
    autoBetInfinite,
    autoErrorMessage,
    autoRunning,
    autoStartDisabled,
    betDisabled,
    betMutation,
    betValidation,
    clearBets,
    errorMessage,
    handleBet,
    lastResult,
    placeColor,
    placeColumn,
    placeDozen,
    placeHalf,
    placeParity,
    placeStraight,
    placements,
    selectedChip,
    setSelectedChip,
    startAutoBet,
    stopAutoBet,
    toggleAutoBetInfinite,
    totalBet,
    updateAutoBetCount,
  } = useRouletteGameController();

  return (
    <form
      className={cn(
        "grid gap-0 bg-surface-2 md:grid-cols-[22rem_minmax(0,1fr)]",
        isExpanded ? "h-full min-h-0 overflow-hidden" : "min-h-[520px]",
      )}
      onSubmit={handleBet}
    >
      {/* lg+ pins the side column to the 668px Figma artboard height so tab content
          can never resize it; <lg stays fluid (mobile drawer/stacked). */}
      <div className="order-2 md:order-1 lg:h-[668px]">
        <RouletteBetPanel
          autoBetCountDraft={autoBetCountDraft}
          autoBetInfinite={autoBetInfinite}
          autoErrorMessage={autoErrorMessage}
          autoRunning={autoRunning}
          autoStartDisabled={autoStartDisabled}
          betDisabled={betDisabled}
          betPending={betMutation.isPending}
          betValidation={betValidation}
          clearDisabled={
            betMutation.isPending ||
            autoRunning ||
            !totalBet ||
            totalBet === "0.00"
          }
          errorMessage={errorMessage}
          onClear={clearBets}
          onSelectChip={setSelectedChip}
          onStartAutoBet={startAutoBet}
          onStopAutoBet={stopAutoBet}
          onToggleAutoBetInfinite={toggleAutoBetInfinite}
          onUpdateAutoBetCount={updateAutoBetCount}
          selectedChip={selectedChip}
          totalBet={totalBet}
        />
      </div>

      <div
        className={cn(
          "order-1 flex min-w-0 flex-col justify-center gap-4 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_64%)] p-4 md:order-2 md:p-6",
          isExpanded && "min-h-0",
        )}
      >
        <RouletteTable
          disabled={betMutation.isPending}
          highlightNumber={lastResult?.randomPosition ?? null}
          onPlaceColor={placeColor}
          onPlaceColumn={placeColumn}
          onPlaceDozen={placeDozen}
          onPlaceHalf={placeHalf}
          onPlaceParity={placeParity}
          onPlaceStraight={placeStraight}
          placements={placements}
        />

        <RouletteResult result={lastResult} />
      </div>
    </form>
  );
}
