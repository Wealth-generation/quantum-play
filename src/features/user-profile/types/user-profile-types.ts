export type UserProfileBalanceType = "GAME_POINTS" | "WATCH_POINTS";

export interface UserProfileBalance {
  balanceType: UserProfileBalanceType;
  value: string;
}

export interface UserProfileAuthProvider {
  provider: string;
}

export interface UserProfileCryptoAddresses {
  btcAddress: string | null;
  ethAddress: string | null;
  ltcAddress: string | null;
}

export interface UserProfileDegenCity {
  connected: boolean;
  label: string | null;
  status: string | null;
}

export interface UserProfileData {
  id: string;
  email: string;
  username: string;
  profileImgUrl: string | null;
  createdAt: string | null;
  isBanned: boolean;
  hasVerifiedRoleOnDiscord: boolean;
  authProviders: UserProfileAuthProvider[];
  cryptoAddresses: UserProfileCryptoAddresses;
  userBalances: UserProfileBalance[];
  balances: {
    gamePoints: string;
    watchPoints: string;
  };
  degenCity: UserProfileDegenCity;
  hasPassword: boolean;
}

export interface UserProfileStats {
  watchPointSpent: string;
  bets: string;
  currentLeaderboardPosition: string;
}

export type UserProfileBetGameSlug =
  | "thedoctor_dice"
  | "thedoctor_keno"
  | "thedoctor_plinko"
  | "thedoctor_roulette";

export interface UserProfileBet {
  id: string;
  betSize: string;
  payout: string;
  settledAt: string;
  gameName: string;
  providerName: string;
}

export interface UserProfileBetsResponse {
  take: number;
  page: number;
  total: number;
  totalPages: number;
  data: UserProfileBet[];
}

export interface UserProfileBetsParams {
  page: number;
  take: number;
  gameSlug?: UserProfileBetGameSlug;
}
