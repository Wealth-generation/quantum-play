import type { ReactNode } from "react";
import type { GameInfo } from "@/entities/game/model";
import { GameExpandedModeProvider } from "@/features/game-expanded-mode";
import { MaxBetProvider } from "@/features/max-bet";
import { getGameActionConfig } from "./game-action-config";
import { GameDetailShell } from "./game-detail-shell";

interface GameDetailProps {
  game: GameInfo;
  children?: ReactNode;
}

export function GameDetail({ children, game }: GameDetailProps) {
  const actionConfig = getGameActionConfig(game);

  return (
    <GameExpandedModeProvider key={game.slug}>
      <MaxBetProvider
        key={game.slug}
        supported={actionConfig.capabilities.maxBetMode}
      >
        <GameDetailShell game={game}>{children}</GameDetailShell>
      </MaxBetProvider>
    </GameExpandedModeProvider>
  );
}
