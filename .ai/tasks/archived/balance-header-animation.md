# Task Lifecycle Record

## Identity

- Task title: Balance Header Animation
- Status: active; implementation complete; final review and authenticated/manual UI QA pending
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: codex/balance-header-animation
- Current branch at task start: codex/plinko-animation-redesign (clean)
- Branch creation command/evidence:
  - `git status --short --branch` confirmed a clean `codex/plinko-animation-redesign` worktree.
  - `git switch develop` then `git pull --ff-only origin develop` confirmed `develop` is at `origin/develop` (`e97f544`).
  - `git switch -c codex/balance-header-animation` created the dedicated task branch from `develop`; a subsequent `git switch develop`, fast-forward pull, and switch back reconfirmed the base.

## Scope

- Goal: add shared balance-display event semantics and a TopBar-local digit-roll animation for Dice and Plinko debit/settlement updates.
- Non-goals: new BFF/API routes, endpoint or payload-shape changes, wager/result authority, auth/session, dependencies, Keno/Roulette, global formatting policy, a global wallet ledger, unrelated TopBar redesign, and lifecycle actions.
- Approved scope: display-only Dice debit projection with authoritative reconciliation; preserve Plinko projection/settlement behavior; publish typed balance events; TopBar-local Motion animation; durable architecture documentation; route-local Plinko money-contract enforcement for request `betSize` and returned `betSize`/`payout`.
- Forbidden scope: new API routes/contracts, game-specific visual components, shared UI primitives, new stores/query hooks, generic cross-game balance ledger, and unrelated refactors.
- Editable files:
  - `.ai/tasks/active/balance-header-animation.md`
  - `docs/architecture/foundation-decisions.md`
  - `src/features/balance/types/balance-types.ts`
  - `src/features/balance/model/balance-display-projection.ts`
  - `src/features/balance/index.ts`
  - `src/widgets/top-bar/top-bar.tsx`
  - `src/widgets/top-bar/animated-balance-value.tsx` (new)
  - `src/games/dice/model/dice-query.ts`
  - `src/games/dice/model/use-dice-game-controller.ts`
  - `src/games/plinko/model/use-plinko-manual-betting.ts`
  - `src/games/plinko/lib/plinko-money.ts`
  - `src/games/plinko/model/plinko-types.ts`
  - `src/app/api/games/plinko/bet/route.ts`
- Context-only files:
  - `AGENTS.md`, `CLAUDE.md`, architecture/workflow docs, and `.claude/rules/**`
  - `package.json`, `scripts/docs-ownership-map.json`
  - `src/features/balance/model/balance-query.ts`, `src/features/balance/api/balance-client.ts`
  - Dice/Plinko bet clients and types outside the listed Plinko request type
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/widgets/lobby/flip-digit.tsx`

## Source Of Truth

- Source-of-truth files inspected: `AGENTS.md`, `CLAUDE.md`, `docs/architecture/foundation-decisions.md`, `docs/workflow/**`, `package.json`, current balance, TopBar, Dice, Plinko, and Motion source.
- Architecture decisions: canonical balance remains TanStack Query/backend authoritative; feature-level metadata contains display intent; TopBar owns presentation; Dice and Plinko publish intent only.
- Relevant rules: AI workflow, project structure, design-system foundation, state/data/API boundary, game frontend architecture, quality gates, validation workflow, and Git lifecycle.
- Relevant skills: audit, implementation, documentation, UI QA, API-boundary check, review, and pre-commit.

## Impact

- Docs impact: update `docs/architecture/foundation-decisions.md` because this extends the shared balance-display contract across two implemented games and TopBar.
- API boundary impact: route shape and browser-to-backend topology are unchanged; browser still calls local `/api/*` and backend access remains server-side. The Plinko BFF now normalizes or rejects money-like values at that boundary.
- UI QA requirement: yes; TopBar animation, feedback, responsiveness, reduced motion, and accessibility require manual evidence.
- Stack primitive checklist: TopBar remains a client widget; balance query remains server-state owner; display projection/event state stays in the existing balance feature; Motion is reused for animation; no form/state-library or shared primitive change applies.

## Validation Plan

- Planned commands: `git diff --check`, `pnpm lint`, `pnpm build`, `pnpm check:docs`, `pnpm validate`.
- Manual checks: Dice manual/AutoBet; Plinko manual/AutoBet/burst/watchdog; desktop/compact layout; reduced motion; screen-reader-facing DOM; feedback reset and reconciliation.
- Skipped checks and reasons: the repository has no test script/test runner, and scope forbids adding test infrastructure; automated test-first validation is unavailable.

## Evidence

- Commands run:
  - `git diff --check` passed.
  - `pnpm lint -- src/widgets/top-bar/animated-balance-value.tsx src/widgets/top-bar/top-bar.tsx src/features/balance src/games/dice/model/dice-query.ts src/games/dice/model/use-dice-game-controller.ts src/games/plinko/model/use-plinko-manual-betting.ts` passed.
  - `pnpm check:docs` passed with mapped durable documentation evidence.
  - `pnpm lint -- src/app/api/games/plinko/bet/route.ts src/games/plinko/lib/plinko-money.ts src/games/plinko/model/plinko-types.ts` passed.
  - Full `pnpm lint` failed on 28 pre-existing errors and 1,748 warnings in `.ai/context/plinko-mvp/js/**`, plus the existing `src/widgets/main-nav/main-nav.tsx` warning; no changed-file lint error remained after the targeted check.
  - `pnpm build` was blocked before project type verification by the existing Google Outfit network fetch and missing `matter-js` / `pixi.js` modules imported by untouched Plinko renderer source.
  - `pnpm validate` failed at the same pre-existing full-lint failures before it could reach build/docs checks.
  - P1 remediation: the Plinko BFF is the owner of money-format enforcement. Request `betSize` accepts fixed-decimal strings only (for example `100`, `100.50`, `0.0001`) and rejects JSON numbers, exponent, hexadecimal, binary, octal, signed, empty, `Infinity`, `NaN`, and malformed formats. Returned `betSize` and `payout` are normalized fixed decimals before browser settlement or rejected through the existing invalid-response path. `comparePlinkoDecimal()` compares normalized fixed-decimal money strings only; break-even omits `outcome`.
  - Documentation impact: not needed for `src/app/api/games/plinko/bet/route.ts`, `src/games/plinko/lib/plinko-money.ts`, or `src/games/plinko/model/plinko-types.ts`; this hardens the existing Plinko BFF contract without adding a route, browser boundary, state owner, or payload shape.
- Review evidence: the focused comparator review identified the BFF/comparator money-contract P1. This route-local remediation requires a final read-only review; TopBar remains the only visual owner, and Dice and Plinko publish feature-level metadata only. Remaining risk is unverified runtime behavior because full validation and authenticated UI QA are blocked.
- Pre-commit evidence: blocked; full validation and required manual UI evidence are incomplete.
- UI QA evidence: Browser plugin connection was initialized and the local development server listened on port 3000, but in-app browser navigation stalled before a DOM/screenshot could be captured. Authenticated Dice/Plinko bet flows remain unverified.
- API boundary evidence: the existing Plinko BFF route now enforces the approved fixed-decimal money contract for request `betSize` and returned `betSize`/`payout`; no browser request, route, endpoint, backend URL, auth/session/token logic, or API client changed.

## Risks And Handoff

- Risks: projection/event ordering under rapid bets; preserving Plinko settlement/watchdog behavior; verifying BFF rejection of non-money input and normalization/rejection of backend money values; reconciling Dice display-only projections without overwriting canonical balance; compact authenticated layout still requires manual QA; full repository validation remains unavailable.
- Handoff: do not stage, commit, push, open a PR, merge, delete branches, or archive this artifact without an explicit request.
- Lifecycle close notes: not requested.
