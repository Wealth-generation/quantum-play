"use client";

import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/primitives/button";
import { useRouletteGameController } from "../model/use-roulette-game-controller";
import { RouletteChipTray } from "./roulette-chip-tray";
import { RouletteResult } from "./roulette-result";
import { RouletteTable } from "./roulette-table";

export function RouletteGame() {
  const { isExpanded } = useGameExpandedMode();
  const {
    betDisabled,
    betMutation,
    betValidation,
    clearBets,
    errorMessage,
    handleBet,
    lastResult,
    placeColor,
    placeStraight,
    placements,
    selectedChip,
    setSelectedChip,
    totalBet,
  } = useRouletteGameController();

  return (
    <form
      className={cn(
        "grid gap-0 bg-surface-2 md:grid-cols-[20rem_minmax(0,1fr)]",
        isExpanded ? "h-full min-h-0 overflow-hidden" : "min-h-[520px]",
      )}
      onSubmit={handleBet}
    >
      <div className="order-2 flex flex-col gap-4 border-border p-4 md:order-1 md:border-r">
        <RouletteChipTray
          clearDisabled={betMutation.isPending}
          onClear={clearBets}
          onSelectChip={setSelectedChip}
          selectedChip={selectedChip}
          totalBet={totalBet}
        />

        <Button
          className="w-full"
          disabled={betDisabled}
          size="md"
          type="submit"
          variant="primary"
        >
          {betMutation.isPending ? "Spinning…" : "Spin"}
        </Button>

        {errorMessage ? (
          <p className="text-sm font-medium text-danger">{errorMessage}</p>
        ) : betValidation ? (
          <p className="text-sm font-medium text-text-muted">{betValidation}</p>
        ) : null}
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
          onPlaceStraight={placeStraight}
          placements={placements}
        />

        <RouletteResult result={lastResult} />
      </div>
    </form>
  );
}
