"use client";

import * as React from "react";
import { useAutoBetRunner } from "@/features/auto-bet";
import { buildRouletteBetParams, hasAnyBet, totalBet } from "../lib/roulette-bets";
import { compareMoney } from "../lib/roulette-decimal";
import { useRouletteStore } from "./roulette-store";
import type {
  RouletteBetRequest,
  RouletteBetResult,
} from "./roulette-types";

const ROULETTE_AUTO_BET_DELAY_MS = 800;
const DEFAULT_AUTO_BET_COUNT = "10";

// The runner's Result must carry betSize/payout/didWin. didWin is required by the
// shared type but is NOT used for any bet-amount scaling — a Roulette bet is a fixed
// multi-array placement, replayed unchanged each round.
type RouletteAutoBetResult = RouletteBetResult & { didWin: boolean };

interface UseRouletteAutoBetOptions {
  authenticated: boolean;
  balance: string | undefined;
  balanceLoading: boolean;
  placeBet: (request: RouletteBetRequest) => Promise<RouletteBetResult>;
  onResult: (result: RouletteBetResult) => void;
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
  onResult,
  placeBet,
}: UseRouletteAutoBetOptions) {
  // Subscribed so guard state (hasBets) recomputes when the user edits chips.
  const placements = useRouletteStore((state) => state.placements);

  const [autoBetCountDraft, setAutoBetCountDraft] = React.useState(
    DEFAULT_AUTO_BET_COUNT,
  );
  const [autoBetInfinite, setAutoBetInfinite] = React.useState(false);

  const autoRunner = useAutoBetRunner<RouletteAutoBetResult>({
    delayMs: ROULETTE_AUTO_BET_DELAY_MS,
    initialRemainingBets: Number(DEFAULT_AUTO_BET_COUNT),
    onRoundComplete: (result) => {
      onResult(result);
    },
    placeBet: async () => {
      if (!authenticated) {
        throw new Error("Auto-bet stopped because your session ended.");
      }

      // Read live placements so each round replays the CURRENT placement (the store
      // is the source of truth; placements are never cleared between auto-rounds).
      const currentPlacements = useRouletteStore.getState().placements;

      if (!hasAnyBet(currentPlacements)) {
        throw new Error("Place at least one chip to auto-bet.");
      }

      // Runner has no balance guard; pre-check here so a known shortfall stops the
      // session cleanly instead of surfacing as a generic backend error.
      const total = totalBet(currentPlacements);

      if (balance !== undefined && compareMoney(total, balance) > 0) {
        throw new Error("Auto-bet stopped because your balance is insufficient.");
      }

      const result = await placeBet({
        params: buildRouletteBetParams(currentPlacements),
      });

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

  // Stop the loop if the session ends mid-run (mirrors Dice/Plinko).
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
    if (autoRunning) {
      return;
    }

    setAutoBetInfinite((current) => {
      const nextInfinite = !current;
      autoRunner.setRemainingBets(
        nextInfinite ? "infinite" : Number(autoBetCountDraft || "0"),
      );

      return nextInfinite;
    });
  }

  function startAutoBet() {
    if (autoStartDisabled) {
      return;
    }

    autoRunner.start({
      remainingBets: autoBetInfinite ? "infinite" : Number(autoBetCountDraft),
    });
  }

  return {
    autoBetCountDraft,
    autoBetInfinite,
    autoErrorMessage: autoRunner.state.errorMessage,
    autoRunning,
    autoStartDisabled,
    startAutoBet,
    stopAutoBet: autoRunner.stop,
    toggleAutoBetInfinite,
    updateAutoBetCount,
  };
}
