import type { SoundEvent } from "../model/sound-contract";

export interface SoundRegistryEntry {
  key: string;
  src: string[];
}

// THIS SLICE: every entry is a no-op stub (src: []). The sound service
// silently no-ops on empty sources. Real assets land in a later slice.
export const SOUND_REGISTRY: Record<SoundEvent, SoundRegistryEntry> = {
  "bet:place": { key: "bet:place", src: [] },
  "bet:win": { key: "bet:win", src: [] },
  "bet:loss": { key: "bet:loss", src: [] },
  "bet:push": { key: "bet:push", src: [] },
  "dice:roll": { key: "dice:roll", src: [] },
  "plinko:drop": { key: "plinko:drop", src: [] },
  "plinko:land": { key: "plinko:land", src: [] },
  "keno:reveal": { key: "keno:reveal", src: [] },
  "keno:match": { key: "keno:match", src: [] },
  "roulette:spin": { key: "roulette:spin", src: [] },
  "roulette:land": { key: "roulette:land", src: [] },
  "ui:click": { key: "ui:click", src: [] },
  "ui:toggle": { key: "ui:toggle", src: [] },
};
