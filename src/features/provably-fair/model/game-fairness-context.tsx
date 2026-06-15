"use client";

import * as React from "react";
import type { GameFairnessResultSnapshot } from "../types/fairness-types";

interface GameFairnessContextValue {
  clearSnapshot: () => void;
  setSnapshot: (snapshot: GameFairnessResultSnapshot) => void;
  snapshot: GameFairnessResultSnapshot;
}

const GameFairnessContext =
  React.createContext<GameFairnessContextValue | null>(null);

interface GameFairnessProviderProps {
  children: React.ReactNode;
}

export function GameFairnessProvider({
  children,
}: GameFairnessProviderProps) {
  const [snapshot, setSnapshotState] =
    React.useState<GameFairnessResultSnapshot>(null);

  const setSnapshot = React.useCallback(
    (nextSnapshot: GameFairnessResultSnapshot) => {
      setSnapshotState(nextSnapshot);
    },
    [],
  );
  const clearSnapshot = React.useCallback(() => {
    setSnapshotState(null);
  }, []);
  const value = React.useMemo(
    () => ({
      clearSnapshot,
      setSnapshot,
      snapshot,
    }),
    [clearSnapshot, setSnapshot, snapshot],
  );

  return (
    <GameFairnessContext.Provider value={value}>
      {children}
    </GameFairnessContext.Provider>
  );
}

export function useGameFairnessSnapshot() {
  const context = React.useContext(GameFairnessContext);

  if (!context) {
    throw new Error(
      "useGameFairnessSnapshot must be used within GameFairnessProvider.",
    );
  }

  return context;
}
