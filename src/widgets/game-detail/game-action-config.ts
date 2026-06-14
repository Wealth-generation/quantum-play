import type { GameInfo, GameSlug } from "@/entities/game/model";

export interface GameActionCapabilities {
  gameRules: boolean;
  turboMode: boolean;
  maxBetMode: boolean;
  volumeControl: boolean;
  provablyFair: boolean;
}

export interface GameRulesContent {
  items: GameRulesItem[];
}

export interface MaxBetWarningContent {
  body: string;
  enableLabel: string;
  title: string;
}

export interface GameRulesItem {
  children?: string[];
  text: string;
}

export interface GameActionConfig {
  capabilities: GameActionCapabilities;
  game: GameInfo;
  maxBetWarning?: MaxBetWarningContent;
  rules: GameRulesContent;
}

const gameActionCapabilities: Record<GameSlug, GameActionCapabilities> = {
  dice: {
    gameRules: true,
    turboMode: true,
    maxBetMode: true,
    volumeControl: true,
    provablyFair: true,
  },
  keno: {
    gameRules: true,
    turboMode: true,
    maxBetMode: true,
    volumeControl: true,
    provablyFair: false,
  },
  plinko: {
    gameRules: true,
    turboMode: true,
    maxBetMode: true,
    volumeControl: true,
    provablyFair: false,
  },
  roulette: {
    gameRules: true,
    turboMode: false,
    maxBetMode: false,
    volumeControl: true,
    provablyFair: false,
  },
};

const gameRulesContent: Record<GameSlug, GameRulesContent> = {
  dice: {
    items: [
      {
        text: "Pick a game mode (Under, Over, Between, Double Between or Outside).",
      },
      {
        text: "Drag the slider to set your target value.",
      },
      {
        text: "Higher win chance means a lower multiplier, so pick your balance of risk and reward.",
      },
      {
        text: "Press Bet to roll; a random number from 0.00 to 100.00 is generated.",
      },
      {
        text: "In the Advanced tab, the chosen strategy adjusts your next bet based on the previous result:",
        children: [
          "Martingale doubles the bet after a loss and resets it after a win.",
          "Delayed Martingale stays flat after the first loss, doubles after every next loss, and resets on a win.",
          "Paroli doubles the bet after a win and resets it after a loss or 3 wins in a row.",
          "D’Alembert raises the bet by one unit after a loss and lowers it by one after a win.",
        ],
      },
      {
        text: "The theoretical Return to Player (RTP) is 96.00%",
      },
      {
        text: "Max Bet: 100,000",
      },
      {
        text: "The maximum payout is $500,000.",
      },
    ],
  },
  keno: {
    items: [
      {
        text: "Choose your bet amount and risk level.",
      },
      {
        text: "Select 1 to 10 numbers on the board.",
      },
      {
        text: "Press Play to draw numbers.",
      },
      {
        text: "Your payout is determined by how many numbers match your selection and the corresponding multiplier.",
      },
      {
        text: "The maximum multiplier is 10,000x.",
      },
      {
        text: "The maximum payout is $500,000.",
      },
    ],
  },
  plinko: {
    items: [
      {
        text: "Choose your bet amount, risk level, and the number of rows.",
      },
      {
        text: "Drop the ball by pressing Play.",
      },
      {
        text: "The multiplier you land on determines your payout.",
      },
      {
        text: "The maximum multiplier is 10,000x.",
      },
      {
        text: "The maximum payout is $500,000.",
      },
    ],
  },
  roulette: {
    items: [
      {
        text: "Place your chips on the board before spinning the wheel.",
      },
      {
        text: "Choose from multiple bet types:",
        children: [
          "Straight (1 number) — pays 36:1",
          "Split (2 numbers) — pays 17:1",
          "Street (3 numbers) — pays 11:1",
          "Corner (4 numbers) — pays 8:1",
          "Double Street (6 numbers) — pays 5:1",
          "Column or Dozen (12 numbers) — pays 2:1",
          "Red/Black, Even/Odd, 1-18/19-36 — pays 1:1",
        ],
      },
      {
        text: "Press Bet to spin the wheel. The ball lands on a random number.",
      },
      {
        text: "If the result matches your bet, you win the corresponding payout.",
      },
      {
        text: "The theoretical Return to Player (RTP) is 97.30%.",
      },
      {
        text: "The maximum payout is $500,000.",
      },
    ],
  },
};

const maxBetWarningContent: Partial<Record<GameSlug, MaxBetWarningContent>> = {
  dice: {
    body: "Max Bet in Dice depends on your current multiplier. Since the total payout is capped at $500,000, the max bet is calculated based on your current rollover value. In Auto Bet, any higher next bet is automatically reduced to the current max bet.",
    enableLabel: "Enable",
    title: "Enable Max Bet?",
  },
  plinko: {
    body: "Max Bet increases Plinko's active bet limit from 100,000 to 500,000. Bet Amount still cannot exceed your available balance.",
    enableLabel: "Enable",
    title: "Enable Max Bet?",
  },
};

export function getGameActionConfig(game: GameInfo): GameActionConfig {
  return {
    capabilities: gameActionCapabilities[game.slug],
    game,
    maxBetWarning: maxBetWarningContent[game.slug],
    rules: gameRulesContent[game.slug],
  };
}
