# Task: Mobile Bottom Navigation Refactor

## Goal

On mobile (< lg) move navigation into a fixed bottom navigation bar and slim the header down. Desktop (>= lg) must remain completely untouched — all changes stay behind < lg breakpoint guards.

## Branch Mode

- Mode: PR-mode
- Base branch: `develop`
- Task branch: `feat/mobile-bottom-nav`
- Current branch at task start: `develop`
- Branch creation command: `git checkout -b feat/mobile-bottom-nav`
- Branch creation evidence: switched successfully

## Reference Constraint

A layout/behaviour reference screenshot ("The Doctor") was provided for context ONLY.
**Nothing from it — logo, art, brand colours, or copy — appears in this implementation.**
Layout and interaction behaviour are the only things derived from it.

## Approved Editable Files

- `src/widgets/app-shell/app-shell.tsx`
- `src/widgets/top-bar/top-bar.tsx`
- `src/widgets/main-nav/main-nav.tsx`
- `src/widgets/bottom-nav/bottom-nav.tsx` (NEW)
- `src/widgets/bottom-nav/index.ts` (NEW)
- `docs/architecture/foundation-decisions.md`
- `.ai/tasks/active/mobile-bottom-nav.md` (this file)

## Context-Only Files (no edits)

- `src/features/auth/*`
- `src/features/balance/*`
- `src/features/points-exchange/*`
- `src/widgets/auth-modal/*`
- `src/app/globals.css`
- `src/app/user/page.tsx`

## Scope

### Header (< lg)
- Logo pinned LEFT (remove current mobile centering).
- Authenticated: balances + exchange ChevronDown pinned RIGHT. Preserve existing Popover + PointsExchangeModal wiring exactly.
- Unauthenticated: "Log In" Button pinned RIGHT (useAuthModal).
- REMOVE from mobile header: hamburger, Bell, username pill, mobile LogOut button.
- Keep every desktop (>= lg) element exactly as-is.
- X close control: when drawerOpen is true, an X appears LEFT of logo and slides logo right. CSS transition only (no Motion). TopBar receives `drawerOpen` + `onCloseDrawer` from AppShell.

### Bottom Nav (NEW widget — src/widgets/bottom-nav/)
- Fixed bottom, full width, hidden at >= lg.
- Three items: Menu (burger), Bell, User — all Lucide icons.
  - Burger: toggles drawer via onToggleDrawer prop. Tinted primary green when drawerOpen === true.
  - Bell: pure placeholder — no handler, no route, never tinted active.
  - Profile: authenticated → Link to /user, tinted primary green when pathname === "/user". Unauthenticated → opens auth modal (useAuthModal), not a navigation.
- usePathname() and useAuthSession() called internally.
- Does NOT import from app-shell, top-bar, or main-nav.
- Props: drawerOpen: boolean, onToggleDrawer: () => void.
- padding-bottom: env(safe-area-inset-bottom) for iOS home indicator.

### Drawer / MainNav
- DailyClaimCard stays at top of drawer — out of scope to move.
- Logout slot pinned to bottom of drawer (mt-auto in flex column):
  - Authenticated → "Log out" calls useLogoutMutation.
  - Unauthenticated → "Log In" item in primary green opens auth modal.
- Close on nav-link click: new optional onClose prop; mobile drawer passes it, desktop sidebar does not.

### AppShell Wiring
- Single owner of drawerOpen state.
- Thread drawerOpen + toggle/close callbacks to TopBar and BottomNav.
- Shared bar height constant: `BOTTOM_BAR_H = 60` (px) used for:
  - Bottom bar height
  - Drawer bottom offset (bottom-[60px])
  - Scrim bottom offset (bottom-[60px])
  - Main padding-bottom (pb-[60px])
- Bottom bar z-index: z-[60] (above drawer z-50).

## Non-Goals

- No desktop layout changes.
- No rebuild of balance popover / PointsExchangeModal.
- No functional bell.
- No DailyClaimCard move.
- No new dependencies.
- No new globals.css tokens.
- No BFF routes or new browser API calls.
- No Figma; no third-party brand/art/copy.

## Stack Primitive Checklist

- Tailwind CSS + CSS variables: yes (existing tokens, no new)
- cn(): yes (imported from @/shared/lib)
- CVA: not needed (no multi-variant primitive)
- Lucide icons: already present (lucide-react)
- Motion: NOT used for new transitions (CSS transitions to match drawer)
- Radix: not needed for new components

## Docs Impact

- `docs/architecture/foundation-decisions.md`: update to record `widgets/bottom-nav` as implemented.

## API Boundary Impact

None. No new BFF routes. No browser external calls.

## UI QA Impact

Required after implementation (separate pass):
- All mobile routes at < lg: drawer open/close (burger, scrim, X, link tap, re-tap burger)
- Active tint: burger (drawer open), profile (/user active), bell (never)
- Logout in drawer (authenticated), Log In in drawer (unauthenticated)
- Header: logo left, balances right — no overflow
- Safe-area on iOS
- Desktop (>= lg): no regressions

## Validation Plan

```
pnpm validate   (lint + build + check:docs)
Manual scope check
Manual API boundary check
Manual UI QA (separate)
```

## Status

In progress.
