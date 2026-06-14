"use client";

import * as React from "react";

export type AutoBetStatus = "idle" | "running" | "stopping" | "error";
export type AutoBetDecimalInput = number | string;
export type AutoBetRemainingBets = number | "infinite";

type DecimalInput = AutoBetDecimalInput | Decimal;

const DECIMAL_SCALE_DIGITS = 12;
const DECIMAL_SCALE = BigInt("1000000000000");

class Decimal {
  private constructor(private readonly units: bigint) {}

  static from(value: AutoBetDecimalInput | undefined, fallback = "0") {
    const nextValue = value === undefined || value === "" ? fallback : value;

    return new Decimal(parseDecimalUnits(nextValue));
  }

  div(value: DecimalInput) {
    const divisor = Decimal.fromInput(value);

    if (divisor.units === BigInt(0)) {
      throw new Error("Cannot divide by zero.");
    }

    return new Decimal((this.units * DECIMAL_SCALE) / divisor.units);
  }

  gte(value: DecimalInput) {
    return this.units >= Decimal.fromInput(value).units;
  }

  lte(value: DecimalInput) {
    return this.units <= Decimal.fromInput(value).units;
  }

  minus(value: DecimalInput) {
    return new Decimal(this.units - Decimal.fromInput(value).units);
  }

  plus(value: DecimalInput) {
    return new Decimal(this.units + Decimal.fromInput(value).units);
  }

  times(value: DecimalInput) {
    return new Decimal(
      (this.units * Decimal.fromInput(value).units) / DECIMAL_SCALE,
    );
  }

  toString() {
    const negative = this.units < BigInt(0);
    const absoluteUnits = negative ? -this.units : this.units;
    const integerPart = absoluteUnits / DECIMAL_SCALE;
    const fractionalPart = absoluteUnits % DECIMAL_SCALE;
    const fraction = fractionalPart
      .toString()
      .padStart(DECIMAL_SCALE_DIGITS, "0")
      .replace(/0+$/, "");

    return `${negative ? "-" : ""}${integerPart.toString()}${
      fraction ? `.${fraction}` : ""
    }`;
  }

  private static fromInput(value: DecimalInput) {
    return value instanceof Decimal ? value : Decimal.from(value);
  }
}

function normalizeDecimalSource(value: AutoBetDecimalInput) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Decimal value must be finite.");
    }

    return value.toFixed(DECIMAL_SCALE_DIGITS);
  }

  const trimmed = value.trim();

  if (trimmed.toLowerCase().includes("e")) {
    const numericValue = Number(trimmed);

    if (!Number.isFinite(numericValue)) {
      throw new Error("Decimal value must be finite.");
    }

    return numericValue.toFixed(DECIMAL_SCALE_DIGITS);
  }

  return trimmed;
}

function parseDecimalUnits(value: AutoBetDecimalInput) {
  const source = normalizeDecimalSource(value);
  const sign = source.startsWith("-") ? BigInt(-1) : BigInt(1);
  const unsigned = source.replace(/^[+-]/, "");
  const [integerSource = "0", fractionSource = ""] = unsigned.split(".");
  const integerPart = integerSource || "0";
  const fractionPart = fractionSource
    .padEnd(DECIMAL_SCALE_DIGITS, "0")
    .slice(0, DECIMAL_SCALE_DIGITS);

  if (!/^\d+$/.test(integerPart) || !/^\d*$/.test(fractionSource)) {
    throw new Error("Decimal value is invalid.");
  }

  return (
    (BigInt(integerPart) * DECIMAL_SCALE + BigInt(fractionPart || "0")) * sign
  );
}

export interface AutoBetRoundResult {
  betSize: string;
  payout: string;
  didWin: boolean;
}

export type AutoBetSizingStrategy =
  | { type: "none" }
  | { type: "increase"; increaseByPercent: AutoBetDecimalInput }
  | { type: "reset"; betAmount?: AutoBetDecimalInput };

export interface AutoBetRunnerState<Result extends AutoBetRoundResult> {
  status: AutoBetStatus;
  remainingBets: number | null;
  currentBetAmount: string;
  autoSessionProfit: string;
  completedRounds: number;
  errorMessage: string | null;
  lastResult: Result | null;
}

export interface AutoBetStartOptions {
  currentBetAmount?: AutoBetDecimalInput;
  remainingBets?: AutoBetRemainingBets;
}

export interface UseAutoBetRunnerOptions<Result extends AutoBetRoundResult> {
  delayMs?: number;
  initialBetAmount?: AutoBetDecimalInput;
  initialRemainingBets?: AutoBetRemainingBets;
  normalizeBetAmount?: (currentBetAmount: string) => string;
  onError?: (error: unknown) => void;
  onLoss?: AutoBetSizingStrategy;
  onRoundComplete?: (result: Result) => void;
  onWin?: AutoBetSizingStrategy;
  placeBet: (currentBetAmount: string) => Promise<Result>;
  stopOnLoss?: AutoBetDecimalInput;
  stopOnProfit?: AutoBetDecimalInput;
}

const DEFAULT_DELAY_MS = 850;
const DEFAULT_STRATEGY: AutoBetSizingStrategy = { type: "none" };

function decimal(value: AutoBetDecimalInput | undefined, fallback = "0") {
  return Decimal.from(value, fallback);
}

function decimalString(value: AutoBetDecimalInput | undefined, fallback = "0") {
  return decimal(value, fallback).toString();
}

function nonNegativeWholeNumber(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(Math.trunc(value), 0);
}

function normalizeRemainingBets(value: AutoBetRemainingBets | undefined) {
  if (value === "infinite") {
    return null;
  }

  return nonNegativeWholeNumber(value ?? 0);
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Auto-bet stopped because the request failed.";
}

function applySizingStrategy(
  currentBetAmount: string,
  strategy: AutoBetSizingStrategy | undefined,
  initialBetAmount: AutoBetDecimalInput | undefined,
) {
  const resolvedStrategy = strategy ?? DEFAULT_STRATEGY;

  if (resolvedStrategy.type === "reset") {
    return decimalString(resolvedStrategy.betAmount ?? initialBetAmount, "0");
  }

  if (resolvedStrategy.type === "increase") {
    const current = decimal(currentBetAmount);
    const increase = current
      .times(decimal(resolvedStrategy.increaseByPercent))
      .div(100);

    return current.plus(increase).toString();
  }

  return currentBetAmount;
}

function shouldStopForProfit(
  autoSessionProfit: Decimal,
  stopOnProfit: AutoBetDecimalInput | undefined,
) {
  if (stopOnProfit === undefined || decimal(stopOnProfit).lte(0)) {
    return false;
  }

  return autoSessionProfit.gte(decimal(stopOnProfit));
}

function shouldStopForLoss(
  autoSessionProfit: Decimal,
  stopOnLoss: AutoBetDecimalInput | undefined,
) {
  if (stopOnLoss === undefined || decimal(stopOnLoss).lte(0)) {
    return false;
  }

  return autoSessionProfit.lte(decimal(stopOnLoss).times(-1));
}

function normalizeBetAmount<Result extends AutoBetRoundResult>(
  value: string,
  options: UseAutoBetRunnerOptions<Result>,
) {
  return options.normalizeBetAmount?.(value) ?? value;
}

function createInitialState<Result extends AutoBetRoundResult>(
  initialBetAmount: AutoBetDecimalInput | undefined,
  initialRemainingBets: AutoBetRemainingBets | undefined,
  options: UseAutoBetRunnerOptions<Result>,
): AutoBetRunnerState<Result> {
  return {
    status: "idle",
    remainingBets: normalizeRemainingBets(initialRemainingBets),
    currentBetAmount: normalizeBetAmount(
      decimalString(initialBetAmount, "0"),
      options,
    ),
    autoSessionProfit: "0",
    completedRounds: 0,
    errorMessage: null,
    lastResult: null,
  };
}

export function useAutoBetRunner<Result extends AutoBetRoundResult>(
  options: UseAutoBetRunnerOptions<Result>,
) {
  const [state, setState] = React.useState<AutoBetRunnerState<Result>>(() =>
    createInitialState(
      options.initialBetAmount,
      options.initialRemainingBets,
      options,
    ),
  );
  const stateRef = React.useRef(state);
  const optionsRef = React.useRef(options);
  const sessionInitialBetAmountRef = React.useRef(
    normalizeBetAmount(decimalString(options.initialBetAmount, "0"), options),
  );
  const lifecycleIdRef = React.useRef(0);
  const mountedRef = React.useRef(true);
  const loopActiveRef = React.useRef(false);
  const stopRequestedRef = React.useRef(false);
  const delayTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const delayResolveRef = React.useRef<(() => void) | null>(null);

  const updateState = React.useCallback(
    (
      updater: (
        current: AutoBetRunnerState<Result>,
      ) => AutoBetRunnerState<Result>,
    ) => {
      if (!mountedRef.current) {
        return;
      }

      const next = updater(stateRef.current);
      stateRef.current = next;
      setState(next);
    },
    [],
  );

  const finishDelay = React.useCallback(() => {
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }

    const resolve = delayResolveRef.current;
    delayResolveRef.current = null;
    resolve?.();
  }, []);

  const waitBetweenRounds = React.useCallback(
    (delayMs: number) =>
      new Promise<void>((resolve) => {
        delayResolveRef.current = resolve;
        delayTimeoutRef.current = setTimeout(() => {
          finishDelay();
        }, Math.max(delayMs, 0));
      }),
    [finishDelay],
  );

  React.useLayoutEffect(() => {
    optionsRef.current = options;
  }, [options]);

  React.useEffect(() => {
    lifecycleIdRef.current += 1;
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      lifecycleIdRef.current += 1;
      loopActiveRef.current = false;
      stopRequestedRef.current = true;
      finishDelay();
    };
  }, [finishDelay]);

  const stop = React.useCallback(() => {
    stopRequestedRef.current = true;
    finishDelay();

    if (loopActiveRef.current) {
      updateState((current) =>
        current.status === "running"
          ? { ...current, status: "stopping" }
          : current,
      );
    }
  }, [finishDelay, updateState]);

  const runLoop = React.useCallback(async () => {
    const lifecycleId = lifecycleIdRef.current;

    try {
      while (
        mountedRef.current &&
        lifecycleIdRef.current === lifecycleId
      ) {
        const snapshot = stateRef.current;

        if (
          stopRequestedRef.current ||
          (snapshot.remainingBets !== null && snapshot.remainingBets <= 0)
        ) {
          updateState((current) => ({
            ...current,
            status: current.status === "error" ? "error" : "idle",
          }));
          break;
        }

        const currentOptions = optionsRef.current;

        try {
          const result = await currentOptions.placeBet(snapshot.currentBetAmount);

          if (
            !mountedRef.current ||
            lifecycleIdRef.current !== lifecycleId
          ) {
            break;
          }

          currentOptions.onRoundComplete?.(result);

          const roundProfit = decimal(result.payout).minus(
            decimal(result.betSize),
          );
          const nextProfit = decimal(snapshot.autoSessionProfit).plus(roundProfit);
          const nextRemainingBets =
            snapshot.remainingBets === null
              ? null
              : Math.max(snapshot.remainingBets - 1, 0);
          const sizingStrategy = result.didWin
            ? currentOptions.onWin
            : currentOptions.onLoss;
          const nextBetAmount = normalizeBetAmount(
            applySizingStrategy(
              snapshot.currentBetAmount,
              sizingStrategy,
              sessionInitialBetAmountRef.current,
            ),
            currentOptions,
          );
          const reachedStopOnProfit = shouldStopForProfit(
            nextProfit,
            currentOptions.stopOnProfit,
          );
          const reachedStopOnLoss = shouldStopForLoss(
            nextProfit,
            currentOptions.stopOnLoss,
          );

          updateState((current) => ({
            ...current,
            status: "running",
            remainingBets: nextRemainingBets,
            currentBetAmount: nextBetAmount,
            autoSessionProfit: nextProfit.toString(),
            completedRounds: current.completedRounds + 1,
            errorMessage: null,
            lastResult: result,
          }));

          if (
            stopRequestedRef.current ||
            (nextRemainingBets !== null && nextRemainingBets <= 0) ||
            reachedStopOnProfit ||
            reachedStopOnLoss
          ) {
            updateState((current) => ({ ...current, status: "idle" }));
            break;
          }

          await waitBetweenRounds(
            currentOptions.delayMs ?? DEFAULT_DELAY_MS,
          );
        } catch (error) {
          currentOptions.onError?.(error);
          updateState((current) => ({
            ...current,
            status: "error",
            errorMessage: errorMessage(error),
          }));
          break;
        }
      }
    } finally {
      loopActiveRef.current = false;
      stopRequestedRef.current = false;
      finishDelay();
    }
  }, [finishDelay, updateState, waitBetweenRounds]);

  const start = React.useCallback((startOptions?: AutoBetStartOptions) => {
    const snapshot = stateRef.current;
    const nextRemainingBets =
      startOptions?.remainingBets === undefined
        ? snapshot.remainingBets
        : normalizeRemainingBets(startOptions.remainingBets);
    const currentOptions = optionsRef.current;
    const nextBetAmount =
      startOptions?.currentBetAmount === undefined
        ? snapshot.currentBetAmount
        : normalizeBetAmount(
            decimalString(
              startOptions.currentBetAmount,
              snapshot.currentBetAmount,
            ),
            currentOptions,
          );

    if (
      loopActiveRef.current ||
      (nextRemainingBets !== null && nextRemainingBets <= 0)
    ) {
      return;
    }

    sessionInitialBetAmountRef.current = nextBetAmount;
    loopActiveRef.current = true;
    stopRequestedRef.current = false;
    updateState((current) => ({
      ...current,
      remainingBets: nextRemainingBets,
      currentBetAmount: nextBetAmount,
      status: "running",
      autoSessionProfit: "0",
      completedRounds: 0,
      errorMessage: null,
      lastResult: null,
    }));

    void runLoop();
  }, [runLoop, updateState]);

  const setRemainingBets = React.useCallback(
    (remainingBets: AutoBetRemainingBets) => {
      updateState((current) => ({
        ...current,
        remainingBets: normalizeRemainingBets(remainingBets),
      }));
    },
    [updateState],
  );

  const setCurrentBetAmount = React.useCallback(
    (currentBetAmount: AutoBetDecimalInput) => {
      updateState((current) => ({
        ...current,
        currentBetAmount: normalizeBetAmount(
          decimalString(currentBetAmount, current.currentBetAmount),
          optionsRef.current,
        ),
      }));
    },
    [updateState],
  );

  return {
    state,
    isRunning: state.status === "running" || state.status === "stopping",
    setCurrentBetAmount,
    setRemainingBets,
    start,
    stop,
  };
}
