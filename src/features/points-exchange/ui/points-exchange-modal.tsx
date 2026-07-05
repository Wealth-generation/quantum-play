"use client";

import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Input } from "@/shared/ui/primitives/input";
import { usePointsExchangeMutation } from "../model/points-exchange-query";

interface PointsExchangeModalProps {
  gamePoints: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  watchPoints: string;
}

interface PointsExchangeFormValues {
  amount: string;
}

interface ParsedDecimal {
  scale: number;
  units: bigint;
}

const DEFAULT_FORM_VALUES: PointsExchangeFormValues = {
  amount: "1",
};

const INTEGER_PATTERN = /^[1-9]\d*$/;
const DECIMAL_PATTERN = /^\d+(?:\.\d+)?$/;

function parsePositiveIntegerDraft(value: string): number | null {
  const trimmed = value.trim();

  if (!INTEGER_PATTERN.test(trimmed)) {
    return null;
  }

  const amount = Number(trimmed);

  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

function parseDecimal(value: string): ParsedDecimal | null {
  const trimmed = value.trim();

  if (!DECIMAL_PATTERN.test(trimmed)) {
    return null;
  }

  const [integerPart, fractionPart = ""] = trimmed.split(".");
  const digits = `${integerPart}${fractionPart}`.replace(/^0+/, "") || "0";

  return {
    scale: fractionPart.length,
    units: BigInt(digits),
  };
}

function hasEnoughWatchPoints(amount: number, watchPoints: string) {
  const parsedBalance = parseDecimal(watchPoints);

  if (!parsedBalance) {
    return false;
  }

  const scaledAmount =
    BigInt(amount) * BigInt(10) ** BigInt(parsedBalance.scale);

  return scaledAmount <= parsedBalance.units;
}

function formatReceivedAmount(amount: number | null) {
  return amount === null ? "0.00" : `${amount}.00`;
}

function mutationErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Exchange failed. Please try again.";
}

function RateCard({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="flex h-12 items-center justify-center gap-2 rounded-md bg-surface-3 px-4 text-sm font-bold text-text shadow-inset-hi sm:h-14">
      <Image alt="" className="h-6 w-6" height={24} src={icon} width={24} />
      <span>{label}</span>
    </div>
  );
}

function BalanceChip({
  icon,
  value,
}: {
  icon: string;
  value: string;
}) {
  return (
    <span className="hidden h-8 items-center gap-1 rounded-md border border-border bg-bg/40 px-2 text-xs font-bold text-text-muted sm:inline-flex">
      <span>Balance</span>
      <Image alt="" className="h-4 w-4" height={16} src={icon} width={16} />
      <span className="text-text">{value}</span>
    </span>
  );
}

export function PointsExchangeModal({
  gamePoints,
  onOpenChange,
  open,
  watchPoints,
}: PointsExchangeModalProps) {
  const exchangeMutation = usePointsExchangeMutation();
  const form = useForm<PointsExchangeFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const amountDraft =
    useWatch({ control: form.control, name: "amount" }) ?? "";
  const parsedAmount = parsePositiveIntegerDraft(amountDraft);
  const insufficientBalance =
    parsedAmount !== null && !hasEnoughWatchPoints(parsedAmount, watchPoints);
  const validationMessage =
    parsedAmount === null
      ? "Enter a valid amount."
      : insufficientBalance
        ? "Insufficient Watch Points balance."
        : null;
  const alertMessage =
    validationMessage ??
    (exchangeMutation.isError
      ? mutationErrorMessage(exchangeMutation.error)
      : null);
  const confirmDisabled =
    exchangeMutation.isPending || validationMessage !== null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset(DEFAULT_FORM_VALUES);
      exchangeMutation.reset();
    }

    onOpenChange(nextOpen);
  }

  async function handleSubmit(values: PointsExchangeFormValues) {
    const amount = parsePositiveIntegerDraft(values.amount);

    if (amount === null || !hasEnoughWatchPoints(amount, watchPoints)) {
      return;
    }

    try {
      await exchangeMutation.mutateAsync({ amount });
      handleOpenChange(false);
    } catch {
      // Mutation state renders the safe error message.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-5rem)] w-[calc(100vw-2rem)] max-w-[680px] overflow-y-auto rounded-xl bg-surface p-5 sm:p-8">
        <Button
          aria-label="Close points exchange"
          className="absolute right-4 top-4 text-text-muted hover:text-text"
          onClick={() => handleOpenChange(false)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="mx-auto flex max-w-[560px] flex-col">
          <div className="flex justify-center">
            <Image
              alt=""
              className="h-auto w-20 sm:w-24"
              height={96}
              sizes="96px"
              src="/images/two-coins.webp"
              width={118}
            />
          </div>

          <div className="mt-4 text-center">
            <DialogTitle className="text-[clamp(18px,3vw,22px)] font-black">
              Points exchange
            </DialogTitle>
            <DialogDescription className="mx-auto mt-3 max-w-[460px] text-[clamp(13px,2.8vw,15px)] font-semibold leading-6 text-text-muted">
              Convert your Watch Points into Game Points to earn rewards and
              enhance your gameplay.
            </DialogDescription>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <RateCard icon="/images/watch-point.svg" label="1 Watch point" />
            <span className="flex h-5 items-center justify-center text-lg font-black text-text">
              =
            </span>
            <RateCard icon="/images/game-point.svg" label="1 Game point" />
          </div>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-text-muted"
                htmlFor="points-exchange-amount"
              >
                You give
              </label>
              <div className="relative">
                <Image
                  alt=""
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
                  height={20}
                  src="/images/watch-point.svg"
                  width={20}
                />
                <Input
                  id="points-exchange-amount"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="h-12 bg-surface-3 pl-10 pr-3 font-bold sm:pr-32"
                  aria-invalid={validationMessage ? "true" : undefined}
                  {...form.register("amount")}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  <BalanceChip icon="/images/watch-point.svg" value={watchPoints} />
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-text-muted"
                htmlFor="points-exchange-receive"
              >
                You will receive
              </label>
              <div className="relative">
                <Image
                  alt=""
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
                  height={20}
                  src="/images/game-point.svg"
                  width={20}
                />
                <Input
                  id="points-exchange-receive"
                  readOnly
                  tabIndex={-1}
                  value={formatReceivedAmount(parsedAmount)}
                  className="h-12 bg-surface-3 pl-10 pr-3 font-bold sm:pr-32"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  <BalanceChip icon="/images/game-point.svg" value={gamePoints} />
                </span>
              </div>
            </div>

            {alertMessage ? (
              <p className="text-sm font-bold text-danger" role="alert">
                {alertMessage}
              </p>
            ) : null}

            <Button
              className="mt-2 h-13 w-full text-base font-black disabled:bg-surface-3 disabled:shadow-none"
              disabled={confirmDisabled}
              type="submit"
              variant="primary"
            >
              {exchangeMutation.isPending ? "Confirming..." : "Confirm"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
