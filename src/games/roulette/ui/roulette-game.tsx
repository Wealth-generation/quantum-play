"use client";

import { useState, useSyncExternalStore } from "react";
import BetAmountIcon from "@/shared/assets/games/roulette/icons/bet-amount-icon.svg";
import ChipValueIcon from "@/shared/assets/games/roulette/icons/chip-value-icon.svg";
import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { useSoundContract } from "@/features/sound";
import { cn } from "@/shared/lib";
import { ROULETTE_CHIPS } from "../config/roulette-defaults";
import { formatMoney } from "../lib/roulette-decimal";
import { useRouletteGameController } from "../model/use-roulette-game-controller";
import { RouletteBetPanel } from "./roulette-bet-panel";
import { RouletteChipTray } from "./roulette-chip-tray";
import { RouletteHistory } from "./roulette-history";
import { RouletteMobileTable } from "./roulette-mobile-table";
import { RouletteResult } from "./roulette-result";
import { RouletteSoundToggle } from "./roulette-sound-toggle";
import { RouletteSpinOverlay } from "./roulette-spin-overlay";
import { RouletteTable } from "./roulette-table";
import { RouletteWheel } from "./roulette-wheel";

// Duplicated from RouletteBetPanel — same disabled-fill (#3f4a59 @50%, no @theme token).
const DISABLED_FILL =
  "bg-[color-mix(in_srgb,var(--color-border-2)_50%,transparent)] text-text-placeholder";
// Duplicated from RouletteBetPanel — same active-tab gradient, no new @theme token.
const ACTIVE_TAB =
  "border border-border bg-gradient-to-b from-[color-mix(in_srgb,var(--color-surface-3)_40%,transparent)] to-[color-mix(in_srgb,var(--color-border-2)_40%,transparent)] text-text";

// Detects whether the viewport is below Tailwind's md breakpoint (768px).
// useSyncExternalStore is React 18's idiomatic pattern for external stores such
// as media queries. getServerSnapshot returns false (wheel renders on SSR), then
// getSnapshot provides the real client value immediately on hydration — no effect,
// no synchronous setState, no cascading-render lint error.
function subscribeMobileBreakpoint(callback: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
const getMobileSnapshot = () => window.matchMedia("(max-width: 767px)").matches;
const getMobileServerSnapshot = () => false;

function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobileBreakpoint,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );
}

export function RouletteGame() {
  const { isExpanded } = useGameExpandedMode();
  const sound = useSoundContract();
  // betMode hoisted here so all three breakpoint layouts (desktop panel, tablet
  // block, mobile block) share the same state — no forked logic.
  const [betMode, setBetMode] = useState<"manual" | "auto">("manual");

  function handleModeChange(mode: "manual" | "auto") {
    sound.play("ui:click");
    setBetMode(mode);
  }

  // isMobile drives: (1) whether the inline wheel is rendered (it isn't on mobile),
  // (2) whether to show the spin overlay (mobile uses it instead of the inline wheel),
  // (3) which board layout to render, and (4) where the sound toggle is placed.
  const isMobile = useIsMobile();

  const {
    autoBetCountDraft,
    autoBetInfinite,
    autoErrorMessage,
    autoRemainingBets,
    autoRunning,
    autoStartDisabled,
    betDisabled,
    betMutation,
    betValidation,
    clearBets,
    undoBet,
    undoDisabled,
    errorMessage,
    handleBet,
    handleSpinSettled,
    lastResult,
    pendingSpin,
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

  const clearDisabled =
    betMutation.isPending || autoRunning || !totalBet || totalBet === "0.00";
  const selectedChipData =
    ROULETTE_CHIPS.find((chip) => chip.value === selectedChip) ??
    ROULETTE_CHIPS[0];
  const betCtaDisabled =
    betMode === "manual" ? betDisabled : !autoRunning && autoStartDisabled;

  // Shared bet-controls JSX rendered in both the tablet (md–lg) and mobile (<md)
  // single-column stacks. Both use the same state and handlers from the controller.
  const betControlsBlock = (
    <div className="flex flex-col gap-6 lg:hidden">
      {/* Bet button — full width */}
      <button
        className={cn(
          "flex h-12 w-full items-center justify-center rounded-md px-6 py-3 text-lg font-medium transition-colors",
          betCtaDisabled
            ? cn("cursor-not-allowed", DISABLED_FILL)
            : "bg-gradient-to-b from-primary-tint to-primary text-on-primary shadow-btn hover:from-primary hover:to-primary-hover active:from-primary-hover active:to-primary-press",
        )}
        disabled={betCtaDisabled}
        onClick={
          betMode === "auto"
            ? autoRunning
              ? stopAutoBet
              : startAutoBet
            : () => sound.play("ui:click")
        }
        type={betMode === "manual" ? "submit" : "button"}
      >
        {betMode === "manual" && betMutation.isPending
          ? "Placing bet…"
          : betMode === "auto" && autoRunning
            ? autoBetInfinite
              ? "Stop (∞)"
              : `Stop (${autoRemainingBets ?? 0})`
            : "Bet"}
      </button>

      {/* Chip Value / Bet Amount info row */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-base font-medium leading-5">
          <span className="text-text">Chip Value</span>
          <span className="flex items-center gap-2 text-text">
            <ChipValueIcon className="h-4 w-4" />
            {selectedChipData.label}{" "}
            <span className="uppercase">Coins</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-base font-medium leading-5">
          <span className="text-text">Bet Amount</span>
          <span className="flex items-center gap-2 text-text">
            <BetAmountIcon className="h-4 w-4" />
            {formatMoney(totalBet)}{" "}
            <span className="uppercase">Coins</span>
          </span>
        </div>
      </div>

      {/* Chip denominations — RouletteChipTray uses grid-cols-5 with 10 chips,
          naturally rendering 2 rows of 5 at all breakpoints. */}
      <RouletteChipTray
        disabled={betMutation.isPending}
        onSelectChip={setSelectedChip}
        selectedChip={selectedChip}
      />

      {/* Manual / Auto mode toggle */}
      <div
        className="flex w-full items-center gap-2 rounded-lg bg-surface p-2"
        role="tablist"
      >
        {(["manual", "auto"] as const).map((tab) => (
          <button
            aria-selected={betMode === tab}
            className={cn(
              "flex-1 rounded-md px-4 py-3 text-base font-medium capitalize transition-colors",
              betMode === tab ? ACTIVE_TAB : "text-text-muted hover:text-text",
            )}
            key={tab}
            onClick={() => handleModeChange(tab)}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error / validation messages */}
      {betMode === "auto" ? (
        autoErrorMessage ? (
          <p className="text-sm font-medium text-danger">{autoErrorMessage}</p>
        ) : null
      ) : errorMessage ? (
        <p className="text-sm font-medium text-danger">{errorMessage}</p>
      ) : betValidation ? (
        <p className="text-sm font-medium text-text-muted">{betValidation}</p>
      ) : null}
    </div>
  );

  return (
    <form
      className={cn(
        "grid gap-0 bg-surface-2 lg:grid-cols-[22rem_minmax(0,1fr)]",
        isExpanded
          ? "h-full min-h-0 overflow-hidden"
          : "md:min-h-[520px]",
      )}
      onSubmit={handleBet}
    >
      {/* Mobile-only spin overlay — fixed-position scrim + wheel. Mounts while
          pendingSpin is non-null on mobile; auto-dismisses when onSpinSettled fires
          and the controller clears pendingSpin. Desktop/tablet use the inline wheel. */}
      {isMobile && (
        <RouletteSpinOverlay
          onSpinSettled={handleSpinSettled}
          pendingSpin={pendingSpin}
        />
      )}

      {/* Desktop panel — hidden at md–lg and mobile; restored at lg+ in left column.
          lg:h-[668px] pins it to the Figma artboard height. */}
      <div className="hidden lg:block lg:order-1 lg:h-[668px]">
        <RouletteBetPanel
          autoBetCountDraft={autoBetCountDraft}
          autoBetInfinite={autoBetInfinite}
          autoErrorMessage={autoErrorMessage}
          autoRemainingBets={autoRemainingBets}
          autoRunning={autoRunning}
          autoStartDisabled={autoStartDisabled}
          betDisabled={betDisabled}
          betPending={betMutation.isPending}
          betValidation={betValidation}
          clearDisabled={clearDisabled}
          errorMessage={errorMessage}
          mode={betMode}
          onClear={clearBets}
          onModeChange={handleModeChange}
          onSelectChip={setSelectedChip}
          onStartAutoBet={startAutoBet}
          onStopAutoBet={stopAutoBet}
          onToggleAutoBetInfinite={toggleAutoBetInfinite}
          onUndo={undoBet}
          onUpdateAutoBetCount={updateAutoBetCount}
          selectedChip={selectedChip}
          totalBet={totalBet}
          undoDisabled={undoDisabled}
        />
      </div>

      {/* Right / single column — contains wheel (md+ only), board, and controls. */}
      <div
        className={cn(
          "relative order-1 lg:order-2 flex min-w-0 flex-col gap-4 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_64%)] p-4 md:justify-center md:p-6",
          isExpanded && "min-h-0",
        )}
      >
        {/* ── Wheel area — tablet/desktop only (md+). Conditionally NOT mounted on
            mobile so the Pixi Application is never created at <md.
            isMobile is false on server/hydration, then becomes true on a mobile
            client; the wheel unmounts immediately after the first effect fires. ── */}
        {!isMobile && (
          <div className="flex items-start gap-4">
            <div className="flex shrink-0 flex-col gap-4">
              <RouletteSoundToggle />
              <RouletteHistory />
            </div>
            <div className="min-w-0 flex-1">
              <RouletteWheel
                onSpinSettled={handleSpinSettled}
                pendingSpin={pendingSpin}
              />
            </div>
          </div>
        )}

        {/* ── Mobile header: sound toggle only (no wheel, no history strip) ── */}
        {isMobile && <RouletteSoundToggle />}

        {/* ── Board: rotated mobile layout OR standard tablet/desktop layout.
            Both share identical handlers, placements, disabled gate, chip-stack
            rendering, and highlight state — only the grid arrangement differs. ── */}
        {isMobile ? (
          <RouletteMobileTable
            clearDisabled={clearDisabled}
            disabled={betMutation.isPending}
            highlightNumber={lastResult?.randomPosition ?? null}
            onClear={clearBets}
            onPlaceColor={placeColor}
            onPlaceColumn={placeColumn}
            onPlaceDozen={placeDozen}
            onPlaceHalf={placeHalf}
            onPlaceParity={placeParity}
            onPlaceStraight={placeStraight}
            onUndo={undoBet}
            placements={placements}
            undoDisabled={undoDisabled}
          />
        ) : (
          <RouletteTable
            clearDisabled={clearDisabled}
            disabled={betMutation.isPending}
            highlightNumber={lastResult?.randomPosition ?? null}
            onClear={clearBets}
            onPlaceColor={placeColor}
            onPlaceColumn={placeColumn}
            onPlaceDozen={placeDozen}
            onPlaceHalf={placeHalf}
            onPlaceParity={placeParity}
            onPlaceStraight={placeStraight}
            onUndo={undoBet}
            placements={placements}
            undoDisabled={undoDisabled}
          />
        )}

        {/* ── Bet controls block — shared between tablet (md–lg) and mobile (<md).
            Hidden at lg+ via CSS (desktop panel handles those). Both breakpoints
            use the same betMode state and controller handlers. ── */}
        {betControlsBlock}

        <RouletteResult result={lastResult} />
      </div>
    </form>
  );
}
