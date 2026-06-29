import { Button } from "@/shared/ui/primitives/button";

export function LeaderboardCTA() {
  return (
    <section className="flex justify-center">
      <Button disabled size="md" type="button" variant="primary">
        Join the Leaderboard
      </Button>
    </section>
  );
}
