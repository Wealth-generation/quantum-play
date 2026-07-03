# Task: games-route-nav-and-reveal

## Goal

1. Wire `/games` as a navigable link in the sidebar "Games" row (PART 1).
2. Apply SectionReveal scroll-reveal wrappers to the `/games` page sections (PART 2).

## Branch Mode

PR-mode. Branch created manually by the user off `develop`.

## Branch Info

| Field | Value |
|---|---|
| Base branch | develop |
| Task branch | feat/games-route-nav-and-reveal |
| Current branch at task start | feat/games-route-nav-and-reveal |
| Branch creation | Created manually by user before this task; no agent branch command needed |

## Scope

### PART 1 — Nav wiring (Commit 1)

**Editable:** `src/widgets/main-nav/main-nav.tsx`

Goal: split the "Games" row into two distinct hit targets:
- Label + leading icon → `<Link href="/games">` (navigates, no toggle)
- Caret → separate `<button>` (toggles submenu, no navigation)

Reuse `isGamesPath` for active state and `aria-current`. Preserve collapsed
sidebar behavior and mobile drawer path.

### PART 2 — SectionReveal on /games (Commit 2)

**Editable:** `src/widgets/games-lobby/games-lobby.tsx`

Wrap the four logical blocks inside the existing `<section flex-col gap-10>`:
1. Heading block → `<SectionReveal eager>`
2. Game cards grid → `<SectionReveal>`
3. `<BetLive>` → `<SectionReveal>`
4. `<GamesFaq>` → `<SectionReveal>`

No extraction of inline blocks into named components. No refactor. Wrapping only.

## Non-Goals

- Do NOT edit `nav-items.ts`.
- Do NOT change child game links or other nav groups.
- Do NOT touch lobby/rewards/leaderboard pages.
- Do NOT add props to SectionReveal or add dependencies.
- Do NOT stage, commit, push, or create a PR.

## Context-Only Files

- `src/app/games/page.tsx`
- `src/app/games/[gameSlug]/page.tsx`
- `src/widgets/games-lobby/game-card.tsx`
- `src/widgets/games-lobby/games-faq.tsx`
- `src/widgets/bet-live/bet-live.tsx`
- `src/shared/ui/section-reveal.tsx`
- `src/widgets/main-nav/nav-items.ts`
- Reference pages: lobby.tsx, rewards-page.tsx, leaderboard-page.tsx

## Docs Impact

No durable architecture docs need updating. This task wires an existing route
and applies an existing shared primitive — both patterns are already documented.

## API Boundary Impact

None. No API calls, BFF routes, or auth changes.

## UI QA Impact

Both parts require UI QA:
- Nav: collapsed sidebar, expanded sidebar, mobile drawer, keyboard navigation.
- Reveal: scroll behavior, above-fold eager section, reduced-motion.

## Intended Commit Split (user to commit)

1. `feat(main-nav): split Games row into link + caret toggle for /games navigation`
2. `feat(games-lobby): apply SectionReveal scroll-reveal to /games page sections`

## Validation

- `git diff --check` — clean
- `pnpm lint` — 0 errors
- `pnpm build` — 0 errors; /games and /games/[gameSlug] prerender
- `pnpm check:docs` — if triggered by docs-ownership map
- package.json / lockfile: unmodified

## Validation Results

| Check | Result |
|---|---|
| `git diff --check` | Clean — no whitespace errors |
| `pnpm lint` | 0 errors, 1 pre-existing warning (`onExpandRequest` unused in main-nav.tsx — existed before this task) |
| `pnpm build` | 0 errors; `/games` (Static) and `/games/[gameSlug]` (SSG ×4) prerender cleanly |
| `pnpm check:docs` | Passed — active task artifact satisfies docs-ownership check for games-lobby changes |
| package.json / lockfile | Unmodified |
| Files changed | Exactly 2 source files + task artifact; `nav-items.ts` untouched |

## Status

COMPLETE — awaiting user commits (two separate commits as noted above)
