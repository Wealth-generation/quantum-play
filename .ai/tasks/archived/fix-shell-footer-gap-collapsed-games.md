# Task: fix-shell-footer-gap-collapsed-games

## Goal
Two client-side bug fixes:
1. Remove blank space below footer on desktop (>= lg) caused by always-on 60px inline paddingBottom on `<main>`.
2. Fix collapsed-sidebar Games click to navigate + reveal submenu WITHOUT expanding the sidebar.

## Scope

### Editable files
- `src/app/globals.css` — add `--bottom-bar-h: 60px` to `:root`
- `src/widgets/app-shell/app-shell.tsx` — replace inline paddingBottom style with CSS-var class; update drawer/scrim bottom offsets
- `src/widgets/bottom-nav/bottom-nav.tsx` — replace hardcoded h-[60px] with CSS-var class
- `src/widgets/main-nav/main-nav.tsx` — remove `onExpandRequest?.()` from collapsed Games onClick; change toggle to always-open

### Context-only files (do not edit)
- `src/widgets/footer/footer.tsx`
- `src/widgets/main-nav/nav-icons.tsx`
- `src/widgets/main-nav/nav-items.ts`
- `src/shared/ui/primitives/collapsible.tsx`
- `src/app/layout.tsx`

### Non-goals
- No API/BFF changes
- No new dependencies
- No mobile drawer behaviour changes
- Do not remove `onExpandRequest` from interfaces/wiring
- Do not rebuild collapsed submenu or game icons
- Do not touch footer component or expanded-sidebar behaviour

## Branch Mode
PR-mode

## Base Branch
`develop`

## Task Branch
`fix/shell-footer-gap-collapsed-games`

## Current Branch at Task Start
`develop`

## Branch Creation Evidence
```
git checkout develop && git checkout -b fix/shell-footer-gap-collapsed-games
# Switched to a new branch 'fix/shell-footer-gap-collapsed-games'
```

## Stack Primitive Checklist
- No new JSX components, no new state, no new query hooks
- Fix 1: layout-only (CSS var + class change)
- Fix 2: behaviour-only (one call removed, toggle → always-open)
- Not applicable: form state, data fetching, Zod, Big.js, CVA

## API Boundary Impact
None — client-side only.

## Docs Impact
None — corrective fixes, no new architectural patterns.

## UI QA Impact
Required post-implementation (user performs browser QA):
- Fix 1: desktop >= lg — blank space below footer is gone; mobile — content not hidden behind bottom bar
- Fix 2: collapsed desktop sidebar — Games click navigates to /games, sidebar stays collapsed, 4 game icons revealed in narrow rail; mobile drawer unaffected

## Validation Plan
`pnpm validate` after implementation.

## Risks
- Fix 1: `BOTTOM_BAR_H` JS constant retained and kept in sync with `--bottom-bar-h` (60px) — comment added to document the relationship
- Fix 2: `gamesOpen` now always set to `true` on collapsed Games click; second click does not close submenu (desired per spec)

## Status
In progress
