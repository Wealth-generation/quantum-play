"use client";

import { create } from "zustand";
import {
  ROULETTE_DEFAULT_CHIP,
  type RouletteBetColor,
} from "../config/roulette-defaults";
import {
  EMPTY_PLACEMENTS,
  isStraightNumber,
  type RoulettePlacements,
} from "../lib/roulette-bets";
import { addMoney } from "../lib/roulette-decimal";
import {
  clearPlacements,
  loadPlacements,
  savePlacements,
} from "../lib/roulette-storage";
import type {
  ColumnBetKey,
  DozenBetKey,
  HalfBetKey,
  ParityBetKey,
  RouletteBetResult,
} from "./roulette-types";

const HISTORY_CAP = 5;

interface RouletteStoreState {
  placements: RoulettePlacements;
  selectedChip: number;
  hydrated: boolean;
  // Runtime-only spin history (not persisted to localStorage).
  history: RouletteBetResult[];
  hydrate: () => void;
  setSelectedChip: (chip: number) => void;
  placeStraight: (value: number) => void;
  placeColor: (color: RouletteBetColor) => void;
  placeDozen: (dozen: DozenBetKey) => void;
  placeColumn: (column: ColumnBetKey) => void;
  placeParity: (parity: ParityBetKey) => void;
  placeHalf: (half: HalfBetKey) => void;
  clearBets: () => void;
  addToHistory: (result: RouletteBetResult) => void;
  clearHistory: () => void;
}

// Runtime source of truth for chip placement. Initial state is EMPTY on both
// server and first client render (no SSR hydration mismatch); the localStorage
// layer is loaded after mount via `hydrate()` and written through on changes.
export const useRouletteStore = create<RouletteStoreState>((set, get) => ({
  placements: EMPTY_PLACEMENTS,
  selectedChip: ROULETTE_DEFAULT_CHIP,
  hydrated: false,
  history: [],
  hydrate: () => {
    if (get().hydrated) {
      return;
    }

    set({ placements: loadPlacements(), hydrated: true });
  },
  setSelectedChip: (chip) => {
    set({ selectedChip: chip });
  },
  placeStraight: (value) => {
    if (!isStraightNumber(value)) {
      return;
    }

    const { placements, selectedChip } = get();
    const key = String(value);
    const nextPlacements: RoulettePlacements = {
      ...placements,
      straight: {
        ...placements.straight,
        [key]: addMoney(placements.straight[key] ?? "0", selectedChip),
      },
    };

    savePlacements(nextPlacements);
    set({ placements: nextPlacements });
  },
  placeColor: (color) => {
    const { placements, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      color: {
        ...placements.color,
        [color]: addMoney(placements.color[color] ?? "0", selectedChip),
      },
    };

    savePlacements(nextPlacements);
    set({ placements: nextPlacements });
  },
  placeDozen: (dozen) => {
    const { placements, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      dozen: {
        ...placements.dozen,
        [dozen]: addMoney(placements.dozen[dozen] ?? "0", selectedChip),
      },
    };

    savePlacements(nextPlacements);
    set({ placements: nextPlacements });
  },
  placeColumn: (column) => {
    const { placements, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      column: {
        ...placements.column,
        [column]: addMoney(placements.column[column] ?? "0", selectedChip),
      },
    };

    savePlacements(nextPlacements);
    set({ placements: nextPlacements });
  },
  placeParity: (parity) => {
    const { placements, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      parity: {
        ...placements.parity,
        [parity]: addMoney(placements.parity[parity] ?? "0", selectedChip),
      },
    };

    savePlacements(nextPlacements);
    set({ placements: nextPlacements });
  },
  placeHalf: (half) => {
    const { placements, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      half: {
        ...placements.half,
        [half]: addMoney(placements.half[half] ?? "0", selectedChip),
      },
    };

    savePlacements(nextPlacements);
    set({ placements: nextPlacements });
  },
  clearBets: () => {
    clearPlacements();
    set({ placements: EMPTY_PLACEMENTS });
  },
  addToHistory: (result) => {
    const { history } = get();
    set({ history: [result, ...history].slice(0, HISTORY_CAP) });
  },
  clearHistory: () => set({ history: [] }),
}));
