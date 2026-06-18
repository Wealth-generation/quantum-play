"use client";

import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { cn } from "@/shared/lib";
import { useRouletteGameController } from "../model/use-roulette-game-controller";
import { RouletteBetPanel } from "./roulette-bet-panel";
import { RouletteHistory } from "./roulette-history";
import { RouletteResult } from "./roulette-result";
import { RouletteSoundToggle } from "./roulette-sound-toggle";
import { RouletteTable } from "./roulette-table";
import { RouletteWheel } from "./roulette-wheel";

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
          "relative order-1 flex min-w-0 flex-col justify-center gap-4 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_64%)] p-4 md:order-2 md:p-6",
          isExpanded && "min-h-0",
        )}
      >
        {/* Wheel area: left column (sound toggle + history strip) to the left of the
            wheel. shrink-0 on the left column keeps the 40px badge strip from
            compressing; min-w-0 flex-1 on the wheel wrapper lets the wheel fill the
            remaining space while its own max-w-[360px] caps the visual size. */}
        <div className="flex items-start gap-4">
          <div className="flex shrink-0 flex-col gap-4">
            <RouletteSoundToggle />
            <RouletteHistory />
          </div>
          <div className="min-w-0 flex-1">
            <RouletteWheel />
          </div>
        </div>

        {/* Betting board: full width, history no longer sits to the board's right. */}
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
