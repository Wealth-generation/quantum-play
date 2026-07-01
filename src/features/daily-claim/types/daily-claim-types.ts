export interface DailyClaimStatus {
  available: boolean;
  enabled: boolean;
  pointsAmount: number;
  invalidConfig: boolean;
  nextClaimAt: string | null;
  secondsUntilNextClaim: number;
}

export interface DailyClaimResult {
  pointsAmount: number;
}
