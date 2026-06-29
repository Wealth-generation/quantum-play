import { LeaderboardSection } from "@/widgets/lobby/leaderboard-section";

import { podiumPlayers } from "./leaderboard-data";

export function LeaderboardHero() {
  return (
    <LeaderboardSection
      title="Monthly Bonus Buy Competition"
      subtitle="Be a Top 1000 player and win an exclusive prize."
      players={podiumPlayers.map((player) => ({
        place: player.place,
        username: player.username,
        wagered: player.wagered,
        reward: player.prize,
      }))}
      showAction={false}
    />
  );
}
