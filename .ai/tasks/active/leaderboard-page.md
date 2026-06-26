# Task: Leaderboard Page

**Date:** 2026-06-26
**Branch mode:** PR-mode / continuing existing task branch
**Base branch:** develop
**Task branch:** feat/leaderboard-page (pre-existing)
**Current branch at task start:** feat/leaderboard-page
**Skill:** implementation

---

## Goal

Create the `/leaderboard` page as a static, UI-only pass 1:
- full page widget composition under `src/widgets/leaderboard/**`
- thin App Router route entry at `src/app/leaderboard/page.tsx`
- no API, BFF, Zustand, query hooks, or CTA/auth wiring

---

## Scope

### Editable files

| File | Change |
|---|---|
| `src/app/leaderboard/page.tsx` | New thin route entry |
| `src/widgets/leaderboard/index.ts` | New widget public export |
| `src/widgets/leaderboard/leaderboard-page.tsx` | New page composition |
| `src/widgets/leaderboard/leaderboard-data.ts` | New static data/types module |
| `src/widgets/leaderboard/leaderboard-hero.tsx` | New hero/podium section |
| `src/widgets/lobby/leaderboard-section.tsx` | Shared source implementation reused by leaderboard hero |
| `src/widgets/lobby/countdown-timer.tsx` | Shared countdown component updated after Figma audit |
| `src/widgets/leaderboard/countdown-banner.tsx` | New client countdown wrapper |
| `src/widgets/leaderboard/leaderboard-cta.tsx` | New centered disabled CTA |
| `src/widgets/leaderboard/leaderboard-table.tsx` | New semantic table section |
| `src/widgets/leaderboard/rules-accordion.tsx` | New rules/eligibility accordion |
| `.ai/tasks/active/leaderboard-page.md` | Active task artifact |

### Context-only files

- `src/widgets/lobby/leaderboard-card.tsx`
- `src/widgets/lobby/countdown-timer.tsx`
- `src/shared/ui/primitives/button.tsx`
- `src/shared/ui/primitives/collapsible.tsx`
- `src/app/globals.css`
- `docs/architecture/foundation-decisions.md`
- `docs/architecture/auth.md`

---

## Interface Notes

- `LeaderboardCard` expects `reward`, not `prize`. The new widget keeps the requested `prize` field in static data and maps it to `reward` at the callsite.
- `CountdownTimer` accepts `{ days, hours, minutes, iconClass }`, not a target date. The new countdown wrapper stores a stable target date per mount, derives the initial duration from it, and passes those values into the existing timer component.
- `CountdownTimer` now supports two visual modes: `pill` preserves the existing bonus-card timer, and `card` matches the audited Figma leaderboard countdown component.
- `LeaderboardCard` does not accept avatar/trophy asset props; it uses its own internal asset mapping by `place`.
- `LeaderboardHero` now reuses the lobby leaderboard section layout directly. The intentional remaining difference is `showAction={false}` because the `/leaderboard` page already has a separate CTA section immediately below the hero.

---

## Non-goals

- Backend countdown authority
- CTA auth integration
- BFF/API mapping
- Shared table primitive
- New dependencies
- Lobby leaderboard visual regressions

---

## Docs Impact

Docs-not-needed rationale: this pass adds a new static page widget and route within existing `src/app` and `src/widgets` ownership. It does not introduce a new architecture boundary, BFF route, state layer, or durable product contract beyond a UI-only composition.

## API Boundary Impact

None. No browser API calls, no `/api/*` additions, and no backend exposure.

## UI QA Impact

Manual UI QA is required for:
- hero parity between `/` and `/leaderboard`
- countdown parity with Figma node `4775:128527`
- hero podium ordering across mobile and `md+`
- countdown banner render and live ticking
- table layout readability on narrow screens
- accordion default-open first item and chevron rotation

## Validation

`pnpm validate` — passed.
- `git diff --check`: clean
- `pnpm lint`: passed with 1 pre-existing unrelated warning in `src/widgets/main-nav/main-nav.tsx` (`onExpandRequest` unused)
- `pnpm build`: passed; `/leaderboard` generated successfully as a static route
- `pnpm check:docs`: passed

## UI QA Evidence

Manual/browser checks completed against `http://127.0.0.1:3000/leaderboard`:
- desktop/default viewport: hero heading present; podium rendered as place 2 left, place 1 center, place 3 right
- mobile `390x844`: cards stack cleanly; heading/subtitle fit; CTA remains disabled
- rules accordion: `Rules` trigger rendered with `data-state="open"` by default
- Figma countdown audit follow-up: leaderboard countdown renders at `288x138`, matching the Figma component frame size; card layout now includes the internal label and four time cells (`D/H/M/S`)
- preserved legacy usage: lobby bonus cards continue using the existing compact pill countdown path through the shared component

## Review Result

Pass. Changes stay within approved widget/route scope, preserve the local `/api/*` boundary by making no API calls, and do not introduce new state ownership or shared primitives.
