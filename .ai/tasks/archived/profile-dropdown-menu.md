# Task Lifecycle Record

## Identity

- Task title: Desktop authenticated profile dropdown menu
- Status: active
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: feat/profile-dropdown-menu
- Current branch at task start: feat/profile-dropdown-menu
- Branch creation command/evidence:
  - User explicitly approved `feat/profile-dropdown-menu`.
  - `git branch --show-current` reported `feat/profile-dropdown-menu` before implementation.

## Scope

- Goal: Add a desktop-only authenticated TopBar profile menu that links to the existing `/user` route shell and reuses logout unchanged.
- Non-goals:
  - Mobile layout/navigation, TopBar balance behavior, user route changes, Points Shop, Affiliates, and dropdown SVG content changes.
  - Auth/session/API/BFF contracts, route creation, dependencies, or new shared primitives.
- Approved scope:
  - `src/widgets/top-bar/top-bar.tsx`
  - `public/images/profile.svg`
  - `public/images/connections.svg`
  - `public/images/bet-history.svg`
  - `public/images/seed-history.svg`
  - `public/images/logout.svg`
  - This task artifact.
- Editable files:
  - `.ai/tasks/active/profile-dropdown-menu.md`
  - `src/widgets/top-bar/top-bar.tsx`
  - The five approved `public/images/*.svg` assets, included without content edits.
- Context-only files:
  - `src/shared/ui/primitives/popover.tsx`
  - `src/features/auth/model/auth-session.ts`
  - `src/features/auth/api/auth-client.ts`
  - `src/app/user/page.tsx`
  - `src/widgets/user-profile/**`
  - `.ai/context/profile-dropdown/ref-profile-dropdown.mp4`
  - `.ai/context/profile-dropdown/ref-profile-page.jpg`

## Source Of Truth

- Source-of-truth files inspected:
  - `AGENTS.md`, `CLAUDE.md`, `docs/architecture/foundation-decisions.md`, `docs/architecture/auth.md`.
  - Relevant `.claude/rules/**`, implementation/UI-QA skills, and TopBar/Popover/auth source.
- Architecture decisions:
  - `src/widgets/top-bar/top-bar.tsx` owns this product-specific desktop menu.
  - The existing shared Popover wrapper provides trigger, outside-click, Escape, and viewport-aware positioning behavior.
  - Existing `useLogoutMutation()` is called unchanged; menu state remains local to Popover.

## Impact

- Docs impact: not needed. Docs-not-needed rationale: `src/widgets/top-bar/top-bar.tsx` only adds local desktop navigation presentation while preserving the documented auth-session and logout ownership in `docs/architecture/auth.md`; no auth, session, API, or app-shell contract changes.
- API boundary impact: none. No new fetches, BFF routes, or auth-client changes.
- UI QA requirement: desktop trigger/menu interaction and mobile regression checks are required.
- Stack primitive checklist:
  - Existing Popover, Button, Image, Link, Motion, and Tailwind tokens are reused.
  - No new shared primitive, global state, or feature module is needed.

## Validation Plan

- Planned commands:
  - `git diff --check`
  - `pnpm lint`
  - `pnpm check:docs`
  - `pnpm validate` for readiness awareness.
- Manual checks:
  - Desktop open/close, outside-click, Escape, hover, links, logout, right-edge positioning, and unchanged mobile navigation.
- Skipped checks and reasons:
  - Automated TDD is not applicable: the repository has no test script and approved scope excludes test infrastructure.

## Evidence

- Commands run:
  - Verified `feat/profile-dropdown-menu`, `src/app/user/page.tsx`, and all five approved SVG assets before editing.
  - `git diff --check` passed.
  - `pnpm lint` passed with no errors; it reports the existing unrelated unused `onExpandRequest` warning in `src/widgets/main-nav/main-nav.tsx`.
  - `pnpm check:docs` passed and recognized this artifact's `src/widgets/top-bar/top-bar.tsx` docs-not-needed rationale.
  - Approved escalated `pnpm validate` ran `git diff --check` and lint successfully, then failed only at the existing unresolved `pixi.js` import in `src/games/roulette/renderer/pixi-roulette-ball-renderer.ts`.
  - Final `git diff --check`, `pnpm lint`, and `pnpm check:docs` passed; lint still reports only the existing unrelated `main-nav.tsx` warning.
- Review evidence:
  - Scope and architecture review passed: only approved TopBar, task artifact, and supplied SVG files changed; no auth/API/balance/mobile-navigation scope leak exists.
  - The desktop menu uses the existing Popover primitive and `useLogoutMutation()` unchanged. Mobile retains the original Lucide logout glyph and controls.
- Pre-commit evidence:
  - Current-task pre-commit review confirmed branch/task-branch match, approved changed-file scope, docs-not-needed rationale, API-boundary evidence, and completed manual UI QA.
  - A fresh full `pnpm validate` attempt did not complete and was stopped; the prior completed escalated run remains the current validation evidence and failed only at the unrelated Roulette/Pixi build error.
- UI QA evidence:
  - Source review: desktop-only `lg:flex` Popover trigger/content replace the desktop username/logout area; existing mobile username, bell, and logout controls remain `lg:hidden`.
  - Source review: the existing Radix Popover wrapper supplies outside-click and Escape dismissal plus collision-aware end alignment; Motion supplies the reduced-motion-aware opening offset animation.
  - Human authenticated UI QA completed and passed: the desktop menu opens under the profile trigger; outside click and Escape close it; hover transitions work; and right-edge positioning has no clipping.
  - Human authenticated UI QA confirmed Profile, Connections, Bet History, and Seed History target the approved `/user` URLs; Logout retains existing behavior; and mobile layout/navigation remains unchanged.
- API boundary evidence:
  - No new fetch, `/api/*`, auth-client, route, or balance projection/query changes. Logout continues to call the existing `useLogoutMutation()`.

## Risks And Handoff

- Risks:
  - Readiness may remain blocked by the existing unresolved Roulette `pixi.js` build dependency.
- Handoff:
  - Implementation and authenticated UI QA are complete. Readiness remains blocked only by the existing Roulette/Pixi build failure.
- Lifecycle close notes:
  - Lifecycle close not requested.
