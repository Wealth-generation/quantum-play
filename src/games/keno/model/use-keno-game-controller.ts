"use client";

import * as React from "react";
import { useAuthSession } from "@/features/auth";
import { useBalanceQuery } from "@/features/balance";
import { useMaxBetContract } from "@/features/max-bet";
import { useSoundContract } from "@/features/sound";
import { useTurboMode } from "@/features/turbo-mode";
import {
  KENO_AUTOPICK_STEP_MS,
  KENO_AUTOPICK_STEP_TURBO_MS,
  KENO_MIN_BET,
} from "../config/keno-defaults";
import { compareMoney, formatMoney } from "../lib/keno-decimal";
import {
  doubleBetAmount,
  halfBetAmount,
  maxBetAmount,
  normalizeMoneyInput,
} from "../lib/keno-input";
import { autoPick as autoPickHelper } from "../lib/keno-tiles";
import { useKenoAutoBet } from "./use-keno-auto-bet";
import { useKenoBetMutation } from "./keno-query";
import { useKenoStore } from "./keno-store";
import type { KenoBetRequest, KenoBetResult, KenoRiskLevel } from "./keno-types";

export function useKenoGameController() {
  const { turboEnabled } = useTurboMode();
  const maxBet = useMaxBetContract();
  const authSession = useAuthSession();
  const sound = useSoundContract();
  const soundRef = React.useRef(sound);
  React.useEffect(() => { soundRef.current = sound; }, [sound]);
  const authenticated = authSession.data?.authenticated === true;
  const balanceQuery = useBalanceQuery(authenticated);
  const betMutation = useKenoBetMutation();

  const selectedTiles = useKenoStore((state) => state.selectedTiles);
  const selectedRisk = useKenoStore((state) => state.selectedRisk);
  const revealedNumbers = useKenoStore((state) => state.revealedNumbers);
  const isRevealComplete = useKenoStore((state) => state.isRevealComplete);
  const history = useKenoStore((state) => state.history);
  const toggleTile = useKenoStore((state) => state.toggleTile);
  const setRisk = useKenoStore((state) => state.setRisk);
  const clearTiles = useKenoStore((state) => state.clearTiles);
  const addRevealedNumber = useKenoStore((state) => state.addRevealedNumber);
  const finaliseReveal = useKenoStore((state) => state.finaliseReveal);
  const clearReveal = useKenoStore((state) => state.clearReveal);
  const addToHistory = useKenoStore((state) => state.addToHistory);

  const [betAmount, setBetAmountState] = React.useState(KENO_MIN_BET);
  const [isAutoPicking, setIsAutoPicking] = React.useState(false);
  // Persists the last win result for the overlay until the next bet starts.
  const [currentResult, setCurrentResult] = React.useState<KenoBetResult | null>(null);
  // 0-based indices of last-round hit tiles; drives the looping glow pulse.
  const [pulsingTiles, setPulsingTiles] = React.useState<ReadonlySet<number>>(new Set());

  // Non-null while the reveal animation is playing.
  const [revealResult, setRevealResult] =
    React.useState<KenoBetResult | null>(null);
  // Ref mirrors revealResult to avoid stale closure in handleRevealSettled.
  const revealResultRef = React.useRef<KenoBetResult | null>(null);
  // Stored resolve function; called by handleRevealSettled to unblock the runner.
  const revealResolveRef = React.useRef<(() => void) | null>(null);

  const balance = balanceQuery.data?.gamePoints;
  const hasSelection = selectedTiles.size > 0;

  // Returns a Promise that resolves once handleRevealSettled is called.
  // The auto-bet runner awaits this inside its placeBet closure, blocking the
  // loop until the KenoGrid fires the settle callback.
  const requestReveal = React.useCallback(
    (result: KenoBetResult): Promise<void> =>
      new Promise<void>((resolve) => {
        soundRef.current.play("keno:reveal");
        revealResolveRef.current = resolve;
        revealResultRef.current = result;
        setRevealResult(result);
      }),
    [],
  );

  // Called by KenoGrid when the last tile animation fires.
  // Pushes the result to history, resolves the pending promise (unblocking the
  // auto-bet runner), and enters the freeze phase: isRevealComplete stays true so
  // hit/miss/drawn tile states remain visible. The board exits freeze via one of
  // three triggers: dismissOverlay + Bet button, Bet button alone, or clicking a
  // selected tile (exitFreeze). Must not block resolve().
  const handleRevealSettled = React.useCallback(() => {
    const result = revealResultRef.current;
    revealResultRef.current = null;

    if (result) {
      addToHistory(result);

      const { selectedTiles: currentSelected } = useKenoStore.getState();
      const hitIndices = result.results.filter((r) => currentSelected.has(r));

      // Show overlay for any non-zero multiplier — this includes sub-1x returns
      // (e.g. LOW/MEDIUM pick=1 match=0: 0.7x / 0.4x). Intentional product design:
      // any non-zero payout surfaces the overlay, not just net-win outcomes.
      if (result.multiplier > 0) {
        setCurrentResult(result);
      }
      if (hitIndices.length > 0) {
        setPulsingTiles(new Set(hitIndices));
      }
      if (Number(result.payout) > Number(result.betSize)) {
        soundRef.current.play("bet:win");
      }
    }

    // isRevealComplete intentionally NOT cleared here — freeze phase starts.
    // clearReveal() is called at the start of the next bet (handleBet /
    // wrappedPlaceBet) or by exitFreeze() when the player clicks a selected tile.
    setRevealResult(null);

    const resolve = revealResolveRef.current;
    revealResolveRef.current = null;
    resolve?.();
  }, [addToHistory]);

  // Wraps the bet mutation to clear tile states, overlay, and pulse at the start
  // of each auto-bet iteration — mirrors what handleBet does for manual bets.
  const wrappedPlaceBet = React.useCallback(
    (req: KenoBetRequest) => {
      clearReveal();
      setCurrentResult(null);
      setPulsingTiles(new Set());
      return betMutation.mutateAsync(req);
    },
    [betMutation, clearReveal],
  );

  const auto = useKenoAutoBet({
    authenticated,
    balance,
    balanceLoading: balanceQuery.isLoading,
    placeBet: wrappedPlaceBet,
    onRevealRequired: requestReveal,
  });

  const isBusy = betMutation.isPending || revealResult !== null || isAutoPicking;

  const insufficientBalance =
    authenticated &&
    balance !== undefined &&
    hasSelection &&
    compareMoney(betAmount, balance) > 0;

  const belowMinimum = compareMoney(betAmount, KENO_MIN_BET) < 0;

  const betValidation: string | null = !authenticated
    ? "Sign in to place a bet."
    : balanceQuery.isLoading
      ? "Balance is loading."
      : belowMinimum
        ? `Minimum bet is ${formatMoney(KENO_MIN_BET)}.`
        : insufficientBalance
          ? "Insufficient balance."
          : null;

  const betDisabled =
    betValidation !== null || !hasSelection || isBusy || balanceQuery.isError;

  const errorMessage =
    betMutation.isError && betMutation.error instanceof Error
      ? betMutation.error.message
      : betMutation.isError
        ? "Keno bet failed."
        : null;

  // Dismisses the win overlay without starting a new bet.
  // Tile states (hit/drawn/miss) remain visible until the next bet fires.
  function dismissOverlay() {
    setCurrentResult(null);
  }

  // Freeze-phase exit trigger 3: player clicks a selected tile (hit or miss).
  // Clears the freeze state and deselects that tile so the board returns to
  // selection mode with that slot vacant.
  function exitFreeze(index: number) {
    clearReveal();
    setCurrentResult(null);
    setPulsingTiles(new Set());
    toggleTile(index);
  }

  async function handleBet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (betDisabled) return;

    // Clear tile reveal states, overlay, and pulse at the start of each round.
    clearReveal();
    setCurrentResult(null);
    setPulsingTiles(new Set());

    try {
      const result = await betMutation.mutateAsync({
        betSize: betAmount,
        risk: selectedRisk,
        selected: Array.from(selectedTiles),
      });

      // Blocks until KenoGrid calls handleRevealSettled.
      await requestReveal(result);
    } catch {
      // Mutation error state surfaces errorMessage below.
    }
  }

  // Staggered auto-pick: clears selection then adds 10 random tiles one-by-one.
  // In turbo mode the step is 0 ms (instant). isBusy includes isAutoPicking to
  // gate the bet button and prevent double-triggering during the sequence.
  function handleAutoPick() {
    if (isAutoPicking || isBusy) return;
    sound.play("ui:click");
    const indices = autoPickHelper();
    const stepMs = turboEnabled ? KENO_AUTOPICK_STEP_TURBO_MS : KENO_AUTOPICK_STEP_MS;
    clearTiles();
    setIsAutoPicking(true);
    indices.forEach((index, i) => {
      setTimeout(() => {
        useKenoStore.getState().toggleTile(index);
        soundRef.current.play("keno:select");
        if (i === indices.length - 1) {
          setIsAutoPicking(false);
        }
      }, i * stepMs);
    });
  }

  function setBetAmount(value: string) {
    setBetAmountState(normalizeMoneyInput(value));
  }

  function handleHalfBet() {
    setBetAmountState(halfBetAmount(betAmount));
  }

  function handleDoubleBet() {
    setBetAmountState(doubleBetAmount(betAmount));
  }

  function handleMaxBet() {
    setBetAmountState(maxBetAmount(balance));
  }

  function handleTileToggle(index: number) {
    sound.play("keno:select");
    toggleTile(index);
  }

  function handleRevealedNumber(num: number) {
    if (selectedTiles.has(num)) {
      soundRef.current.play("keno:match");
    } else {
      soundRef.current.play("keno:miss");
    }
    addRevealedNumber(num);
  }

  function handleSetRisk(risk: KenoRiskLevel) {
    sound.play("ui:click");
    setRisk(risk);
  }

  function handleClearTiles() {
    sound.play("ui:click");
    clearTiles();
  }

  return {
    // Shell contracts
    turboEnabled,
    maxBetEnabled: maxBet.enabled,
    // Auth / balance
    authenticated,
    balanceQuery,
    // Bet amount
    betAmount,
    setBetAmount,
    handleHalfBet,
    handleDoubleBet,
    handleMaxBet,
    // Validation / status
    betDisabled,
    betMutation,
    betValidation,
    errorMessage,
    isBusy,
    // Manual bet handler
    handleBet,
    // Tile selection (store)
    selectedTiles,
    toggleTile: handleTileToggle,
    handleAutoPick,
    clearTiles: handleClearTiles,
    // Win overlay / pulse state
    currentResult,
    dismissOverlay,
    exitFreeze,
    pulsingTiles,
    // Risk (store)
    selectedRisk,
    setRisk: handleSetRisk,
    // Reveal lifecycle
    revealResult,
    revealedNumbers,
    isRevealComplete,
    addRevealedNumber: handleRevealedNumber,
    finaliseReveal,
    handleRevealSettled,
    // History
    history,
    // Auto-bet
    autoBetCountDraft: auto.autoBetCountDraft,
    autoBetInfinite: auto.autoBetInfinite,
    autoErrorMessage: auto.autoErrorMessage,
    autoRunning: auto.autoRunning,
    autoStartDisabled: auto.autoStartDisabled,
    startAutoBet: auto.startAutoBet,
    stopAutoBet: auto.stopAutoBet,
    toggleAutoBetInfinite: auto.toggleAutoBetInfinite,
    updateAutoBetCount: auto.updateAutoBetCount,
  };
}
