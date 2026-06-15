"use client";

import * as React from "react";
import {
  BookOpen,
  Expand,
  Minimize2,
  Settings,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import type { GameInfo } from "@/entities/game/model";
import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { useMaxBetContract } from "@/features/max-bet";
import { useGameFairnessSnapshot } from "@/features/provably-fair";
import { useTurboMode } from "@/features/turbo-mode";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/primitives/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/primitives/popover";
import { ProvablyFairModal } from "@/widgets/provably-fair-modal";
import { getGameActionConfig } from "./game-action-config";
import { GameRulesModal } from "./game-rules-modal";
import { MaxBetWarningModal } from "./max-bet-warning-modal";

function VisualSwitch({ active = false, label }: { active?: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-5 w-9 rounded-pill transition-colors",
          active ? "bg-primary" : "bg-border-2",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-3 w-3 rounded-pill bg-text transition-transform",
            active ? "translate-x-5" : "translate-x-1",
          )}
        />
      </span>
    </div>
  );
}

function InteractiveSwitch({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className="w-full text-left"
      onClick={onClick}
      type="button"
    >
      <VisualSwitch active={active} label={label} />
    </button>
  );
}

interface GameActionsProps {
  game: GameInfo;
  portalContainer?: HTMLElement | null;
}

export function GameActions({ game, portalContainer }: GameActionsProps) {
  const [fairnessOpen, setFairnessOpen] = React.useState(false);
  const [maxBetWarningOpen, setMaxBetWarningOpen] = React.useState(false);
  const [rulesOpen, setRulesOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const expandedMode = useGameExpandedMode();
  const maxBet = useMaxBetContract();
  const turbo = useTurboMode();
  const fairness = useGameFairnessSnapshot();
  const actionConfig = getGameActionConfig(game);
  const { capabilities } = actionConfig;
  const hasSettings =
    capabilities.gameRules ||
    capabilities.turboMode ||
    capabilities.maxBetMode ||
    capabilities.volumeControl;

  function handleMaxBetClick() {
    if (maxBet.enabled) {
      maxBet.disable();
      return;
    }

    if (actionConfig.maxBetWarning) {
      setMaxBetWarningOpen(true);
      setSettingsOpen(false);
    }
  }

  function enableMaxBet() {
    maxBet.enable();
    setMaxBetWarningOpen(false);
  }

  function toggleExpandedMode() {
    setSettingsOpen(false);
    void expandedMode.toggleExpanded();
  }

  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-3 py-3 shadow-inset-hi">
        <div className="flex items-center gap-2">
          {hasSettings ? (
            <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
              <PopoverTrigger asChild>
                <Button
                  aria-label="Open game settings"
                  size="icon"
                  variant="secondary"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="z-[80] w-[min(17rem,calc(100vw-2rem))] p-4"
                collisionPadding={12}
                portalContainer={portalContainer}
                side="top"
                sideOffset={10}
              >
                <div className="flex flex-col gap-4">
                  {capabilities.gameRules ? (
                    <Button
                      className="w-full"
                      onClick={() => {
                        setRulesOpen(true);
                        setSettingsOpen(false);
                      }}
                      size="sm"
                      type="button"
                      variant="primary"
                    >
                      <BookOpen className="h-4 w-4" />
                      Game Rules
                    </Button>
                  ) : null}
                  {capabilities.turboMode ? (
                    <InteractiveSwitch
                      active={turbo.turboEnabled}
                      label="Turbo Mode"
                      onClick={turbo.toggleTurbo}
                    />
                  ) : null}
                  {capabilities.maxBetMode ? (
                    actionConfig.maxBetWarning ? (
                      <InteractiveSwitch
                        active={maxBet.enabled}
                        label="Max Bet"
                        onClick={handleMaxBetClick}
                      />
                    ) : (
                      <VisualSwitch label="Max Bet" />
                    )
                  ) : null}
                  {capabilities.volumeControl ? (
                    <div className="flex items-center gap-3">
                      <Volume2 className="h-4 w-4 text-text-muted" />
                      <input
                        aria-label="Volume"
                        className="h-1 flex-1 accent-primary"
                        defaultValue="78"
                        max="100"
                        min="0"
                        type="range"
                      />
                    </div>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
          ) : null}

          <Button
            aria-label={
              expandedMode.isExpanded
                ? "Exit fullscreen game mode"
                : "Enter fullscreen game mode"
            }
            aria-pressed={expandedMode.isExpanded}
            onClick={toggleExpandedMode}
            size="icon"
            type="button"
            variant="secondary"
          >
            {expandedMode.isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Expand className="h-4 w-4" />
            )}
          </Button>
        </div>

        {capabilities.provablyFair ? (
          <Button
            className="h-auto gap-2 px-0 text-sm font-semibold text-primary hover:bg-transparent hover:text-primary-hover"
            onClick={() => setFairnessOpen(true)}
            size="sm"
            type="button"
            variant="ghost"
          >
            <span>Provably Fair</span>
            <ShieldCheck className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {capabilities.gameRules ? (
        <GameRulesModal
          gameLabel={game.label}
          open={rulesOpen}
          portalContainer={portalContainer}
          rules={actionConfig.rules}
          onOpenChange={setRulesOpen}
        />
      ) : null}

      {actionConfig.maxBetWarning ? (
        <MaxBetWarningModal
          content={actionConfig.maxBetWarning}
          open={maxBetWarningOpen}
          portalContainer={portalContainer}
          onEnable={enableMaxBet}
          onOpenChange={setMaxBetWarningOpen}
        />
      ) : null}

      {capabilities.provablyFair ? (
        <ProvablyFairModal
          gameLabel={game.label}
          gameSlug={game.slug}
          open={fairnessOpen}
          plinkoResult={
            fairness.snapshot?.game === "plinko"
              ? fairness.snapshot.result
              : null
          }
          portalContainer={portalContainer}
          onOpenChange={setFairnessOpen}
        />
      ) : null}
    </>
  );
}
