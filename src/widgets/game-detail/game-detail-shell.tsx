"use client";

import type { ReactNode } from "react";
import type { GameInfo } from "@/entities/game/model";
import { useGameExpandedMode } from "@/features/game-expanded-mode";
import { GameFairnessProvider } from "@/features/provably-fair";
import { TurboModeProvider } from "@/features/turbo-mode";
import { cn } from "@/shared/lib";
import { BetLive } from "@/widgets/bet-live";
import { GameActions } from "./game-actions";

interface GameDetailShellProps {
  children?: ReactNode;
  game: GameInfo;
  turboSupported: boolean;
}

export function GameDetailShell({
  children,
  game,
  turboSupported,
}: GameDetailShellProps) {
  const {
    fullscreenPortalContainer,
    isExpanded,
    registerFullscreenPortalContainer,
    registerFullscreenTarget,
  } = useGameExpandedMode();

  return (
    <TurboModeProvider key={game.slug} supported={turboSupported}>
      <GameFairnessProvider key={game.slug}>
        <div className="bg-bg">
          <section
            className={cn(
              "mx-auto flex w-full flex-col",
              isExpanded
                ? "max-w-none px-0 py-0"
                : "max-w-6xl px-4 py-8 md:px-6 md:py-12",
            )}
          >
            <div
              ref={registerFullscreenTarget}
              className={cn(
                "relative mx-auto flex w-full flex-col bg-bg",
                isExpanded
                  ? "h-screen max-w-none overflow-hidden p-2 md:p-4"
                  : "max-w-6xl",
              )}
            >
              <div
                className={cn(
                  "overflow-hidden border border-border bg-surface-2 shadow-inset-hi",
                  isExpanded
                    ? "min-h-0 flex-1 rounded-none md:rounded-md"
                    : "rounded-md",
                )}
              >
                {children ?? (
                  <div
                    className={cn(
                      "flex min-h-[360px] flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent_58%)] px-6 text-center",
                      isExpanded && "h-full min-h-0",
                    )}
                  >
                    <p className="text-sm font-bold uppercase tracking-widest text-primary">
                      {game.label}
                    </p>
                    <h1 className="text-4xl font-black text-text md:text-5xl">
                      Game coming soon
                    </h1>
                    <p className="max-w-md text-sm font-medium text-text-muted">
                      A playable {game.label} experience will arrive in a later
                      approved game implementation task.
                    </p>
                  </div>
                )}
              </div>

              <GameActions
                game={game}
                portalContainer={fullscreenPortalContainer}
              />

              <div ref={registerFullscreenPortalContainer} />
            </div>

            {isExpanded ? null : (
              <BetLive
                className="mt-6"
                gameSlug={game.slug}
                variant="game"
              />
            )}
          </section>
        </div>
      </GameFairnessProvider>
    </TurboModeProvider>
  );
}
