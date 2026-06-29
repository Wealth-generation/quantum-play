# Task: Apply SectionReveal Across /leaderboard and /rewards

## Goal

Wrap the top-level sections on `/rewards` and `/leaderboard` in `<SectionReveal>` so
those pages get the same scroll-reveal behaviour the lobby already has. First section
per page gets `eager=true` to prevent flash-of-invisible-content on above-fold content.

## Branch Mode

PR-mode. Branch was created manually by the user off a clean, fully-merged `develop`.

| Field                      | Value                                      |
|----------------------------|--------------------------------------------|
| Base branch                | `develop`                                  |
| Task branch                | `feat/apply-section-reveal-across-pages`   |
| Current branch at start    | `feat/apply-section-reveal-across-pages`   |
| Branch creation            | Created manually by user before task start |

## Scope

### Editable files

- `src/widgets/rewards/rewards-page.tsx`
- `src/widgets/leaderboard/leaderboard-page.tsx`

### Context-only files (read, not edited)

- `src/shared/ui/section-reveal.tsx`
- `src/widgets/lobby/lobby.tsx`
- All section component files (rewards-header, rewards-search-bar, etc.)

## Non-goals

- No changes to `SectionReveal` or its props.
- No changes to any section component file.
- No lobby changes.
- No new dependencies.
- No git staging / committing / pushing / PR creation.

## Wrap Plan

### /rewards (rewards-page.tsx)

| Section          | eager | Note                        |
|------------------|-------|-----------------------------|
| RewardsHeader    | yes   | Above-fold; first section   |
| RewardsSearchBar | no    | Defaults                    |
| RewardsGrid      | no    | Defaults                    |
| RewardsFaq       | no    | Defaults                    |

No className pass-through needed — all sections carry their own sizing.

### /leaderboard (leaderboard-page.tsx)

| Section          | eager | Note                                   |
|------------------|-------|----------------------------------------|
| LeaderboardHero  | yes   | Above-fold hero with background image  |
| CountdownBanner  | no    | Client component — client-inside-client fine |
| LeaderboardCTA   | no    | Defaults                               |
| LeaderboardTable | no    | Defaults                               |
| RulesAccordion   | no    | Client component — client-inside-client fine |

No className pass-through needed — all sections carry their own sizing.

## Stack Primitive Checklist

- `SectionReveal` is the project primitive for this behaviour — used directly.
- No new motion primitives, hooks, or deps introduced.
- No state, form, or API work.

## API Boundary Impact

None.

## Docs Impact

None. No architectural pattern is new here — SectionReveal usage was documented
when introduced. This is per-page application of the established pattern.

## UI QA Impact

Required after implementation: confirm scroll-reveal fires on both pages, eager
sections appear immediately without flash, prefers-reduced-motion respected.

## Validation Plan

- `pnpm validate` (git diff --check + lint + build + check:docs)
- Confirm diff covers exactly 2 source files + this artifact.
- Confirm exactly one `eager` per page.
- Confirm no section component file appears in diff.
