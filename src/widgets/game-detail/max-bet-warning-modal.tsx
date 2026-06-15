"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import type { MaxBetWarningContent } from "./game-action-config";

interface MaxBetWarningModalProps {
  content: MaxBetWarningContent;
  onEnable: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  portalContainer?: HTMLElement | null;
}

export function MaxBetWarningModal({
  content,
  onEnable,
  onOpenChange,
  open,
  portalContainer,
}: MaxBetWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(92vw,26rem)] rounded-md p-5 text-center sm:p-8"
        portalContainer={portalContainer}
      >
        <div className="mb-5 flex justify-end">
          <Button
            aria-label="Close Max Bet warning"
            onClick={() => onOpenChange(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <AlertTriangle className="mx-auto mb-5 h-14 w-14 text-danger" />
        <DialogTitle className="text-xl font-black">{content.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Max Bet warning.
        </DialogDescription>

        <p className="mt-5 text-sm font-semibold leading-6 text-text-muted">
          {content.body}
        </p>

        <Button
          className="mt-6 h-11 w-full text-sm font-black"
          onClick={onEnable}
          type="button"
          variant="primary"
        >
          {content.enableLabel}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
