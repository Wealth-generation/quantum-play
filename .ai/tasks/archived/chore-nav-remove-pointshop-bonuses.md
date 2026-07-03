# Task: Remove pointshop and bonuses nav entries

## Goal
Remove the two unused nav items (Pointshop, Bonuses) from the main nav and footer. Clean up their
associated icon imports and dead icon exports.

## Branch Mode
PR-mode

## Base Branch
develop

## Task Branch
chore/nav-remove-pointshop-bonuses

## Current Branch at Task Start
chore/nav-remove-pointshop-bonuses (already checked out; no branch creation needed)

## Branch Creation Evidence
Branch pre-existed per user instruction. Confirmed via `git branch --show-current`.

---

## Scope

### Editable Files
- `src/widgets/main-nav/nav-items.ts` — remove Pointshop and Bonuses entries + IconCart/IconCrown imports
- `src/widgets/main-nav/nav-icons.tsx` — remove IconCart and IconCrown dead exports
- `src/widgets/footer/footer-data.ts` — remove Pointshop and Bonuses footer links

### Context-Only Files (do not edit)
- `src/widgets/lobby/lobby-hero.tsx` — "bonuses" is marketing copy, not a nav link
- `src/widgets/rewards/rewards-header.tsx` — "bonuses" is plain text subtitle, not a nav link

## Non-Goals
- No other nav items changed (lobby, leaderboard, rewards, games, roulette, keno, plinko, dice).
- No route additions, no restyling, no new deps, no git writes.
- No src/app route folders to delete (none exist for pointshop or bonuses).

## Reference Discovery (Step 1)
All occurrences of pointshop/bonuses in src/:
- `src/widgets/main-nav/nav-items.ts:4,7,24,27` — imports + nav items (REMOVE)
- `src/widgets/footer/footer-data.ts:10,14` — footer links (REMOVE)
- `src/widgets/main-nav/nav-icons.tsx:13-18,37-43` — IconCart, IconCrown dead exports (REMOVE)
- `src/widgets/lobby/lobby-hero.tsx:64` — plain text, leave
- `src/widgets/rewards/rewards-header.tsx:11` — plain text, leave

---

## Validation
- [ ] pnpm lint — 0 errors
- [ ] pnpm build — 0 errors
- [ ] git diff --check — clean
- [ ] Re-grep pointshop/bonuses — 0 nav/icon hits

## Docs Impact
None — nav item list is implementation, not documented in durable architecture docs.

## API Boundary Impact
None.

## UI QA Impact
Nav renders without Pointshop and Bonuses items. Footer renders without them. All other items intact.
