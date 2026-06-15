# Task Lifecycle Record

## Identity

- Task title: Roulette game module — first slice (shell + real bets, minimal)
- Status: In progress (implementation)
- Mode: Implementation
- Branch mode: PR-mode
- Base branch: `codex/game-action-shell-foundation` (NON-STANDARD — stacked on the Game Action Shell branch, not `develop`, because its contracts are not yet in `develop`)
- Task branch: `feat/roulette-game` (pre-existing; not created by this task)
- Current branch at task start: `feat/roulette-game`
- Branch creation command/evidence: none — branch already existed before this task. No branch was created or switched. Constraint: this roulette PR must NOT merge into `develop` until the Game Action Shell base merges first.

## Scope

- Goal: Implement deliverable #7 of the roulette audit — the smallest playable vertical: place chips (color + straight only) → send bet to local BFF → reveal winning number statically → refresh shared balance. Mirror the Dice pattern (structure, not logic).
- Non-goals:
  - Animated wheel and the `renderer/` layer.
  - Provably Fair UI/verify; do NOT flip `game-action-config.ts` roulette `provablyFair:false`. Do NOT reuse Dice verify (limit mismatch).
  - Full board (all 10 bet types) — color + straight only this slice (other 8 arrays sent empty).
  - Turbo, Max Bet (keep hidden), volume/audio.
  - Any reliance on `multiplier` for multi-bet payout math.
  - Browser → backend direct calls (browser hits local `/api/*` only).
  - No commit / push / PR / merge / branch creation.
- Approved scope: new `src/games/roulette/**` module, one new BFF route `src/app/api/games/roulette/bet/route.ts`, route wiring in `src/app/games/[gameSlug]/page.tsx`, durable docs update in `docs/architecture/foundation-decisions.md`.
- Forbidden scope: editing Game Action Shell / colleague files (read+reuse only), config BFF route (backend has none), any other game module, shared primitives, auth.
- Editable files:
  - `src/games/roulette/config/roulette-defaults.ts` (new)
  - `src/games/roulette/lib/roulette-decimal.ts` (new — game-local BigInt decimal, NOT Big.js; see conflict note in Risks)
  - `src/games/roulette/lib/roulette-bets.ts` (new)
  - `src/games/roulette/lib/roulette-storage.ts` (new)
  - `src/games/roulette/model/roulette-types.ts` (new)
  - `src/games/roulette/model/roulette-client.ts` (new)
  - `src/games/roulette/model/roulette-query.ts` (new)
  - `src/games/roulette/model/roulette-store.ts` (new)
  - `src/games/roulette/model/use-roulette-game-controller.ts` (new)
  - `src/games/roulette/ui/roulette-game.tsx` (new)
  - `src/games/roulette/ui/roulette-table.tsx` (new)
  - `src/games/roulette/ui/roulette-chip-tray.tsx` (new)
  - `src/games/roulette/ui/roulette-result.tsx` (new)
  - `src/games/roulette/index.ts` (new)
  - `src/app/api/games/roulette/bet/route.ts` (new)
  - `src/app/games/[gameSlug]/page.tsx` (edit — render `<RouletteGame/>` for slug `roulette`)
  - `docs/architecture/foundation-decisions.md` (edit — durable docs)
- Context-only files: `src/games/dice/**`, `src/app/api/games/dice/**`, `src/app/api/_lib/**`, `src/features/balance/**`, `src/features/provably-fair/**`, `src/widgets/game-detail/**`, `src/entities/game/model/**`, `src/shared/ui/primitives/**`, `src/app/globals.css`.

## Source Of Truth

- Source-of-truth files inspected: `docs/architecture/foundation-decisions.md`, `.claude/rules/**`, `src/app/api/games/dice/bet/route.ts`, `src/app/api/_lib/{auth-backend,auth-cookies}.ts`, `src/games/dice/**`, `src/features/balance/**`, `src/widgets/game-detail/**`, `package.json` (big.js ^7, zustand ^5, @tanstack/react-query ^5).
- Architecture decisions: backend authoritative for outcome/payout; browser → local `/api/*` only; Zustand owns local game state; Big.js for decimal-safe UI; game modules must not import other game modules.
- Relevant rules: game-frontend-architecture, state-data-api-boundary, design-system-foundation, project-structure, quality-gates, git-lifecycle.
- Relevant skills: implementation (this), api-boundary-check, documentation, ui-qa, review, pre-commit.

## Impact

- Docs impact: BLOCKING. `src/games/**`, `src/app/api/games/**`, and `src/features/**` (Zustand store is first such use) map to `docs/architecture/foundation-decisions.md`. First roulette module + new roulette BFF route = new architectural-pattern instance → durable docs updated.
- API boundary impact: New local BFF route `POST /api/games/roulette/bet` only. Backend URL + auth cookies stay server-side via `_lib` helpers. No config route. Manual api-boundary check required at review.
- UI QA requirement: BLOCKING — new table/chip UI, result reveal, responsive + fullscreen-portal behavior. ui-qa evidence required at review.
- Stack primitive checklist:
  - Entrypoint thinness: `[gameSlug]/page.tsx` stays thin (renders `<RouletteGame/>`).
  - Orchestration: `use-roulette-game-controller.ts`.
  - Component split: table / chip tray / result / game shell.
  - Data/state/form ownership: TanStack Query (bet mutation + shared balance), Zustand (chip placement, runtime source of truth), no RHF (no form drafts).
  - Project primitives: reuse `Button`, `cn`, design tokens; reuse `features/balance`, `features/auth`. No new shared primitive.

## Validation Plan

- Planned commands: `pnpm validate` (git diff --check, lint, build, check:docs).
- Manual checks: scope check vs editable list; documentation impact check; API boundary check; UI QA evidence.
- Skipped checks and reasons: no test runner / Playwright exists in repo — none claimed.

## Evidence

- Commands run:
  - `git diff --check` → exit 0.
  - `pnpm lint` → exit 0.
  - `pnpm build` → exit 0; route `ƒ /api/games/roulette/bet` and `● /games/roulette` (SSG) present in route manifest.
  - `pnpm check:docs` → "Docs freshness check passed"; mapped `src/games/**`, `src/app/api/games/**`, `src/app/games/**` changes matched durable docs change in `foundation-decisions.md`.
  - Runtime smoke (live dev server): `GET /games/roulette` → 200 (renders Spin / Total bet / Clear bets / "Sign in to place a bet"); `POST /api/games/roulette/bet` no auth → 401; `POST` with cookie + incomplete `params` → 400; `GET /games/keno` → 200 "coming soon" (placeholder regression guard passed).
- Review evidence: (pending review skill)
- Pre-commit evidence: (pending pre-commit skill)
- UI QA evidence: runtime SSR render confirmed via HTTP + accessibility text; browser-preview MCP could not hold a server on this Windows host (next dev single-instance lock) — visual screenshot not captured. Full ui-qa skill pass still pending.
- API boundary evidence: browser calls only `/api/games/roulette/bet`; backend URL + `access_token` cookie handled server-side via `_lib`; 401/400 gates verified at runtime. Manual api-boundary-check skill still pending.

## Risks And Handoff

- Risks:
  - PROMPT/SKILL CONFLICT (flagged): prompt asked for "Big.js wrappers", but `big.js` ships no types and `@types/big.js` is not installed → strict-build failure; adding it is approval-gated (Dependency/Security Approval Gate). Resolved by following the Dice precedent (hand-rolled game-local BigInt decimal in `roulette-decimal.ts`, re-derived, not importing Dice). No dependency added. If the team prefers literal Big.js, approve `@types/big.js` and the helper can be swapped behind its stable API.
  - `colorValues` entry shape/color encoding NOT specified in the supplied contract (only `straightValues` shape was given). Implemented as `{ color: "RED" | "BLACK", amount }`, isolated in `roulette-defaults.ts` (`ROULETTE_COLOR_CODES`) + the mapper, so it is a one-line fix. MUST be verified against a captured color sample before relying on real bets.
  - `multiplier` semantics for mixed multi-bet unconfirmed → result/winnings derived from authoritative `payout` string only; `multiplier` shown for display, never used for math.
  - Zustand store is the first in the repo (new pattern); persisted via localStorage as a persistence layer only.
  - No backend config endpoint → min/max bet, chip denominations, payouts are frontend constants (not authoritative limits).
- Handoff: after implementation, run review → ui-qa → api-boundary-check → pre-commit. Do not commit/push/PR until requested.
- Lifecycle close notes: keep active until explicitly closed.
