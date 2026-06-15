"use client";

import * as React from "react";

export interface TurboModeContract {
  disableTurbo: () => void;
  enableTurbo: () => void;
  supported: boolean;
  toggleTurbo: () => void;
  turboEnabled: boolean;
}

interface TurboModeProviderProps {
  children: React.ReactNode;
  supported: boolean;
}

const TurboModeContext = React.createContext<TurboModeContract | null>(null);

export function TurboModeProvider({
  children,
  supported,
}: TurboModeProviderProps) {
  const [enabled, setEnabled] = React.useState(false);
  const turboEnabled = supported && enabled;

  const value = React.useMemo<TurboModeContract>(
    () => ({
      disableTurbo: () => setEnabled(false),
      enableTurbo: () => {
        if (supported) {
          setEnabled(true);
        }
      },
      supported,
      toggleTurbo: () => {
        if (supported) {
          setEnabled((current) => !current);
        }
      },
      turboEnabled,
    }),
    [supported, turboEnabled],
  );

  return (
    <TurboModeContext.Provider value={value}>
      {children}
    </TurboModeContext.Provider>
  );
}

export function useTurboMode() {
  const context = React.useContext(TurboModeContext);

  if (context === null) {
    throw new Error("useTurboMode must be used within TurboModeProvider");
  }

  return context;
}
