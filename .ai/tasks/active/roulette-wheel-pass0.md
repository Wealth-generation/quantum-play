# Pass 0 — Roulette Wheel Visual (Static + Idle CSS Rotation)

**Date:** 2026-06-18
**Branch mode:** Local / no-PR — continuing sub-pass on existing feature branch `feat/roulette-game`.
**Base branch:** develop
**Task branch:** feat/roulette-game (no new sub-branch; all roulette passes land here before the single feature PR)
**Current branch at task start:** feat/roulette-game

---

## Goal

Build the static + idle-rotating wheel visual as a prerequisite for the rAF-driven ball animation (Passes A + B). The renderer module (`renderer/`) is intentionally excluded from this pass.

## Scope

| Action | File |
|---|---|
| CREATE | `src/games/roulette/ui/roulette-wheel.tsx` |
| CREATE | `src/games/roulette/ui/roulette-wheel-ball.tsx` |
| EDIT | `src/games/roulette/ui/roulette-game.tsx` — mount `<RouletteWheel />` |
| EDIT | `src/app/globals.css` — add CCW/CW idle rotation keyframes |

## Non-goals (respected)

- No `src/games/roulette/renderer/` folder.
- No rAF / requestAnimationFrame anywhere.
- No `discRef` / `ballCanvasRef` / `use-roulette-renderer.ts`.
- No changes to `use-roulette-game-controller.ts`, `use-roulette-auto-bet.ts`, `roulette-result.tsx`, `roulette-history.tsx`.
- No `roulette-wheel-geometry.ts` (pocket order — Pass A).
- No new `@theme` tokens.

## Context-only files (not edited)

- `src/games/roulette/model/**` — all model files unchanged
- `src/games/roulette/ui/roulette-table.tsx` — betting board unchanged
- `src/games/roulette/ui/roulette-result.tsx` — win overlay unchanged
- `src/games/roulette/ui/roulette-history.tsx` — history sidebar unchanged
- `src/games/roulette/config/**` — unchanged
- `src/games/roulette/lib/**` — unchanged

## Implementation decisions (tunable values, flagged for review)

### Idle rotation durations
- Disc CCW: **24 s / revolution** — calm, ambient casino feel.
- Crown CW: **18 s / revolution** — independently faster for visual contrast.
- Both are `linear infinite`. Chosen in the lower half of the spec's suggested 15–30 s range.
- To tune: change the duration values in the `animation` inline styles in `roulette-wheel.tsx`.

### Keyframe location
`@keyframes roulette-disc-ccw` and `@keyframes roulette-crown-cw` added to `src/app/globals.css` (root-level, after existing utility layers). Named with `roulette-` prefix to avoid conflicts with other game keyframes.

### Wheel container max-width
`max-w-[360px]` — compact above the 625 px betting board; matches reference screenshot proportions.

### Layer proportions
- outer-bg: fills container via `fill` + `object-contain` (566 × 566 source).
- ball-track: fills container (548 × 548, ≈ 96.8 % of outer-bg, letterbox negligible).
- disc: fills container (519 × 530, near-square, ≈ 91.7 % width; `object-contain` keeps aspect ratio).
- crown: absolute centered, width = 156 / 566 × 100 ≈ **27.6 %** of container.

### Ball (Pass 0 — raster asset, post-swap)
- **Asset:** `roullete-ball.webp` (20 × 20 px, VP8X with alpha channel). Typo in filename preserved from the original PSD export.
- **Rendered:** `<Image width={12} height={12} />` — rendered at 12 × 12 px to match prior CSS-circle footprint and preserve the tuned orbit radius (`top: 5.5%`).
- **Removed:** `size-2.5`, `rounded-full`, `backgroundColor: rgba(255,255,255,0.75)`, `boxShadow` glow — all replaced by the raster asset's own pixel data and alpha transparency.
- **Position unchanged:** `top: 5.5%`, `left: 50%`, `transform: translate(-50%, -50%)` — 12-o'clock on track groove, held by the orbit container.
- No ref, no animation on the element itself. Pass B will replace the orbit wrapper with rAF-driven renderer and attach a ref.

### Ball — earlier CSS-only Pass 0 record (for history)
- Was: 12 × 12 px (`size-3`) white circle, `rounded-full`, `bg-white`, double glow `box-shadow`.
- Dimmed to `size-2.5` (10 px) + `rgba(255,255,255,0.75)` + reduced glow in fix-up pass.
- Replaced with raster `next/image` in a follow-up sub-pass (same session).

## Validation

- `pnpm validate` (lint + build + check:docs) — must pass.
- Manual UI QA required:
  - Disc rotates CCW continuously at idle (no bet needed).
  - Crown rotates CW continuously and independently.
  - Ball is visible as a small white glowing circle on the track ring.
  - Layer z-order correct (crown above disc, ball above crown).
  - Wheel sits above the betting board in the right column.
  - No regressions in the bet panel, win overlay, or history sidebar.

## Pass 0 Fix-up (post-QA, same session)

Three visual issues corrected after manual UI-QA. No new files created; existing files edited in place.

### Fix 1 — Layer proportions restored

**Problem:** All four image layers used `next/image fill` directly on `absolute inset-0` wrappers, making every layer render at 100% of the container. The outer-bg border ring was invisible because ball-track and disc overlapped it completely.

**Fix:** Ball-track and disc are now rendered inside dedicated centering wrappers (`absolute inset-0 flex items-center justify-center`) with explicit proportional widths:
- `wheel-ball-track.webp`: wrapper `width: 96.8%`, `aspect-square` (548 / 566 ≈ 96.8 %)
- `wheel-disc.webp`: wrapper `width: 91.7%`, `aspectRatio: "519 / 530"` (519 / 566 ≈ 91.7 %)
- `wheel-outer-bg.webp`: unchanged — fills container via `fill` (it IS the reference size)
- `wheel-crown.webp`: unchanged — already proportionally sized

The disc-centering wrapper does NOT rotate; only the inner proportional div carries the `roulette-disc-ccw` animation, keeping `transform-origin` at the disc's own center = the wheel center.

### Fix 2 — Ball orbital CW rotation

**Problem:** Ball was positioned with absolute top/left on the wheel container itself, placing it over the disc area rather than the track groove. No motion.

**Fix:** "Satellite around a point" orbit pattern:
- Orbit wrapper: `absolute inset-0`, carries `roulette-ball-orbit-cw 9s linear infinite`. Its `transform-origin` is `50% 50%` of itself = the wheel center.
- Ball inside orbit wrapper: `top: 7%`, `left: 50%`, `transform: translate(-50%, -50%)` — places the ball at the 12-o'clock position on the track groove.
- The wrapper rotating CW carries the ball around the wheel center without the ball self-spinning visually (circle is rotationally symmetric).
- New keyframe `roulette-ball-orbit-cw` added to `globals.css` alongside existing disc/crown keyframes.

**Orbit duration: 60 s / revolution CW** — updated after second QA pass to match a clock's second-hand angular speed (one full revolution per minute). Independent from disc (24 s CCW) and crown (18 s CW). LCM of 60, 18, 24 = 360 s before the three align.

**Ball track-groove position — final value `top: 5.5 %`:** initial estimate was `top: 7 %` (≈ 155 px from center at 360 px). Nudged outward ~5 px after QA (ball was near inner edge of track gap) → 160 px from center → top = (180 − 160) / 360 ≈ 5.5 %.

### Fix 3 — Ball visual intensity reduced

**Before:** `size-3` (12 px), `rgba(255,255,255,1.0)` effectively (via `bg-white`), strong double glow.
**After:** `size-2.5` (10 px), `rgba(255,255,255,0.75)` background, reduced glow:
- Inner halo: `0 0 4px 1px rgba(255,255,255,0.50)` (was 0.85)
- Outer bloom: `0 0 10px 4px rgba(255,255,255,0.15)` (was 0.35)
Goal: "present but understated" — visible as a dim pearl on the track without drawing attention away from the disc.

## Docs impact

Docs-not-needed rationale:

Changed mapped files: `src/games/roulette/ui/**` (new wheel components, roulette-game.tsx mount) and `src/app/globals.css` (two roulette-specific keyframes added).

`src/games/roulette/ui/**` is mapped to `docs/architecture/foundation-decisions.md`. The foundation decisions doc already records `src/games/roulette/ui/**` as the implemented UI layer. This pass adds two new wheel composition files following the documented pattern — no new architectural boundary, state-management behavior, or ownership change. No docs update needed for the `ui/` additions.

`src/app/globals.css` is mapped to `docs/architecture/foundation-decisions.md` and `docs/design/design-source-audit.md`. The globals.css change adds two `@keyframes` blocks (`roulette-disc-ccw`, `roulette-crown-cw`) that are game-local CSS animation primitives for the Roulette wheel's idle rotation. These are not design tokens, not new theme variables, and not shared UI primitives — they do not alter the design-system foundation described in either mapped doc. No docs update needed for this keyframe addition.

A docs update to `foundation-decisions.md` will be required in Pass A when `src/games/roulette/renderer/` is created (first renderer pattern for Roulette).

## History Layout + Exit Animation Fix (same session, same branch — superseded by repositioning below)

**Files:** `src/games/roulette/ui/roulette-game.tsx`, `src/games/roulette/ui/roulette-history.tsx`

### Fix 1 — flex layout around table + history strip

**Problem:** `<RouletteTable>` has `w-full max-w-[625px]` on its root div. As a flex item alongside `<RouletteHistory>` in a `flex items-start gap-2` row, `w-full` sets the table's flex-basis to 100% of the container. Both items then compete for space and the table can consume all available width, leaving the history no stable room.

**Fix:** Wrapped `<RouletteTable>` in `<div className="min-w-0 flex-1">`. The wrapper is `flex-1` (grows to fill remaining space) and `min-w-0` (can shrink below content width if needed). `<RouletteHistory>` is a separate flex item — `shrink-0` added to its outer div so the 40px badge strip never compresses. The history sits directly to the right of the table, top-aligned via the parent `items-start`, flush with the first row of the board.

### Fix 2 — exit animation on oldest badge

**Pattern follows `plinko-mini-history.tsx`** (same project, same Motion library version).

- `AnimatePresence initial={false} mode="popLayout"` — `popLayout` immediately removes the exiting item from layout flow (absolute positioned during exit), so the container height contracts without holding a dead slot. `initial={false}` suppresses animation on first mount.
- Each `motion.div` has `layout` (smooth position transition for remaining items when the list re-orders) and a stable `key={entry.betId}` (the existing bet ID — not array index — so Motion correctly identifies which item is being removed vs shifted).
- Animation: `initial={{ opacity: 0, scale: 0.94, y: -8 }}` → `animate={{ opacity: 1, scale: 1, y: 0 }}` → `exit={{ opacity: 0, scale: 0.9, y: 8 }}`, 200 ms `easeOut`.
- Removed `overflow-y-auto` from outer div (HISTORY_CAP=5 × 40px + 4 × 8px gap = 232px max; no overflow is possible).

**Non-goals respected:** no changes to `roulette-store.ts`, `use-roulette-game-controller.ts`, `use-roulette-auto-bet.ts`, or wheel/ball files. No badge content/style changes beyond the `motion.div` wrapper replacement and `shrink-0` on the container.

## Sound Toggle Placeholder + History Repositioning (same session, supersedes prior history positioning)

**Files:**
- CREATE `src/games/roulette/ui/roulette-sound-toggle.tsx`
- EDIT `src/games/roulette/ui/roulette-game.tsx`

### What changed

The prior "History Layout Fix" placed `<RouletteHistory>` to the right of the betting board. Per fresh visual direction, the history moves again: it now sits in the top area of the right column, to the LEFT of the wheel, stacked below a new sound icon placeholder.

**New layout (right column, top area):**
```
flex items-start gap-4:
  ├─ flex shrink-0 flex-col gap-4:   ← left column, width = 40px (badge/icon size)
  │    RouletteSoundToggle            ← static Volume2 icon, size-10 container
  │    RouletteHistory                ← badge strip (unchanged internals)
  └─ min-w-0 flex-1:
       RouletteWheel                  ← grows to fill, max-w-[360px]
```
Below that row: `<RouletteTable>` full-width (no history sidebar, no min-w-0 wrapper).

**`RouletteSoundToggle`:** pure visual placeholder — `Volume2` lucide icon, `size-5 text-text-muted strokeWidth={1.5}`, wrapped in `size-10 flex items-center justify-center aria-hidden` div. No click handler, no state, no Zustand wiring. Sound functionality explicitly deferred.

**Spacing:** `gap-4` (16px) between sound icon and history block; `gap-2` (8px) between individual history badges — two distinct values, icon-to-history gap is 2× badge gap.

**`min-w-0 flex-1` wrapper:** removed from around `<RouletteTable>` (no longer in a flex row with siblings). Added to the wheel wrapper inside the top-area flex row.

**Non-goals:** no sound audio logic, no audio state, no store changes. History badge animation/content from prior pass unchanged.

**Deferred follow-up:** sound toggle interactivity (click, mute/unmute state, audio integration) is a separate task — not part of this or any prior pass.

## API boundary impact

None. Purely additive UI, no BFF routes, no TanStack Query, no Zustand changes.
