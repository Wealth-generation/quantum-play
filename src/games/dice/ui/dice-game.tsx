"use client";

import { motion } from "motion/react";
import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { useTurboMode } from "@/features/turbo-mode";
import { cn } from "@/shared/lib";
import { formatDecimal } from "../lib/dice-math";
import { useDiceGameController } from "../model/use-dice-game-controller";
import { DiceAutoConfigureModal } from "./dice-auto-configure-modal";
import { DiceControlsPanel } from "./dice-controls-panel";
import { DiceMetric } from "./dice-metric";
import { DiceRecentResults } from "./dice-recent-results";
import { DiceSlider } from "./dice-slider";

const DICE_RESULT_GLOW_DURATION = 0.25;
const DICE_TURBO_RESULT_GLOW_DURATION = 0.08;

export function DiceGame() {
  const { fullscreenPortalContainer, isExpanded } = useGameExpandedMode();
  const { turboEnabled } = useTurboMode();
  const {
    activeMode,
    authenticated,
    auto,
    betAmountValidation,
    betDisabled,
    betMutation,
    configQuery,
    dice,
    doubleBetAmount,
    halfBetAmount,
    handleBet,
    maxBet,
    maxBetAmount,
    normalizeBetAmount,
    updateBetAmount,
    updateMode,
  } = useDiceGameController();
  const manualErrorMessage =
    betMutation.isError && betMutation.error instanceof Error
      ? betMutation.error.message
      : betMutation.isError
        ? "Dice bet failed."
        : null;

  return (
    <form
      className={cn(
        "grid gap-0 bg-surface-2 md:grid-cols-[22rem_minmax(0,1fr)]",
        isExpanded
          ? "h-full min-h-0 overflow-hidden"
          : "min-h-[520px]",
      )}
      onSubmit={handleBet}
    >
      <DiceControlsPanel
        activeMode={activeMode}
        authenticated={authenticated}
        autoBetCountDraft={auto.autoBetCountDraft}
        autoBetInfinite={auto.autoBetInfinite}
        autoConfig={auto.autoConfig}
        autoErrorMessage={auto.errorMessage}
        autoRunning={auto.autoRunning}
        autoStartDisabled={auto.autoStartDisabled}
        betAmount={dice.betAmount}
        betAmountFeedback={authenticated ? betAmountValidation : null}
        betDisabled={betDisabled}
        configError={configQuery.isError}
        manualErrorMessage={manualErrorMessage}
        manualLoading={betMutation.isPending}
        onBetAmountBlur={normalizeBetAmount}
        onBetAmountChange={updateBetAmount}
        onConfigure={auto.openConfigure}
        onDoubleBetAmount={doubleBetAmount}
        onHalfBetAmount={halfBetAmount}
        onMaxBetAmount={maxBet.enabled ? maxBetAmount : undefined}
        onModeChange={updateMode}
        onStartAutoBet={auto.startAutoBet}
        onStopAutoBet={auto.stopAutoBet}
        onToggleAutoBetInfinite={auto.toggleAutoBetInfinite}
        onUpdateAutoBetCount={auto.updateAutoBetCount}
        profitOnWin={dice.profitOnWin}
      />

      <motion.div
        animate={
          dice.lastResult
            ? {
                boxShadow: dice.lastResult.didWin
                  ? "inset 0 0 28px rgba(34,197,94,0.08)"
                  : "inset 0 0 28px rgba(220,38,38,0.08)",
              }
            : undefined
        }
        className={cn(
          "relative order-1 flex min-w-0 flex-col justify-center bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_64%)] px-4 md:order-2",
          isExpanded
            ? "min-h-[360px] py-10 md:min-h-0 md:px-10 md:py-16 xl:px-14"
            : "py-16 md:px-8 md:py-20",
        )}
        transition={{
          duration: turboEnabled
            ? DICE_TURBO_RESULT_GLOW_DURATION
            : DICE_RESULT_GLOW_DURATION,
        }}
      >
        <DiceRecentResults
          results={dice.recentResults}
          turboEnabled={turboEnabled}
        />

        <div
          className={cn(
            "mx-auto flex w-full flex-col",
            isExpanded ? "max-w-5xl gap-14 md:gap-20" : "max-w-3xl gap-16",
          )}
        >
          <DiceSlider
            didWin={dice.lastResult?.didWin}
            onChange={dice.updateThreshold}
            randomValue={dice.lastResult?.randomValue}
            threshold={dice.threshold}
          />

          <div className="grid grid-cols-3 gap-2 rounded-md border border-border/70 bg-surface/70 p-2 shadow-inset-hi md:gap-3 md:p-3">
            <DiceMetric
              label="Multiplier"
              suffix="x"
              value={formatDecimal(dice.multiplier, 4)}
            />
            <DiceMetric
              label="Rollover"
              onSuffixClick={dice.mirrorThreshold}
              value={formatDecimal(dice.threshold)}
            />
            <DiceMetric
              label="Chance"
              suffix="%"
              value={formatDecimal(dice.chance)}
            />
          </div>
        </div>
      </motion.div>

      {auto.configureOpen ? (
        <DiceAutoConfigureModal
          config={auto.autoConfig}
          disabled={auto.autoRunning}
          onApply={auto.applyAutoConfig}
          onOpenChange={auto.setConfigureOpen}
          onResetAll={auto.resetAutoConfig}
          open={auto.configureOpen}
          portalContainer={fullscreenPortalContainer}
        />
      ) : null}
    </form>
  );
}
