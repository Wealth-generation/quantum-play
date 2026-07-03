# Task: Mobile Nav Follow-up Fixes

## Goal

Two targeted fixes following the merged mobile bottom-nav work.

## Branch Mode

- Mode: PR-mode
- Base branch: `develop`
- Task branch: `fix/mobile-nav-followups`
- Current branch at task start: `develop`
- Branch creation: `git checkout -b fix/mobile-nav-followups`

## Accepted Risk (logged per prompt)

DailyClaimer was a non-goal in the prior task and was not audited. Fix #2 begins
with a read-only locate step inside this task instead of a separate audit round.
Minimum-bureaucracy approach explicitly accepted by the user.

## Fix 2 — Locate findings (read-only, pre-implementation)

File: `src/features/daily-claim/ui/daily-claim-card.tsx`, line 155
```tsx
<DailyClaimPill className="text-text-muted">Log in</DailyClaimPill>
```
`DailyClaimPill` is a non-interactive `div` with base classes:
`absolute bottom-[12px] left-[12px] flex h-[32px] … bg-surface-3 … text-text shadow-btn`
The `text-text-muted` override renders it grey.
The active "Claim" button immediately below uses `bg-gradient-to-b from-primary-tint to-primary text-on-primary` — the same green gradient as the project's primary Button variant.
Fix: replace the className with the same green-gradient + text-on-primary treatment,
keeping `h-[32px]` and all other sizing unchanged.

## Approved Editable Files

- `src/widgets/bottom-nav/bottom-nav.tsx` (Fix 1)
- `src/features/daily-claim/ui/daily-claim-card.tsx` (Fix 2)

## Context-Only Files (no edits)

- `src/widgets/top-bar/top-bar.tsx` (source of "Log In" wording)
- `src/features/auth/*`
- `src/widgets/auth-modal/*`

## Scope

### Fix 1 — Bottom-nav profile tab label by auth state
- Unauthenticated: label changes from "Profile" to "Log In" (exact wording from top-bar.tsx).
  Icon (User), behaviour (opens auth modal), and all other classes unchanged.
- Authenticated: "Profile" label and all behaviour unchanged.

### Fix 2 — DailyClaimer Log In styling
- `DailyClaimPill` at line 155: replace `className="text-text-muted"` with
  `className="bg-gradient-to-b from-primary-tint to-primary text-on-primary"`.
- Size (`h-[32px]`, position, padding) unchanged.
- No behaviour, structure, or other changes to DailyClaimCard.

## Non-Goals

- No desktop changes.
- No new files, no new dependencies, no new tokens.
- No BFF routes, no new API calls.
- DailyClaimer not restructured or made interactive beyond current behaviour.

## Docs Impact

None — no architectural ownership changes.

## API Boundary Impact

None.

## Validation Plan

`pnpm validate` (lint + build + check:docs).

## Status

In progress.
