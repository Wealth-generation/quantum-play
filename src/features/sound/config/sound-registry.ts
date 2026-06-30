import type { SoundEvent } from "../model/sound-contract";

export interface SoundRegistryEntry {
  key: string;
  src: string[];
}

export const SOUND_REGISTRY: Record<SoundEvent, SoundRegistryEntry> = {
  "ui:click": { key: "ui:click", src: ["/sounds/ui/click.mp3"] },
  "ui:tick": { key: "ui:tick", src: ["/sounds/ui/tick.mp3"] },
  "bet:win": { key: "bet:win", src: ["/sounds/outcome/win.mp3"] },
  "dice:throw": { key: "dice:throw", src: ["/sounds/dice/throw.mp3"] },
  "dice:rolling": { key: "dice:rolling", src: ["/sounds/dice/rolling.mp3"] },
  "dice:score": { key: "dice:score", src: ["/sounds/dice/score.mp3"] },
  "keno:select": { key: "keno:select", src: ["/sounds/keno/select.mp3"] },
  "keno:reveal": { key: "keno:reveal", src: ["/sounds/keno/reveal.mp3"] },
  "keno:match": { key: "keno:match", src: ["/sounds/keno/match.mp3"] },
  "plinko:drop": { key: "plinko:drop", src: ["/sounds/plinko/drop.mp3"] },
  "plinko:pocket": { key: "plinko:pocket", src: ["/sounds/plinko/pocket.mp3"] },
  "roulette:spin": { key: "roulette:spin", src: ["/sounds/roulette/spin.mp3"] },
};
