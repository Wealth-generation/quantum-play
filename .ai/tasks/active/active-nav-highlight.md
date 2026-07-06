# Task: Active Nav Highlight — Primary Green

## Goal
Fix the desktop sidebar + mobile drawer navigation so that the active
item renders in the primary green (`text-primary` / `#22c55e`), matching
the mentor UI feedback. Today the active branch uses `text-text` (white)
while green only appears on hover — the inverse of the desired result.

## Branch Mode
PR-mode

## Base Branch
develop

## Task Branch
feat/active-nav-highlight

## Current Branch at Task Start
develop

## Branch Creation Evidence
Command: `git checkout -b feat/active-nav-highlight`
Result: Switched to a new branch 'feat/active-nav-highlight'

## Scope
Edit ONE file only: `src/widgets/main-nav/main-nav.tsx`

Four `cn()` active branches — change `"text-text"` → `"text-primary"`:
1. primaryNavItems Link — isActive branch (~line 110)
2. Games parent Link — expanded mode, isGamesPath branch (~line 145)
3. Games parent Link — collapsed mode, isGamesPath branch (~line 179)
4. gamesNavItems Link — isActive branch (~line 206)

## Editable Files
- `src/widgets/main-nav/main-nav.tsx`

## Context-Only Files (no edits)
- `src/widgets/main-nav/nav-items.ts`
- `src/widgets/main-nav/nav-icons.tsx`
- `src/widgets/bottom-nav/bottom-nav.tsx`
- `src/widgets/top-bar/top-bar.tsx`
- `src/widgets/app-shell/app-shell.tsx`
- `src/app/globals.css`
- `src/shared/ui/primitives/button.tsx`

## Non-Goals
- bottom-nav.tsx — already correct, no change
- top-bar.tsx — out of scope
- nav-items.ts — no active field needed
- globals.css — no new tokens
- No background plate / left-border accent
- No text-primary-tint; use text-primary only
- No new CVA variant, shared primitive, or data-* attributes
- No route-match logic changes
- No dev server

## Docs Impact
None.

## API Boundary Impact
None.

## UI QA Impact
Required — visual verification of active green on:
- Desktop sidebar (expanded + collapsed)
- Mobile drawer
- All primaryNavItems, Games parent, gamesNavItems
- Confirm bottom-nav unchanged

## Accepted Behavior
Dual highlight (Games parent + game sub-item both green on a game route)
is expected and correct.

## Validation Plan
- git diff --check
- pnpm lint (0 errors)
- pnpm build (0 errors)

## Validation Evidence
- git diff --check: clean (no output)
- pnpm lint: 0 errors
- pnpm build: ✓ Compiled successfully (Turbopack, 35.2s), TypeScript clean, 37 static pages generated

## Status
Implementation complete — awaiting visual QA and commit
