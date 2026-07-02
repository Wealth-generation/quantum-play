import type { Balance } from "@/features/balance";

export interface PointsExchangeRequest {
  amount: number;
}

export interface PointsExchangeResult extends Balance {
  exchangeRate: string;
  gamePointsReceived: string;
  watchPointsSpent: string;
}
