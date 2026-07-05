export interface LiveBetDto {
  betId: string;
  betSettledAt: string;
  betSize: string;
  payout: string;
  multiplier: string;
  userId: string;
  username: string;
  gameName: string;
  gameImage: string | null;
  gameSlug: string;
}

export function isLiveBetDto(value: unknown): value is LiveBetDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const bet = value as Record<string, unknown>;

  return (
    typeof bet.betId === "string" &&
    typeof bet.betSettledAt === "string" &&
    typeof bet.betSize === "string" &&
    typeof bet.payout === "string" &&
    typeof bet.multiplier === "string" &&
    typeof bet.userId === "string" &&
    typeof bet.username === "string" &&
    typeof bet.gameName === "string" &&
    (typeof bet.gameImage === "string" || bet.gameImage === null) &&
    typeof bet.gameSlug === "string"
  );
}

export function formatLiveBetTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatMultiplier(value: string): string {
  return value.endsWith("x") ? value : `${value}x`;
}

export function shortenUsername(username: string): string {
  if (username.length <= 16) {
    return username;
  }

  return `${username.slice(0, 11)}...`;
}
