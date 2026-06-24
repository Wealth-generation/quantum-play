import Image from "next/image";
import { cn } from "@/shared/lib";
import { ROULETTE_CHIPS } from "../config/roulette-defaults";
import { breakIntoChips } from "../lib/roulette-chips";

// Visual constants confirmed from Figma node 3902-25079 (read 2026-06-17).
// Figma chip: size-[28.059px] → CHIP_PX = 28.
// Figma offset: top coin at y=0, middle at y≈1.75, bottom at y≈3.35 → OFFSET_PX = 2.
// Figma stack shows exactly 3 coins → MAX_VISIBLE = 3.
// Overflow "+N" badge: not shown in Figma node (only 3-chip scenario); kept from
// fallback — no contradiction from design, still needed for large bet amounts.
const MAX_VISIBLE = 3;
const CHIP_PX = 28;
const OFFSET_PX = 2;

// O(1) denomination lookup — built once at module load.
const CHIP_BY_DENOM = new Map(ROULETTE_CHIPS.map((c) => [c.value, c]));

interface RouletteChipStackProps {
  // Formatted money string from the placement store, e.g. "125.00".
  amount: string;
}

// Renders a vertically-stacked coin pile over a bet cell per Figma node 3902-25079.
// - Absolutely positioned (inset-0); never changes the cell's box size.
// - pointer-events-none: the cell button beneath still receives all clicks.
// - Stack fans downward: top-of-pile chip at y=0 (rendered last → in front),
//   base chip at y=(n-1)*OFFSET (rendered first → behind). Largest denomination
//   is the base chip; smallest is the top-of-pile chip.
// - Figma drop-shadow on all chips except the base (bottom) chip.
// - When chip count exceeds MAX_VISIBLE, the top-of-pile chip carries a "+N" badge.
// - Applies equally to small number cells (~40px) and wide outside-bet zones.
export function RouletteChipStack({ amount }: RouletteChipStackProps) {
  // parseInt stops at ".": "125.00" → 125. Visual use only — not financial math.
  const total = parseInt(amount, 10);
  if (!(total > 0)) return null;

  const all = breakIntoChips(total);
  if (all.length === 0) return null;

  const overflow = Math.max(0, all.length - MAX_VISIBLE);
  const visible = all.slice(0, MAX_VISIBLE);
  // Container height spans from the top-of-pile chip (y=0) to the base chip's bottom.
  const stackH = CHIP_PX + (visible.length - 1) * OFFSET_PX;

  return (
    // Centered in the cell so the stack sits naturally over the bet zone.
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <span
        className="relative block"
        style={{ width: CHIP_PX, height: stackH }}
      >
        {visible.map((denom, idx) => {
          const chip = CHIP_BY_DENOM.get(denom);
          if (!chip) return null;

          // idx=0 = largest denomination = base of pile.
          // Base chip has the largest topOffset → rendered first (behind in DOM).
          // idx=n-1 = smallest = top-of-pile chip → topOffset=0 → rendered last (in front).
          const topOffset = (visible.length - 1 - idx) * OFFSET_PX;
          // Figma: shadow on middle + top chips; base chip has no shadow.
          const hasShadow = idx > 0;
          const isTop = idx === visible.length - 1;

          return (
            <span
              key={idx}
              className={cn(
                "absolute left-0",
                hasShadow &&
                  "drop-shadow-[0px_2.338px_1.169px_rgba(0,0,0,0.25)]",
              )}
              style={{ top: topOffset, width: CHIP_PX, height: CHIP_PX }}
            >
              <Image
                alt=""
                height={CHIP_PX}
                src={chip.image}
                width={CHIP_PX}
              />
              {isTop && overflow > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-pill border border-text/60 bg-bg px-0.5 text-[9px] font-bold leading-none text-text">
                  +{overflow}
                </span>
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}
