# Task: Keno Bug Fixes (4 bugs)

## Goal
Fix four confirmed bugs in the Keno game vertical. Scope was set by a prior read-only audit.

## Branch Mode
- **Mode:** PR-mode
- **Base branch:** develop
- **Task branch:** fix/keno-bugs
- **Branch at task start:** develop
- **Branch creation:** `git checkout -b fix/keno-bugs` ✓

## Non-Goals
- No BFF/route/contract changes
- No edits to src/features/auto-bet/model/useAutoBetRunner.ts
- No new dependencies, no new tokens
- No other games touched
- No dev server — browser QA by user
- No commit/push/PR/merge

## Editable Files
- `src/games/keno/model/use-keno-auto-bet.ts` (Bug 3)
- `src/games/keno/model/use-keno-game-controller.ts` (Bug 3 + Bug 4)
- `src/games/keno/ui/keno-game.tsx` (Bug 1)
- `src/games/keno/ui/keno-bet-panel.tsx` (Bug 2)

## Context-Only Files (read, not edited)
- `src/features/auto-bet/model/useAutoBetRunner.ts`
- `src/app/api/games/keno/bet/route.ts`
- `src/games/keno/model/keno-store.ts`
- `src/games/keno/model/keno-types.ts`
- `src/games/keno/ui/keno-result.tsx`
- `src/games/keno/ui/keno-grid.tsx`
- `src/games/keno/lib/keno-tiles.ts`

## Bugs

### Bug 3 — Auto mode sends betSize:"0"
- **Root cause:** `betAmount` in controller never passed to `useKenoAutoBet`; runner initializes `currentBetAmount` to `"0"`.
- **Fix:** Add `betAmount: string` to `UseKenoAutoBetOptions`; pass `currentBetAmount: betAmount` in `startAutoBet()`; pass `betAmount` from controller to hook.

### Bug 4 — Board not cleared on Auto Pick / Clear Table
- **Root cause:** `handleAutoPick` and `handleClearTiles` call only `clearTiles()`, leaving `revealedNumbers`/`isRevealComplete`/overlay/pulse dirty.
- **Fix:** Add `clearReveal()`, `setCurrentResult(null)`, `setPulsingTiles(new Set())` to both handlers.

### Bug 1 — Win overlay doesn't cover bet controls
- **Root cause:** `KenoResult` (`absolute inset-0`) is inside the inner board div only, not the full form.
- **Fix:** Add `relative` to `<form>`; move `<KenoResult>` to direct `<form>` child.

### Bug 2 — "Medium" risk button label offset
- **Root cause:** No explicit `text-center` on risk buttons.
- **Fix:** Add `text-center` to shared risk button className.

## Stack Primitive Checklist
- No new JSX components added — patches to existing components only.
- No new state, no new store slices, no new data fetching.
- Not applicable for JSX-heavy UI checklist.

## Docs Impact

**docs-not-needed rationale** (satisfies `check:docs` for changed `src/games/**` files):

Changed files: `use-keno-auto-bet.ts`, `use-keno-game-controller.ts`, `keno-bet-panel.tsx`, `keno-game.tsx`.

These are **bug fixes within the existing Keno game module** — no new architectural pattern, no new BFF slice, no new API boundary, no new state ownership layer, no new game module, no new shared primitive.

- `docs/architecture/foundation-decisions.md` already documents the Keno game vertical ownership (`src/games/keno`), the auto-bet feature boundary, the BFF boundary, and the Zustand/TanStack Query state split. None of those decisions change.
- Bug 3: threads `betAmount` through an existing function call chain (controller → hook → runner). The runner contract (`useAutoBetRunner`) is unchanged. This is a data-flow fix, not an architectural introduction.
- Bug 4: adds three already-used reset calls to two handlers. No new state, no new store slice, no new pattern.
- Bug 1: repositions a component within the same file's JSX tree. No new layout primitive, no new z-index layer introduced architecturally.
- Bug 2: adds `text-center` to an existing button class. No design-token or CVA change.

No durable doc update is warranted.

## API Boundary Impact
None. BFF contract unchanged. Bug 3 fix causes a correct non-zero betSize string to be sent — no contract change.

## UI QA Impact
Bugs 1, 2, 4 have visible UI change. User performs browser QA.

## Validation Plan
`pnpm validate` after implementation.

## Status
- [x] Branch created
- [x] Artifact created
- [x] Bug 3 implemented
- [x] Bug 4 implemented
- [x] Bug 1 implemented
- [x] Bug 2 implemented
- [x] Validation run — lint ✓ build ✓ TypeScript ✓ check:docs ✓

## Validation Evidence (bugs 1–4)
```
pnpm validate
  git diff --check  ✓
  pnpm lint         ✓ (ESLint clean)
  pnpm build        ✓ (Next.js 16.2.6, compiled in 47s, TypeScript clean)
  pnpm check:docs   ✓ (docs-not-needed rationale accepted)
```

---

## Fix A — Revert win overlay to board-scoped

**Branch mode:** PR-mode (continuing on fix/keno-bugs, user-confirmed)
**Branch at task start:** fix/keno-bugs (uncommitted changes from bugs 1–4)

### Scope
Revert the earlier change that made KenoResult a form-level overlay:
- Remove `relative` from `<form>` element in keno-game.tsx
- Move `<KenoResult>` back inside the inner right/main `<div>` (which already has `relative`)
- keno-result.tsx unchanged; onClick={onDismiss} dismiss stays

### Editable files
- `src/games/keno/ui/keno-game.tsx`

### Context-only
- `src/games/keno/ui/keno-result.tsx` (no change)

---

## Fix B — Auto-mode Bet button: "Stop (N)" / "Stop (∞)"

### Scope
Thread `autoRemainingBets: number | null` (null = infinite) from runner state to panel.
Update Bet button label only — handlers and disabled logic unchanged.

Label logic:
- manual + betPending → "Placing bet…"
- auto + autoRunning + autoBetInfinite → "Stop (∞)"
- auto + autoRunning + finite → `Stop (${autoRemainingBets ?? 0})`
- otherwise → "Bet"

### Editable files
- `src/games/keno/model/use-keno-auto-bet.ts`
- `src/games/keno/model/use-keno-game-controller.ts`
- `src/games/keno/ui/keno-game.tsx`
- `src/games/keno/ui/keno-bet-panel.tsx`

### Context-only
- `src/features/auto-bet/model/useAutoBetRunner.ts` (read state.remainingBets only)

### docs-not-needed rationale
Bug fixes and a UI label enhancement inside the existing Keno game vertical. No new architectural pattern, no new BFF slice, no new shared primitive. Same rationale as bugs 1–4 above.

## Status (Fix A + Fix B)
- [x] Branch confirmed (fix/keno-bugs, user-confirmed to continue)
- [x] Artifact updated
- [x] Fix A implemented
- [x] Fix B implemented
- [x] Validation run — lint ✓ build ✓ TypeScript ✓ check:docs ✓
