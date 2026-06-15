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

interface RouletteStoreState {
  placements: RoulettePlacements;
  selectedChip: number;
  hydrated: boolean;
  hydrate: () => void;
  setSelectedChip: (chip: number) => void;
  placeStraight: (value: number) => void;
  placeColor: (color: RouletteBetColor) => void;
  clearBets: () => void;
}

// Runtime source of truth for chip placement. Initial state is EMPTY on both
// server and first client render (no SSR hydration mismatch); the localStorage
// layer is loaded after mount via `hydrate()` and written through on changes.
export const useRouletteStore = create<RouletteStoreState>((set, get) => ({
  placements: EMPTY_PLACEMENTS,
  selectedChip: ROULETTE_DEFAULT_CHIP,
  hydrated: false,
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
  clearBets: () => {
    clearPlacements();
    set({ placements: EMPTY_PLACEMENTS });
  },
}));
