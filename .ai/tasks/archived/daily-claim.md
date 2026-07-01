# Task Lifecycle Record

## Identity

- Task title: Daily Claim BFF and Sidebar Integration
- Status: active
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: codex/daily-claim-bff
- Current branch at task start: develop
- Branch creation command/evidence: `git checkout -b codex/daily-claim-bff` -> switched to new branch `codex/daily-claim-bff`

## Current State

- Implementation and bugfix are complete on `codex/daily-claim-bff`.
- Human authenticated browser QA after the status normalization bugfix confirmed `GET /api/daily-claimer/status` no longer returns `502`.
- Human browser QA confirmed the Daily Claim UI works after the bugfix.
- Semantic review completed with recommendation `Approve`, risk level `Low`, and no blocking issues.
- Pre-commit readiness completed with status `Ready`.
- Remaining work before lifecycle actions: staging, commit, push, PR, merge, and artifact archival remain pending explicit user request.

## Scope

- Goal: Add authenticated Daily Claim functionality through local BFF routes, connect the existing sidebar card, show claim status/countdown, and refetch authoritative balance after successful claim.
- Non-goals: Do not refactor the app shell or main navigation beyond Daily Claim integration. Do not implement reference bottom mobile nav. Do not change TopBar balance architecture. Do not add optimistic balance updates. Do not add dependencies, Playwright, CI, hooks, scanners, game balance changes, staging, commits, pushes, PRs, merges, or artifact archival.
- Approved scope:
  - Add `GET /api/daily-claimer/status`.
  - Add `POST /api/daily-claimer/claim`.
  - Add feature-local Daily Claim client/query/types/ui under `src/features/daily-claim/**`.
  - Connect `src/widgets/main-nav/main-nav.tsx` to the feature without broad nav refactoring.
  - Update durable docs only if required by docs freshness.
- Forbidden scope: Browser calls to external backend, browser backend URL/token/cookie exposure, optimistic balance math, auth/session behavior changes, new dependencies, broad nav/app-shell restructuring, reference bottom mobile nav, and edits outside approved scope.
- Editable files:
  - `.ai/tasks/active/daily-claim.md`
  - `src/app/api/daily-claimer/status/route.ts`
  - `src/app/api/daily-claimer/claim/route.ts`
  - `src/features/daily-claim/**`
  - `src/widgets/main-nav/main-nav.tsx`
  - `docs/architecture/foundation-decisions.md` if required
  - `docs/architecture/auth.md` if required
  - `docs/design/design-source-audit.md` if required
- Context-only files:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.claude/rules/**`
  - `.claude/skills/**`
  - `docs/workflow/**`
  - `docs/architecture/**`
  - `.ai/context/daily-claim/**`
  - `src/app/api/_lib/**`
  - existing auth/session/refresh, user balance/profile, and game bet routes
  - `src/features/balance/**`
  - `src/widgets/top-bar/top-bar.tsx`

## Source Of Truth

- Source-of-truth files inspected:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/architecture/foundation-decisions.md`
  - `docs/architecture/auth.md`
  - `.claude/rules/index.md`
  - `.claude/rules/state-data-api-boundary.md`
  - `.claude/rules/quality-gates.md`
  - `.claude/rules/validation-workflow.md`
  - `docs/workflow/ai-development-flow.md`
  - `docs/workflow/task-lifecycle.md`
  - `docs/workflow/ownership-to-docs.md`
  - `scripts/docs-ownership-map.json`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md`
- Architecture decisions:
  - Browser code calls only local `/api/*`.
  - Backend URL, auth cookie forwarding, and token/session logic stay server-side/BFF.
  - `src/app/api/**` owns local BFF route handlers.
  - TanStack Query owns server state.
  - `src/features/balance` / `balanceQueryKey` is the authoritative displayed balance source.
  - Backend remains authoritative for wallet/balance; Daily Claim must not use optimistic balance updates.
- Relevant rules:
  - API boundary gate applies.
  - UI QA evidence gate applies.
  - Docs impact gate applies for new BFF and feature ownership.
  - Active task artifact gate applies because task lane is architecture-sensitive.
- Relevant skills:
  - `.claude/skills/implementation/SKILL.md`
  - `.claude/skills/api-boundary-check/SKILL.md`
  - `.claude/skills/documentation/SKILL.md`
  - `.claude/skills/ui-qa/SKILL.md`
  - `.claude/skills/review/SKILL.md`
  - `.claude/skills/pre-commit/SKILL.md`
  - `.agents/skills/ui-markup/SKILL.md`
  - `.agents/skills/responsive-layout/SKILL.md`

## Impact

- Docs impact: new Daily Claim BFF/feature/UI ownership is mapped/significant. Durable docs updated in `docs/architecture/foundation-decisions.md`, `docs/architecture/auth.md`, and `docs/design/design-source-audit.md`.
- API boundary impact: yes. New browser client must call only `/api/daily-claimer/*`; BFF route handlers proxy server-side to `/daily-claimer/*` with `access_token` cookie forwarding.
- UI QA requirement: yes. Check desktop expanded sidebar, desktop collapsed sidebar, and mobile drawer states for loading, unauthenticated, available, claimed/countdown, disabled/config-invalid, pending, and error states where practical.
- Stack primitive checklist:
  - Entrypoint thinness: `main-nav` should compose a feature component and avoid absorbing API logic.
  - Data ownership: Daily Claim status/mutation in TanStack Query.
  - Balance ownership: no duplicate balance state; use `balanceQueryKey`.
  - UI ownership: Daily Claim user action UI in `src/features/daily-claim`, composed by `src/widgets/main-nav`.
  - API ownership: route handlers in `src/app/api/daily-claimer/**`.

## Validation Plan

- Planned commands:
  - `git diff --check`
  - `pnpm check:docs`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm validate`
- Manual checks:
  - API boundary check through `.claude/skills/api-boundary-check/SKILL.md`
  - UI QA through `.claude/skills/ui-qa/SKILL.md`
  - Documentation impact check through `.claude/skills/documentation/SKILL.md`
  - Review through `.claude/skills/review/SKILL.md`
- Skipped checks and reasons:
  - TDD automated tests are not added because the repo has no test script and the approved editable scope does not include test infrastructure or test files.

## Evidence

- Evidence path: `.ai/context/daily-claim/`
- Expected evidence files:
  - `daily-claim-mobile.jpg`
  - `daily-claim-desktop.jpg`
  - `api-daily-claimer-status-responce.jpg`
  - `api-daily-claimer-status-request.jpg`
  - `api-claim-responce.jpg`
  - `api-claim-request.jpg`
  - `daily-claimer-before.jpg`
  - `daily-claimer-after.jpg`
- Commands run:
  - `git status --short --branch` -> `## develop...origin/develop`
  - `git branch --show-current` -> `develop`
  - `git checkout -b codex/daily-claim-bff` -> switched to new branch
  - `git diff --check` -> passed
  - `pnpm check:docs` -> passed
  - `pnpm lint` -> initial timeout at 120s; rerun surfaced countdown hook diagnostics; final rerun passed after fixes
  - `pnpm build` -> sandbox run failed on Google Font network fetch; network-enabled rerun surfaced a countdown type narrowing error; final rerun passed after fix
  - `pnpm validate` -> passed; ran `git diff --check`, `pnpm lint`, `pnpm build`, and `pnpm check:docs`
  - Pre-commit readiness `git status --short --branch` -> on `codex/daily-claim-bff`, no staged files, Daily Claim implementation/docs/task changes only.
  - Pre-commit readiness `git diff --check` -> passed.
  - Pre-commit readiness `pnpm validate` -> sandbox run failed at `next/font` Google Fonts fetch; network-enabled rerun passed.
- Bugfix evidence:
  - Observed issue from user: authenticated `GET /api/daily-claimer/status` returned `502` with `Daily Claim status response was invalid.`
  - Root cause: `normalizeDailyClaimStatus` required `nextClaimAt` to be a string and `secondsUntilNextClaim` to be present for every valid status, which rejects valid available/no-countdown backend states where `nextClaimAt` can be `null` or absent and countdown seconds can be absent/null.
  - Fix: status normalization now keeps booleans and `pointsAmount` strict, accepts valid date strings or `null`/absent `nextClaimAt`, normalizes absent/null `secondsUntilNextClaim` to `0`, rejects malformed countdown field types, and returns a stable browser-safe shape.
  - UI fix: Daily Claim countdown logic now treats only a future `nextClaimAt` or positive `secondsUntilNextClaim` as an actual countdown, so available state renders the claim button and no-countdown unavailable state does not render `0h:0m:0s`.
  - `git diff --check` -> passed after bugfix edits.
  - API boundary scan over `src/app/api/daily-claimer/status/route.ts` and `src/features/daily-claim/**` -> no browser external backend URL, `Authorization`, `Bearer`, or `refresh_token`; `access_token` appears only in the server route handler.
  - `pnpm validate` -> sandbox run failed at `next/font` Google Fonts fetch; network-enabled rerun passed.
  - Shell local status control: unauthenticated `GET http://localhost:3000/api/daily-claimer/status` returned `401 {"error":"Authentication required."}`.
  - Authenticated local status re-check: attempted through in-app browser so localhost cookies would be included, but browser page attachment/execution timed out twice. Could not independently verify an authenticated browser-cookie request in this environment.
  - Human authenticated browser QA re-check completed after bugfix: authenticated `GET /api/daily-claimer/status` no longer returned `502`.
  - Human UI QA re-check completed after bugfix: Daily Claim UI worked in browser after the normalization fix.
- API boundary evidence:
  - Browser Daily Claim client fetches only `/api/daily-claimer/status` and `/api/daily-claimer/claim`.
  - Browser auth retry uses the existing local `refreshAuthSingleFlight` path.
  - `rg` over changed Daily Claim source found no external backend URL, `Authorization`, `Bearer`, or `refresh_token` usage.
  - `access_token` appears only in the new server route handlers through `backendCookieHeader(["access_token"])`.
- UI QA evidence:
  - Affected screens are the desktop sidebar and mobile drawer through `src/widgets/app-shell/app-shell.tsx`.
  - Desktop expanded sidebar composes the new feature card in the existing 186px nav slot.
  - Desktop collapsed sidebar keeps the existing static Daily Claimer thumbnail.
  - Mobile drawer uses the expanded card through `MainNav collapsed={false}`.
  - Source-level state checks covered loading, unauthenticated, unavailable/error, available claim, pending claim, and countdown display branches.
  - Bugfix source-level state checks covered available status with no countdown fields, countdown status with future/positive countdown, and no-countdown unavailable fallback.
  - Human authenticated browser QA confirmed the Daily Claim UI works after the status normalization bugfix.
- Documentation evidence:
  - Durable architecture docs now list the Daily Claim BFF routes, feature ownership, safe browser payload boundary, and balance refetch/no-optimistic-balance decision.
  - Design audit now records that the Daily Claimer card was connected after the original static scaffold.
- Review evidence:
  - Semantic review mode: read-only.
  - Recommendation: Approve.
  - Risk level: Low.
  - Blocking issues: none.
  - BFF/API boundary: passed. Browser code calls only local `/api/daily-claimer/*`; backend URL and cookie forwarding stay server-side.
  - Balance ownership: passed. Claim success refetches `balanceQueryKey`; no optimistic `+pointsAmount` balance math or duplicated wallet state.
  - Feature ownership: passed. Daily Claim client/query/types/countdown/UI live under `src/features/daily-claim/**`; `main-nav` composes the feature.
  - UI ownership: passed. Expanded sidebar/mobile drawer use the feature card; collapsed sidebar keeps the static thumbnail; no app shell restructure found.
  - Docs/task artifact accuracy: passed. Durable docs reflect implemented behavior and the task artifact records implementation, bugfix, human QA, validation, residual risks, and pre-commit status.
  - Validation evidence reviewed and accepted.
  - Non-blocking suggestions:
    - Claim mutation failure UI could be improved later.
    - Countdown `aria-live` may be too chatty because it can announce every second.
  - Open questions: none for implementation; untested backend rate-limit and unexpected error-shape behavior remain runtime risks.
  - Residual risks: backend edge cases not covered by the human QA session, including rate-limit and unobserved error-shape behavior; safe fallback for `available: false` with no countdown; Google Fonts/network dependency can affect build validation in restricted environments.
- Pre-commit readiness notes: Ready. Validation evidence exists (`pnpm validate` passed after network-enabled rerun), API boundary evidence exists, UI/API human QA evidence exists, semantic review evidence exists, changed files match approved scope, no staged files exist, and no lifecycle actions have been performed. Staging, commit, push, PR, merge, and archive actions remain forbidden until explicitly requested.

## Decisions

- Balance refetch decision: after a successful claim, refetch/invalidate `balanceQueryKey` so `/api/user/balance` remains the source of truth.
- No optimistic update rationale: the claim response contains only `pointsAmount`, not authoritative current balance, and concurrent game rounds can mutate balance independently.
- Daily Claim status decision: after a successful claim, refetch Daily Claim status and derive the countdown from backend `nextClaimAt` / `secondsUntilNextClaim`.
- Durable-docs decision: updated foundation architecture route/feature ownership and design audit placeholder status instead of relying on a docs-not-needed rationale.

## Risks And Handoff

- Risks:
  - Backend may return unobserved error shapes for already-claimed, disabled config, or rate limiting.
  - If the backend returns `available: false`, `enabled: true`, `invalidConfig: false`, and no future/positive countdown, the card now shows a safe unavailable state.
  - `pnpm build` may be blocked by environment/network issues unrelated to this task.
  - Non-blocking UX polish remains available for claim mutation failure messaging and countdown live-region announcement behavior.
- Handoff:
  - Implementation and bugfix complete; human authenticated API/UI QA confirmed the reported `502` and UI regression are resolved.
  - Lifecycle actions remain pending explicit user request.
- Lifecycle close notes:
  - Do not archive unless explicitly requested.
