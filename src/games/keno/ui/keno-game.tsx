"use client";

import { useState } from "react";
import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { cn } from "@/shared/lib";
import { useKenoGameController } from "../model/use-keno-game-controller";
import type { BetMode } from "./keno-bet-panel";
import { KenoBetPanel } from "./keno-bet-panel";
import { KenoGrid } from "./keno-grid";
import { KenoMultiplierStrip } from "./keno-multiplier-strip";
import { KenoResult } from "./keno-result";

export function KenoGame() {
  const { isExpanded } = useGameExpandedMode();

  // betMode hoisted here so the desktop sidebar and tablet/mobile stacked
  // panel instances share the same state — no forked logic.
  const [betMode, setBetMode] = useState<BetMode>("manual");

  const {
    turboEnabled,
    maxBetEnabled,
    addRevealedNumber,
    autoBetCountDraft,
    autoBetInfinite,
    autoErrorMessage,
    autoRunning,
    autoStartDisabled,
    balanceQuery,
    betAmount,
    betDisabled,
    betMutation,
    betValidation,
    clearTiles,
    currentResult,
    dismissOverlay,
    exitFreeze,
    errorMessage,
    finaliseReveal,
    handleAutoPick,
    handleBet,
    handleDoubleBet,
    handleHalfBet,
    handleMaxBet,
    handleRevealSettled,
    isBusy,
    isRevealComplete,
    pulsingTiles,
    revealedNumbers,
    revealResult,
    selectedRisk,
    selectedTiles,
    setBetAmount,
    setRisk,
    startAutoBet,
    stopAutoBet,
    toggleAutoBetInfinite,
    toggleTile,
    updateAutoBetCount,
  } = useKenoGameController();

  const balance = balanceQuery.data?.gamePoints;

  // Shared props forwarded to both panel instances (desktop sidebar + tablet/mobile stack).
  const panelProps = {
    mode: betMode,
    onModeChange: setBetMode,
    balance,
    balanceLoading: balanceQuery.isLoading,
    betAmount,
    onBetAmountChange: setBetAmount,
    onHalf: handleHalfBet,
    onDouble: handleDoubleBet,
    onMax: maxBetEnabled ? handleMaxBet : undefined,
    selectedRisk,
    onRiskChange: setRisk,
    selectedCount: selectedTiles.size,
    onClearTiles: clearTiles,
    onAutoPick: handleAutoPick,
    betDisabled,
    betPending: betMutation.isPending,
    betValidation,
    errorMessage,
    autoBetCountDraft,
    autoBetInfinite,
    autoErrorMessage,
    autoRunning,
    autoStartDisabled,
    onUpdateAutoBetCount: updateAutoBetCount,
    onToggleAutoBetInfinite: toggleAutoBetInfinite,
    onStartAutoBet: startAutoBet,
    onStopAutoBet: stopAutoBet,
  };

  return (
    // Outer <form> handles manual bet submit — the type="submit" button inside
    // KenoBetPanel submits this form. Auto-bet actions use type="button".
    <form
      className={cn(
        "grid gap-0 bg-surface-2 lg:grid-cols-[22rem_minmax(0,1fr)]",
        isExpanded
          ? "h-full min-h-0 overflow-hidden"
          : "md:min-h-[520px]",
      )}
      onSubmit={handleBet}
    >
      {/* ── Desktop left panel — only visible at lg+ ─────────────────────── */}
      <div className="hidden lg:block lg:order-1 lg:h-full">
        <KenoBetPanel {...panelProps} />
      </div>

      {/* ── Right / main area — grid, strip, and win overlay only ─────────── */}
      <div
        className={cn(
          "relative order-1 lg:order-2 flex min-w-0 flex-col gap-4",
          "bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_64%)]",
          "p-4 md:p-6",
          isExpanded && "min-h-0",
        )}
      >
        {/* Grid + strip share a w-fit mx-auto wrapper so the strip is exactly
            as wide as the grid. The grid's w-fit anchors the wrapper to the
            tile content width (~569px desktop); the strip fills via flex stretch. */}
        {/* Mobile/tablet (<lg): w-full so tiles fill the padded area (no overflow).
            Desktop lg+: w-fit mx-auto centers the fixed-width grid. */}
        <div className="flex flex-col gap-4 w-full lg:w-fit lg:mx-auto">
          {/* Keno number grid — 8×5, responsive tile sizes from slice 4 */}
          <KenoGrid
            addRevealedNumber={addRevealedNumber}
            disabled={isBusy}
            isRevealComplete={isRevealComplete}
            onExitFreeze={exitFreeze}
            onFinaliseReveal={finaliseReveal}
            onRevealSettled={handleRevealSettled}
            onToggleTile={toggleTile}
            pulsingTiles={pulsingTiles}
            revealResult={revealResult}
            revealedNumbers={revealedNumbers}
            selectedTiles={selectedTiles}
            turbo={turboEnabled}
          />

          {/* Multiplier strip — highlight bound to revealedNumbers (store array).
              revealedNumbers persists through the freeze phase regardless of overlay
              visibility; cleared by clearReveal() when the next bet starts or a
              tile click exits freeze. Independent of currentResult / overlay state. */}
          <KenoMultiplierStrip
            isRevealComplete={isRevealComplete}
            pickCount={selectedTiles.size}
            revealedNumbers={revealedNumbers}
            risk={selectedRisk}
            selectedTiles={selectedTiles}
          />
        </div>

        {/* Win overlay — shows when currentResult is non-null (controller sets after
            win reveal, clears at start of next bet or on backdrop click). */}
        <KenoResult
          onDismiss={dismissOverlay}
          result={currentResult}
          selectedTiles={selectedTiles}
        />
      </div>

      {/* ── Tablet/mobile bet-control — full content-width sibling of the board ──
          Figma nodes 4107:111884 (tablet) and 4107:131250 (mobile) show the bet
          control as a direct sibling of the board section, NOT nested inside it.
          Placing it here as a direct <form> child gives it the full single-column
          grid width below lg without inheriting the board's p-4/p-6 padding.
          At lg+, the desktop left panel (hidden.lg:block) handles bet-control;
          this instance is hidden. order-2 ensures it appears after the board row. */}
      <div className="order-2 min-w-0 lg:hidden">
        <KenoBetPanel {...panelProps} />
      </div>
    </form>
  );
}
