"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  type AutoBetSizingStrategy,
  useAutoBetRunner,
} from "@/features/auto-bet";
import { useAuthSession } from "@/features/auth";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Input } from "@/shared/ui/primitives/input";
import {
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from "@/shared/ui/primitives/slider";
import { cn } from "@/shared/lib";
import {
  DICE_MAX_THRESHOLD,
  DICE_MIN_THRESHOLD,
  DICE_THRESHOLD_STEP,
  diceSliderTicks,
} from "../config/dice-defaults";
import { formatDecimal } from "../lib/dice-math";
import {
  useDiceConfigQuery,
  useManualDiceBetMutation,
} from "../model/dice-query";
import type { DiceBetResult } from "../model/dice-types";
import { useManualDice } from "../model/use-manual-dice";

const DICE_MARKER_EDGE_PERCENT = 4;
const AUTO_BET_DELAY_MS = 800;
const DEFAULT_AUTO_BET_COUNT = "10";

type DiceMode = "manual" | "auto";
type AutoStrategyMode = "reset" | "increase";

interface DiceAutoStrategyConfig {
  mode: AutoStrategyMode;
  increaseByPercent: string;
}

interface DiceAutoConfig {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeMoneyInput(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const firstDot = normalized.indexOf(".");

  if (firstDot === -1) {
    return normalized;
  }

  return `${normalized.slice(0, firstDot + 1)}${normalized
    .slice(firstDot + 1)
    .replace(/\./g, "")}`;
}

function normalizePercentInput(value: string) {
  return normalizeMoneyInput(value);
}

function normalizeWholeNumberInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

function isPositiveWholeNumber(value: string) {
  const numericValue = Number(value);

  return (
    value.trim() !== "" &&
    Number.isFinite(numericValue) &&
    Number.isInteger(numericValue) &&
    numericValue > 0
  );
}

function normalizeAutoBetAmount(value: string) {
  return value.trim() === "" ? "" : formatDecimal(value);
}

function normalizeBetAmountForRequest(value: string) {
  return formatDecimal(value || "0");
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

function autoSummary(config: DiceAutoStrategyConfig) {
  if (config.mode === "increase") {
    return `${formatDecimal(config.increaseByPercent || "0")}%`;
  }

  return "Auto";
}

function autoConfigDefaults(): DiceAutoConfig {
  return {
    onWin: { ...DEFAULT_AUTO_STRATEGY },
    onLoss: { ...DEFAULT_AUTO_STRATEGY },
    stopOnProfit: DEFAULT_AUTO_CONFIG.stopOnProfit,
    stopOnLoss: DEFAULT_AUTO_CONFIG.stopOnLoss,
  };
}

function toTrackPercent(value: number) {
  const clampedValue = clamp(value, DICE_MIN_THRESHOLD, DICE_MAX_THRESHOLD);
  return (
    ((clampedValue - DICE_MIN_THRESHOLD) /
      (DICE_MAX_THRESHOLD - DICE_MIN_THRESHOLD)) *
    100
  );
}

function markerBubbleTranslateClass(percent: number) {
  if (percent <= DICE_MARKER_EDGE_PERCENT) {
    return "translate-x-0";
  }

  if (percent >= 100 - DICE_MARKER_EDGE_PERCENT) {
    return "-translate-x-full";
  }

  return "-translate-x-1/2";
}

function CoinValue({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        alt=""
        aria-hidden="true"
        height={20}
        src="/images/game-point.svg"
        width={20}
      />
      <span>{value}</span>
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-black text-text">{children}</span>;
}

function MoneyIcon() {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-on-primary">
      $
    </span>
  );
}

function MoneyBadge({ value }: { value: string }) {
  return (
    <span className="flex items-center gap-2">
      <MoneyIcon />
      <span>{value}</span>
    </span>
  );
}

function BetAmountControl({
  disabled,
  onChange,
  onBlur,
  onDouble,
  onHalf,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onDouble: () => void;
  onHalf: () => void;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>Bet Amount</FieldLabel>
      <div className="flex rounded-md border border-border bg-control shadow-inset-hi">
        <div className="flex flex-1 items-center px-3 font-bold text-text">
          <CoinValue value="" />
          <Input
            aria-label="Bet amount"
            className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:shadow-none"
            disabled={disabled}
            inputMode="decimal"
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            value={value}
          />
        </div>
        <button
          className="my-2 border-l border-border px-3 text-xs font-bold text-text-muted hover:text-text disabled:opacity-50"
          disabled={disabled}
          onClick={onHalf}
          type="button"
        >
          1/2
        </button>
        <button
          className="my-2 border-l border-border px-3 text-xs font-bold text-text-muted hover:text-text disabled:opacity-50"
          disabled={disabled}
          onClick={onDouble}
          type="button"
        >
          2X
        </button>
      </div>
    </div>
  );
}

function DiceMetric({
  label,
  onSuffixClick,
  suffix,
  value,
}: {
  label: string;
  onSuffixClick?: () => void;
  suffix?: string;
  value: string;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="text-sm font-black text-text">{label}</p>
      <div className="flex h-11 items-center justify-between gap-3 rounded-md border border-border bg-control px-3 text-sm font-bold text-text shadow-inset-hi">
        <span className="truncate">{value}</span>
        {onSuffixClick ? (
          <button
            aria-label="Mirror rollover"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-surface-3 hover:text-text"
            onClick={onSuffixClick}
            type="button"
          >
            <Image
              alt=""
              aria-hidden="true"
              height={16}
              src="/images/rollover.svg"
              width={16}
            />
          </button>
        ) : suffix ? (
          <span className="text-lg text-text-muted">{suffix}</span>
        ) : null}
      </div>
    </div>
  );
}

function AutoSummaryCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-h-16 rounded-md border border-border/70 bg-surface-2/70 px-3 py-3 shadow-inset-hi">
      <p className="text-xs font-bold text-text-muted">{label}</p>
      <div className="mt-1 text-sm font-black text-text">{value}</div>
    </div>
  );
}

function StrategyToggle({
  onChange,
  value,
}: {
  onChange: (value: DiceAutoStrategyConfig) => void;
  value: DiceAutoStrategyConfig;
}) {
  const increaseSelected = value.mode === "increase";

  return (
    <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center rounded-md border border-border bg-control p-1 shadow-inset-hi">
      <button
        className={cn(
          "h-8 rounded-sm px-4 text-xs font-black transition-colors",
          value.mode === "reset"
            ? "bg-primary text-on-primary"
            : "bg-surface-2 text-text-muted hover:text-text",
        )}
        onClick={() => onChange({ mode: "reset", increaseByPercent: "" })}
        type="button"
      >
        Reset
      </button>
      <button
        className={cn(
          "h-8 rounded-sm px-4 text-xs font-black transition-colors",
          value.mode === "increase"
            ? "bg-primary text-on-primary"
            : "bg-surface-2 text-text-muted hover:text-text",
        )}
        onClick={() => onChange({ ...value, mode: "increase" })}
        type="button"
      >
        Increase By
      </button>
      <div className="relative min-w-0 px-2">
        <Input
          aria-label="Increase percentage"
          className="h-8 border-0 bg-transparent px-1 pr-5 text-right font-black shadow-none placeholder:text-text-placeholder disabled:opacity-100 focus-visible:shadow-none"
          disabled={!increaseSelected}
          inputMode="decimal"
          onChange={(event) =>
            onChange({
              ...value,
              increaseByPercent: normalizePercentInput(event.target.value),
            })
          }
          placeholder="0.00"
          value={increaseSelected ? value.increaseByPercent : ""}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-text-muted">
          %
        </span>
      </div>
    </div>
  );
}

function StopAmountInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const previewValue = formatDecimal(value || "0");

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="grid h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-control px-3 text-sm font-bold text-text shadow-inset-hi">
        <div className="flex min-w-0 items-center gap-2">
          <MoneyIcon />
          <Input
            aria-label={label}
            className="h-9 min-w-0 border-0 bg-transparent px-0 text-left font-black shadow-none placeholder:text-text-placeholder focus-visible:shadow-none"
            inputMode="decimal"
            onChange={(event) =>
              onChange(normalizeMoneyInput(event.target.value))
            }
            placeholder="0.00"
            value={value}
          />
        </div>
        <span className="shrink-0 text-right font-black text-text">
          ${previewValue}
        </span>
      </div>
    </div>
  );
}

function AutoConfigureModal({
  config,
  disabled,
  onApply,
  onResetAll,
  onOpenChange,
  open,
}: {
  config: DiceAutoConfig;
  disabled?: boolean;
  onApply: (config: DiceAutoConfig) => void;
  onOpenChange: (open: boolean) => void;
  onResetAll: () => void;
  open: boolean;
}) {
  const [draft, setDraft] = React.useState<DiceAutoConfig>(config);

  function applyDraft() {
    onApply({
      onWin: {
        ...draft.onWin,
        increaseByPercent: draft.onWin.increaseByPercent,
      },
      onLoss: {
        ...draft.onLoss,
        increaseByPercent: draft.onLoss.increaseByPercent,
      },
      stopOnProfit: draft.stopOnProfit,
      stopOnLoss: draft.stopOnLoss,
    });
  }

  function resetAll() {
    const defaults = autoConfigDefaults();
    setDraft(defaults);
    onResetAll();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !disabled && onOpenChange(nextOpen)}
    >
      <DialogContent className="max-h-[calc(100svh-2rem)] max-w-[min(92vw,28rem)] overflow-y-auto rounded-md bg-bg p-6">
        <DialogClose
          aria-label="Close Configure Auto-Bet"
          className="absolute right-5 top-5 text-2xl leading-none text-text transition-colors hover:text-text-muted"
          disabled={disabled}
          type="button"
        >
          X
        </DialogClose>
        <DialogTitle className="text-center text-xl font-black">
          Configure Auto-Bet
        </DialogTitle>

        <div className="mt-7 space-y-5">
          <div className="space-y-2">
            <FieldLabel>On Win</FieldLabel>
            <StrategyToggle
              onChange={(onWin) => setDraft((current) => ({ ...current, onWin }))}
              value={draft.onWin}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>On Loss</FieldLabel>
            <StrategyToggle
              onChange={(onLoss) =>
                setDraft((current) => ({ ...current, onLoss }))
              }
              value={draft.onLoss}
            />
          </div>

          <StopAmountInput
            label="Stop on Profit"
            onChange={(stopOnProfit) =>
              setDraft((current) => ({ ...current, stopOnProfit }))
            }
            value={draft.stopOnProfit}
          />

          <StopAmountInput
            label="Stop on Loss"
            onChange={(stopOnLoss) =>
              setDraft((current) => ({ ...current, stopOnLoss }))
            }
            value={draft.stopOnLoss}
          />

          <Button
            className="h-11 w-full font-black"
            disabled={disabled}
            onClick={applyDraft}
            type="button"
          >
            Apply
          </Button>
          <Button
            className="h-10 w-full font-black"
            disabled={disabled}
            onClick={resetAll}
            type="button"
            variant="secondary"
          >
            Reset all
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultMarker({
  didWin,
  randomValue,
}: {
  didWin: boolean;
  randomValue: number;
}) {
  const percent = toTrackPercent(randomValue);
  const left = `${percent}%`;

  return (
    <motion.div
      animate={{ left, opacity: 1, scale: 1 }}
      className="absolute bottom-2 z-10 h-0 w-0"
      initial={false}
      transition={{ duration: 0.26, ease: "easeOut" }}
    >
      <div
        className={cn(
          "absolute bottom-0 left-0 rounded-sm border px-3 py-2 text-sm font-black text-text shadow-overlay",
          markerBubbleTranslateClass(percent),
          didWin
            ? "border-primary/50 bg-primary/20"
            : "border-danger/50 bg-danger/20",
        )}
      >
        {formatDecimal(randomValue)}
      </div>
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-0 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent",
          didWin ? "border-t-primary/50" : "border-t-danger/50",
        )}
      />
    </motion.div>
  );
}

function DiceSlider({
  didWin,
  onChange,
  randomValue,
  threshold,
}: {
  didWin?: boolean;
  onChange: (value: number) => void;
  randomValue?: number;
  threshold: number;
}) {
  const thresholdPercent = toTrackPercent(threshold);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border-2 bg-surface-2 px-5 py-8 pt-12 shadow-inset-hi">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 bottom-full h-12">
            {typeof randomValue === "number" && typeof didWin === "boolean" ? (
              <ResultMarker didWin={didWin} randomValue={randomValue} />
            ) : null}
          </div>

          <SliderRoot
            aria-label="Dice rollover"
            className="relative"
            max={DICE_MAX_THRESHOLD}
            min={DICE_MIN_THRESHOLD}
            onValueChange={([value]) => {
              if (typeof value === "number") {
                onChange(value);
              }
            }}
            step={DICE_THRESHOLD_STEP}
            value={[threshold]}
          >
            <SliderTrack className="h-3 bg-primary">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 bg-danger"
                style={{
                  width: `${thresholdPercent}%`,
                }}
              />
            </SliderTrack>
            <SliderThumb className="flex h-9 w-9 items-center justify-center rounded-md border-border-2 bg-[#3b4654] shadow-overlay transition-colors hover:border-primary focus-visible:border-primary focus-visible:shadow-glow">
              <span
                aria-hidden="true"
                className="flex h-4 items-center justify-center gap-1"
              >
                <span className="h-4 w-[3px] rounded-pill bg-bg/55" />
                <span className="h-4 w-[3px] rounded-pill bg-bg/55" />
                <span className="h-4 w-[3px] rounded-pill bg-bg/55" />
              </span>
            </SliderThumb>
          </SliderRoot>
        </div>
      </div>
      <div className="px-5">
        <div className="relative h-5 text-xs font-black text-text-muted">
          {diceSliderTicks.map((tick, index) => {
            const tickPercent = toTrackPercent(tick);

            return (
              <span
                className={cn(
                  "absolute top-0 whitespace-nowrap",
                  index === 0 && "translate-x-0 text-left",
                  index > 0 &&
                    index < diceSliderTicks.length - 1 &&
                    "-translate-x-1/2 text-center",
                  index === diceSliderTicks.length - 1 &&
                    "-translate-x-full text-right",
                )}
                key={tick}
                style={{ left: `${tickPercent}%` }}
              >
                {tick}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RecentResults({
  results,
}: {
  results: Array<{ id: string; didWin: boolean; randomValue: number }>;
}) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="absolute right-4 top-4 z-10 flex min-h-9 max-w-[calc(100%-2rem)] flex-nowrap justify-end gap-2 overflow-visible md:right-8 md:top-7">
      <AnimatePresence initial={false} mode="popLayout">
        {results.map((result) => (
          <motion.span
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className={cn(
              "rounded-sm px-3 py-2 text-sm font-black text-text shadow-inset-hi",
              result.didWin ? "bg-primary" : "bg-surface-3",
            )}
            exit={{ opacity: 0, scale: 0.92, x: -18 }}
            initial={{ opacity: 0, scale: 0.95, x: 10 }}
            key={result.id}
            layout
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            {formatDecimal(result.randomValue)}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function DiceGame() {
  const authSession = useAuthSession();
  const configQuery = useDiceConfigQuery();
  const betMutation = useManualDiceBetMutation();
  const dice = useManualDice(configQuery.data);
  const [activeMode, setActiveMode] = React.useState<DiceMode>("manual");
  const [autoBetCountDraft, setAutoBetCountDraft] = React.useState(
    DEFAULT_AUTO_BET_COUNT,
  );
  const [autoConfig, setAutoConfig] = React.useState<DiceAutoConfig>(() =>
    autoConfigDefaults(),
  );
  const [configureOpen, setConfigureOpen] = React.useState(false);
  const [autoSessionMessage, setAutoSessionMessage] = React.useState<
    string | null
  >(null);
  const authenticated = authSession.data?.authenticated === true;
  const autoRunner = useAutoBetRunner<DiceBetResult>({
    delayMs: AUTO_BET_DELAY_MS,
    initialBetAmount: dice.betAmount || "0",
    initialRemainingBets: Number(DEFAULT_AUTO_BET_COUNT),
    normalizeBetAmount: normalizeAutoBetAmount,
    onError: () => {
      setAutoSessionMessage("Auto-bet stopped because the request failed.");
    },
    onLoss: toAutoSizingStrategy(autoConfig.onLoss),
    onRoundComplete: (result) => {
      dice.applyResult(result);
      setAutoBetCountDraft((current) =>
        String(Math.max(Number(current || "0") - 1, 0)),
      );
      setAutoSessionMessage(null);
    },
    onWin: toAutoSizingStrategy(autoConfig.onWin),
    placeBet: (currentBetAmount) => {
      if (!authenticated) {
        throw new Error("Auto-bet stopped because your session ended.");
      }

      const request = {
        above: dice.above,
        betSize: normalizeBetAmountForRequest(currentBetAmount),
        threshold: dice.threshold,
      };

      return betMutation.mutateAsync(request);
    },
    stopOnLoss: autoConfig.stopOnLoss,
    stopOnProfit: autoConfig.stopOnProfit,
  });
  const autoRunning = autoRunner.isRunning;
  const betDisabled =
    activeMode !== "manual" ||
    !authenticated ||
    !dice.canBet ||
    autoRunning ||
    betMutation.isPending ||
    configQuery.isError;
  const parsedAutoBetAmount = Number(dice.betAmount || "0");
  const autoStartGuardReasons = [
    !authenticated ? "user is not authenticated" : null,
    !dice.canBet ? "bet amount is not greater than 0" : null,
    !Number.isFinite(parsedAutoBetAmount)
      ? "bet amount is not finite"
      : null,
    !isPositiveWholeNumber(autoBetCountDraft)
      ? "number of bets is not a positive finite integer"
      : null,
    autoRunning ? "auto runner is already running" : null,
    betMutation.isPending ? "dice bet mutation is pending" : null,
    configQuery.isError ? "dice config query is in error" : null,
  ].filter((reason): reason is string => reason !== null);
  const autoStartDisabled = autoStartGuardReasons.length > 0;

  React.useEffect(() => {
    const normalizedCurrentBetAmount = normalizeAutoBetAmount(
      autoRunner.state.currentBetAmount,
    );

    if (
      autoRunning &&
      dice.betAmount !== normalizedCurrentBetAmount
    ) {
      dice.updateBetAmount(normalizedCurrentBetAmount);
    }
  }, [
    activeMode,
    autoRunner.state.currentBetAmount,
    autoRunning,
    dice,
  ]);

  React.useEffect(() => {
    if (!authenticated && autoRunning) {
      queueMicrotask(() => {
        setAutoSessionMessage("Auto-bet stopped because your session ended.");
      });
      autoRunner.stop();
    }
  }, [authenticated, autoRunning, autoRunner]);

  function updateMode(mode: DiceMode) {
    if (autoRunning) {
      return;
    }

    setActiveMode(mode);
  }

  function updateBetAmount(value: string) {
    dice.updateBetAmount(value);

    if (activeMode === "auto") {
      autoRunner.setCurrentBetAmount(value || "0");
    }
  }

  function normalizeBetAmount() {
    const normalized = normalizeAutoBetAmount(dice.betAmount);
    dice.normalizeCurrentBetAmount();

    if (activeMode === "auto") {
      autoRunner.setCurrentBetAmount(normalized || "0");
    }
  }

  function halfBetAmount() {
    dice.halfBetAmount();
    const nextValue = Number(dice.betAmount || "0") / 2;

    if (activeMode === "auto") {
      autoRunner.setCurrentBetAmount(formatDecimal(nextValue));
    }
  }

  function doubleBetAmount() {
    dice.doubleBetAmount();
    const nextValue = Number(dice.betAmount || "0") * 2;

    if (activeMode === "auto") {
      autoRunner.setCurrentBetAmount(formatDecimal(nextValue));
    }
  }

  function updateAutoBetCount(value: string) {
    const normalized = normalizeWholeNumberInput(value);
    setAutoBetCountDraft(normalized);
    autoRunner.setRemainingBets(normalized ? Number(normalized) : 0);
  }

  function startAutoBet() {
    if (autoStartDisabled) {
      return;
    }

    setAutoSessionMessage(null);
    const normalizedBetAmount = normalizeBetAmountForRequest(dice.betAmount);
    dice.updateBetAmount(normalizedBetAmount);
    autoRunner.setCurrentBetAmount(normalizedBetAmount);

    const startPayload = {
      currentBetAmount: normalizedBetAmount,
      remainingBets: Number(autoBetCountDraft),
    };

    autoRunner.start(startPayload);
  }

  function stopAutoBet() {
    autoRunner.stop();
  }

  function applyAutoConfig(nextConfig: DiceAutoConfig) {
    setAutoConfig(nextConfig);
    setConfigureOpen(false);
  }

  function resetAutoConfig() {
    setAutoConfig(autoConfigDefaults());
  }

  async function handleBet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (betDisabled) {
      return;
    }

    try {
      const normalizedBetAmount = normalizeBetAmountForRequest(dice.betAmount);
      dice.updateBetAmount(normalizedBetAmount);

      const result = await betMutation.mutateAsync({
        above: true,
        betSize: normalizedBetAmount,
        threshold: dice.threshold,
      });
      dice.applyResult(result);
    } catch {
      // The mutation state renders the safe error message below.
    }
  }

  return (
    <form
      className="grid min-h-[520px] gap-0 bg-surface-2 md:grid-cols-[22rem_minmax(0,1fr)]"
      onSubmit={handleBet}
    >
      <div className="order-2 flex flex-col gap-5 border-t border-border bg-surface px-4 py-5 md:order-1 md:border-r md:border-t-0 md:px-6">
        <div
          className={cn(
            "grid grid-cols-2 rounded-md bg-bg p-1",
            activeMode === "auto" && "order-3 md:order-none",
          )}
        >
          <button
            className={cn(
              "h-11 rounded-sm text-sm font-black transition-colors",
              activeMode === "manual"
                ? "bg-surface-3 text-text shadow-inset-hi"
                : "text-text-muted",
            )}
            disabled={autoRunning}
            onClick={() => updateMode("manual")}
            type="button"
          >
            Manual
          </button>
          <button
            className={cn(
              "h-11 rounded-sm text-sm font-black transition-colors",
              activeMode === "auto"
                ? "bg-surface-3 text-text shadow-inset-hi"
                : "text-text-muted",
            )}
            disabled={autoRunning}
            onClick={() => updateMode("auto")}
            type="button"
          >
            Auto
          </button>
        </div>

        {activeMode === "manual" ? (
          <>
            <BetAmountControl
              onChange={updateBetAmount}
              onBlur={normalizeBetAmount}
              onDouble={doubleBetAmount}
              onHalf={halfBetAmount}
              value={dice.betAmount}
            />

            <div className="space-y-2">
              <FieldLabel>Profit on Win</FieldLabel>
              <div className="flex h-11 items-center rounded-md border border-border bg-control px-3 text-sm font-bold text-text shadow-inset-hi">
                <CoinValue value={formatDecimal(dice.profitOnWin)} />
              </div>
            </div>

            <Button
              className="h-12 w-full text-base font-black"
              disabled={betDisabled}
              type="submit"
              variant={authenticated ? "primary" : "secondary"}
            >
              {betMutation.isPending ? "Betting..." : "Bet"}
            </Button>
          </>
        ) : (
          <>
            <div className="order-1 flex flex-col gap-3 md:order-3">
              <Button
                className="h-12 w-full text-base font-black"
                disabled={autoRunning}
                onClick={() => setConfigureOpen(true)}
                type="button"
                variant="secondary"
              >
                Configure
              </Button>
              {autoRunning ? (
                <Button
                  className="h-12 w-full bg-danger text-base font-black text-text hover:bg-danger/90"
                  onClick={stopAutoBet}
                  type="button"
                >
                  Stop Auto-Bet
                </Button>
              ) : (
                <Button
                  className="h-12 w-full text-base font-black"
                  disabled={autoStartDisabled}
                  onClick={startAutoBet}
                  type="button"
                  variant={authenticated ? "primary" : "secondary"}
                >
                  Start Auto-Bet
                </Button>
              )}
            </div>

            <div className="order-2 space-y-5 md:order-2">
              <BetAmountControl
                disabled={autoRunning}
                onChange={updateBetAmount}
                onBlur={normalizeBetAmount}
                onDouble={doubleBetAmount}
                onHalf={halfBetAmount}
                value={dice.betAmount}
              />

              <div className="space-y-2">
                <FieldLabel>Number of Bets</FieldLabel>
                <div className="flex rounded-md border border-border bg-control shadow-inset-hi">
                  <Input
                    aria-label="Number of bets"
                    className="h-10 border-0 bg-transparent shadow-none placeholder:text-text-placeholder focus-visible:shadow-none"
                    disabled={autoRunning}
                    inputMode="numeric"
                    onChange={(event) => updateAutoBetCount(event.target.value)}
                    placeholder="Enter number of bets"
                    value={autoBetCountDraft}
                  />
                  <button
                    aria-label="Infinite auto-bet is not available in this MVP"
                    className="my-2 flex items-center border-l border-border px-3 disabled:opacity-60"
                    disabled
                    type="button"
                  >
                    <Image
                      alt=""
                      aria-hidden="true"
                      className="opacity-80"
                      height={16}
                      src="/images/infinity.svg"
                      width={16}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <AutoSummaryCard
                  label="On Win"
                  value={autoSummary(autoConfig.onWin)}
                />
                <AutoSummaryCard
                  label="On Loss"
                  value={autoSummary(autoConfig.onLoss)}
                />
                <AutoSummaryCard
                  label="Stop on Profit"
                  value={<MoneyBadge value={formatDecimal(autoConfig.stopOnProfit)} />}
                />
                <AutoSummaryCard
                  label="Stop on Loss"
                  value={<MoneyBadge value={formatDecimal(autoConfig.stopOnLoss)} />}
                />
              </div>
            </div>
          </>
        )}

        {!authenticated ? (
          <p className="text-xs font-semibold text-text-subtle">
            Log in to place a bet.
          </p>
        ) : null}

        {configQuery.isError ? (
          <p className="text-xs font-semibold text-danger" role="alert">
            Dice configuration is unavailable.
          </p>
        ) : null}

        {betMutation.isError && activeMode === "manual" ? (
          <p className="text-xs font-semibold text-danger" role="alert">
            {betMutation.error instanceof Error
              ? betMutation.error.message
              : "Dice bet failed."}
          </p>
        ) : null}

        {activeMode === "auto" &&
        (autoRunner.state.errorMessage || autoSessionMessage) ? (
          <p className="text-xs font-semibold text-danger" role="alert">
            {autoRunner.state.errorMessage ?? autoSessionMessage}
          </p>
        ) : null}
      </div>

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
        <RecentResults results={dice.recentResults} />

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

      {configureOpen ? (
        <AutoConfigureModal
          config={autoConfig}
          disabled={autoRunning}
          onApply={applyAutoConfig}
          onOpenChange={setConfigureOpen}
          onResetAll={resetAutoConfig}
          open={configureOpen}
        />
      ) : null}
    </form>
  );
}
