export interface DiceConfig {
  rtp: number;
  maxBet: number;
  minBet: number;
  maxMultiplier: number;
}

export interface DiceBetRequest {
  betSize: number | string;
  threshold: number;
  above: boolean;
}

export interface DiceBetResult {
  createdAt: string;
  betId: string;
  betSize: string;
  payout: string;
  multiplier: string;
  randomValue: number;
  threshold: number;
  above: boolean;
  didWin: boolean;
}
