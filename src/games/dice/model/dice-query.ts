"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  balanceQueryKey,
  clearBalanceDisplayProjection,
  setBalanceDisplayProjection,
} from "@/features/balance";
import { Decimal } from "../lib/dice-decimal";
import { getDiceConfig, placeDiceBet } from "./dice-client";
import type { DiceBetRequest, DiceBetResult } from "./dice-types";

export const diceConfigQueryKey = ["games", "dice", "config"] as const;
const DICE_BALANCE_PROJECTION_OWNER_ID = "dice-bet";
let diceBalanceEventSequence = 0;

interface DiceBalanceProjectionContext {
  balance: string;
  stake: string;
}

function formatProjectionValue(value: string, referenceValue: string) {
  const fractionDigits = referenceValue.split(".")[1]?.length ?? 0;
  const [integerPart, fractionPart = ""] = value.split(".");

  if (fractionDigits === 0) {
    return integerPart;
  }

  return `${integerPart}.${fractionPart
    .padEnd(fractionDigits, "0")
    .slice(0, fractionDigits)}`;
}

function projectDiceBalance(
  balance: string,
  stake: string,
  payout?: string,
) {
  const projected = Decimal.from(balance).minus(stake);
  const settled = payout === undefined ? projected : projected.plus(payout);

  return formatProjectionValue(settled.toString(), balance);
}

export function useDiceConfigQuery() {
  return useQuery({
    queryFn: getDiceConfig,
    queryKey: diceConfigQueryKey,
    staleTime: 5 * 60 * 1000,
  });
}

export function useManualDiceBetMutation(currentGamePoints: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeDiceBet,
    onMutate: (
      request: DiceBetRequest,
    ): DiceBalanceProjectionContext | undefined => {
      if (!currentGamePoints) {
        return undefined;
      }

      const stake = String(request.betSize);
      const nextValue = projectDiceBalance(currentGamePoints, stake);

      setBalanceDisplayProjection({
        event: {
          balanceType: "GAME_POINTS",
          id: `dice-debit-${++diceBalanceEventSequence}`,
          nextValue,
          reason: "bet-debit",
        },
        gamePoints: nextValue,
        ownerId: DICE_BALANCE_PROJECTION_OWNER_ID,
      });

      return {
        balance: currentGamePoints,
        stake,
      };
    },
    onError: (_error, _request, context) => {
      if (context) {
        clearBalanceDisplayProjection(DICE_BALANCE_PROJECTION_OWNER_ID);
      }
    },
    onSuccess: async (
      result: DiceBetResult,
      _request,
      context,
    ) => {
      if (context) {
        const nextValue = projectDiceBalance(
          context.balance,
          context.stake,
          result.payout,
        );

        setBalanceDisplayProjection({
          event: {
            balanceType: "GAME_POINTS",
            id: `dice-settlement-${++diceBalanceEventSequence}`,
            nextValue,
            outcome: result.didWin ? "win" : "loss",
            reason: "bet-settlement",
          },
          gamePoints: nextValue,
          ownerId: DICE_BALANCE_PROJECTION_OWNER_ID,
        });
      }

      try {
        await queryClient.refetchQueries({ queryKey: balanceQueryKey });
      } finally {
        clearBalanceDisplayProjection(DICE_BALANCE_PROJECTION_OWNER_ID);
      }
    },
  });
}
