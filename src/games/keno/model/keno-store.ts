"use client";

import { create } from "zustand";
import { KENO_HISTORY_CAP } from "../config/keno-defaults";
import {
  autoPick as autoPickHelper,
  clearTiles as clearTilesHelper,
  toggleTile as toggleTileHelper,
} from "../lib/keno-tiles";
import type { KenoBetResult, KenoRiskLevel } from "./keno-types";

interface KenoStoreState {
  selectedTiles: Set<number>;
  selectedRisk: KenoRiskLevel;
  // Accumulates 0-based drawn indices during the staggered reveal animation.
  revealedNumbers: number[];
  isRevealComplete: boolean;
  // Runtime-only round history (not persisted to localStorage).
  history: KenoBetResult[];
  toggleTile: (index: number) => void;
  setRisk: (risk: KenoRiskLevel) => void;
  autoPick: () => void;
  clearTiles: () => void;
  addRevealedNumber: (index: number) => void;
  finaliseReveal: () => void;
  /** Clears isRevealComplete (re-enables tile selection) but keeps revealedNumbers
   *  so hit/drawn tiles remain visible until the next bet calls clearReveal(). */
  resetRevealPhase: () => void;
  clearReveal: () => void;
  addToHistory: (result: KenoBetResult) => void;
  clearHistory: () => void;
}

export const useKenoStore = create<KenoStoreState>((set, get) => ({
  selectedTiles: new Set<number>(),
  selectedRisk: "CLASSIC",
  revealedNumbers: [],
  isRevealComplete: false,
  history: [],

  toggleTile: (index) => {
    set({ selectedTiles: toggleTileHelper(get().selectedTiles, index) });
  },
  setRisk: (risk) => {
    set({ selectedRisk: risk });
  },
  autoPick: () => {
    set({ selectedTiles: new Set(autoPickHelper()) });
  },
  clearTiles: () => {
    set({ selectedTiles: clearTilesHelper() });
  },

  addRevealedNumber: (index) => {
    set((state) => ({
      revealedNumbers: [...state.revealedNumbers, index],
    }));
  },
  finaliseReveal: () => {
    set({ isRevealComplete: true });
  },
  resetRevealPhase: () => {
    set({ isRevealComplete: false });
  },
  clearReveal: () => {
    set({ revealedNumbers: [], isRevealComplete: false });
  },

  addToHistory: (result) => {
    const { history } = get();
    set({ history: [result, ...history].slice(0, KENO_HISTORY_CAP) });
  },
  clearHistory: () => set({ history: [] }),
}));
