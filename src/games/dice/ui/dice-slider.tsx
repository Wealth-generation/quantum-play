"use client";

import { useSoundContract } from "@/features/sound";
import {
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from "@/shared/ui/primitives/slider";
import { cn } from "@/shared/lib";
import {
  DICE_MAX_THRESHOLD,
  DICE_MIN_THRESHOLD,
  DICE_THRESHOLD_STEP,
  diceSliderTicks,
} from "../config/dice-defaults";
import { DiceResultMarker, toTrackPercent } from "./dice-result-marker";

interface DiceSliderProps {
  didWin?: boolean;
  onChange: (value: number) => void;
  randomValue?: number;
  threshold: number;
}

export function DiceSlider({
  didWin,
  onChange,
  randomValue,
  threshold,
}: DiceSliderProps) {
  const sound = useSoundContract();
  const thresholdPercent = toTrackPercent(threshold);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border-2 bg-surface-2 px-5 py-8 pt-12 shadow-inset-hi">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 bottom-full h-12">
            {typeof randomValue === "number" && typeof didWin === "boolean" ? (
              <DiceResultMarker didWin={didWin} randomValue={randomValue} />
            ) : null}
          </div>

          <SliderRoot
            aria-label="Dice rollover"
            className="relative"
            max={DICE_MAX_THRESHOLD}
            min={DICE_MIN_THRESHOLD}
            onValueChange={([value]) => {
              if (typeof value === "number") {
                if (value !== threshold) {
                  sound.play("ui:tick");
                }
                onChange(value);
              }
            }}
            step={DICE_THRESHOLD_STEP}
            value={[threshold]}
          >
            <SliderTrack className="h-3 bg-primary">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 bg-danger"
                style={{
                  width: `${thresholdPercent}%`,
                }}
              />
            </SliderTrack>
            <SliderThumb className="flex h-9 w-9 items-center justify-center rounded-md border-border-2 bg-[#3b4654] shadow-overlay transition-colors hover:border-primary focus-visible:border-primary focus-visible:shadow-glow">
              <span
                aria-hidden="true"
                className="flex h-4 items-center justify-center gap-1"
              >
                <span className="h-4 w-[3px] rounded-pill bg-bg/55" />
                <span className="h-4 w-[3px] rounded-pill bg-bg/55" />
                <span className="h-4 w-[3px] rounded-pill bg-bg/55" />
              </span>
            </SliderThumb>
          </SliderRoot>
        </div>
      </div>
      <div className="px-5">
        <div className="relative h-5 text-xs font-black text-text-muted">
          {diceSliderTicks.map((tick, index) => {
            const tickPercent = toTrackPercent(tick);

            return (
              <span
                className={cn(
                  "absolute top-0 whitespace-nowrap",
                  index === 0 && "translate-x-0 text-left",
                  index > 0 &&
                    index < diceSliderTicks.length - 1 &&
                    "-translate-x-1/2 text-center",
                  index === diceSliderTicks.length - 1 &&
                    "-translate-x-full text-right",
                )}
                key={tick}
                style={{ left: `${tickPercent}%` }}
              >
                {tick}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
