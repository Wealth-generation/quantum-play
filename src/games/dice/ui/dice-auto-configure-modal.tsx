"use client";

import * as React from "react";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import {
  autoConfigDefaults,
  type DiceAutoConfig,
} from "../model/use-dice-auto-bet";
import { FieldLabel } from "./dice-ui-atoms";
import { DiceStopLimitControl } from "./dice-stop-limit-control";
import { DiceStrategyControl } from "./dice-strategy-control";

interface DiceAutoConfigureModalProps {
  config: DiceAutoConfig;
  disabled?: boolean;
  onApply: (config: DiceAutoConfig) => void;
  onOpenChange: (open: boolean) => void;
  onResetAll: () => void;
  open: boolean;
}

export function DiceAutoConfigureModal({
  config,
  disabled,
  onApply,
  onOpenChange,
  onResetAll,
  open,
}: DiceAutoConfigureModalProps) {
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
            <DiceStrategyControl
              onChange={(onWin) => setDraft((current) => ({ ...current, onWin }))}
              value={draft.onWin}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>On Loss</FieldLabel>
            <DiceStrategyControl
              onChange={(onLoss) =>
                setDraft((current) => ({ ...current, onLoss }))
              }
              value={draft.onLoss}
            />
          </div>

          <DiceStopLimitControl
            label="Stop on Profit"
            onChange={(stopOnProfit) =>
              setDraft((current) => ({ ...current, stopOnProfit }))
            }
            value={draft.stopOnProfit}
          />

          <DiceStopLimitControl
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
