"use client";

import * as React from "react";
import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { useGameFairnessSnapshot } from "@/features/provably-fair";
import { useTurboMode } from "@/features/turbo-mode";
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
import {
  usePlinkoConfigQuery,
  usePlinkoManualBetting,
  usePlinkoMiniHistory,
} from "../model";
import type {
  PlinkoRendererRound,
  PlinkoRendererSettlementReason,
} from "../renderer";
import { PlinkoBoardPanel } from "./plinko-board-panel";
import { PlinkoControls, type PlinkoMode } from "./plinko-controls";

export function PlinkoGame() {
  const { isExpanded } = useGameExpandedMode();
  const { clearSnapshot, setSnapshot } = useGameFairnessSnapshot();
  const { turboEnabled } = useTurboMode();
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
  const manualBetting = usePlinkoManualBetting({
    betAmount,
    configError: configQuery.isError,
    configMinBet: config.minBet,
    mode,
    onBetAmountNormalized: setBetAmount,
    risk,
    rowsCount,
    turboEnabled,
  });
  const { addSettledRound, items: miniHistoryItems } = usePlinkoMiniHistory();
  const { settleRound } = manualBetting;
  const controlsLocked = manualBetting.controlsLocked;

  React.useEffect(() => {
    if (!manualBetting.latestFairnessResult) {
      return;
    }

    setSnapshot({
      game: "plinko",
      result: manualBetting.latestFairnessResult,
    });
  }, [manualBetting.latestFairnessResult, setSnapshot]);

  React.useEffect(() => () => clearSnapshot(), [clearSnapshot]);

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

    if (mode !== "manual") {
      return;
    }

    void manualBetting.placeManualBet();
  }

  const handleRoundSettled = React.useCallback(
    (
      round: PlinkoRendererRound,
      reason: PlinkoRendererSettlementReason,
    ) => {
      settleRound(round.id);

      if (reason === "visual") {
        addSettledRound(round);
      }
    },
    [addSettledRound, settleRound],
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
        autoBetCountDraft={manualBetting.autoBetCountDisplay}
        autoBetInfinite={manualBetting.autoBetInfinite}
        autoRunning={manualBetting.autoRunning}
        autoStartDisabled={manualBetting.autoStartDisabled}
        configError={configQuery.isError}
        configLoading={configQuery.isLoading}
        controlsLocked={controlsLocked}
        errorMessage={manualBetting.visibleErrorMessage}
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
        onAutoBetCountChange={manualBetting.updateAutoBetCount}
        onAutoBetInfiniteToggle={manualBetting.toggleAutoBetInfinite}
        onModeChange={setMode}
        onRiskChange={setRisk}
        onRowsChange={updateRows}
        onStartAutoBet={manualBetting.startAutoBet}
        onStopAutoBet={manualBetting.stopAutoBet}
      />

      <PlinkoBoardPanel
        bucketMultipliers={bucketMultipliers}
        isExpanded={isExpanded}
        miniHistoryItems={miniHistoryItems}
        onPlaybackLifecycle={manualBetting.onPlaybackLifecycle}
        onRoundSettled={handleRoundSettled}
        roundsToVisualize={manualBetting.roundsToVisualize}
        risk={risk}
        rowsCount={rowsCount}
        turboEnabled={turboEnabled}
      />
    </form>
  );
}
