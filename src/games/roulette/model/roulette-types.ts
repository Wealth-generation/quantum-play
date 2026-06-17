// Request/response DTOs for the local roulette BFF. Amounts are strings
// (e.g. "25.00"); the backend is authoritative for outcome and payout.

export interface StraightBetValue {
  straightNumber: number;
  amount: string;
}

export interface ColorBetValue {
  // VERIFIED against prod payload (2026-06-15): color is UPPERCASE "RED" | "BLACK".
  color: string;
  amount: string;
}

// VERIFIED against prod payload (2026-06-17): exact UPPERCASE literal unions.
export type DozenBetKey = "FIRST" | "SECOND" | "THIRD";
export type ColumnBetKey = "TOP" | "MIDDLE" | "BOTTOM";
export type ParityBetKey = "EVEN" | "ODD";
export type HalfBetKey = "LOW" | "HIGH";

export interface DozenBetValue {
  dozen: DozenBetKey;
  amount: string;
}

export interface ColumnBetValue {
  column: ColumnBetKey;
  amount: string;
}

export interface ParityBetValue {
  parity: ParityBetKey;
  amount: string;
}

export interface HalfBetValue {
  half: HalfBetKey;
  amount: string;
}

// Out-of-scope bet types for this slice are always sent as empty arrays.
export interface RouletteBetParams {
  straightValues: StraightBetValue[];
  splitValues: unknown[];
  streetValues: unknown[];
  cornerValues: unknown[];
  doubleStreetValues: unknown[];
  columnValues: ColumnBetValue[];
  dozenValues: DozenBetValue[];
  colorValues: ColorBetValue[];
  parityValues: ParityBetValue[];
  halfValues: HalfBetValue[];
}

export interface RouletteBetRequest {
  params: RouletteBetParams;
}

export interface RouletteBetResult {
  betId: string;
  createdAt: string;
  betSize: string;
  payout: string;
  randomPosition: number;
  multiplier: string;
}
