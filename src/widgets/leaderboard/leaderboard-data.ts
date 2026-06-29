export type PodiumPlace = 1 | 2 | 3;

export interface PodiumPlayer {
  place: PodiumPlace;
  username: string;
  wagered: string;
  prize: string;
}

export interface TableRow {
  rank: number;
  username: string;
  wagered: string;
  prize: string;
}

export interface RulesItem {
  title: string;
  content: string;
}

export const podiumPlayers: PodiumPlayer[] = [
  { place: 1, username: "NovaSpin", wagered: "12,480.00", prize: "5,000.00" },
  { place: 2, username: "LuckyOrbit", wagered: "11,930.50", prize: "2,500.00" },
  { place: 3, username: "ReelPilot", wagered: "11,220.25", prize: "1,000.00" },
];

export const tableRows: TableRow[] = [
  { rank: 1, username: "NovaSpin", wagered: "12,480.00", prize: "5,000.00" },
  { rank: 2, username: "LuckyOrbit", wagered: "11,930.50", prize: "2,500.00" },
  { rank: 3, username: "ReelPilot", wagered: "11,220.25", prize: "1,000.00" },
  { rank: 4, username: "TurboMint", wagered: "10,905.10", prize: "750.00" },
  { rank: 5, username: "JackpotJay", wagered: "10,440.75", prize: "500.00" },
  { rank: 6, username: "BetBeacon", wagered: "9,988.40", prize: "350.00" },
  { rank: 7, username: "QuantumAce", wagered: "9,620.15", prize: "250.00" },
  { rank: 8, username: "SpinCipher", wagered: "9,104.80", prize: "175.00" },
  { rank: 9, username: "CoinVoyage", wagered: "8,775.55", prize: "125.00" },
  { rank: 10, username: "RushNova", wagered: "8,410.30", prize: "100.00" },
];

const rulesPlaceholder =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer facilisis, libero in fermentum fermentum, est nunc gravida mauris, non viverra erat ligula ac sem.";

export const rulesItems: RulesItem[] = [
  { title: "Rules", content: rulesPlaceholder },
  { title: "Disclaimer", content: rulesPlaceholder },
  { title: "Wagering", content: rulesPlaceholder },
  { title: "Responsible Gambling", content: rulesPlaceholder },
  {
    title: "Self-Exclusion Policy & Giveaway Eligibility",
    content: rulesPlaceholder,
  },
];
