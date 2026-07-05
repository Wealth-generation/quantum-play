"use client";

import * as React from "react";

export interface GameExpandedModeContract {
  enterExpanded: () => Promise<void>;
  exitExpanded: () => Promise<void>;
  fullscreenPortalContainer: HTMLElement | null;
  isExpanded: boolean;
  isFullscreenActive: boolean;
  registerFullscreenPortalContainer: (node: HTMLElement | null) => void;
  registerFullscreenTarget: (node: HTMLElement | null) => void;
  toggleExpanded: () => Promise<void>;
}

interface GameExpandedModeProviderProps {
  children: React.ReactNode;
}

const GameExpandedModeContext =
  React.createContext<GameExpandedModeContract | null>(null);

export function GameExpandedModeProvider({
  children,
}: GameExpandedModeProviderProps) {
  const fullscreenTargetRef = React.useRef<HTMLElement | null>(null);
  const [fullscreenPortalContainer, setFullscreenPortalContainer] =
    React.useState<HTMLElement | null>(null);
  const [isFullscreenActive, setIsFullscreenActive] = React.useState(false);

  const syncFullscreenState = React.useCallback(() => {
    const target = fullscreenTargetRef.current;

    setIsFullscreenActive(
      target !== null && document.fullscreenElement === target,
    );
  }, []);

  React.useEffect(() => {
    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("fullscreenerror", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener("fullscreenerror", syncFullscreenState);
    };
  }, [syncFullscreenState]);

  const registerFullscreenTarget = React.useCallback(
    (node: HTMLElement | null) => {
      fullscreenTargetRef.current = node;
    },
    [],
  );

  const registerFullscreenPortalContainer = React.useCallback(
    (node: HTMLElement | null) => {
      setFullscreenPortalContainer(node);
    },
    [],
  );

  const enterExpanded = React.useCallback(async () => {
    const target = fullscreenTargetRef.current;

    if (!target || typeof target.requestFullscreen !== "function") {
      syncFullscreenState();
      return;
    }

    try {
      await target.requestFullscreen();
      syncFullscreenState();
    } catch {
      syncFullscreenState();
    }
  }, [syncFullscreenState]);

  const exitExpanded = React.useCallback(async () => {
    const target = fullscreenTargetRef.current;

    if (!target || document.fullscreenElement !== target) {
      syncFullscreenState();
      return;
    }

    if (typeof document.exitFullscreen !== "function") {
      syncFullscreenState();
      return;
    }

    try {
      await document.exitFullscreen();
      syncFullscreenState();
    } catch {
      syncFullscreenState();
    }
  }, [syncFullscreenState]);

  const toggleExpanded = React.useCallback(async () => {
    if (document.fullscreenElement === fullscreenTargetRef.current) {
      await exitExpanded();
      return;
    }

    await enterExpanded();
  }, [enterExpanded, exitExpanded]);

  const value = React.useMemo<GameExpandedModeContract>(
    () => ({
      enterExpanded,
      exitExpanded,
      fullscreenPortalContainer: isFullscreenActive
        ? fullscreenPortalContainer
        : null,
      isExpanded: isFullscreenActive,
      isFullscreenActive,
      registerFullscreenPortalContainer,
      registerFullscreenTarget,
      toggleExpanded,
    }),
    [
      enterExpanded,
      exitExpanded,
      fullscreenPortalContainer,
      isFullscreenActive,
      registerFullscreenPortalContainer,
      registerFullscreenTarget,
      toggleExpanded,
    ],
  );

  return (
    <GameExpandedModeContext.Provider value={value}>
      {children}
    </GameExpandedModeContext.Provider>
  );
}

export function useGameExpandedMode() {
  const context = React.useContext(GameExpandedModeContext);

  if (context === null) {
    throw new Error(
      "useGameExpandedMode must be used within GameExpandedModeProvider",
    );
  }

  return context;
}
