export interface FairnessSeed {
  clientSeed: string;
  hashedServerSeed: string;
  nextHashedServerSeed: string;
  nonce: number;
}

export interface ChangeClientSeedRequest {
  clientSeed: string;
}
