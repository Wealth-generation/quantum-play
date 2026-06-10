"use client";

import { motion } from "motion/react";
import { formatDecimal } from "../lib/dice-math";
import { useDiceGameController } from "../model/use-dice-game-controller";
import { DiceAutoConfigureModal } from "./dice-auto-configure-modal";
import { DiceControlsPanel } from "./dice-controls-panel";
import { DiceMetric } from "./dice-metric";
import { DiceRecentResults } from "./dice-recent-results";
import { DiceSlider } from "./dice-slider";

export function DiceGame() {
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
      className="grid min-h-[520px] gap-0 bg-surface-2 md:grid-cols-[22rem_minmax(0,1fr)]"
      onSubmit={handleBet}
    >
      <DiceControlsPanel
        activeMode={activeMode}
        authenticated={authenticated}
        autoBetCountDraft={auto.autoBetCountDraft}
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
        onConfigure={() => auto.setConfigureOpen(true)}
        onDoubleBetAmount={doubleBetAmount}
        onHalfBetAmount={halfBetAmount}
        onModeChange={updateMode}
        onStartAutoBet={auto.startAutoBet}
        onStopAutoBet={auto.stopAutoBet}
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
        className="relative order-1 flex min-w-0 flex-col justify-center bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_64%)] px-4 py-16 md:order-2 md:px-8 md:py-20"
        transition={{ duration: 0.25 }}
      >
        <DiceRecentResults results={dice.recentResults} />

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-16">
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
        />
      ) : null}
    </form>
  );
}
