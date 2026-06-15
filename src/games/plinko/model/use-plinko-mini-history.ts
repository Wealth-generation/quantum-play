"use client";

import * as React from "react";
import {
  PLINKO_RECENT_RESULTS_LIMIT,
  type PlinkoRisk,
  type PlinkoRows,
} from "../config";
import type { PlinkoRendererRound } from "../renderer";

export interface PlinkoMiniHistoryItem {
  betId: string;
  bucketIndex: number;
  id: string;
  multiplier: number;
  risk: PlinkoRisk;
  rowsCount: PlinkoRows;
}

export function usePlinkoMiniHistory() {
  const settledHistoryIdsRef = React.useRef(new Set<string>());
  const [items, setItems] = React.useState<PlinkoMiniHistoryItem[]>([]);

  const addSettledRound = React.useCallback((round: PlinkoRendererRound) => {
    if (settledHistoryIdsRef.current.has(round.id)) {
      return;
    }

    settledHistoryIdsRef.current.add(round.id);
    setItems((current) =>
      [
        {
          betId: round.result.betId,
          bucketIndex: round.result.bucketIndex,
          id: round.id,
          multiplier: round.result.multiplier,
          risk: round.result.risk,
          rowsCount: round.result.rowsCount,
        },
        ...current.filter((item) => item.id !== round.id),
      ].slice(0, PLINKO_RECENT_RESULTS_LIMIT),
    );
  }, []);

  return {
    addSettledRound,
    items,
  };
}
