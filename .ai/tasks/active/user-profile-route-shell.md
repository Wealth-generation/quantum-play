# Task Lifecycle Record

## Identity

- Task title: User profile route shell
- Status: active
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: feat/user-profile-route-shell
- Current branch at task start: feat/user-profile-route-shell
- Branch creation command/evidence:
  - User explicitly approved `feat/user-profile-route-shell`.
  - `git branch --show-current` reported `feat/user-profile-route-shell` before implementation.
  - No branch creation was needed in this session because the approved branch was already checked out.

## Scope

- Goal: Add a static, URL-tabbed `/user` route shell that provides stable destinations for the future authenticated profile dropdown.
- Non-goals:
  - TopBar dropdown, Points Shop, Affiliates, dropdown SVG assets.
  - Backend/user data, BFF/API routes, auth redirects or route guards.
  - Crypto wallets, statistics, private mode, reset password, mobile bottom navigation, dependencies.
- Approved scope:
  - `src/app/user/page.tsx`
  - `src/widgets/user-profile/**`
  - `docs/architecture/foundation-decisions.md`
  - This task artifact.
- Editable files:
  - `.ai/tasks/active/user-profile-route-shell.md`
  - `src/app/user/page.tsx`
  - `src/widgets/user-profile/user-profile.tsx`
  - `src/widgets/user-profile/index.ts`
  - `docs/architecture/foundation-decisions.md`
- Context-only files:
  - `AGENTS.md`, `CLAUDE.md`, `.claude/rules/**`, `.claude/skills/**`.
  - `src/app/layout.tsx`, `src/widgets/app-shell/app-shell.tsx`, `src/shared/ui/primitives/card.tsx`.
  - `src/features/auth/**`, `docs/architecture/auth.md`.
  - `.ai/context/profile-dropdown/ref-profile-page.jpg`.

## Source Of Truth

- Source-of-truth files inspected:
  - `AGENTS.md`, `CLAUDE.md`, `docs/architecture/foundation-decisions.md`, `docs/architecture/auth.md`.
  - Relevant `.claude/rules/**`, `docs/workflow/**`, and local implementation/UI-QA skills.
  - Existing route, App Shell, Card, and Next 16 local `page`/`searchParams` documentation.
- Architecture decisions:
  - `src/app/user/page.tsx` is a thin server route that resolves the Next 16 `searchParams` promise.
  - `src/widgets/user-profile/**` owns static presentational tab navigation and placeholders.
  - Missing, unknown, and repeated `tab` values resolve to `profile`.
  - The route has no auth guard and performs no data/API access.

## Impact

- Docs impact: required. `docs/architecture/foundation-decisions.md` has been updated to identify `/user` as a static, URL-tabbed shell; profile data/API work remains deferred.
- API boundary impact: none. No API, auth, session, or backend behavior changes.
- UI QA requirement: required for all supported URLs, query fallbacks, narrow layout, and unchanged App Shell/mobile navigation.
- Stack primitive checklist:
  - Route entrypoint remains thin.
  - Widget owns product UI; existing `Card`, Tailwind tokens, and `next/link` are reused.
  - No global state, client query state, form state, or new shared primitive is needed.

## Validation Plan

- Planned commands:
  - `git diff --check`
  - `pnpm lint`
  - `pnpm check:docs`
  - `pnpm validate` after the prior commands pass.
- Manual checks:
  - `/user`, all three supported tab URLs, invalid/repeated-tab fallback, narrow-width overflow, and unchanged App Shell/mobile navigation.
  - Scope, docs, and API-boundary review.
- Skipped checks and reasons:
  - Automated TDD is not applicable: `package.json` has no test script, the approved validation baseline prohibits inventing commands, and approved scope excludes test infrastructure.

## Evidence

- Commands run:
  - `git status --short --branch` and `git branch --show-current` confirmed the approved `feat/user-profile-route-shell` branch.
  - `git diff --check` passed.
  - `pnpm lint` passed with no errors. It reported one pre-existing warning in `src/widgets/main-nav/main-nav.tsx` for unused `onExpandRequest`.
  - `pnpm check:docs` passed.
  - Development-server route verification returned `200` and the expected selected placeholder for `/user`, each supported tab URL, an unknown tab, and repeated `tab=connections&tab=seed-history`.
  - Sandboxed `pnpm validate` failed at `pnpm build`: Google Font retrieval was sandbox-blocked and the existing Roulette renderer could not resolve `pixi.js`.
  - Approved escalated `pnpm validate` removed the font error but still failed at the existing unresolved `pixi.js` import in `src/games/roulette/renderer/pixi-roulette-ball-renderer.ts`.
- Review evidence:
  - Scope review: changed files are limited to the approved route, widget, foundation document, and task artifact.
  - Architecture review: the route only resolves a query parameter; the widget owns static UI. No new feature/entity/shared ownership was added.
  - API/state review: no `fetch`, `/api/*`, auth hook, route guard, client query state, or global state was introduced.
  - Documentation review: foundation documentation matches the implemented static shell and explicitly preserves deferred data/API work.
- Pre-commit evidence:
  - Not run: readiness is blocked by the unrelated repository build failure.
- UI QA evidence:
  - Server-rendered route verification confirmed all required destination and fallback states.
  - Human manual UI QA completed and passed for `/user`, `/user?tab=connections`, `/user?tab=bets-history`, and `/user?tab=seed-history`.
  - Human manual UI QA confirmed invalid and repeated `tab` values fall back to Profile.
  - Human manual UI QA confirmed narrow-width layout has no horizontal overflow, the App Shell remains intact, and mobile layout/navigation is unchanged.
- API boundary evidence:
  - No API/BFF, auth, session, backend URL, or data-fetching files changed.

## Risks And Handoff

- Risks:
  - The route is an authenticated-user destination but deliberately does not enforce authentication; route guarding needs separate approved auth scope.
  - Query-backed rendering is request-time dynamic in Next 16, as expected for `searchParams`.
- Handoff:
  - Implementation is complete within scope. Readiness remains blocked only by the existing unresolved Roulette `pixi.js` build dependency; no fix was attempted because it is outside this task.
- Lifecycle close notes:
  - Lifecycle close not requested.
