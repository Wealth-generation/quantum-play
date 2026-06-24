// Pure Keno tile selection and state helpers. No React, no Zustand store.
// All indices are 0-based (internal wire format). The +1 display offset lives
// only in tileLabel() — that is the single authoritative display boundary.

import { KENO_MAX_SELECTED, KENO_TILE_COUNT } from "../config/keno-defaults";

export type KenoTileState = "idle" | "selected" | "hit" | "miss" | "drawn";

/**
 * Toggle a tile's membership in the selection set.
 *
 * - If `index` is already selected: remove it (always allowed).
 * - If `index` is NOT selected and the set is below MAX_SELECTED: add it.
 * - If `index` is NOT selected and the set is already at MAX_SELECTED: no-op.
 *
 * Returns a new Set; never mutates the input.
 */
export function toggleTile(
  selected: ReadonlySet<number>,
  index: number,
): Set<number> {
  const next = new Set(selected);

  if (next.has(index)) {
    next.delete(index);
  } else if (next.size < KENO_MAX_SELECTED) {
    next.add(index);
  }

  return next;
}

/**
 * Randomly pick `count` unique tile indices from [0, KENO_TILE_COUNT).
 * Defaults to KENO_MAX_SELECTED. Uses Fisher-Yates partial shuffle so no
 * index can appear twice. Returns a plain array of 0-based indices.
 */
export function autoPick(count: number = KENO_MAX_SELECTED): number[] {
  const safeCount = Math.min(
    Math.max(Math.trunc(count), 0),
    KENO_MAX_SELECTED,
  );

  if (safeCount === 0) {
    return [];
  }

  // Build a mutable pool of all valid indices, then partial Fisher-Yates.
  const pool = Array.from({ length: KENO_TILE_COUNT }, (_, i) => i);

  for (let i = 0; i < safeCount; i++) {
    const remaining = KENO_TILE_COUNT - i;
    const j = i + Math.floor(Math.random() * remaining);
    // Swap pool[i] and pool[j]
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  return pool.slice(0, safeCount);
}

/**
 * Return an empty selection set. Provided as a named helper so callers
 * don't scatter `new Set<number>()` construction across the codebase.
 */
export function clearTiles(): Set<number> {
  return new Set<number>();
}

/**
 * Derive the visual state of a single tile.
 *
 * `revealedNumbers` is the accumulating sequence of drawn indices that have
 * been animated so far (grows from 0 to DRAW_COUNT during the reveal phase).
 * Pass the full draw result once `isRevealComplete` is true.
 *
 * State matrix:
 *
 * | selected | in revealedNumbers | isRevealComplete | state      |
 * |----------|--------------------|------------------|------------|
 * | yes      | yes                | any              | "hit"      |
 * | no       | yes                | any              | "drawn"    |
 * | yes      | no                 | true             | "miss"     |
 * | yes      | no                 | false            | "selected" |
 * | no       | no                 | any              | "idle"     |
 */
export function getKenoTileState(
  index: number,
  selected: ReadonlySet<number>,
  revealedNumbers: readonly number[],
  isRevealComplete: boolean,
): KenoTileState {
  const isSelected = selected.has(index);
  const isRevealed = revealedNumbers.includes(index);

  if (isRevealed) {
    return isSelected ? "hit" : "drawn";
  }

  if (isSelected) {
    return isRevealComplete ? "miss" : "selected";
  }

  return "idle";
}

/**
 * Returns the 1-based display label for a tile. This is the ONLY place the
 * +1 offset from 0-based internal index to visible number is applied.
 * Wire data (selected[], results[]) always uses the raw 0-based index.
 */
export function tileLabel(index: number): number {
  return index + 1;
}
