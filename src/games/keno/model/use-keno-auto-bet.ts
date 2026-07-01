"use client";

import * as React from "react";
import { useAutoBetRunner } from "@/features/auto-bet";
import { useSoundContract } from "@/features/sound";
import { compareMoney } from "../lib/keno-decimal";
import { useKenoStore } from "./keno-store";
import type { KenoBetRequest, KenoBetResult } from "./keno-types";

const KENO_AUTO_BET_DELAY_MS = 800;
const DEFAULT_AUTO_BET_COUNT = "10";

type KenoAutoBetResult = KenoBetResult & { didWin: boolean };

interface UseKenoAutoBetOptions {
  authenticated: boolean;
  balance: string | undefined;
  balanceLoading: boolean;
  placeBet: (req: KenoBetRequest) => Promise<KenoBetResult>;
  // Blocks the runner loop until the tile reveal animation completes.
  onRevealRequired: (result: KenoBetResult) => Promise<void>;
}

function isPositiveWholeNumber(value: string) {
  return /^\d+$/.test(value) && Number(value) > 0;
}

function normalizeWholeNumberInput(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export function useKenoAutoBet({
  authenticated,
  balance,
  balanceLoading,
  placeBet,
  onRevealRequired,
}: UseKenoAutoBetOptions) {
  const sound = useSoundContract();
  const [autoBetCountDraft, setAutoBetCountDraft] = React.useState(
    DEFAULT_AUTO_BET_COUNT,
  );
  const [autoBetInfinite, setAutoBetInfinite] = React.useState(false);

  const autoRunner = useAutoBetRunner<KenoAutoBetResult>({
    delayMs: KENO_AUTO_BET_DELAY_MS,
    initialRemainingBets: Number(DEFAULT_AUTO_BET_COUNT),
    placeBet: async (currentBetAmount) => {
      if (!authenticated) {
        throw new Error("Auto-bet stopped because your session ended.");
      }

      const { selectedTiles, selectedRisk } = useKenoStore.getState();

      if (selectedTiles.size === 0) {
        throw new Error("Select at least one tile to auto-bet.");
      }

      if (
        balance !== undefined &&
        compareMoney(currentBetAmount, balance) > 0
      ) {
        throw new Error(
          "Auto-bet stopped because your balance is insufficient.",
        );
      }

      const result = await placeBet({
        betSize: currentBetAmount,
        risk: selectedRisk,
        selected: Array.from(selectedTiles),
      });

      // Runner loop waits here until the tile reveal animation resolves.
      await onRevealRequired(result);

      return {
        ...result,
        didWin: Number(result.payout) > Number(result.betSize),
      };
    },
  });

  const autoRunning = autoRunner.isRunning;
  const hasSelection = useKenoStore((state) => state.selectedTiles.size > 0);

  const autoStartDisabled =
    !authenticated ||
    !hasSelection ||
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
    autoRunning,
    autoStartDisabled,
    startAutoBet,
    stopAutoBet,
    toggleAutoBetInfinite,
    updateAutoBetCount,
  };
}
