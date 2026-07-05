"use client";

import * as React from "react";
import { useAuthSession } from "@/features/auth";
import { useBalanceQuery } from "@/features/balance";
import { useSoundContract } from "@/features/sound";
import { ROULETTE_MIN_TOTAL_BET } from "../config/roulette-defaults";
import { buildRouletteBetParams, hasAnyBet, totalBet } from "../lib/roulette-bets";
import { compareMoney, formatMoney } from "../lib/roulette-decimal";
import type {
  RouletteRendererSettlementReason,
  RouletteRendererSpin,
} from "../renderer/roulette-renderer-types";
import { useRouletteAutoBet } from "./use-roulette-auto-bet";
import { useRouletteBetMutation } from "./roulette-query";
import { useRouletteStore } from "./roulette-store";
import type { RouletteBetResult } from "./roulette-types";

export function useRouletteGameController() {
  const authSession = useAuthSession();
  const authenticated = authSession.data?.authenticated === true;
  const balanceQuery = useBalanceQuery(authenticated);
  const betMutation = useRouletteBetMutation();
  const sound = useSoundContract();
  const soundRef = React.useRef(sound);
  React.useEffect(() => { soundRef.current = sound; }, [sound]);

  const placements = useRouletteStore((state) => state.placements);
  const selectedChip = useRouletteStore((state) => state.selectedChip);
  const hydrated = useRouletteStore((state) => state.hydrated);
  const hydrate = useRouletteStore((state) => state.hydrate);
  const setSelectedChip = useRouletteStore((state) => state.setSelectedChip);
  const placeStraight = useRouletteStore((state) => state.placeStraight);
  const placeColor = useRouletteStore((state) => state.placeColor);
  const placeDozen = useRouletteStore((state) => state.placeDozen);
  const placeColumn = useRouletteStore((state) => state.placeColumn);
  const placeParity = useRouletteStore((state) => state.placeParity);
  const placeHalf = useRouletteStore((state) => state.placeHalf);
  const clearBets = useRouletteStore((state) => state.clearBets);
  const addToHistory = useRouletteStore((state) => state.addToHistory);

  const [lastResult, setLastResult] = React.useState<RouletteBetResult | null>(null);

  // pendingSpin drives the Pixi ball animation. Non-null while the spin is playing;
  // cleared and handleResult called when the renderer fires onSpinSettled.
  const [pendingSpin, setPendingSpin] = React.useState<RouletteBetResult | null>(null);

  // Stored resolve function for the auto-bet placeBet Promise. Set by requestSpin,
  // called by handleSpinSettled so the runner's loop waits for animation completion.
  const spinResolveRef = React.useRef<(() => void) | null>(null);

  // Records history and surfaces the win overlay — called after animation completes.
  const handleResult = React.useCallback(
    (result: RouletteBetResult) => {
      setLastResult(result);
      addToHistory(result);
      if (Number(result.payout) > Number(result.betSize)) {
        soundRef.current.play("bet:win");
      }
    },
    [addToHistory],
  );

  // Called by RoulettePixiBallStage (via RouletteWheel) when the spin animation settles.
  // Clears spin state, records the result, and unblocks the auto-bet runner if active.
  const handleSpinSettled = React.useCallback(
    (spin: RouletteRendererSpin, _reason: RouletteRendererSettlementReason) => {
      void _reason; // result is authoritative regardless of settlement reason
      soundRef.current.stop("roulette:spin");
      setPendingSpin(null);
      handleResult(spin.result);
      const resolve = spinResolveRef.current;
      spinResolveRef.current = null;
      resolve?.();
    },
    [handleResult],
  );

  // Returns a Promise that resolves once the animation completes (via handleSpinSettled).
  // Used by the auto-bet path to block the runner's loop until the spin is done.
  const requestSpin = React.useCallback(
    (result: RouletteBetResult): Promise<void> =>
      new Promise<void>((resolve) => {
        soundRef.current.play("roulette:spin");
        spinResolveRef.current = resolve;
        setPendingSpin(result);
      }),
    [],
  );

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const total = totalBet(placements);
  const hasBets = hasAnyBet(placements);
  const balance = balanceQuery.data?.gamePoints;

  const auto = useRouletteAutoBet({
    authenticated,
    balance,
    balanceLoading: balanceQuery.isLoading,
    // Always await spin settlement. On mobile the spin overlay provides the
    // renderer, so onSpinSettled fires the same way as on desktop/tablet.
    onSpinRequired: requestSpin,
    placeBet: betMutation.mutateAsync,
  });

  const insufficientBalance =
    authenticated &&
    balance !== undefined &&
    hasBets &&
    compareMoney(total, balance) > 0;
  const belowMinimum =
    hasBets && compareMoney(total, ROULETTE_MIN_TOTAL_BET) < 0;

  const betValidation: string | null = !authenticated
    ? "Sign in to place a bet."
    : !hasBets
      ? "Place at least one chip."
      : balanceQuery.isLoading
        ? "Balance is loading."
        : belowMinimum
          ? `Minimum bet is ${formatMoney(ROULETTE_MIN_TOTAL_BET)}.`
          : insufficientBalance
            ? "Insufficient balance."
            : null;

  const betDisabled =
    betValidation !== null ||
    betMutation.isPending ||
    pendingSpin !== null ||
    balanceQuery.isError;

  const errorMessage =
    betMutation.isError && betMutation.error instanceof Error
      ? betMutation.error.message
      : betMutation.isError
        ? "Roulette bet failed."
        : null;

  function handleSelectChip(chip: number) {
    sound.play("ui:click");
    setSelectedChip(chip);
  }

  function handlePlaceStraight(value: number) {
    sound.play("ui:click");
    placeStraight(value);
  }

  function handlePlaceColor(color: Parameters<typeof placeColor>[0]) {
    sound.play("ui:click");
    placeColor(color);
  }

  function handlePlaceDozen(dozen: Parameters<typeof placeDozen>[0]) {
    sound.play("ui:click");
    placeDozen(dozen);
  }

  function handlePlaceColumn(column: Parameters<typeof placeColumn>[0]) {
    sound.play("ui:click");
    placeColumn(column);
  }

  function handlePlaceParity(parity: Parameters<typeof placeParity>[0]) {
    sound.play("ui:click");
    placeParity(parity);
  }

  function handlePlaceHalf(half: Parameters<typeof placeHalf>[0]) {
    sound.play("ui:click");
    placeHalf(half);
  }

  function handleClearBets() {
    sound.play("ui:click");
    clearBets();
  }

  async function handleBet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (betDisabled) return;
    try {
      const result = await betMutation.mutateAsync({
        params: buildRouletteBetParams(placements),
      });
      // Trigger spin. On desktop/tablet the inline wheel handles it;
      // on mobile the spin overlay mounts and handles it. handleResult is called
      // from handleSpinSettled once the animation (in either renderer) completes.
      sound.play("roulette:spin");
      setPendingSpin(result);
    } catch {
      // The mutation error state renders the safe error message below.
    }
  }

  return {
    authenticated,
    balanceQuery,
    betDisabled,
    betMutation,
    betValidation,
    clearBets: handleClearBets,
    errorMessage,
    handleBet,
    handleSpinSettled,
    hydrated,
    lastResult,
    pendingSpin,
    placeColor: handlePlaceColor,
    placeColumn: handlePlaceColumn,
    placeDozen: handlePlaceDozen,
    placeHalf: handlePlaceHalf,
    placeParity: handlePlaceParity,
    placeStraight: handlePlaceStraight,
    placements,
    selectedChip,
    setSelectedChip: handleSelectChip,
    totalBet: total,
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
