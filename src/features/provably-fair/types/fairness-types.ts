export interface FairnessSeed {
  clientSeed: string;
  hashedServerSeed: string;
  nextHashedServerSeed: string;
  nonce: number;
}

export interface ChangeClientSeedRequest {
  clientSeed: string;
}

export type FairnessGameSlug = "dice" | "plinko";

export type PlinkoFairnessPathStep = 0 | 1;

export interface PlinkoFairnessContractWarning {
  code: string;
  message: string;
}

export interface PlinkoFairnessResultSnapshot {
  betId: string;
  betSize: string;
  bucketIndex: number;
  contractWarnings: PlinkoFairnessContractWarning[];
  createdAt: string;
  expectedMultiplier: number | null;
  id: string;
  multiplier: number;
  payout: string;
  results: PlinkoFairnessPathStep[];
  risk: string;
  rowsCount: number;
}

export type GameFairnessResultSnapshot =
  | {
      game: "plinko";
      result: PlinkoFairnessResultSnapshot;
    }
  | null;
