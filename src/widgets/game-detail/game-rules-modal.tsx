"use client";

import { BookOpen, X } from "lucide-react";
import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import type { GameRulesContent } from "./game-action-config";

interface GameRulesModalProps {
  gameLabel: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  rules: GameRulesContent;
}

export function GameRulesModal({
  gameLabel,
  onOpenChange,
  open,
  rules,
}: GameRulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[min(92vw,42rem)] overflow-y-auto rounded-md p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <BookOpen className="h-5 w-5 shrink-0 text-text" />
            <div>
              <DialogTitle className="text-xl font-black">
                Game Rules
              </DialogTitle>
              <DialogDescription className="sr-only">
                Rules for {gameLabel}.
              </DialogDescription>
            </div>
          </div>
          <Button
            aria-label="Close game rules"
            onClick={() => onOpenChange(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ol className="space-y-4 text-sm font-semibold leading-6 text-text-muted">
          {rules.items.map((item, index) => (
            <li className="flex gap-2" key={item.text}>
              <span className="shrink-0 text-text">{index + 1}.</span>
              <div className="min-w-0">
                <p>{item.text}</p>
                {item.children ? (
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {item.children.map((child) => (
                      <li key={child}>{child}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
