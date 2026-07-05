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
import { addMoney, isPositiveMoney, subtractMoney } from "../lib/roulette-decimal";
import {
  clearPlacements,
  clearStack,
  loadPlacements,
  loadStack,
  savePlacements,
  saveStack,
} from "../lib/roulette-storage";
import type {
  ColumnBetKey,
  DozenBetKey,
  HalfBetKey,
  ParityBetKey,
  PlacedBetEntry,
  RouletteBetResult,
} from "./roulette-types";

const HISTORY_CAP = 5;

interface RouletteStoreState {
  placements: RoulettePlacements;
  betsStack: PlacedBetEntry[];
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
  undoLastBet: () => void;
  clearBets: () => void;
  addToHistory: (result: RouletteBetResult) => void;
  clearHistory: () => void;
}

// Runtime source of truth for chip placement. Initial state is EMPTY on both
// server and first client render (no SSR hydration mismatch); the localStorage
// layer is loaded after mount via `hydrate()` and written through on changes.
export const useRouletteStore = create<RouletteStoreState>((set, get) => ({
  placements: EMPTY_PLACEMENTS,
  betsStack: [],
  selectedChip: ROULETTE_DEFAULT_CHIP,
  hydrated: false,
  history: [],
  hydrate: () => {
    if (get().hydrated) {
      return;
    }

    set({ placements: loadPlacements(), betsStack: loadStack(), hydrated: true });
  },
  setSelectedChip: (chip) => {
    set({ selectedChip: chip });
  },
  placeStraight: (value) => {
    if (!isStraightNumber(value)) {
      return;
    }

    const { placements, betsStack, selectedChip } = get();
    const key = String(value);
    const nextPlacements: RoulettePlacements = {
      ...placements,
      straight: {
        ...placements.straight,
        [key]: addMoney(placements.straight[key] ?? "0", selectedChip),
      },
    };
    const nextStack = [...betsStack, { category: "straight" as const, key, amount: selectedChip }];

    savePlacements(nextPlacements);
    saveStack(nextStack);
    set({ placements: nextPlacements, betsStack: nextStack });
  },
  placeColor: (color) => {
    const { placements, betsStack, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      color: {
        ...placements.color,
        [color]: addMoney(placements.color[color] ?? "0", selectedChip),
      },
    };
    const nextStack = [...betsStack, { category: "color" as const, key: color, amount: selectedChip }];

    savePlacements(nextPlacements);
    saveStack(nextStack);
    set({ placements: nextPlacements, betsStack: nextStack });
  },
  placeDozen: (dozen) => {
    const { placements, betsStack, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      dozen: {
        ...placements.dozen,
        [dozen]: addMoney(placements.dozen[dozen] ?? "0", selectedChip),
      },
    };
    const nextStack = [...betsStack, { category: "dozen" as const, key: dozen, amount: selectedChip }];

    savePlacements(nextPlacements);
    saveStack(nextStack);
    set({ placements: nextPlacements, betsStack: nextStack });
  },
  placeColumn: (column) => {
    const { placements, betsStack, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      column: {
        ...placements.column,
        [column]: addMoney(placements.column[column] ?? "0", selectedChip),
      },
    };
    const nextStack = [...betsStack, { category: "column" as const, key: column, amount: selectedChip }];

    savePlacements(nextPlacements);
    saveStack(nextStack);
    set({ placements: nextPlacements, betsStack: nextStack });
  },
  placeParity: (parity) => {
    const { placements, betsStack, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      parity: {
        ...placements.parity,
        [parity]: addMoney(placements.parity[parity] ?? "0", selectedChip),
      },
    };
    const nextStack = [...betsStack, { category: "parity" as const, key: parity, amount: selectedChip }];

    savePlacements(nextPlacements);
    saveStack(nextStack);
    set({ placements: nextPlacements, betsStack: nextStack });
  },
  placeHalf: (half) => {
    const { placements, betsStack, selectedChip } = get();
    const nextPlacements: RoulettePlacements = {
      ...placements,
      half: {
        ...placements.half,
        [half]: addMoney(placements.half[half] ?? "0", selectedChip),
      },
    };
    const nextStack = [...betsStack, { category: "half" as const, key: half, amount: selectedChip }];

    savePlacements(nextPlacements);
    saveStack(nextStack);
    set({ placements: nextPlacements, betsStack: nextStack });
  },
  undoLastBet: () => {
    const { placements, betsStack } = get();

    if (betsStack.length === 0) {
      return;
    }

    const nextStack = betsStack.slice(0, -1);
    const entry = betsStack[betsStack.length - 1];
    const currentSection = placements[entry.category] as Record<string, string>;
    const next = subtractMoney(currentSection[entry.key] ?? "0", entry.amount);
    const nextSection = { ...currentSection };

    if (!isPositiveMoney(next)) {
      delete nextSection[entry.key];
    } else {
      nextSection[entry.key] = next;
    }

    const nextPlacements: RoulettePlacements = {
      ...placements,
      [entry.category]: nextSection,
    };

    savePlacements(nextPlacements);
    saveStack(nextStack);
    set({ placements: nextPlacements, betsStack: nextStack });
  },
  clearBets: () => {
    clearPlacements();
    clearStack();
    set({ placements: EMPTY_PLACEMENTS, betsStack: [] });
  },
  addToHistory: (result) => {
    const { history } = get();
    set({ history: [result, ...history].slice(0, HISTORY_CAP) });
  },
  clearHistory: () => set({ history: [] }),
}));
