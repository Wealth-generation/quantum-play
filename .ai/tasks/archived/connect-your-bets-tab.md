# Task: Connect Your Bets Tab

## Current State

- Status: implementation complete; pre-commit readiness requested.
- Branch mode: PR-mode.
- Base branch: develop.
- Task branch: codex/connect-your-bets-tab.
- Current branch at task start: develop.
- Branch creation evidence:
  - User explicitly confirmed creating and switching to `codex/connect-your-bets-tab` from clean `develop`.
  - `git status --short --branch` before branch creation reported `## develop...origin/develop`.
  - Sandboxed `git checkout -b codex/connect-your-bets-tab` failed because Git ref creation was blocked.
  - Approved escalated `git checkout -b codex/connect-your-bets-tab` succeeded.
  - `git status --short --branch` after branch creation reported `## codex/connect-your-bets-tab`.

## Goal

Connect the existing `Your bets` tab in `BetLive` to authenticated own-bets data from `GET /api/user/bets`.

## Required Behavior

- `/games`: `Your bets` shows authenticated user's own bets across all four games.
- `/games/[gameSlug]`: `Your bets` shows authenticated user's own bets only for the current game.
- Unauthenticated users keep the existing `Log in to see your bets.` message.
- Preserve the existing tab label/casing and tab behavior.
- No pagination UI.
- Preserve existing BetLive table style, row layout, loading, empty, and error patterns where applicable.
- Preserve lobby/game table difference: lobby shows Time; game detail hides Time.

## Scope

### Editable Files

- `.ai/tasks/active/connect-your-bets-tab.md`
- `src/widgets/bet-live/bet-live-client.ts`
- `src/widgets/bet-live/bet-live.tsx`
- `src/widgets/game-detail/game-detail-shell.tsx`
- `docs/architecture/foundation-decisions.md`

### Context-Only Files

- `src/app/api/user/bets/route.ts`
- `src/features/user-profile/**`
- `src/features/auth/**`
- `src/app/games/**`
- `src/entities/game/model/games.ts`
- `docs/workflow/ownership-to-docs.md`
- `scripts/docs-ownership-map.json`
- `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md`

### Non-Goals

- No new BFF routes.
- No backend URL calls from browser code.
- No auth/session helper refactor.
- No profile table redesign.
- No BetLive table redesign.
- No pagination controls.
- No realtime/socket behavior.
- No game module changes.
- No tab rename or intentional label casing change.
- No broad shared bet abstraction unless implementation proves it necessary.

## Source Of Truth

- Latest audit result in the Codex thread.
- `CLAUDE.md`.
- `docs/architecture/foundation-decisions.md`.
- `docs/architecture/auth.md`.
- `.claude/rules/**`.
- `.claude/skills/implementation/SKILL.md`.
- `.claude/skills/api-boundary-check/SKILL.md`.
- `.claude/skills/documentation/SKILL.md`.
- `.claude/skills/ui-qa/SKILL.md`.
- `.claude/skills/review/SKILL.md`.
- `.agents/skills/ui-markup/SKILL.md`.
- `.agents/skills/responsive-layout/SKILL.md`.

## Architecture Decisions

- `src/widgets/bet-live/**` remains the owner of the BetLive widget, public tab fetches, and Your bets UI integration.
- Existing `GET /api/user/bets` remains the only own-bets BFF route used by the browser.
- Own-bets mapping stays BetLive-local unless a broader repeated-use need appears.
- Auth state uses the existing `useAuthSession()` query.
- Local `401` retry uses the existing `refreshAuthSingleFlight()` pattern without modifying auth/session internals.
- Game detail passes the current `game.slug` to BetLive so BetLive can map it to the audited backend `thedoctor_*` slug.

## Stack Primitive Checklist

- Thin app routes remain unchanged.
- Page shell ownership remains in `src/widgets/game-detail/**` and `src/widgets/games-lobby/**`.
- Server state remains TanStack Query.
- Browser code calls only local `/api/*`.
- UI uses existing Tailwind token classes, existing Motion row animation, and existing BetLive table primitives.
- No shared primitive, new dependency, route handler, store, renderer, or game module is introduced.

## Impact

- Docs impact: required. `docs/architecture/foundation-decisions.md` currently records Live Bets `Your` tab integration as deferred and must be updated.
- API boundary impact: required. Browser data fetching changes to authenticated local `/api/user/bets`.
- UI QA impact: required. Visible authenticated/unauthenticated tab behavior changes on `/games` and each game detail page.
- Test/TDD note: package.json has no test script, and the repo validation baseline forbids inventing test tooling. Verification will use existing validation commands plus manual source/UI/API checks.

## Validation Plan

- `git diff --check`
- `pnpm lint`
- `pnpm build`
- `pnpm check:docs`
- `pnpm validate`
- Manual API boundary check.
- Manual source/UI QA check for `/games`, `/games/dice`, `/games/keno`, `/games/plinko`, `/games/roulette` on desktop/mobile states where possible.
- Read-only review before final handoff.

## Risks

- Backend game slug contract is assumed from audited BFF route validation and human UI QA: `thedoctor_dice`, `thedoctor_keno`, `thedoctor_plinko`, `thedoctor_roulette`.
- Own-bets response lacks a backend multiplier; the multiplier is derived display-only from `payout / betSize`.

## Implementation Evidence

- `src/widgets/bet-live/bet-live-client.ts`
  - Added BetLive-local own-bets DTOs matching `GET /api/user/bets`.
  - Added stable own-bets query key with session user id, page, take, and optional backend game slug.
  - Added frontend-to-backend game slug mapping for the four existing games.
  - Added authenticated local `/api/user/bets` fetch with one local `401` refresh through `refreshAuthSingleFlight()`.
- `src/widgets/bet-live/bet-live.tsx`
  - Uses the existing `useAuthSession()` state.
  - Keeps unauthenticated `Your bets` behavior/message unchanged.
  - Maps public live bets and own bets into a BetLive-local table row shape.
  - Derives own-bet multiplier from `payout / betSize` for display only.
  - Reuses existing table, loading, empty, and error patterns.
- `src/widgets/game-detail/game-detail-shell.tsx`
  - Passes the current `game.slug` into `BetLive` for game-scoped own-bets filtering.
- `docs/architecture/foundation-decisions.md`
  - Records the implemented `Your bets` integration and removes it from deferred Live Bets scope.

## Validation Evidence

- `git diff --check`: passed.
- `pnpm lint`: passed with one existing warning in `src/widgets/main-nav/main-nav.tsx` for unused `onExpandRequest`.
- `pnpm build`: passed after rerunning outside the sandbox because Next/font needed network access for Google Fonts.
- `pnpm check:docs`: passed.
- `pnpm validate`: passed after rerunning outside the sandbox for the same Next/font network requirement.

## API Boundary Check

- Browser code added only local `/api/user/bets` calls.
- The only auth retry path uses the existing local `refreshAuthSingleFlight()` helper and local `/api/auth/refresh`.
- No BFF route handlers, auth/session internals, external backend URLs, backend cookies, or token handling were changed.
- Existing `src/app/api/user/bets/route.ts` contract was inspected and matches the BetLive-local DTO.

## UI QA Evidence

- Human orchestrator manual browser QA was completed and passed.
- Human UI QA verified:
  - `Your Bets` works.
  - Existing styles are preserved.
  - `/games/[gameSlug]` correctly shows own bets only for the specific game.
  - Game-specific filtering works as expected.
  - No visual/style regression was observed.
- Agent/browser automation UI QA was not required and is not the source of truth for this check.
- Static route reachability through the local dev server passed for:
  - `/games`
  - `/games/dice`
  - `/games/keno`
  - `/games/plinko`
  - `/games/roulette`
- Source/UI checks confirmed:
  - The tab label remains `Your bets`.
  - `/games` passes no game filter.
  - `/games/[gameSlug]` passes the current game slug to BetLive and maps it to the route-supported backend slug.
  - Lobby BetLive keeps the Time column; game-detail BetLive keeps Time hidden.
  - Existing table row style, empty state, loading state, and unauthenticated message are reused.

## Review Notes

- No scope expansion found in changed files.
- No game modules, BFF routes, auth/session internals, table redesign, pagination, or tab naming were touched.
- Source implementation review approved the code with a non-blocking request to record the human UI QA evidence; this artifact now records that evidence.
