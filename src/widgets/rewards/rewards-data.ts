export type RewardCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  status: "active" | "ended";
  timeLabel: string;
};

export const rewardCards: RewardCard[] = [
  {
    id: "rakeback",
    title: "15% Rakeback",
    description: "Placeholder description for the rakeback reward.",
    image: "/assets/rewards/images/reward-card-rakeback-15.webp",
    status: "ended",
    timeLabel: "Ended",
  },
  {
    id: "cashback",
    title: "10% Cashback",
    description: "Placeholder description for the cashback reward.",
    image: "/assets/rewards/images/reward-card-cashback-10.webp",
    status: "active",
    timeLabel: "12d 4h remaining",
  },
  {
    id: "free-spins",
    title: "50 Free Spins",
    description: "Placeholder description for the free spins reward.",
    image: "/assets/rewards/images/reward-card-free-spins-777.webp",
    status: "active",
    timeLabel: "5d 2h remaining",
  },
];

export type FaqItem = {
  title: string;
  content: string;
};

const LOREM =
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

export const faqItems: FaqItem[] = [
  { title: "What are rewards?", content: LOREM },
  { title: "How do I earn rewards?", content: LOREM },
  { title: "When do rewards expire?", content: LOREM },
  { title: "Can I combine rewards?", content: LOREM },
  { title: "How do I claim a reward?", content: LOREM },
];
