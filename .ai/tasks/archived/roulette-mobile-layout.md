# Task: Roulette Mobile Layout (<md)

**Date:** 2026-06-19
**Branch mode:** Local / continuing feat/roulette-game
**Base branch:** develop
**Task branch:** feat/roulette-game (pre-existing)
**Current branch at task start:** feat/roulette-game
**Skill:** implementation

---

## Goal

Add a third independent breakpoint (<md) for the roulette game:
1. Wheel/Pixi not mounted on mobile (performance — no canvas created).
2. Bet/spin flow works immediately without waiting for a renderer.
3. Rotated mobile board (vertical columns of 3 numbers, outside bets on left, 2:1 at bottom).
4. Mobile single-column order: Mute icon → Board → Bet → Chip info → Chips (2×5) → Mode toggle.

---

## Breakpoint Strategy

| Range | Layout |
|---|---|
| `lg+` | Two-column grid: 22rem panel + wheel/board. Unchanged. |
| `md–lg` | Single-column: wheel + board (Clear/Undo in parity row) + bet controls. Unchanged. |
| `<md` | Single-column: no wheel, mobile board, same bet controls block (shared with tablet via `lg:hidden`). |

---

## Scope

### Editable files

| File | Change |
|---|---|
| `src/games/roulette/model/use-roulette-game-controller.ts` | Add `rendererPresent` param; immediate-resolve path for handleBet and auto-bet |
| `src/games/roulette/ui/roulette-game.tsx` | `useIsMobile` hook; conditional wheel; mobile board vs standard board; mobile sound toggle |
| `src/games/roulette/ui/roulette-mobile-table.tsx` | NEW — rotated mobile board component |
| `.ai/tasks/active/roulette-mobile-layout.md` | This artifact |

### Context-only files (not edited)

- `src/games/roulette/renderer/**` — animation internals
- `src/games/roulette/ui/roulette-wheel.tsx`, `roulette-pixi-ball-stage.tsx` — not mounted on mobile, unchanged
- `src/games/roulette/ui/roulette-table.tsx`, `roulette-bet-panel.tsx`, `roulette-chip-tray.tsx` — unchanged

---

## Part 1: Wheel Not Mounted on Mobile

`useIsMobile()` uses `useSyncExternalStore` (React 18 idiomatic pattern for external stores like media queries):
- `subscribe`: attaches `change` listener to `matchMedia("(max-width: 767px)")`
- `getSnapshot`: returns `mq.matches` on client
- `getServerSnapshot`: returns `false` (wheel renders on SSR; unmounts after client hydration on mobile)

`RouletteWheel` and `RoulettePixiBallStage` (inside it) are only mounted when `!isMobile`. On mobile, no Pixi Application is ever created.

Why `useSyncExternalStore` over `useEffect+setState`: the project lint rule (`react-hooks/set-state-in-effect`) forbids synchronous `setState` calls inside effect bodies, which the naive `useEffect` approach would trigger.

---

## Part 2: No-Renderer Immediate Bet Path

**Controller change** — `useRouletteGameController({ rendererPresent?: boolean })`:

- `handleBet`: when `rendererPresent=false`, calls `handleResult(result)` directly after the mutation resolves. When `true`, calls `setPendingSpin(result)` (existing path).
- `betDisabled`: `pendingSpin !== null` guard only active when `rendererPresent=true`. On mobile, `pendingSpin` is never set so the Bet button is never stuck disabled after a bet.
- `requestSpinImmediate`: a new callback (mobile auto-bet path) that calls `handleResult(result)` and returns `Promise.resolve()` immediately. The auto-bet runner uses this instead of `requestSpin` when `rendererPresent=false`.
- `useRouletteAutoBet.onSpinRequired`: `rendererPresent ? requestSpin : requestSpinImmediate`.

**Auto-bet pacing on mobile**: The existing `ROULETTE_AUTO_BET_DELAY_MS = 800ms` inter-round delay in `useAutoBetRunner` still applies. Since there's no animation (~4s) on mobile, each round takes only the network round-trip + 800ms delay. This is sane pacing for mobile — not too fast, no changes needed.

---

## Part 3: Rotated Mobile Board

`RouletteMobileTable` (`roulette-mobile-table.tsx`) — NEW component:

**Same props as `RouletteTable`** (`placements`, `disabled`, `highlightNumber`, bet handlers, `onClear`, `clearDisabled`). No betting logic is forked — only the grid arrangement changes.

**Layout**:
```
[ 0 — full width ]
[ sidebar: 9 outside bets (flex-1 each) | 12-col × 3-row number grid ]
[ Clear | Undo | 2:1 BOTTOM | 2:1 MIDDLE | 2:1 TOP ]
```

**Number grid**: `grid grid-cols-12 grid-rows-3 grid-flow-col` with numbers 1–36 in source order. `grid-flow-col` places them column by column: col1=1,2,3; col2=4,5,6; …; col12=34,35,36. Text stays horizontal and readable — this is a re-arranged grid, NOT a CSS `rotate()` transform.

**2:1 column key mapping**: With column auto-flow, mobile grid rows 1/2/3 correspond to desktop ColumnBetKey BOTTOM/MIDDLE/TOP respectively (row1 = numbers 1,4,7,...,34 = BOTTOM; row2 = 2,5,8,...,35 = MIDDLE; row3 = 3,6,9,...,36 = TOP).

**Cell sizing**: Number cells have `h-16` (64px), driving grid height to 3×64+2×3=198px. Sidebar uses `items-stretch` + `flex-1` on each cell so 9 cells share 198-24=174px ≈ 19.3px each.

---

## Part 4: Mobile Layout Order

Controls in `roulette-game.tsx` right column, mobile (`<md`):
1. `RouletteSoundToggle` (top, standalone — no wheel area wrapper)
2. `RouletteMobileTable` (rotated board with Clear/Undo/2:1 at bottom)
3. Shared `betControlsBlock` (`lg:hidden`): Bet → Chip info → ChipTray → Mode toggle

**Shared bet controls**: The `betControlsBlock` JSX variable is rendered once and used in the JSX. It has `lg:hidden` so it shows at `<lg` (both tablet md–lg AND mobile <md). Mobile uses the same block as tablet — no duplication of state or handlers.

**ChipTray (2 rows of 5)**: `RouletteChipTray` uses `grid-cols-[repeat(5,48px)]` with 10 chips — always 2 rows of 5. No change needed.

---

## Figma Gap Resolution (Pass 2 — 2026-06-19)

Audit node: Figma 3938-57447 vs `roulette-mobile-table.tsx`.

| Gap | Status | Notes |
|---|---|---|
| GAP-1 Two-column sidebar | ✓ Applied | 2×w-[58px] columns, 4px gap |
| GAP-2 Clear/Undo placement | ✓ Applied | Clear bottom of col 1; Undo bottom of col 2 |
| GAP-3 2:1 standalone row | ✓ Applied | Own `flex gap-[5px]` below number grid |
| GAP-4 Zero width | ✓ Applied | w-[130px], scoped to number grid only |
| GAP-5 Number source order | ✓ Applied | 3,6,…,36 → 2,5,…,35 → 1,4,…,34 (per human decision) |
| GAP-6 Number grid flex-wrap | ✓ Applied | `flex flex-wrap w-[130px]`, 3 per row |
| GAP-7 Sidebar column width | ✓ Applied | w-[58px] each |
| GAP-8 Number cell size | ✓ Applied | size-[40px] |
| GAP-9 Zero height | ✓ Applied | h-[40px] |
| GAP-10 2:1 cell size | ✓ Applied | size-[40px] |
| GAP-11 Clear/Undo size | ✓ Applied | h-[40px], w-full, icon h-5 w-5 (20px) |
| GAP-12 Number grid gap | ✓ Applied | gap-[5px] |
| GAP-13 Outer flex gap | ✓ Applied | gap-[8px] |
| GAP-14 Sidebar inner gaps | ✓ Applied | gap-[5px] within columns, gap-[4px] between |
| GAP-15 Red sidebar cell color | ✓ Accepted | kept bg-danger (#dc2626) per human decision |
| GAP-16 Outside-bet border | ✓ Accepted | kept color-mix(border-2,50%) per human decision |
| GAP-17 Clear/Undo gradient | ✓ Applied | from-surface-3 to-border-2 + border-border |
| GAP-18 1to18/Even bg | ✓ Accepted | bg-surface uniform per human decision |
| GAP-19 Font size | ✓ Applied | text-sm (14px) on outer wrapper |
| GAP-20 Label copy | ✓ Applied | "1 to 18", "19 to 36", "1 to 12", "13 to 24", "25 to 36" |

ColumnBetKey → 2:1 cell order: LEFT=TOP / MIDDLE=MIDDLE / RIGHT=BOTTOM.
Matches source order (TOP numbers appear first in MOBILE_NUMBERS, rows 1–4 of the flex-wrap).

---

## Part 5: Mobile Spin Overlay (2026-06-19)

Reverts the "immediate resolution" mobile path introduced in Part 2. Mobile now uses
the same await-settle path as desktop/tablet, made possible by a new overlay that
mounts a real renderer during each spin.

### Scope

| File | Change |
|---|---|
| `src/games/roulette/renderer/roulette-renderer-types.ts` | Add `skipReturnTail?: boolean` to `RouletteRendererOptions` |
| `src/games/roulette/renderer/pixi-roulette-ball-renderer.ts` | After dwell phase, check `options.skipReturnTail` and fire onSpinSettled immediately (skip 500 ms return-to-rim tail) |
| `src/games/roulette/ui/roulette-pixi-ball-stage.tsx` | Add `skipReturnTail` prop + `rendererMounted` state; pendingSpin effect re-runs when Pixi loads (fixes overlay timing race); move ref-set after renderer guard |
| `src/games/roulette/ui/roulette-wheel.tsx` | Add `skipReturnTail` prop; forward to PixiBallStage; skip `setOrbitAnimState` when skipReturnTail (overlay unmounts, no idle orbit to resume) |
| `src/games/roulette/model/use-roulette-game-controller.ts` | Remove `rendererPresent` param and `requestSpinImmediate`; always use `requestSpin` (await-settle); always set `pendingSpin` in `handleBet`; always guard `betDisabled` on `pendingSpin !== null` |
| `src/games/roulette/ui/roulette-game.tsx` | Remove `rendererPresent: !isMobile` from controller call; add `<RouletteSpinOverlay>` (isMobile && …); update isMobile comment |
| `src/games/roulette/ui/roulette-spin-overlay.tsx` | NEW: fixed-position scrim + RouletteWheel; renders only when pendingSpin non-null; skipReturnTail=true |

### Single-resolution guarantee
`handleResult` is called exactly once per bet:
- `handleBet` always calls `setPendingSpin(result)` — never `handleResult` directly.
- `handleResult` is only called from `handleSpinSettled`.
- `handleSpinSettled` is called by the renderer's `onSpinSettled`, which fires once per spin (after dwell on mobile, after dwell+return on desktop).
- `setPendingSpin(null)` in `handleSpinSettled` triggers overlay unmount; Pixi is destroyed.

### Timing race fix (rendererMounted)
On the mobile overlay path, Pixi loads async after the overlay mounts. The `rendererMounted`
state variable (set inside the Pixi factory's `.then()`) causes the pendingSpin effect to
re-run when Pixi becomes available, ensuring `visualizeSpin` is called even if `pendingSpin`
arrived before the renderer was ready. The `visualizedSpinIdRef` guard prevents double-trigger.

### Auto-bet on mobile
Auto-bet runner awaits `onSpinRequired` (= `requestSpin`). `requestSpin` sets `pendingSpin`
and returns a Promise that resolves when `handleSpinSettled` fires (at end of dwell + 
skipReturnTail). The runner starts the next round only after the overlay closes. One overlay
per round, no overlapping spins.

### Desktop/tablet unchanged
`skipReturnTail` is falsy on the inline wheel path. Renderer runs the full 500 ms return tail,
setOrbitAnimState fires, idle orbit resumes at exact exit angle — unchanged behavior.

---

## Non-goals Respected

- Desktop (lg+) layout unchanged ✓
- Tablet (md–lg) layout unchanged ✓
- Wheel/ball renderer internals not touched ✓
- No bottom fullscreen/settings row ✓
- No new assets ✓
- Auto-bet pacing sane (existing 800ms delay, no new mechanism) ✓

---

## Docs Impact

`src/games/**` is a blocking mapped area. This introduces a new `roulette-mobile-table.tsx` component and a conditional no-renderer bet path. Both are within the existing `roulette/ui/` and `roulette/model/` ownership — no new folder or architectural boundary is crossed. Docs-not-needed rationale: this is a UI layout addition and a conditional logic branch within the existing game module; `foundation-decisions.md` already covers the roulette game module structure and the renderer boundary (renderer never decides outcome, never called on mobile).

## API Boundary Impact

None. No API calls added. `betMutation.mutateAsync` is unchanged. The mobile path just skips the animation wait — the backend call is identical.

## UI QA Impact

Manual QA required:
- **lg+**: desktop two-column layout + spin animation unchanged
- **md–lg**: tablet single-column layout + spin animation unchanged
- **<md**: no wheel (verify Pixi not initialized), rotated board with horizontal readable text, Clear/Undo/2:1 at board bottom, Bet full-width, chips 2 rows of 5, Manual/Auto toggle; bet resolves immediately (no 4s wait); auto-bet advances without hanging; Bet button not stuck disabled after a bet.

---

## Validation

### Pass 1 — initial mobile layout (2026-06-19)
`pnpm validate` — **passed**.
- `pnpm lint`: 0 errors; 1 pre-existing warning in `main-nav.tsx`
- `pnpm build`: compiled successfully; TypeScript 0 errors; 24 static pages generated
- `pnpm check:docs`: passed

### Pass 2 — Figma gap alignment (2026-06-19)
`pnpm validate` — **passed**.
- `git diff --check`: clean
- `pnpm lint`: 0 errors; 1 pre-existing warning in `main-nav.tsx` (unrelated)
- `pnpm build`: compiled successfully in 66s; TypeScript finished 0 errors; 24 pages generated
- `pnpm check:docs`: passed; active task artifact rationale found for `src/games/**`

Manual UI QA — pending (requires browser at three widths: lg+, md–lg, <md).

### Pass 5 — shared-texture eviction fix (2026-06-19)
`pnpm validate` — **passed**.
- `git diff --check`: clean
- `pnpm lint`: 0 errors; 1 pre-existing warning (unrelated)
- `pnpm build`: compiled successfully in 37s; TypeScript 0 errors; 24 pages generated
- `pnpm check:docs`: passed

Confirmed root cause: Pixi's Assets cache is a **global singleton**. The disc texture loaded via
`Assets.load(discImageUrl)` is a shared entry. Calling `Assets.unload(discImageUrl)` in the overlay
cleanup path (main `destroy()` and the post-`Assets.load` StrictMode guard) evicted the shared
cache entry for ALL consumers — so every subsequent `Assets.load()` call (spin 2, 3, StrictMode
remount) found the cache empty → "not found in Cache" → null TextureSource → "alphaMode" crash.

Fix (Option A): removed both `Assets.unload(discImageUrl)` calls. The disc texture is treated as a
shared, app-lifetime resource — it loads once into the global cache and stays there. Each new
renderer mount calls `Assets.load(discImageUrl)` and gets the cached texture immediately (no
re-download). `app.destroy({ texture: false, textureSource: false })` still tears down the
Application and sprites without touching the TextureSource, keeping the cache valid.

`sizes` props verified: overlay wheel rendered at 272–312 px on mobile. `sizes="360px"` selects
the same 384 px srcset entry as the correct value (~312 px) would — no blurry or wasteful download
difference. Left unchanged.

### Pass 4 — texture-lifecycle fix + next/image sizes (2026-06-19)
`pnpm validate` — **passed**.
- `git diff --check`: clean
- `pnpm lint`: 0 errors; 1 pre-existing warning in `main-nav.tsx` (unrelated)
- `pnpm build`: compiled successfully in 37s; TypeScript 0 errors; 24 pages generated
- `pnpm check:docs`: passed; all changed files covered by active task artifact rationale

Root cause recorded: `app.destroy({ textureSource: true })` was destroying the Assets-managed
`discTexture` source directly, bypassing `Assets.unload()`. On StrictMode double-mount, the
second factory found the cache corrupted → "not found in Cache" → null-texture crash.
Fix: use `{ texture: false, textureSource: false }` on all `app.destroy` calls (3 sites in
`pixi-roulette-ball-renderer.ts`); `Assets.unload(discImageUrl)` already handles cache eviction.
Overlay per-spin mount/unmount path is now also safe.

Files changed:
- `pixi-roulette-ball-renderer.ts`: `texture: false, textureSource: false` at all 3 destroy sites
- `roulette-wheel.tsx`: `sizes="360px"` (outer-bg), `sizes="348px"` (ball-track), `sizes="100px"` (crown)
- `main-nav.tsx`: `sizes` added to both daily-claimer fill images (bg: responsive, closed: 52px)

### Pass 3 — mobile spin overlay (2026-06-19)
`pnpm validate` — **passed**.
- `git diff --check`: clean
- `pnpm lint`: 0 errors; 1 pre-existing warning in `main-nav.tsx` (unrelated)
- `pnpm build`: compiled successfully in 61s; TypeScript 0 errors; 24 pages generated
- `pnpm check:docs`: passed; new `roulette-spin-overlay.tsx` covered by active task artifact rationale
