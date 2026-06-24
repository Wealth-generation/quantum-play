import { ROULETTE_CHIP_DENOMINATIONS } from "../config/roulette-defaults";

// Greedy chip breakdown: converts a total integer bet amount into the fewest
// chips possible, largest denomination first. ROULETTE_CHIP_DENOMINATIONS is
// [1,5,25,50,...,50000] ascending, so we iterate in reverse.
//
// Since the minimum denomination is 1 and all totals are integer multiples of
// at least 1 (no fractions in roulette placements), this always resolves exactly
// with zero remainder.
//
// Edge cases:
//   breakIntoChips(0)   → []
//   breakIntoChips(-3)  → []
//   breakIntoChips(1)   → [1]
//   breakIntoChips(6)   → [5, 1]
//   breakIntoChips(30)  → [25, 5]
//   breakIntoChips(125) → [50, 50, 25]
export function breakIntoChips(total: number): number[] {
  const chips: number[] = [];
  let remaining = Math.floor(total);

  if (remaining <= 0) return chips;

  for (let i = ROULETTE_CHIP_DENOMINATIONS.length - 1; i >= 0; i--) {
    const denom = ROULETTE_CHIP_DENOMINATIONS[i];

    while (remaining >= denom) {
      chips.push(denom);
      remaining -= denom;
    }
  }

  return chips;
}
