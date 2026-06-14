"use client";

import * as React from "react";
import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { cn } from "@/shared/lib";
import {
  PLINKO_DEFAULT_BET_AMOUNT,
  PLINKO_DEFAULT_RISK,
  PLINKO_DEFAULT_ROWS,
  PLINKO_ROWS,
  plinkoLocalConfig,
  type PlinkoRisk,
  type PlinkoRows,
} from "../config";
import { usePlinkoConfigQuery, usePlinkoManualBetting } from "../model";
import type { PlinkoRendererRound } from "../renderer";
import { PlinkoBoardPanel } from "./plinko-board-panel";
import { PlinkoControls, type PlinkoMode } from "./plinko-controls";

export function PlinkoGame() {
  const { isExpanded } = useGameExpandedMode();
  const configQuery = usePlinkoConfigQuery();
  const [mode, setMode] = React.useState<PlinkoMode>("manual");
  const [betAmount, setBetAmount] = React.useState(PLINKO_DEFAULT_BET_AMOUNT);
  const [risk, setRisk] = React.useState<PlinkoRisk>(PLINKO_DEFAULT_RISK);
  const [rowsCount, setRowsCount] =
    React.useState<PlinkoRows>(PLINKO_DEFAULT_ROWS);
  const config = configQuery.data ?? {
    maxBet: plinkoLocalConfig.defaultMaxBet,
    minBet: plinkoLocalConfig.defaultMinBet,
    multipliers: plinkoLocalConfig.multipliers,
    risks: plinkoLocalConfig.risks,
    rows: plinkoLocalConfig.rows,
  };
  const bucketMultipliers = config.multipliers[risk][rowsCount];
  const buttonLabel = mode === "manual" ? "Bet" : "Start Autobet";
  const manualBetting = usePlinkoManualBetting({
    betAmount,
    configError: configQuery.isError,
    configMaxBet: config.maxBet,
    configMinBet: config.minBet,
    mode,
    onBetAmountNormalized: setBetAmount,
    risk,
    rowsCount,
  });
  const controlsLocked = manualBetting.controlsLocked;

  function updateRows(value: number[]) {
    if (controlsLocked) {
      return;
    }

    const nextRows = value[0];

    if (PLINKO_ROWS.includes(nextRows as PlinkoRows)) {
      setRowsCount(nextRows as PlinkoRows);
    }
  }

  function halfBetAmount() {
    manualBetting.halfBetAmount();
  }

  function doubleBetAmount() {
    manualBetting.doubleBetAmount();
  }

  function submitManualBet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void manualBetting.placeManualBet();
  }

  const handleRoundSettled = React.useCallback(
    (round: PlinkoRendererRound) => {
      manualBetting.settleRound(round.id);
    },
    [manualBetting],
  );

  return (
    <form
      className={cn(
        "grid bg-surface-2 md:grid-cols-[22rem_minmax(0,1fr)]",
        isExpanded ? "h-full min-h-0 overflow-hidden" : "min-h-[560px]",
      )}
      onSubmit={submitManualBet}
    >
      <PlinkoControls
        authenticated={manualBetting.authenticated}
        betAmount={betAmount}
        betAmountFeedback={
          manualBetting.authenticated ? manualBetting.betAmountValidation : null
        }
        betDisabled={manualBetting.betDisabled}
        buttonLabel={buttonLabel}
        configError={configQuery.isError}
        configLoading={configQuery.isLoading}
        controlsLocked={controlsLocked}
        errorMessage={manualBetting.lastErrorMessage}
        loading={manualBetting.requestingRoundCount > 0}
        mode={mode}
        risk={risk}
        rowsCount={rowsCount}
        onBetAmountBlur={manualBetting.normalizeBetAmount}
        onBetAmountChange={manualBetting.updateBetAmount}
        onDoubleBetAmount={doubleBetAmount}
        onHalfBetAmount={halfBetAmount}
        onMaxBetAmount={
          manualBetting.maxBet.enabled ? manualBetting.maxBetAmount : undefined
        }
        onModeChange={setMode}
        onRiskChange={setRisk}
        onRowsChange={updateRows}
      />

      <PlinkoBoardPanel
        bucketMultipliers={bucketMultipliers}
        isExpanded={isExpanded}
        onRoundSettled={handleRoundSettled}
        previewRound={manualBetting.roundToVisualize}
        risk={risk}
        rowsCount={rowsCount}
      />
    </form>
  );
}
