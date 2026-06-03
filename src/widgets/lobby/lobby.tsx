import { LobbyHero } from "./lobby-hero";
import { LobbyFeatures } from "./lobby-features";
import { LobbyHowTo } from "./lobby-how-to";

export function Lobby() {
  return (
    <div>
      <LobbyHero />
      <LobbyFeatures />
      <LobbyHowTo />
    </div>
  );
}
