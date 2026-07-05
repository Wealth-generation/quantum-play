"use client";

import * as React from "react";
import { useAutoBetRunner } from "@/features/auto-bet";
import { useSoundContract } from "@/features/sound";
import { buildRouletteBetParams, hasAnyBet, totalBet } from "../lib/roulette-bets";
import { compareMoney } from "../lib/roulette-decimal";
import { useRouletteStore } from "./roulette-store";
import type {
  RouletteBetRequest,
  RouletteBetResult,
} from "./roulette-types";

const ROULETTE_AUTO_BET_DELAY_MS = 800;
const DEFAULT_AUTO_BET_COUNT = "10";

type RouletteAutoBetResult = RouletteBetResult & { didWin: boolean };

interface UseRouletteAutoBetOptions {
  authenticated: boolean;
  balance: string | undefined;
  balanceLoading: boolean;
  placeBet: (request: RouletteBetRequest) => Promise<RouletteBetResult>;
  /**
   * Called after each backend result to trigger the spin animation.
   * The returned Promise resolves once the animation settles, which blocks
   * the runner's loop so the next round does not start until the spin is done.
   * useAutoBetRunner's generic contract is unchanged — placeBet just takes longer.
   */
  onSpinRequired: (result: RouletteBetResult) => Promise<void>;
}

function isPositiveWholeNumber(value: string) {
  return /^\d+$/.test(value) && Number(value) > 0;
}

function normalizeWholeNumberInput(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export function useRouletteAutoBet({
  authenticated,
  balance,
  balanceLoading,
  onSpinRequired,
  placeBet,
}: UseRouletteAutoBetOptions) {
  const sound = useSoundContract();
  const placements = useRouletteStore((state) => state.placements);

  const [autoBetCountDraft, setAutoBetCountDraft] = React.useState(
    DEFAULT_AUTO_BET_COUNT,
  );
  const [autoBetInfinite, setAutoBetInfinite] = React.useState(false);

  const autoRunner = useAutoBetRunner<RouletteAutoBetResult>({
    delayMs: ROULETTE_AUTO_BET_DELAY_MS,
    initialRemainingBets: Number(DEFAULT_AUTO_BET_COUNT),
    // onRoundComplete is omitted: handleResult is called from the controller's
    // handleSpinSettled (triggered when onSpinRequired resolves), so the runner
    // does not need to call it. useAutoBetRunner's generic contract is unchanged.
    placeBet: async () => {
      if (!authenticated) {
        throw new Error("Auto-bet stopped because your session ended.");
      }

      const currentPlacements = useRouletteStore.getState().placements;

      if (!hasAnyBet(currentPlacements)) {
        throw new Error("Place at least one chip to auto-bet.");
      }

      const total = totalBet(currentPlacements);

      if (balance !== undefined && compareMoney(total, balance) > 0) {
        throw new Error("Auto-bet stopped because your balance is insufficient.");
      }

      const result = await placeBet({
        params: buildRouletteBetParams(currentPlacements),
      });

      // Wait for the spin animation to complete before returning.
      // The runner's loop awaits this placeBet call, so the next round cannot
      // start until onSpinRequired resolves (i.e. the animation has settled).
      await onSpinRequired(result);

      return {
        ...result,
        didWin: Number(result.payout) > Number(result.betSize),
      };
    },
  });

  const autoRunning = autoRunner.isRunning;
  const hasBets = hasAnyBet(placements);

  const autoStartDisabled =
    !authenticated ||
    !hasBets ||
    balanceLoading ||
    autoRunning ||
    (!autoBetInfinite && !isPositiveWholeNumber(autoBetCountDraft));

  React.useEffect(() => {
    if (!authenticated && autoRunning) {
      autoRunner.stop();
    }
  }, [authenticated, autoRunning, autoRunner]);

  function updateAutoBetCount(value: string) {
    const normalized = normalizeWholeNumberInput(value);
    setAutoBetCountDraft(normalized);

    if (!autoBetInfinite) {
      autoRunner.setRemainingBets(normalized ? Number(normalized) : 0);
    }
  }

  function toggleAutoBetInfinite() {
    if (autoRunning) return;
    sound.play("ui:click");
    setAutoBetInfinite((current) => {
      const nextInfinite = !current;
      autoRunner.setRemainingBets(
        nextInfinite ? "infinite" : Number(autoBetCountDraft || "0"),
      );
      return nextInfinite;
    });
  }

  function startAutoBet() {
    if (autoStartDisabled) return;
    sound.play("ui:click");
    autoRunner.start({
      remainingBets: autoBetInfinite ? "infinite" : Number(autoBetCountDraft),
    });
  }

  function stopAutoBet() {
    sound.play("ui:click");
    autoRunner.stop();
  }

  return {
    autoBetCountDraft,
    autoBetInfinite,
    autoErrorMessage: autoRunner.state.errorMessage,
    autoRemainingBets: autoRunner.state.remainingBets,
    autoRunning,
    autoStartDisabled,
    startAutoBet,
    stopAutoBet,
    toggleAutoBetInfinite,
    updateAutoBetCount,
  };
}
