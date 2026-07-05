# Task: Roulette Undo + Auto-Stop Label

## Goal
Fix two roulette bugs:
1. Wire the Undo button (all three breakpoints) with reload-surviving placement stack.
2. Auto-mode Bet button shows "Stop (N)" / "Stop (∞)" while running (mirror Keno).

## Branch mode
PR-mode

## Base branch
develop

## Task branch
fix/roulette-undo-auto-stop

## Current branch at task start
develop

## Branch creation evidence
```
git checkout -b fix/roulette-undo-auto-stop
# Switched to a new branch 'fix/roulette-undo-auto-stop'
```

## Scope
Two fixes, both entirely inside src/games/roulette/.

### Fix 1 — Undo
- `subtractMoney` added to roulette-decimal.ts
- `PlacedBetEntry` type in roulette-types.ts
- `betsStack` state + `undoLastBet()` + stack push in all 6 place* + clear in clearBets + load in hydrate — roulette-store.ts
- `saveStack` / `loadStack` / `clearStack` with separate key `"roulette:bets:stack:v1"` — roulette-storage.ts
- `undoBet` handler + `undoDisabled` — use-roulette-game-controller.ts
- All three Undo button instances wired: roulette-bet-panel.tsx, roulette-table.tsx, roulette-mobile-table.tsx
- Pass-through in roulette-game.tsx

### Fix 2 — Auto Stop label
- `autoRemainingBets` threaded: use-roulette-auto-bet.ts → use-roulette-game-controller.ts → roulette-game.tsx → roulette-bet-panel.tsx
- Both Bet button instances updated (desktop panel + tablet/mobile betControlsBlock)

## Editable files
- src/games/roulette/lib/roulette-decimal.ts
- src/games/roulette/model/roulette-types.ts
- src/games/roulette/lib/roulette-storage.ts
- src/games/roulette/model/roulette-store.ts
- src/games/roulette/model/use-roulette-auto-bet.ts
- src/games/roulette/model/use-roulette-game-controller.ts
- src/games/roulette/ui/roulette-bet-panel.tsx
- src/games/roulette/ui/roulette-table.tsx
- src/games/roulette/ui/roulette-mobile-table.tsx
- src/games/roulette/ui/roulette-game.tsx

## Context-only files (not edited)
- src/features/auto-bet/model/useAutoBetRunner.ts
- src/app/api/games/roulette/bet/route.ts
- src/games/roulette/lib/roulette-bets.ts

## Non-goals
- No shared runner changes
- No BFF changes
- No new deps or tokens
- No click handler / disabled formula changes for auto (label + threading only)
- No reconstruction of stack from aggregated placements

## Stack primitive checklist
- Zustand owns new `betsStack` state (store-local, game-vertical-internal) ✓
- No new shared primitives, providers, or cross-game state ✓
- No API/BFF expansion ✓
- No new tokens ✓

## API boundary impact
None. BFF and runner contract unchanged.

## Docs impact
None. Both fixes are game-vertical-internal. No architectural patterns introduced.

## UI QA impact
Required across all three breakpoints. Browser QA by user after implementation.

## Validation
pnpm validate (lint + build + docs check)

## Validation evidence
pnpm validate — passed (git diff --check, eslint, next build TypeScript clean, docs freshness check passed). All 10 editable roulette files detected by check:docs.

## Status
Implementation complete — awaiting browser QA
