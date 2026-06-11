"use client";

import * as React from "react";

export const MAX_BET_NORMAL_LIMIT = 100000;
export const MAX_BET_MODE_LIMIT = 500000;

export interface MaxBetContract {
  activeMaxBet: number;
  disable: () => void;
  enable: () => void;
  enabled: boolean;
  maxBetModeMaxBet: number;
  normalMaxBet: number;
  supported: boolean;
}

interface MaxBetProviderProps {
  children: React.ReactNode;
  maxBetModeMaxBet?: number;
  normalMaxBet?: number;
  supported: boolean;
}

interface MaxBetButtonAmountOptions {
  authenticated: boolean;
  balance: string | undefined;
  maxBetModeMaxBet?: number;
}

const MaxBetContext = React.createContext<MaxBetContract | null>(null);

function parseBalance(balance: string | undefined) {
  if (balance === undefined) {
    return null;
  }

  const parsed = Number(balance);

  return Number.isFinite(parsed) ? Math.max(parsed, 0) : null;
}

export function getMaxBetButtonAmount({
  authenticated,
  balance,
  maxBetModeMaxBet = MAX_BET_MODE_LIMIT,
}: MaxBetButtonAmountOptions) {
  const parsedBalance = authenticated ? parseBalance(balance) : null;

  if (parsedBalance === null || parsedBalance <= 0) {
    return 0;
  }

  return Math.min(parsedBalance, maxBetModeMaxBet);
}

export function MaxBetProvider({
  children,
  maxBetModeMaxBet = MAX_BET_MODE_LIMIT,
  normalMaxBet = MAX_BET_NORMAL_LIMIT,
  supported,
}: MaxBetProviderProps) {
  const [enabled, setEnabled] = React.useState(false);
  const effectiveEnabled = supported && enabled;

  const value = React.useMemo<MaxBetContract>(
    () => ({
      activeMaxBet: effectiveEnabled ? maxBetModeMaxBet : normalMaxBet,
      disable: () => setEnabled(false),
      enable: () => {
        if (supported) {
          setEnabled(true);
        }
      },
      enabled: effectiveEnabled,
      maxBetModeMaxBet,
      normalMaxBet,
      supported,
    }),
    [effectiveEnabled, maxBetModeMaxBet, normalMaxBet, supported],
  );

  return (
    <MaxBetContext.Provider value={value}>{children}</MaxBetContext.Provider>
  );
}

export function useMaxBetContract() {
  const context = React.useContext(MaxBetContext);

  if (context === null) {
    throw new Error("useMaxBetContract must be used within MaxBetProvider");
  }

  return context;
}
