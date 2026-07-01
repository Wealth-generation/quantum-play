"use client";

import * as React from "react";
import { useSoundContract } from "@/features/sound";
import { useTurboMode } from "@/features/turbo-mode";
import {
  type AutoBetSizingStrategy,
  useAutoBetRunner,
} from "@/features/auto-bet";
import {
  type DiceBetBounds,
  getDiceBetAmountValidation,
  isPositiveWholeNumber,
  normalizeBetAmountForRequestWithinBounds,
  normalizeWholeNumberInput,
} from "../lib/dice-input";
import type { DiceBetRequest, DiceBetResult } from "./dice-types";

const DICE_AUTO_BET_DELAY_MS = 800;
const DICE_TURBO_AUTO_BET_DELAY_MS = 400;
const DEFAULT_AUTO_BET_COUNT = "10";

export type AutoStrategyMode = "reset" | "increase";

export interface DiceAutoStrategyConfig {
  mode: AutoStrategyMode;
  increaseByPercent: string;
}

export interface DiceAutoConfig {
  onWin: DiceAutoStrategyConfig;
  onLoss: DiceAutoStrategyConfig;
  stopOnProfit: string;
  stopOnLoss: string;
}

const DEFAULT_AUTO_STRATEGY: DiceAutoStrategyConfig = {
  mode: "reset",
  increaseByPercent: "",
};

const DEFAULT_AUTO_CONFIG: DiceAutoConfig = {
  onWin: DEFAULT_AUTO_STRATEGY,
  onLoss: DEFAULT_AUTO_STRATEGY,
  stopOnProfit: "",
  stopOnLoss: "",
};

export function autoConfigDefaults(): DiceAutoConfig {
  return {
    onWin: { ...DEFAULT_AUTO_STRATEGY },
    onLoss: { ...DEFAULT_AUTO_STRATEGY },
    stopOnProfit: DEFAULT_AUTO_CONFIG.stopOnProfit,
    stopOnLoss: DEFAULT_AUTO_CONFIG.stopOnLoss,
  };
}

function toAutoSizingStrategy(
  config: DiceAutoStrategyConfig,
): AutoBetSizingStrategy {
  if (config.mode === "increase") {
    return {
      type: "increase",
      increaseByPercent: config.increaseByPercent || "0",
    };
  }

  return { type: "reset" };
}

interface UseDiceAutoBetOptions {
  above: boolean;
  authenticated: boolean;
  betAmount: string;
  betAmountValidation: string | null;
  betBounds: DiceBetBounds;
  canBet: boolean;
  configError: boolean;
  mutationPending: boolean;
  applyResult: (result: DiceBetResult) => void;
  placeBet: (request: DiceBetRequest) => Promise<DiceBetResult>;
  threshold: number;
  updateBetAmount: (value: string) => void;
}

export function useDiceAutoBet({
  above,
  authenticated,
  betAmount,
  betAmountValidation,
  betBounds,
  canBet,
  configError,
  mutationPending,
  applyResult,
  placeBet,
  threshold,
  updateBetAmount,
}: UseDiceAutoBetOptions) {
  const sound = useSoundContract();
  const { turboEnabled } = useTurboMode();
  const [autoBetCountDraft, setAutoBetCountDraft] = React.useState(
    DEFAULT_AUTO_BET_COUNT,
  );
  const [autoBetInfinite, setAutoBetInfinite] = React.useState(false);
  const [autoConfig, setAutoConfig] = React.useState<DiceAutoConfig>(() =>
    autoConfigDefaults(),
  );
  const [configureOpen, setConfigureOpen] = React.useState(false);
  const [autoSessionMessage, setAutoSessionMessage] = React.useState<
    string | null
  >(null);

  const autoRunner = useAutoBetRunner<DiceBetResult>({
    delayMs: turboEnabled
      ? DICE_TURBO_AUTO_BET_DELAY_MS
      : DICE_AUTO_BET_DELAY_MS,
    initialBetAmount: betAmount || "0",
    initialRemainingBets: Number(DEFAULT_AUTO_BET_COUNT),
    normalizeBetAmount: (currentBetAmount) =>
      normalizeBetAmountForRequestWithinBounds(currentBetAmount, betBounds),
    onError: () => {
      setAutoSessionMessage("Auto-bet stopped because the request failed.");
    },
    onLoss: toAutoSizingStrategy(autoConfig.onLoss),
    onRoundComplete: (result) => {
      applyResult(result);

      if (!autoBetInfinite) {
        setAutoBetCountDraft((current) =>
          String(Math.max(Number(current || "0") - 1, 0)),
        );
      }

      setAutoSessionMessage(null);
    },
    onWin: toAutoSizingStrategy(autoConfig.onWin),
    placeBet: async (currentBetAmount) => {
      if (!authenticated) {
        throw new Error("Auto-bet stopped because your session ended.");
      }

      const betSize = normalizeBetAmountForRequestWithinBounds(
        currentBetAmount,
        betBounds,
      );
      const validationMessage = getDiceBetAmountValidation(betSize, betBounds);

      if (validationMessage !== null) {
        throw new Error(validationMessage);
      }

      sound.play("dice:throw");
      const result = await placeBet({
        above,
        betSize,
        threshold,
      });
      sound.play("dice:rolling");
      if (result.didWin) sound.play("dice:score");
      return result;
    },
    stopOnLoss: autoConfig.stopOnLoss,
    stopOnProfit: autoConfig.stopOnProfit,
  });

  const autoRunning = autoRunner.isRunning;
  const parsedAutoBetAmount = Number(betAmount || "0");
  const autoStartGuardReasons = [
    !authenticated ? "user is not authenticated" : null,
    !canBet ? "bet amount is not greater than 0" : null,
    betAmountValidation ? betAmountValidation : null,
    !Number.isFinite(parsedAutoBetAmount) ? "bet amount is not finite" : null,
    !autoBetInfinite && !isPositiveWholeNumber(autoBetCountDraft)
      ? "number of bets is not a positive finite integer"
      : null,
    autoRunning ? "auto runner is already running" : null,
    mutationPending ? "dice bet mutation is pending" : null,
    configError ? "dice config query is in error" : null,
  ].filter((reason): reason is string => reason !== null);
  const autoStartDisabled = autoStartGuardReasons.length > 0;

  React.useEffect(() => {
    const normalizedCurrentBetAmount = normalizeBetAmountForRequestWithinBounds(
      autoRunner.state.currentBetAmount,
      betBounds,
    );

    if (autoRunning && betAmount !== normalizedCurrentBetAmount) {
      updateBetAmount(normalizedCurrentBetAmount);
    }
  }, [
    autoRunner.state.currentBetAmount,
    autoRunning,
    betAmount,
    betBounds,
    updateBetAmount,
  ]);

  React.useEffect(() => {
    if (!authenticated && autoRunning) {
      queueMicrotask(() => {
        setAutoSessionMessage("Auto-bet stopped because your session ended.");
      });
      autoRunner.stop();
    }
  }, [authenticated, autoRunning, autoRunner]);

  function syncBetAmount(value: string) {
    autoRunner.setCurrentBetAmount(value || "0");
  }

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

    setAutoSessionMessage(null);
    const normalizedBetAmount = normalizeBetAmountForRequestWithinBounds(
      betAmount,
      betBounds,
    );
    updateBetAmount(normalizedBetAmount);
    autoRunner.setCurrentBetAmount(normalizedBetAmount);
    autoRunner.start({
      currentBetAmount: normalizedBetAmount,
      remainingBets: autoBetInfinite
        ? "infinite"
        : Number(autoBetCountDraft),
    });
  }

  function applyAutoConfig(nextConfig: DiceAutoConfig) {
    setAutoConfig(nextConfig);
    setConfigureOpen(false);
  }

  function resetAutoConfig() {
    setAutoConfig(autoConfigDefaults());
  }

  return {
    autoBetCountDraft,
    autoBetInfinite,
    autoConfig,
    autoRunning,
    autoSessionMessage,
    autoStartDisabled,
    configureOpen,
    errorMessage: autoRunner.state.errorMessage ?? autoSessionMessage,
    applyAutoConfig,
    resetAutoConfig,
    setConfigureOpen,
    startAutoBet,
    stopAutoBet: autoRunner.stop,
    syncBetAmount,
    toggleAutoBetInfinite,
    updateAutoBetCount,
  };
}
