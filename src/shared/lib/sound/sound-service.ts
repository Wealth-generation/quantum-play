import { Howl, Howler } from "howler";

export interface SoundService {
  register: (key: string, sources: string[]) => void;
  play: (key: string) => void;
  stop: (key: string) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  unlock: () => void;
  isUnlocked: () => boolean;
}

function createNoopSoundService(): SoundService {
  return {
    register: () => undefined,
    play: () => undefined,
    stop: () => undefined,
    setMuted: () => undefined,
    setVolume: () => undefined,
    unlock: () => undefined,
    isUnlocked: () => false,
  };
}

function createHowlerSoundService(): SoundService {
  const sources = new Map<string, string[]>();
  const sounds = new Map<string, Howl>();
  let muted = false;
  let volume = 1;

  // Howler auto-suspends the shared AudioContext after ~30s of silence.
  // We resume it ourselves in play(), so disable the automatic suspend.
  Howler.autoSuspend = false;

  function getOrCreateHowl(key: string): Howl | null {
    const existing = sounds.get(key);
    if (existing) return existing;

    const src = sources.get(key);
    if (!src || src.length === 0) return null;

    // Lazy Howl creation: instances are only constructed on first play(),
    // never at register() time, keeping AudioContext untouched until needed.
    const sound = new Howl({ src, volume, mute: muted });
    sounds.set(key, sound);
    return sound;
  }

  return {
    register(key, srcList) {
      sources.set(key, srcList);
      sounds.delete(key);
    },
    play(key) {
      // autoSuspend is off, but the context can still arrive here suspended
      // (e.g. browser-initiated). Self-heal on every play(), not just unlock.
      if (Howler.ctx?.state === "suspended") {
        void Howler.ctx.resume();
      }

      // Discard silently if the AudioContext is not yet unlocked — queuing
      // would play stale events late, which is worse than not playing.
      if (Howler.ctx && Howler.ctx.state !== "running") return;

      const sound = getOrCreateHowl(key);
      sound?.play();
    },
    stop(key) {
      sounds.get(key)?.stop();
    },
    setMuted(nextMuted) {
      muted = nextMuted;
      for (const sound of sounds.values()) {
        sound.mute(muted);
      }
    },
    setVolume(nextVolume) {
      volume = nextVolume;
      for (const sound of sounds.values()) {
        sound.volume(volume);
      }
    },
    unlock() {
      void Howler.ctx?.resume();
    },
    isUnlocked() {
      return Howler.ctx?.state === "running";
    },
  };
}

let serviceInstance: SoundService | null = null;

export function getSoundService(): SoundService {
  if (serviceInstance) return serviceInstance;

  serviceInstance =
    typeof window === "undefined"
      ? createNoopSoundService()
      : createHowlerSoundService();

  return serviceInstance;
}
