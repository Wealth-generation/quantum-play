export interface Balance {
  gamePoints: string;
  watchPoints: string;
}

export interface BalanceDisplayEvent {
  balanceType: "GAME_POINTS";
  id: string;
  nextValue: string;
  outcome?: "win" | "loss";
  reason: "bet-debit" | "bet-settlement";
}
