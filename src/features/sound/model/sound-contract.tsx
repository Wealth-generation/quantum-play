"use client";

import * as React from "react";
import { getSoundService } from "@/shared/lib/sound";
import { SOUND_REGISTRY } from "../config/sound-registry";

export type SoundEvent =
  | "ui:click"
  | "ui:tick"
  | "bet:win"
  | "dice:throw"
  | "dice:rolling"
  | "dice:score"
  | "keno:select"
  | "keno:reveal"
  | "keno:match"
  | "keno:miss"
  | "plinko:drop"
  | "plinko:pocket"
  | "roulette:spin";

export interface SoundContract {
  muted: boolean;
  volume: number;
  unlocked: boolean;
  play: (event: SoundEvent) => void;
  stop: (event: SoundEvent) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
}

interface SoundProviderProps {
  children: React.ReactNode;
}

interface SoundPrefs {
  muted: boolean;
  volume: number;
}

const STORAGE_KEY = "sound:prefs:v1";
const DEFAULT_PREFS: SoundPrefs = { muted: false, volume: 1 };

const SoundContext = React.createContext<SoundContract | null>(null);

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    // Access can throw (e.g. disabled storage / sandboxed contexts).
    return null;
  }
}

function isValidVolume(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

// Defensive parse: any corrupt/invalid shape falls back to defaults.
function loadPrefs(): SoundPrefs {
  const storage = getStorage();

  if (!storage) {
    return DEFAULT_PREFS;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return DEFAULT_PREFS;
    }

    const candidate = parsed as Record<string, unknown>;
    const muted = typeof candidate.muted === "boolean" ? candidate.muted : DEFAULT_PREFS.muted;
    const volume = isValidVolume(candidate.volume) ? candidate.volume : DEFAULT_PREFS.volume;

    return { muted, volume };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: SoundPrefs): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Best-effort persistence; ignore quota/serialization failures.
  }
}

export function SoundProvider({ children }: SoundProviderProps) {
  const serviceRef = React.useRef(getSoundService());
  const [prefs, setPrefs] = React.useState<SoundPrefs>(() => loadPrefs());
  const [unlocked, setUnlocked] = React.useState(false);

  React.useEffect(() => {
    const service = serviceRef.current;

    for (const entry of Object.values(SOUND_REGISTRY)) {
      service.register(entry.key, entry.src);
    }
  }, []);

  React.useEffect(() => {
    serviceRef.current.setMuted(prefs.muted);
    serviceRef.current.setVolume(prefs.volume);
    savePrefs(prefs);
  }, [prefs]);

  React.useEffect(() => {
    if (unlocked) return undefined;

    function tryUnlock() {
      const service = serviceRef.current;
      service.unlock();

      if (service.isUnlocked()) {
        setUnlocked(true);
      }
    }

    const target = typeof window === "undefined" ? null : window;
    target?.addEventListener("pointerdown", tryUnlock);
    target?.addEventListener("keydown", tryUnlock);

    return () => {
      target?.removeEventListener("pointerdown", tryUnlock);
      target?.removeEventListener("keydown", tryUnlock);
    };
  }, [unlocked]);

  const value = React.useMemo<SoundContract>(
    () => ({
      muted: prefs.muted,
      volume: prefs.volume,
      unlocked,
      play: (event) => {
        const entry = SOUND_REGISTRY[event];
        serviceRef.current.play(entry.key);
      },
      stop: (event) => {
        const entry = SOUND_REGISTRY[event];
        serviceRef.current.stop(entry.key);
      },
      setMuted: (muted) => {
        setPrefs((current) => ({ ...current, muted }));
      },
      setVolume: (volume) => {
        setPrefs((current) => ({
          ...current,
          volume: Math.min(1, Math.max(0, volume)),
        }));
      },
    }),
    [prefs, unlocked],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSoundContract(): SoundContract {
  const context = React.useContext(SoundContext);

  if (context === null) {
    throw new Error("useSoundContract must be used within SoundProvider");
  }

  return context;
}
