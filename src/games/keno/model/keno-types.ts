// Request/response DTOs for the local keno BFF. Amounts are strings
// (e.g. "1.00"); the backend is authoritative for outcome and payout.
// Wire shapes verified against prod payloads (2026-06-21).

export type KenoRiskLevel = "CLASSIC" | "LOW" | "MEDIUM" | "HIGH";

export interface KenoBetRequest {
  betSize: string;
  risk: KenoRiskLevel;
  // 0-based indices, 1–10 unique ints in [0,39]. Display label = index + 1,
  // but that offset lives only in the tile UI, never at this wire layer.
  selected: number[];
}

export interface KenoBetResult {
  createdAt: string;
  betId: string;
  betSize: string;
  payout: string;
  // Realized round multiplier — number (not string); differs from roulette shape.
  multiplier: number;
  // Always exactly 10 drawn 0-based indices; authoritative for outcome.
  results: number[];
}
