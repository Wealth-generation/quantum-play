# Dice MVP

## Identity

- Task title: Dice MVP
- Status: active
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: codex/dice-mvp
- Current branch at task start: develop
- Branch creation command/evidence: `git checkout -b codex/dice-mvp` succeeded and switched to `codex/dice-mvp`.

## Scope

- Goal: implement the real Dice game on the existing `/games/dice` page using the approved Dice MVP audits, local BFF boundary, shared balance query, optional game-agnostic auto-bet runner, and Provably Fair modal.
- Setup step goal: create PR-mode branch setup and this active task artifact only.
- Phase 1 goal: add local BFF route handlers for Dice config, Dice bet, user balance, and fairness seed without UI, browser client, query hook, game module, or shared primitive changes.
- Phase 2 goal: add the shared browser-safe balance client/query and minimally wire TopBar to display `GAME_POINTS` and `WATCH_POINTS`.

### In Scope

- Manual Dice.
- Auto Dice.
- Over/Under only via API `above`.
- Responsive desktop/mobile layout using `.ai/context/dice-mvp/` references.
- Logged-out state:
  - controls visible;
  - Bet / Start Auto-Bet disabled;
  - no bet request sent.
- Result marker above slider.
- Recent result chips.
- Win/loss visual pulse using local Motion animation only.
- Header balance updates after successful manual and auto bets.
- Shared balance query:
  - `GET /api/user/balance` -> backend `GET /user/query/me`;
  - browser-safe response `{ gamePoints: string; watchPoints: string }`;
  - TopBar and Dice consume the same query key/source.
- Dice BFF routes:
  - `GET /api/games/dice/config` -> backend `GET /games/house/dice/config`;
  - `POST /api/games/dice/bet` -> backend `POST /games/house/dice/bet`.
- Small reusable auto-bet runner if it remains game-agnostic, likely `src/features/auto-bet/model/useAutoBetRunner.ts`.
- Provably Fair modal:
  - Seeds tab;
  - Dice Verify tab;
  - `GET /api/fairness/seed` -> backend `GET /fairness/seed`;
  - `PUT /api/fairness/seed` -> backend `PUT /fairness/seed`;
  - client-side Dice verification using `fairness-verify.ts`.
- Shared Radix Slider primitive if appropriate.
- Local expanded layout mode if included.

### Non-Goals

- Between / Double Between / Outside Dice modes.
- Max Bet modal logic.
- Browser Fullscreen API.
- Fairness history.
- Unhashed seed lookup.
- Backend verification route.
- Keno/Plinko/Roulette verification UI.
- Global animation/accessibility policy.
- `useReducedMotion` in this MVP.
- Header redesign beyond displaying/updating balances.
- Unrelated wallet UI.
- New dependencies.
- Zustand unless shared ownership becomes unavoidable and is explicitly approved.
- CI, Playwright, scripts, commits, pushes, PR creation, branch deletion, lifecycle-close.
- Editing `.ai/context/dice-mvp/`.

## Editable Scope Plan

Setup-only editable file:

```txt
.ai/tasks/active/dice-mvp.md
```

Planned future editable areas, pending explicit implementation-phase approval:

```txt
src/app/api/games/dice/config/route.ts
src/app/api/games/dice/bet/route.ts
src/app/api/user/balance/route.ts
src/app/api/fairness/seed/route.ts
src/features/balance/**
src/features/auto-bet/**
src/features/provably-fair/**
src/widgets/provably-fair-modal/**
src/shared/ui/primitives/slider.tsx
src/shared/ui/primitives/index.ts
src/games/dice/**
src/app/games/[gameSlug]/page.tsx
src/widgets/game-detail/**
src/widgets/top-bar/top-bar.tsx
docs/architecture/foundation-decisions.md
```

Docs updates or source-backed docs-not-needed rationale will be decided during implementation based on actual changed files.

## Context-Only Files

```txt
AGENTS.md
CLAUDE.md
docs/architecture/foundation-decisions.md
docs/architecture/auth.md
docs/workflow/**
.claude/rules/**
.claude/skills/**
src/app/api/_lib/**
src/app/api/auth/**
src/features/auth/**
src/widgets/bet-live/**
src/shared/ui/primitives/**
.ai/context/dice-mvp/**
node_modules/next/dist/docs/**
```

## Source Of Truth

- `AGENTS.md`
- `CLAUDE.md`
- `docs/architecture/foundation-decisions.md`
- `docs/architecture/auth.md`
- `.claude/rules/**`
- `.claude/skills/implementation/SKILL.md`
- `.claude/skills/audit/SKILL.md`
- `.claude/skills/api-boundary-check/SKILL.md`
- `.claude/skills/ui-qa/SKILL.md`
- `.ai/context/dice-mvp/**` as visual/API/helper evidence only
- Installed Next.js route-handler and BFF docs under `node_modules/next/dist/docs/**`

## Architecture Decisions To Preserve

- Browser UI calls only local `/api/*`.
- Browser UI must not call `https://api.thedoctor-dev.com` directly.
- Backend URL, auth cookies, and token forwarding stay server-side in BFF route handlers.
- Backend response is authoritative for bet result and balance.
- TanStack Query owns server state.
- Big.js should be used for money/profit/percentage math where precision matters.
- Motion may be used locally for small Dice animations only.
- Zustand is not planned.
- Auth session remains an identity/session contract; do not expand `/api/auth/session` for balance without explicit approval.

## Planned Implementation Phases

1. Shared BFF foundations for Dice, balance, and fairness. Completed.
2. Shared balance query and minimal TopBar balance wiring. Completed.
3. Provably Fair feature/query/helper and modal. Completed.
4. Shared Slider primitive. Completed.
5. Generic auto-bet runner. Completed.
6. Dice BFF config/bet routes if not done in phase 1. Covered by phase 1.
7. Manual Dice UI/model/helpers. Completed.
7a. Manual Dice runtime fix and desktop design correction. Completed.
7b. Manual Dice route typing cleanup, result pointer polish, and recent roll history animation. Completed.
7c. Manual Dice slider bounds, pointer alignment, and recent roll history direction polish. Completed.
7d. Manual Dice slider max/min bounds and thumb visual polish. Completed.
7e. Manual Dice slider domain mapping correction. Completed.
8. Auto Dice integration. Completed.
8a. Auto Dice incomplete integration fix. Completed.
8b. Auto Dice Start Auto-Bet debug instrumentation. Completed.
8c. Auto Dice debug cleanup and mobile metrics row fix. Completed.
8d. Auto Dice configure input behavior and Increase By sizing fix. Completed.
8e. Auto Dice configure input UX and gating. Completed.
8f. Auto Dice summary cards and Dice visual tone polish. Completed.
8g. Auto Dice Number of Bets placeholder and infinity icon polish. Completed.
8h. Auto Dice Bet Amount decimal normalization. Completed.
8i. Bet Amount input contract unification. Completed.
9. Responsive and expanded layout polish.
10. Review, validation, and task artifact update.

## API Boundary Impact

Required for future implementation. Planned browser clients must call only:

```txt
GET  /api/games/dice/config
POST /api/games/dice/bet
GET  /api/user/balance
GET  /api/fairness/seed
PUT  /api/fairness/seed
```

Planned server-side backend mappings:

```txt
GET  /games/house/dice/config
POST /games/house/dice/bet
GET  /user/query/me
GET  /fairness/seed
PUT  /fairness/seed
```

Manual API boundary check is required after implementation.

Phase 1 API boundary notes:

- Added only local `/api/*` route handlers.
- Browser-facing route handlers map server-side to the approved backend paths.
- `access_token` forwarding is server-side only through the existing `backendCookieHeader(["access_token"])` pattern.
- No backend URL, cookies, tokens, browser API clients, query hooks, or UI wiring were introduced.
- Focused type guards validate request and backend response shapes.

Phase 2 API boundary notes:

- Added browser-safe balance client that calls only `GET /api/user/balance`.
- TopBar consumes the shared balance query only when auth session is authenticated.
- Browser code does not call `https://api.thedoctor-dev.com` or read backend URL/cookies/tokens.
- `/api/auth/session` was not expanded or modified.
- Future Dice bet mutations should invalidate `balanceQueryKey`.

Phase 3 API boundary notes:

- Added browser-safe Provably Fair client that calls only `GET /api/fairness/seed` and `PUT /api/fairness/seed`.
- Browser code does not call `https://api.thedoctor-dev.com`, read `BACKEND_BASE_URL`, or access cookies/tokens.
- No `/fairness/history`, `/fairness/unhashed-seed`, or backend verification route was introduced.
- `fairness-verify.ts` was adapted into source and is imported by the client-side modal only.
- Server seed verification remains client-side and manual because the current seed response exposes only hashed server seed values.

## Docs Impact

Required consideration. This task may introduce the first concrete game module, new non-auth BFF routes, new feature ownership areas, shared balance state, shared auto-bet behavior, Provably Fair ownership, and a shared Slider primitive.

Expected durable-doc target:

```txt
docs/architecture/foundation-decisions.md
```

`docs/architecture/auth.md` should remain unchanged unless auth/session contract changes, which is currently a non-goal.

## UI QA Impact

Required for future implementation. Affected UI:

```txt
/games/dice
TopBar balance display
Dice manual mode
Dice auto mode
Auto-bet configure modal
Provably Fair modal
Logged-out state
Responsive desktop/mobile layouts
Local expanded layout mode if implemented
Live Bets integration area
```

## Validation Plan

Setup-only validation:

```txt
git status --short --branch
git diff --check
```

Future implementation validation:

```txt
git diff --check
pnpm lint
pnpm build
manual API boundary check
manual UI QA
manual docs impact check
```

Phase 1 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; rerun with network approval passed.
```

Phase 2 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; rerun with network approval passed.
```

Phase 3 validation:

```txt
git diff --check: pass
pnpm lint: initial run failed on React set-state-in-effect lint in the modal; fixed and rerun passed.
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; rerun with network approval passed.
```

Phase 4 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; rerun with network approval passed.
```

Phase 5 validation:

```txt
git diff --check: pass
pnpm lint: initial run failed on a forbidden `require("big.js")` attempt; fixed and rerun passed.
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; network rerun exposed that `big.js` has no local TypeScript declarations; final rerun passed after replacing the untyped import with a local fixed-decimal helper.
```

Phase 6 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; rerun with network approval passed.
```

Phase 6.1 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; rerun with network approval passed.
```

Phase 6.2 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; rerun with network approval passed after one TypeScript guard fix for normalized bet id.
```

Phase 6.3 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: not run for this visual/layout-only polish phase because Next/font network access is repeatedly required for Google Outfit in this environment. Full `pnpm build` is required before moving to Auto Dice or before final PR validation.
```

Phase 6.4 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: not run because this phase only changed Dice-local visual/layout slider bounds and thumb JSX/CSS composition. Full `pnpm build` remains required before moving to Auto Dice or before final PR validation.
```

Phase 6.5 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: not run because this phase only corrected the Dice-local selectable threshold domain constant and reused existing lint-covered slider mapping. Full `pnpm build` remains required before moving to Auto Dice or before final PR validation.
```

Post-Phase 6.5 user-provided build evidence:

```txt
pnpm build: passed
Next.js 16.2.6 with Turbopack
Compiled successfully
Finished TypeScript
Generated static pages: 21/21
Verified routes include:
- /api/games/dice/bet
- /api/games/dice/config
- /api/user/balance
- /api/fairness/seed
- /games/dice
```

Phase 7 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; rerun with network approval passed.
Build details: Next.js 16.2.6 with Turbopack, compiled successfully, finished TypeScript, generated static pages 21/21.
Verified build routes include `/api/games/dice/bet`, `/api/games/dice/config`, `/api/user/balance`, `/api/fairness/seed`, and `/games/dice`.
```

Phase 7.1 validation:

```txt
git diff --check: pass
pnpm lint: pass
pnpm build: initial sandbox run failed because Next/font could not fetch Google Outfit; rerun with network approval passed.
Build details: Next.js 16.2.6 with Turbopack, compiled successfully, finished TypeScript, generated static pages 21/21.
Verified build routes include `/api/games/dice/bet`, `/api/games/dice/config`, `/api/user/balance`, `/api/fairness/seed`, and `/games/dice`.
```

## Setup Evidence

- `git branch --show-current`: `develop` before branch creation.
- `git status --short --branch`: `## develop...origin/develop` with untracked `.ai/context/`.
- `git branch --list codex/dice-mvp`: no existing branch.
- `.ai/context/dice-mvp/`: exists.
- `.ai/tasks/active/dice-mvp.md`: did not exist before setup.
- `git checkout -b codex/dice-mvp`: succeeded.

## Phase 1 Evidence

- Files changed:
  - `src/app/api/games/dice/config/route.ts`
  - `src/app/api/games/dice/bet/route.ts`
  - `src/app/api/user/balance/route.ts`
  - `src/app/api/fairness/seed/route.ts`
  - `.ai/tasks/active/dice-mvp.md`
- Implemented local route mappings:
  - `GET /api/games/dice/config` -> `GET /games/house/dice/config`
  - `POST /api/games/dice/bet` -> `POST /games/house/dice/bet`
  - `GET /api/user/balance` -> `GET /user/query/me`
  - `GET /api/fairness/seed` -> `GET /fairness/seed`
  - `PUT /api/fairness/seed` -> `PUT /fairness/seed`
- Balance route extracts `GAME_POINTS` and `WATCH_POINTS` from backend `userBalances` and returns only `{ gamePoints, watchPoints }`.
- Assumption: Dice config remains public based on observed unauthenticated config response; Dice bet, balance, and fairness seed routes require `access_token`.
- No UI, browser clients, query hooks, game modules, shared primitives, dependencies, or `.ai/context/dice-mvp/**` files were changed.
- Build evidence: production build passed and listed `/api/fairness/seed`, `/api/games/dice/bet`, `/api/games/dice/config`, and `/api/user/balance` as dynamic routes.
- Next recommended phase after Phase 1: shared balance query and minimal TopBar balance wiring.

## Phase 2 Evidence

- Files changed:
  - `src/features/balance/api/balance-client.ts`
  - `src/features/balance/model/balance-query.ts`
  - `src/features/balance/types/balance-types.ts`
  - `src/features/balance/index.ts`
  - `src/widgets/top-bar/top-bar.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Provided asset used:
  - `public/images/watch-point.svg` for `WATCH_POINTS`
  - existing `public/images/game-point.svg` for `GAME_POINTS`
- Balance/query ownership:
  - `balanceQueryKey` is the stable shared key for future Dice bet invalidation/refetch.
  - `useBalanceQuery(authenticated)` keeps balance server state in TanStack Query.
  - Balance feature exports `getBalance`, `balanceQueryKey`, `useBalanceQuery`, and `Balance`.
- TopBar behavior:
  - Authenticated users see compact `GAME_POINTS` and `WATCH_POINTS` balance pills.
  - Logged-out users keep the existing Log In button flow.
  - Loading/error balance states fall back to stable `0.00` display and do not expose backend details.
- Manual inspection checks:
  - TopBar uses `/api/user/balance`, not backend URL.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - `/api/auth/session` was not expanded.
  - `GAME_POINTS` uses existing `game-point.svg`.
  - `WATCH_POINTS` uses provided `watch-point.svg`.
  - `.ai/context/dice-mvp/**` was not edited.
  - No unrelated assets were edited.
- Assumption: a stable `0.00` fallback is acceptable for loading/error until a richer wallet/balance state is approved.
- Next recommended phase: Provably Fair feature/query/helper and modal.

## Phase 3 Evidence

- Files changed:
  - `src/features/provably-fair/api/fairness-client.ts`
  - `src/features/provably-fair/model/fairness-query.ts`
  - `src/features/provably-fair/types/fairness-types.ts`
  - `src/features/provably-fair/lib/fairness-verify.ts`
  - `src/features/provably-fair/index.ts`
  - `src/widgets/provably-fair-modal/provably-fair-modal.tsx`
  - `src/widgets/provably-fair-modal/index.ts`
  - `src/widgets/game-detail/game-actions.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Provably Fair ownership:
  - `src/features/provably-fair/**` owns browser-safe fairness seed fetching, client seed rotation, TanStack Query state, and browser Web Crypto Dice verification.
  - `src/widgets/provably-fair-modal/**` owns the product modal UI and local verification form state.
  - `src/widgets/game-detail/game-actions.tsx` only opens the modal from the existing Provably Fair action and keeps the action bar otherwise unchanged.
- Helper/client boundary notes:
  - The browser client uses only `/api/fairness/seed`.
  - The verification helper is adapted from `.ai/context/dice-mvp/fairness-verify.ts` into source and does not import from `.ai/context`.
  - The helper uses browser Web Crypto and does not introduce Node crypto or dependencies.
  - Dice Verify is client-side only and requires a manually entered revealed server seed.
- Manual inspection checks:
  - Browser Provably Fair client calls only `/api/fairness/seed`.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - No `/fairness/history` or `/fairness/unhashed-seed` usage.
  - No backend URL/cookies/tokens exposed to browser code.
  - Modal opens from the existing Provably Fair action.
  - `.ai/context/dice-mvp/**` was not edited.
- Assumption: the static dice track inside the modal is acceptable for Phase 3 until the approved shared Slider primitive phase.
- UI QA impact: code/build inspection only for this phase; no browser screenshot QA was requested or run.
- Next recommended phase: shared Slider primitive.

## Phase 4 Evidence

- Files changed:
  - `src/shared/ui/primitives/slider.tsx`
  - `src/shared/ui/primitives/index.ts`
  - `.ai/tasks/active/dice-mvp.md`
- Shared primitive ownership:
  - `Slider` wraps the installed `@radix-ui/react-slider` Root/Track/Range/Thumb anatomy.
  - `SliderRoot`, `SliderTrack`, `SliderRange`, and `SliderThumb` are exported for future game-specific composition.
  - The composed `Slider` supports Radix controlled/uncontrolled value props plus `min`, `max`, `step`, `disabled`, and `className` through Radix Root props.
  - Styling stays generic and token-based.
- Manual inspection checks:
  - `@radix-ui/react-slider` is used from the installed dependency.
  - Shared Slider contains no Dice or Fairness business logic.
  - Primitive export follows the existing `export * from "./..."` shared UI barrel style.
  - `.ai/context/dice-mvp/**` was not edited.
  - No unrelated primitives were refactored.
- Assumption: future Dice/Fairness marker, zone, label, and result visuals should compose around `SliderRoot`/`SliderTrack`/`SliderRange`/`SliderThumb` instead of being added to the shared primitive.
- UI QA impact: no product UI integration in this phase, so no browser screenshot QA was run.
- Next recommended phase: generic auto-bet runner.

## Phase 5 Evidence

- Files changed:
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/features/auto-bet/index.ts`
  - `.ai/tasks/active/dice-mvp.md`
- Auto-bet ownership:
  - `src/features/auto-bet/**` owns the reusable, game-agnostic auto-run loop model.
  - The runner accepts `placeBet(currentBetAmount)`, `onRoundComplete(result)`, and optional `onError(error)` callbacks.
  - The generic result contract is `{ betSize: string; payout: string; didWin: boolean }`, with additional result fields allowed through generics.
  - The runner tracks status, remaining bets, current bet amount, local session profit, completed rounds, last result, and safe error message.
  - Auto-bet sends one request at a time, blocks duplicate loops, stops on manual stop after the in-flight request or delay boundary, and stops on request failure.
  - Remaining bets start at `0`, and `start()` is ignored while remaining bets are `0` or less.
- Math and lifecycle notes:
  - `roundProfit = payout - betSize` and `autoSessionProfit += roundProfit` use a local fixed-decimal helper for decimal safety.
  - On-win/on-loss `increase` applies to the current bet amount.
  - On-win/on-loss `reset` exists only as an explicit caller-selected strategy and does not implement configure-modal reset behavior.
  - Cleanup clears pending delay scheduling and avoids state updates after unmount.
- Manual inspection checks:
  - Runner contains no Dice/Keno/Plinko/Roulette-specific logic.
  - Runner has no API route knowledge and does not call `fetch`.
  - Runner has no UI or renderer logic.
  - Runner does not use Zustand.
  - Runner uses loop refs to prevent parallel bet requests.
  - `.ai/context/dice-mvp/**` was not edited.
- Assumption/risk:
  - `big.js` is installed, but this package version provides no TypeScript declarations in the local repo. Adding `@types/big.js` or a separate ambient declaration file would be outside the approved Phase 5 scope, so the hook uses a local fixed-decimal helper instead.
- UI QA impact: no product UI integration in this phase, so no browser screenshot QA was run.
- Next recommended phase: Manual Dice UI/model/helpers.

## Phase 6 Evidence

- Files changed:
  - `src/games/dice/config/dice-defaults.ts`
  - `src/games/dice/lib/dice-decimal.ts`
  - `src/games/dice/lib/dice-math.ts`
  - `src/games/dice/model/dice-client.ts`
  - `src/games/dice/model/dice-query.ts`
  - `src/games/dice/model/dice-types.ts`
  - `src/games/dice/model/use-manual-dice.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `src/games/dice/index.ts`
  - `src/app/games/[gameSlug]/page.tsx`
  - `src/widgets/game-detail/game-detail.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Dice ownership:
  - `src/games/dice/**` owns Manual Dice UI, browser-safe Dice client/query/mutation, local Manual Dice state, display math, and defaults.
  - `src/app/games/[gameSlug]/page.tsx` remains thin and only composes `DiceGame` for `/games/dice`.
  - `GameDetail` accepts an optional content slot; other game slugs keep the existing placeholder behavior.
- API boundary notes:
  - Dice browser client calls only `GET /api/games/dice/config` and `POST /api/games/dice/bet`.
  - Browser balance behavior remains through the shared `GET /api/user/balance` balance feature.
  - Dice browser code does not call `https://api.thedoctor-dev.com`, read backend URL, or access cookies/tokens.
  - No `/api/auth/session` changes were made.
- Balance invalidation behavior:
  - `useManualDiceBetMutation()` invalidates `balanceQueryKey` on successful manual bet so TopBar can refetch the shared balance source.
- Manual inspection checks:
  - `/games/dice` renders `DiceGame` real Manual Dice content.
  - Other `/games/[gameSlug]` routes still render placeholders through `GameDetail` fallback content.
  - Logged-out state keeps controls visible but disables Bet and the submit handler returns without sending a request.
  - Successful manual bet applies the backend-authored result marker and recent chip, and invalidates/refetches balance.
  - Shared Slider primitive is used via `SliderRoot`, `SliderTrack`, and `SliderThumb`; no Dice logic was added to the primitive.
  - No Auto Dice behavior, auto-bet runner wiring, configure modal, Max Bet modal, expanded mode, or Browser Fullscreen API was implemented.
  - `.ai/context/dice-mvp/**` was not edited.
- Assumption/risk:
  - Big.js still has no local TypeScript declarations, so Dice display math uses a focused fixed-decimal helper rather than adding types/dependencies.
  - Multiplier/chance are display-derived from threshold, `above`, and config `rtp`; backend response remains authoritative for final payout/result.
- UI QA impact: code/build/manual source inspection only for this phase; no browser screenshot QA was requested or run.
- Next recommended phase: Auto Dice integration.

## Phase 6.1 Evidence

- Files changed:
  - `src/app/api/games/dice/bet/route.ts`
  - `src/games/dice/config/dice-defaults.ts`
  - `src/games/dice/model/use-manual-dice.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Runtime bug root cause:
  - The local Dice bet BFF validator required a `betId` field, but the observed backend Dice bet response provides `id`.
  - The BFF rejected the valid backend response and returned `Dice bet response was invalid.`
  - The route now normalizes `id` or `betId` into browser-safe `betId`, and normalizes numeric/string `betSize`, `payout`, and `multiplier` fields into strings without broad fallback masking.
- Dice UI correction notes:
  - Removed the visible Under/Over segmented control.
  - Manual Dice now sends `above: true` for Rollover/Over behavior.
  - Removed the visible Min/Max/RTP helper text from the Dice card.
  - Recent roll chips are positioned at the top-right of the Dice game area and capped at 7 visible chips.
  - Recent chip entry/overflow uses short local Motion animation only.
  - Desktop Dice card height/spacing was adjusted closer to the manual desktop reference while preserving the game-detail shell and Live Bets placement.
- Rollover behavior notes:
  - `public/images/rollover.svg` is used in the Rollover metric control.
  - Clicking the rollover icon mirrors the current threshold using `newThreshold = 100 - currentThreshold`.
  - Rollover, Chance, Multiplier, and Profit on Win recalculate from the mirrored threshold.
  - Backend result remains authoritative for marker/result chip after a successful bet.
- Manual inspection checks:
  - `/games/dice` source no longer contains visible `Under` / `Over` control text.
  - `/games/dice` source no longer contains visible `Min / Max / RTP` helper text.
  - Dice browser code calls only local `/api/games/dice/config` and `/api/games/dice/bet`.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - Successful manual bet path still applies result marker, appends recent chip, and invalidates shared `balanceQueryKey`.
  - Recent roll chips are capped at 7 by `DICE_RECENT_RESULTS_LIMIT`.
  - Other game routes keep the placeholder fallback through `GameDetail` composition.
  - `.ai/context/dice-mvp/**` was not edited.
  - `public/images/rollover.svg` was used and not modified.
- Assumption/risk:
  - A live authenticated manual bet was not executed in this environment; the root-cause fix was validated by source inspection, lint, and production build.
  - Browser screenshot QA was not run because a browser-control tool was not exposed in this session.
- Next recommended phase: Auto Dice integration.

## Phase 6.2 Evidence

- Files changed:
  - `src/app/api/games/dice/bet/route.ts`
  - `src/games/dice/config/dice-defaults.ts`
  - `src/games/dice/model/use-manual-dice.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Dice bet typing/normalization notes:
  - The Dice bet route keeps raw `fetch().json()` as `unknown`.
  - The route narrows raw response into an explicit `DiceBetBackendDto` with concrete field types.
  - The expected backend DTO supports either `id` or `betId`.
  - `betSize`, `payout`, and `multiplier` are accepted as `string | number`.
  - The browser-safe response remains stable with string `betSize`, `payout`, `multiplier`, and normalized `betId`.
  - No all-unknown backend response interface remains.
- Pointer/chips animation notes:
  - Result pointer now lives in a reserved slider-local pointer lane instead of using a brittle offset against the full game panel.
  - Pointer animates horizontally by Motion `left` between previous and current backend `randomValue` positions.
  - Recent roll chips remain top-right in a separate row from the pointer.
  - Recent roll chips are capped at 6 visible items.
  - Overflow chip exit uses local Motion fade, slight left movement, and scale down.
  - Chip keys use a stable unique id derived from `betId` and `createdAt`, not only the numeric roll value.
- Manual inspection checks:
  - Local `/api/games/dice/bet` supports backend `id` or `betId`.
  - Local `/api/games/dice/bet` supports numeric or string `multiplier`.
  - Dice browser code still calls only local `/api/games/dice/config` and `/api/games/dice/bet`, plus shared balance invalidation through `balanceQueryKey`.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - Rollover behavior still uses `public/images/rollover.svg` and mirrors threshold.
  - Under/Over segmented control and Min/Max/RTP helper footer did not return.
  - Other game routes still render placeholders through `GameDetail` fallback composition.
  - `.ai/context/dice-mvp/**` was not edited.
- Assumption/risk:
  - Browser screenshot QA was not run because a browser-control tool was not exposed in this session.
  - A live authenticated bet was not executed; response typing was validated against the provided local response example and build/type checks.
- Next recommended phase: Auto Dice integration.

## Phase 6.3 Evidence

- Files changed:
  - `src/games/dice/model/use-manual-dice.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Slider geometry correction notes:
  - Dice slider marker, colored track, handle, and tick labels now share one track-relative coordinate system.
  - Result marker positioning is clamped against the actual visual track range, including low and high result values.
  - Tick labels `2`, `25`, `50`, `75`, and `100` are positioned proportionally within the same track wrapper as the colored slider bar.
  - The result marker remains in a dedicated slider-local marker lane, preserving a stable vertical gap below the recent roll chips.
- Recent chip order/animation notes:
  - Recent results are stored and rendered oldest-to-newest from left to right.
  - New results append to the right.
  - Visible history remains capped at 6 chips.
  - When a 7th result arrives, the oldest left chip exits with slight left movement, fade, and scale down.
  - Chip keys remain stable and unique using `betId` plus `createdAt`, so duplicate roll values animate independently.
- Manual inspection checks:
  - Rollover behavior still uses `public/images/rollover.svg` and mirrors threshold with `100 - current`.
  - Rollover, Chance, Multiplier, and Profit on Win remain derived from the current threshold/config and recalculate after threshold changes.
  - Under/Over segmented control did not return.
  - Min/Max/RTP footer text did not return.
  - Manual Dice browser code still calls only local `/api/games/dice/config` and `/api/games/dice/bet`, plus shared balance invalidation through `balanceQueryKey`.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - Other game routes still render placeholders through existing GameDetail composition.
  - `.ai/context/dice-mvp/**` was not edited.
- Assumption/risk:
  - Browser screenshot QA was not run because a browser-control tool was not exposed in this session.
  - `pnpm build` was intentionally skipped for this visual/layout-only phase per user direction because Next/font network access is repeatedly required; a full build remains required before Auto Dice or final PR validation.
- Next recommended phase: Auto Dice integration after running the required full production build when network access is available.

## Phase 6.4 Evidence

- Files changed:
  - `src/games/dice/config/dice-defaults.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Slider bounds correction notes:
  - Dice threshold max now uses the same `2..100` range as the visual colored track coordinate system.
  - Slider root max, colored track fill, result marker anchor, and tick labels now share the same `DICE_MIN_THRESHOLD..DICE_MAX_THRESHOLD` percentage mapping.
  - The result marker anchor remains at the real backend roll position.
  - Marker bubble edge clamping is visual-only; it moves only the text bubble at low/high values and does not change the anchor, thumb position, colored track bounds, or tick positions.
- Thumb visual correction notes:
  - Dice-specific thumb styling now uses a darker slate grip body closer to the reference.
  - Three grip bars are rendered as centered child spans inside the Dice thumb.
  - Grip bars are subtle/dark instead of bright white text glyphs.
  - No Dice-specific styling or behavior was added to `src/shared/ui/primitives/slider.tsx`.
- Manual inspection checks:
  - Slider thumb can reach the visual start/end because the logical max no longer clamps before the track end.
  - Tick labels remain positioned against the colored track coordinate system, not the outer slider frame.
  - Recent chip behavior from Phase 6.3 remains unchanged: oldest-left/newest-right, newest on the right, max 6, stable `betId` plus `createdAt` IDs, oldest exits left with fade/scale.
  - Rollover behavior still uses `public/images/rollover.svg` and mirrors threshold with `100 - current`.
  - Under/Over segmented control did not return.
  - Min/Max/RTP footer text did not return.
  - Manual Dice browser code still calls only local `/api/games/dice/config` and `/api/games/dice/bet`, plus shared balance invalidation through `balanceQueryKey`.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - Other game routes still render placeholders through existing GameDetail composition.
  - `.ai/context/dice-mvp/**` was not edited.
- Assumption/risk:
  - Browser screenshot QA was not run because a browser-control tool was not exposed in this session.
  - `pnpm build` was not run for this Dice-local visual/layout phase; full build remains required before Auto Dice or final PR validation.
- Next recommended phase: run full production build with network access, then proceed to Auto Dice integration.

## Phase 6.5 Evidence

- Files changed:
  - `src/games/dice/config/dice-defaults.ts`
  - `.ai/tasks/active/dice-mvp.md`
- Slider domain/mapping notes:
  - Restored the interactive Dice threshold domain to `2..98`.
  - `clampThreshold()` and `roundThreshold()` now prevent user-selected/request thresholds below `2` or above `98`.
  - The existing Dice slider composition maps `DICE_MIN_THRESHOLD..DICE_MAX_THRESHOLD` to the full visual track width, so threshold `2` maps to the start and threshold `98` maps to the end.
  - Threshold around `50` maps near the center using `((threshold - 2) / (98 - 2)) * 100`.
  - Tick labels remain `2 / 25 / 50 / 75 / 100`; label placement is still track-relative, with `100` clamped to the right edge for the reference-like scale label.
- Marker clamp/display notes:
  - The result marker position uses the same track-relative percent helper and clamps visual anchor placement to `2..98`.
  - The marker bubble displays backend `randomValue` unchanged via `formatDecimal(randomValue)`.
  - Values below `2` anchor at the visual start, and values above `98` anchor at the visual end, while still showing the backend result value.
  - Bubble edge clamping remains visual-only and does not change the slider value, request threshold, colored track bounds, or tick positions.
- Manual inspection checks:
  - Rollover still mirrors with `100 - current`; examples: `2 -> 98`, `98 -> 2`, and `22.79 -> 77.21`.
  - Rollover, Chance, Multiplier, and Profit on Win remain derived from the current threshold/config.
  - Manual bet submits the current selected threshold through the existing local `POST /api/games/dice/bet` client path only.
  - Recent chip behavior from Phase 6.3 remains unchanged: oldest-left/newest-right, newest on the right, max 6, stable duplicate-safe IDs, oldest exits left with fade/scale.
  - Thumb visual style from Phase 6.4 remains intact and Dice-specific.
  - Under/Over segmented control did not return.
  - Min/Max/RTP footer text did not return.
  - Browser Dice code still calls only local `/api/games/dice/config` and `/api/games/dice/bet`, plus shared balance invalidation through `balanceQueryKey`.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - Other game routes still render placeholders through existing GameDetail composition.
  - `.ai/context/dice-mvp/**` was not edited.
- Assumption/risk:
  - Browser screenshot QA was not run because a browser-control tool was not exposed in this session.
  - `pnpm build` was not run for this Dice-local domain constant correction; full build remains required before Auto Dice or final PR validation.
- Next recommended phase: run full production build with network access, then proceed to Auto Dice integration.

## Phase 7 Evidence

- Files changed:
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Auto-bet runner usage notes:
  - Auto Dice uses the existing generic `useAutoBetRunner<DiceBetResult>()`.
  - The runner remains game-agnostic: it has no Dice threshold, marker, chip, endpoint, or balance-query knowledge.
  - Added a generic `initialRemainingBets` option so the runner can initialize finite run count without Dice-specific logic.
  - Dice passes `delayMs: 800` for the approximate delay between completed bets.
  - Dice supplies `placeBet(currentBetAmount)` through the existing local Dice mutation, so each auto round posts to local `/api/games/dice/bet`.
  - The existing mutation invalidates `balanceQueryKey` after every successful auto round.
- Auto Mode behavior notes:
  - Auto tab includes Bet Amount, Number of Bets, On Win, On Loss, Stop on Profit, Stop on Loss, Configure, Start Auto-Bet, and Stop Auto-Bet while running.
  - Start Auto-Bet is disabled unless the user is authenticated, Bet Amount is positive, Number of Bets is a positive integer, config is available, and no run/request is active.
  - Logged-out Auto UI remains visible but disabled for starting; the Dice place-bet callback also guards against session loss.
  - Auto run sends one request at a time through the runner and waits approximately 800ms after each completed bet before the next request.
  - After every successful auto result, Dice applies the backend-authored result marker and recent chip through the same result path as Manual Dice.
  - Number of Bets draft decrements after each completed auto result and remains at its ended value after stopping.
  - Stop Auto-Bet requests stop; the runner stops after the current in-flight request or delay boundary.
  - Stop on Profit and Stop on Loss are delegated to the generic runner and use `payout - betSize` session profit math.
  - On Win / On Loss Increase By strategies are delegated to the generic runner; Reset strategy does not increase the next bet amount and resets through the runner's generic reset behavior.
  - Reset all in the configure modal resets auto configuration only and does not mutate the current Bet Amount field.
  - Configure and mode switching are disabled while an auto run is active.
- UI QA notes:
  - Desktop Auto layout keeps controls on the left and slider/result/metrics on the right.
  - Mobile Auto layout uses source/CSS ordering so the play area remains first, then Configure/Start or Stop, then Bet Amount/Number of Bets/summaries, then the Manual/Auto tabs.
  - Configure Auto-Bet modal uses existing dialog primitive and constrained viewport sizing for mobile.
  - Browser-control tooling was searched for but not exposed in this session, so no screenshot QA was run.
- Manual inspection checks:
  - Manual Dice behavior is preserved through the existing manual submit path.
  - Slider domain remains `2..98`; threshold mapping, thumb visual style, marker clamp/display, rollover behavior, and recent chip order/animation remain unchanged.
  - Infinite auto-bet mode is not implemented; the infinity control is present as a disabled visual affordance only.
  - No Max Bet modal, Between modes, Browser Fullscreen API, Provably Fair changes, BFF/API route changes, shared primitive redesign, Zustand, dependencies, scripts, commits, pushes, or PR actions were introduced.
  - Browser Dice code still calls only local `/api/games/dice/config` and `/api/games/dice/bet`, plus shared balance invalidation through `balanceQueryKey`.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - `.ai/context/dice-mvp/**` was not edited.
- Assumption/risk:
  - Live authenticated Auto Dice request sequencing was not browser-tested in this environment; behavior was validated by source inspection, lint, and production build.
  - Browser screenshot QA remains recommended before final visual signoff because the Browser control tool was not exposed.
- Next recommended phase: responsive and expanded layout polish, with browser screenshot QA when tooling is available.

## Phase 7.1 Evidence

- Files changed:
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/features/auto-bet/index.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Start Auto-Bet root cause:
  - Phase 7 used a split runner contract: Dice called `setCurrentBetAmount()`, `setRemainingBets()`, and then `start()` as separate operations.
  - The runner `start()` guard only inspected the runner's current snapshot and could return when that snapshot still had no prepared positive remaining bet count, creating an enabled-looking Start Auto-Bet path that performed no visible action.
  - The fix makes `start()` accept generic atomic start options, so the current bet amount and finite remaining-bets count are prepared and validated inside the same runner start operation.
- Runtime fix notes:
  - `useAutoBetRunner.start()` now accepts `{ currentBetAmount, remainingBets }`.
  - The runner still remains game-agnostic and contains no Dice threshold, endpoint, marker, chip, or balance logic.
  - Starting a run now atomically sets the starting bet amount, remaining bets, running status, clears errors, and resets session profit/completed rounds for the new session.
  - Dice now calls `autoRunner.start({ currentBetAmount: dice.betAmount || "0", remainingBets: Number(autoBetCountDraft) })` instead of separate setter calls followed by `start()`.
  - Start conditions remain enforced in Dice before calling the runner: authenticated, positive bet amount, positive finite integer Number of Bets, not already running, no pending request, and config available.
  - Stop Auto-Bet continues to use the runner stop path, which stops after the current in-flight request or delay boundary.
- Layout fix notes:
  - Desktop Auto order now matches the reference: Manual/Auto tabs, Bet Amount, Number of Bets, On Win/On Loss cards, Stop on Profit/Stop on Loss cards, Configure, then Start/Stop Auto-Bet.
  - Mobile source/CSS order remains play area first, then Configure/Start or Stop, then Bet Amount/Number of Bets/summaries, then tabs.
  - Slider tick labels were moved outside and below the rounded slider frame.
  - Tick labels retain the same `px-5` track-coordinate wrapper as the colored track, so `2 / 25 / 50 / 75 / 100` remain aligned to the actual track rather than the outer frame.
- Manual inspection checks:
  - Auto requests still use the existing browser-safe Dice client path, so browser code posts only to local `/api/games/dice/bet`.
  - Auto runner still sends one request at a time and uses the existing `800ms` delay configuration.
  - Manual Dice path was not changed.
  - Dice slider domain remains `2..98`.
  - Rollover behavior remains `100 - current`.
  - Recent chips remain capped at 6 and ordered oldest-left/newest-right.
  - Configure modal Apply and Reset all behavior were not changed.
  - Stop on Profit, Stop on Loss, On Win, and On Loss behavior remain delegated to the generic runner.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - `.ai/context/dice-mvp/**` was not edited.
- Assumption/risk:
  - Live authenticated Auto Dice request sequencing was not browser-tested in this environment; behavior was validated by source inspection, lint, and production build.
  - Browser screenshot QA remains recommended for desktop/mobile layout confirmation.
- Next recommended phase: browser UI QA pass for Auto Dice idle/running/configure states, then responsive and expanded layout polish.

## Phase 7.2A Debug Instrumentation Evidence

- Status: completed; live QA confirmed the Auto Dice start path works.
- Files changed:
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Debug scope:
  - Temporary `console.info` logs only.
  - All logs use the `[dice:auto-debug]` prefix.
  - Instrumentation is limited to the Auto Dice Start Auto-Bet click path, runner start path, runner running state, place-bet callback, and mutation success/error.
- Logs added:
  - Start Auto-Bet click handler reached.
  - Auth/session state used by the start guard.
  - Parsed bet amount and parsed number of bets.
  - Disabled/start guard result and reasons.
  - Dice caller invoking `runner.start` with payload.
  - Runner `start()` called with payload and current snapshot.
  - Runner accepted or rejected start, including rejection reason.
  - Runner running state changed.
  - Runner placeBet callback reached.
  - Dice placeBet callback reached.
  - `mutation.mutateAsync` called with request body.
  - Mutation success with result identifiers.
  - Mutation error.
  - Runner placeBet resolved or errored.
- Validation:
  - `pnpm lint`: intentionally not run because temporary console logs were added.
  - `pnpm build`: intentionally not run per Phase 7.2A debug-only instruction.
- Live QA evidence:
  - Auto Mode starts.
  - Network shows sequential `POST /api/games/dice/bet` requests.
  - Balance refresh requests happen after bets.
  - A 5-bet auto run completed to `remainingBets: 0`.
  - Console showed the successful path through `mutation.mutateAsync called`, `mutation success`, `runner placeBet resolved`, and `auto round complete`.

## Phase 7.2B Evidence

- Status: completed debug cleanup and mobile metrics row fix.
- Files changed:
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Debug cleanup notes:
  - Removed every temporary `[dice:auto-debug]` log.
  - Removed debug-only constants and helper code from Dice UI and the auto-bet runner.
  - Preserved the functional atomic `autoRunner.start({ currentBetAmount, remainingBets })` flow that made Auto Mode work.
- Auto behavior preserved:
  - Start Auto-Bet still calls the runner with the current bet amount and finite number-of-bets count.
  - Stop Auto-Bet remains shown while the runner is active.
  - Auto requests still use the existing sequential runner loop and local `/api/games/dice/bet` mutation path.
  - Number of Bets decrement, result marker/chips, and shared balance invalidation remain on the existing successful-result path.
  - Stop still delegates to the runner stop path and waits for the in-flight request or delay boundary to settle.
- Mobile metrics correction:
  - The Multiplier, Rollover, and Chance metrics container now uses a compact three-column grid on mobile.
  - Desktop metrics layout remains three columns and keeps the same surrounding Dice play-area composition.
- Validation:
  - `git diff --check`: passed.
  - `pnpm lint`: passed.
  - `pnpm build`: first sandboxed run failed because Next/font could not fetch Google Fonts; rerun with network access passed.
- Risks:
  - Browser screenshot QA is still recommended to visually confirm the mobile metrics row against the reference after cleanup.
- Next recommended step:
  - Run validation, then perform browser UI QA for Auto Dice mobile and desktop idle/running states.

## Phase 7.3 Evidence

- Status: completed configure input behavior and Increase By sizing fix.
- Files changed:
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Input behavior fix notes:
  - On Win and On Loss percentage inputs remain controlled numeric inputs.
  - The `%` suffix is rendered as a fixed right-side suffix outside the editable text.
  - Percentage input padding reserves suffix space so text and caret do not overlap `%`.
  - Stop on Profit and Stop on Loss now render a left editable numeric input with a green coin icon and a right derived `$...` preview.
  - Empty focused stop fields keep the editable area clean while the right preview falls back to `$0.00`.
- Increase By root cause:
  - The runner updated its latest callbacks/options from a React effect, which could leave sizing strategies stale around newly applied Auto Configure settings.
  - Reset sizing also read the current `initialBetAmount` option, which could drift as Dice mirrored the runner's current bet amount during a run.
- Increase By fix:
  - The auto-bet runner now refreshes its options ref in a layout effect, so the latest On Win and On Loss strategies are available before post-render user interactions and subsequent runner callbacks.
  - The runner captures the session starting bet amount when `start()` is accepted and uses that stable value for Reset sizing.
  - Increase sizing remains game-agnostic and multiplies the current bet amount by the configured percentage after matching results only: On Win after `didWin: true`, On Loss after `didWin: false`.
  - Dice continues to mirror `autoRunner.state.currentBetAmount` into the visible Bet Amount while Auto Mode is active or running.
- Manual inspection checks:
  - Percent suffix stays fixed right and is not part of the input value.
  - Percent input text has reserved right padding and should not overlap the suffix.
  - Stop profit/loss empty focused state should show no ghost editable zeros under the cursor.
  - Stop profit/loss right `$...` preview is derived from the left input.
  - On Win Increase and On Loss Increase are applied by the runner only for matching `didWin` results.
  - The next auto bet request uses `stateRef.current.currentBetAmount`, which is updated before the runner waits and loops to the next request.
  - Auto start/stop behavior, manual Dice behavior, mobile horizontal metrics, desktop Auto layout, slider domain `2..98`, rollover behavior, recent chips, and Configure modal Apply / Reset all behavior remain preserved by source inspection.
  - Browser Dice code still calls only local `/api/games/dice/config` and `/api/games/dice/bet`, plus shared balance invalidation through `balanceQueryKey`.
  - Browser code does not call `https://api.thedoctor-dev.com`.
  - `.ai/context/dice-mvp/**` was not edited.
- Validation:
  - `git diff --check`: passed.
  - `pnpm lint`: passed after replacing a render-time options ref assignment with a layout effect.
  - `pnpm build`: first sandboxed run failed because Next/font could not fetch Google Fonts; rerun with network access passed.
- Risks:
  - Live browser QA is still recommended to confirm caret behavior and the next POST body after a win/loss-driven Increase By transition.
- Next recommended step:
  - Run validation, then manually test Auto Configure inputs and one On Win / On Loss Increase By run with DevTools Network open.

## Phase 7.4 Evidence

- Status: completed Auto Configure input UX and gating.
- Files changed:
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Input UX and gating notes:
  - On Win and On Loss percentage inputs are editable only when that row's `Increase By` mode is selected.
  - When `Reset` is selected, the row's percentage input is disabled and renders the faint `0.00` placeholder instead of real input text.
  - Percentage fields use `placeholder="0.00"` and empty string values by default, so users can type immediately without deleting `0.00`.
  - The `%` suffix remains a fixed right-side suffix outside the input text, with reserved input padding to avoid overlap.
  - Stop on Profit and Stop on Loss use `placeholder="0.00"` for the left editable numeric input.
  - Stop on Profit and Stop on Loss keep the right `$...` preview derived from the left value, falling back to `$0.00` for empty input.
  - Apply preserves empty draft values; existing strategy and stop-limit consumers already treat empty as zero.
- Manual inspection checks:
  - On Win input is disabled when Reset is selected and editable when Increase By is selected.
  - On Loss input is disabled when Reset is selected and editable when Increase By is selected.
  - Focused empty fields show placeholder `0.00`, not actual value text.
  - Users can type without deleting `0.00` because defaults are empty strings.
  - The `%` suffix remains fixed right and outside the editable input value.
  - Stop Profit/Loss right `$...` preview updates from the left input and falls back to `$0.00` when empty.
  - Auto Increase By sizing was not reworked in this phase and remains preserved by source inspection.
  - Auto Start/Stop, Apply, Reset all, desktop Auto layout, mobile horizontal metrics, Manual Dice, and local `/api/*` browser boundary remain preserved by source inspection.
  - `.ai/context/dice-mvp/**` was not edited.
- Validation:
  - `git diff --check`: passed.
  - `pnpm lint`: passed.
  - `pnpm build`: not run because Phase 7.4 only changed Dice modal input UX props/default values and did not significantly change TypeScript structure.
- Risks:
  - Browser QA is still recommended to confirm disabled placeholder rendering and caret behavior in Chrome at mobile and desktop sizes.
- Next recommended step:
  - Run validation, then manually test Auto Configure gating/focus behavior in the browser.

## Phase 7.5 Evidence

- Status: completed Auto summary card formatting and Dice visual tone polish.
- Files changed:
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Summary-card formatting notes:
  - On Win and On Loss reset/default strategy summaries still show `Auto`.
  - On Win and On Loss Increase By summaries now show only the formatted percentage value, such as `5.00%`, `50.00%`, or `100.00%`.
  - Summary cards no longer render `Increase N.00%`.
  - Configure modal button text remains `Increase By`.
  - Stop on Profit and Stop on Loss summary formatting was preserved.
- Visual tone polish notes:
  - The Dice play area result pulse no longer draws a sharp red/green 1px inset outline around the whole game area.
  - Result pulse now uses a softer low-opacity inner glow.
  - The play-area green radial tint was reduced for a quieter dark-panel mood.
  - Auto summary cards and the metrics panel use softer border opacity and slightly muted panel fills.
  - Slider colors, result marker/chips, layout, and game mechanics were not changed.
- Manual inspection checks:
  - On Win/On Loss summary shows `Auto` for reset/default.
  - On Win/On Loss summary shows only `N.00%` for Increase By.
  - No `Increase N.00%` summary text remains in `autoSummary`.
  - Modal button text still says `Increase By`.
  - Harsh result-area border was removed in favor of soft inner glow.
  - Auto runtime behavior, Manual Dice, mobile horizontal metrics, desktop Auto layout, slider domain `2..98`, rollover behavior, and browser local `/api/*` boundary remain preserved by source inspection.
  - `.ai/context/dice-mvp/**` was not edited.
- Validation:
  - `git diff --check`: passed.
  - `pnpm lint`: passed.
  - `pnpm build`: not run because Phase 7.5 only changed Dice-local display text/classes and did not significantly change TypeScript structure.
- Risks:
  - Browser screenshot QA is still recommended to compare the softer palette against the reference across win/loss result states.
- Next recommended step:
  - Run validation, then visually QA Auto summary cards and Dice result-state tone in the browser.

## Phase 7.6 Evidence

- Status: completed Number of Bets placeholder and infinity icon polish.
- Files changed:
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Placeholder/icon notes:
  - Number of Bets now uses `placeholder="Enter number of bets"`.
  - Empty Number of Bets remains an actual empty string through the existing `updateAutoBetCount()` path.
  - Start Auto-Bet remains disabled for empty/invalid Number of Bets through the existing `isPositiveWholeNumber(autoBetCountDraft)` guard.
  - Completed auto-runs can still show actual `0` because the successful-round decrement path writes `"0"` when the finite run completes.
  - The disabled infinity affordance now renders `public/images/infinity.svg` instead of a text glyph.
  - Infinite auto-bet mode remains unimplemented; the icon is disabled/no-op in this phase.
- Manual inspection checks:
  - Empty Number of Bets shows `Enter number of bets`.
  - Users can type without deleting `0` because empty input is not replaced with `"0"`.
  - Completed auto-run can still show `0`.
  - Infinity icon is sourced from `/images/infinity.svg`.
  - Auto finite mode, Manual Dice, Configure modal behavior, Phase 7.5 visual tone, and browser local `/api/*` boundary remain preserved by source inspection.
  - `.ai/context/dice-mvp/**` was not edited.
- Validation:
  - `git diff --check`: passed.
  - `pnpm lint`: passed.
  - `pnpm build`: not run because Phase 7.6 only changed Dice-local placeholder/icon JSX and did not significantly change TypeScript structure.
- Risks:
  - Browser QA is still recommended to confirm the SVG icon tone and placeholder visibility against the soft palette reference.
- Next recommended step:
  - Run validation, then visually QA Auto Mode Number of Bets empty, typed, running, and completed states.

## Phase 7.7 Evidence

- Status: completed Auto Bet Amount decimal normalization.
- Files changed:
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Decimal normalization root cause:
  - Auto Increase By sizing uses the generic auto-bet runner's decimal math, which can produce long precise decimal strings such as `1.985576570652`.
  - Dice mirrored `autoRunner.state.currentBetAmount` directly into the visible Bet Amount input, so the generic runner's long decimal string leaked into the Auto UI.
  - The same raw runner amount was also passed into the Dice bet request path.
- Fix notes:
  - Added an optional game-supplied `normalizeBetAmount` callback to the generic auto-bet runner.
  - Dice supplies `normalizeAutoBetAmount()`, backed by the existing Dice `formatDecimal()` helper, so runner current bet amounts are stored in the same two-decimal display style as Manual Dice.
  - Dice also normalizes the Auto `betSize` defensively before calling the existing local Dice mutation.
  - Increase By still applies after matching results and remains based on the current runner bet amount; Reset strategy remains unchanged.
- Manual inspection checks:
  - Auto Bet Amount should no longer show long decimal values after Increase By sizing.
  - Manual Bet Amount formatting is unchanged because Manual Dice code paths were not modified.
  - Increase By still changes the next runner bet amount through the existing On Win / On Loss strategy path.
  - Next auto POST uses normalized `betSize` through the Dice `placeBet` callback.
  - Auto run behavior, Number of Bets decrement, marker/chips, balance refresh, Configure modal behavior, mobile metrics, summary cards, slider domain `2..98`, and browser local `/api/*` boundary remain preserved by source inspection.
  - `.ai/context/dice-mvp/**` was not edited.
- Validation:
  - `git diff --check`: passed.
  - `pnpm lint`: passed.
  - `pnpm build`: not run because Phase 7.7 only added a small optional runner normalization callback and Dice-local amount normalization; lint did not indicate structural TypeScript risk.
- Risks:
  - Live browser QA is still recommended to confirm the next POST body after win/loss Increase By transitions.
- Next recommended step:
  - Run validation, then manually test Auto Increase By with DevTools Network open to confirm normalized visible amount and normalized `betSize`.

## Phase 7.8 Evidence

- Status: completed Manual/Auto Bet Amount input contract unification.
- Files changed:
  - `src/games/dice/lib/dice-math.ts`
  - `src/games/dice/model/use-manual-dice.ts`
  - `src/games/dice/ui/dice-game.tsx`
  - `.ai/tasks/active/dice-mvp.md`
- Root cause:
  - Manual Bet Amount used `normalizeBetAmount()`, but that sanitizer preserved unlimited fractional digits, allowing values like `8.0022`.
  - Auto Bet Amount was mirrored from `autoRunner.state.currentBetAmount` whenever Auto mode was selected, so idle user edits could be overwritten by runner state.
  - Manual and Auto request paths did not both normalize immediately before sending `betSize`.
- Input contract fix notes:
  - Dice `normalizeBetAmount()` now caps fractional input to two digits, covering typing and paste.
  - Partial natural input remains possible while editing, including `8`, `8.`, `8.0`, `8.00`, and `0.99`.
  - Bet Amount now normalizes on blur through one Dice-local path.
  - Empty Bet Amount remains allowed while editing and still disables Bet / Start through existing positive-amount guards.
  - Auto idle no longer mirrors runner state into the field, so the Auto Bet Amount input remains editable before starting.
  - Auto running still mirrors the runner's current normalized bet amount into the visible input.
  - Manual bet and Auto start/request paths normalize `betSize` before submitting.
  - Half and 2x still use the existing `formatDecimal()` path.
- Decimal normalization notes:
  - Phase 7.7 runner normalization remains preserved.
  - Auto Increase By long decimal output is still normalized before display and before the next Auto POST.
  - Increase By and Reset strategy behavior were not redesigned.
- Manual inspection checks:
  - Manual Bet Amount cannot keep arbitrary long decimals after typing/paste.
  - Manual Bet Amount still supports normal two-decimal input.
  - Auto Bet Amount is editable while Auto is idle and is not overwritten by runner mirroring while the user types.
  - Auto Start uses the edited Auto Bet Amount after request normalization.
  - Manual bet POST and Auto bet POST use normalized `betSize`.
  - Half and 2x normalize consistently through `formatDecimal()`.
  - Auto Start/Stop, sequential requests, Number of Bets decrement, marker/chips, balance refresh, Configure modal behavior, summary cards, mobile metrics, desktop Auto layout, slider domain `2..98`, rollover behavior, and browser local `/api/*` boundary remain preserved by source inspection.
  - `.ai/context/dice-mvp/**` was not edited.
- Validation:
  - `git diff --check`: passed.
  - `pnpm lint`: passed.
  - `pnpm build`: not run because Phase 7.8 changed Dice-local input normalization, blur handling, and request normalization only; lint did not indicate significant TypeScript structure risk.
- Risks:
  - Live browser QA is still recommended to confirm edit/blur behavior and normalized POST payloads in both Manual and Auto modes.
- Next recommended step:
  - Run validation, then manually test Manual and Auto Bet Amount typing, paste, blur, half/2x, start, and POST payloads.

## Phase 7.8 QA, Build, And Deferred Scope Handoff

- User QA evidence recorded after Phase 7.8:
  - Manual Bet Amount normalization works.
  - Manual Bet Amount no longer keeps arbitrary long decimals such as `8.0022`.
  - Manual POST uses normalized `betSize`.
  - Auto idle Bet Amount is editable.
  - Auto Start uses the edited normalized amount.
  - Auto Increase By updates the next bet amount correctly.
  - Network payloads use normalized `betSize`.
  - Half / 2x keep normalized values.
  - Auto Mode still starts and runs correctly.
  - Configure modal behavior remains acceptable after the latest fixes.
- Production build evidence:
  - `pnpm build`: passed.
  - Next.js 16.2.6 (Turbopack).
  - Compiled successfully in 7.8s.
  - Finished TypeScript in 10.2s.
  - Collected page data using 7 workers in 2.1s.
  - Generated static pages using 7 workers: 21/21.
  - Finalized page optimization in 20ms.
- Verified build routes include:
  - `/`
  - `/games`
  - `/games/[gameSlug]`
  - `/games/dice`
  - `/games/keno`
  - `/games/plinko`
  - `/games/roulette`
  - `/api/games/dice/bet`
  - `/api/games/dice/config`
  - `/api/user/balance`
  - `/api/fairness/seed`
  - existing auth and live-bets API routes
- Current implementation status:
  - Manual Dice is working.
  - Auto Dice is working.
  - Auto Configure modal input UX/gating is working.
  - Auto Increase By behavior is working.
  - Bet Amount normalization is working in Manual and Auto.
  - Number of Bets placeholder and disabled infinity affordance are implemented.
  - Recent roll chips, result marker, rollover, balance refresh, and local `/api/*` boundary are preserved.
  - Latest build passed.
- Deferred-scope notes:
  - Fullscreen/expanded mode is still not implemented.
  - Current recommendation: implement as local expanded mode, not Browser Fullscreen API, unless explicitly approved otherwise.
  - Settings menu polish is deferred.
  - Game Rules modal is not implemented yet, despite being present in the reference.
  - Max Bet toggle/modal and `MAX` button behavior are not implemented yet.
  - Max Bet should remain a separate future task because it affects betting logic, balance usage, payout caps, max bet calculation, and Manual/Auto Bet Amount controls.
  - Turbo Mode is not implemented.
  - Volume/settings behavior beyond existing scope is not part of the current Dice MVP completion.
  - If visible non-functional controls remain in the UI, record them as known UI debt or recommend hiding/disabling them in a separate approved phase.
- Next-step recommendation:
  - First run a review/pre-commit QA pass for the current Dice MVP before adding new functionality.
  - After that, choose either Phase 8 local expanded/fullscreen mode, a separate Settings/Game Rules/Max Bet task, or final review/pre-commit/PR readiness if deferred controls are acceptable.

## Dice MVP Review Evidence

- Review status: completed after manual user QA and latest successful production build.
- User QA evidence:
  - Dice Manual mode works.
  - Dice Auto mode works.
  - Configure Auto-Bet behavior works.
  - On Win / On Loss Increase By works.
  - Stop on Profit / Stop on Loss behavior works.
  - Bet Amount normalization works in Manual and Auto.
  - Manual Bet Amount no longer keeps arbitrary long decimals such as `8.0022`.
  - Manual POST uses normalized `betSize`.
  - Auto idle Bet Amount is editable.
  - Auto Start uses the edited normalized amount.
  - Auto Increase By updates the next bet amount correctly.
  - Network payloads use normalized `betSize`.
  - Half / 2x keep normalized values.
  - Number of Bets placeholder and completed `0` state work.
  - Latest manual browser QA did not find blocking Dice runtime issues.
- Latest build evidence:
  - `pnpm build` passed with Next.js 16.2.6 Turbopack.
  - Build compiled successfully.
  - TypeScript finished.
  - Static pages generated: 21/21.
  - Routes include `/games/dice`, `/api/games/dice/bet`, `/api/games/dice/config`, `/api/user/balance`, and `/api/fairness/seed`.
- Deferred task-list items:
  - Game Settings Shell / Game Actions capabilities:
    - Universal shell for active-game actions/settings.
    - Should support per-game capabilities instead of Dice-only duplicated logic.
    - Future owner likely `widgets/game-detail` or a dedicated game settings widget, with game modules passing typed capabilities/config.
  - Game Rules modal:
    - Not implemented yet.
    - Should use reusable modal shell with per-game rules content.
    - Dice/Keno/Plinko/Roulette should provide their own rules config/content.
    - Avoid hardcoding Dice-only rules in a generic shell.
  - Max Bet capability:
    - Not implemented yet.
    - Must be a separate future task because it affects betting logic.
    - Needs backend-safe formula/contract review.
    - Should account for balance, backend maxBet, current multiplier, payout cap, Manual/Auto Bet Amount controls, and Auto next-bet clamping.
    - Should not be implemented as Dice-only duplicated UI if other games need it.
  - Local expanded/fullscreen mode:
    - Not implemented yet.
    - Recommended as local expanded mode at GameDetail/GameShell level, not Browser Fullscreen API, unless explicitly approved later.
    - Should work with the current active game content.
  - Turbo Mode:
    - Not implemented yet.
    - Needs behavior definition per game before implementation.
  - Sound / volume shell:
    - Not implemented as a full game/app sound system.
    - Should be handled as an application/game sound shell with global mute/volume and per-game event mappings, not as isolated Dice-only behavior.
  - Non-functional visible controls:
    - Settings controls that are visible but not functional should be recorded as known UI debt.
    - Future task should either implement, hide, or disable them intentionally.
- Remaining risks:
  - Visible non-functional settings controls remain UI debt.
  - Deferred Game Rules, Max Bet, Turbo Mode, expanded mode, and sound/volume behavior need separate approved scopes.
  - Browser QA should continue before PR readiness because layout/control regressions are easiest to catch visually.
- Next recommended step:
  - Run a review/pre-commit QA pass for the current Dice MVP before adding new functionality.
  - Then choose either Phase 8 local expanded/fullscreen mode, a separate Settings/Game Rules/Max Bet task, or final review/pre-commit/PR readiness if deferred controls are acceptable.

## Risks And Stop Conditions

- Stop if future implementation would touch `.ai/context/dice-mvp/`.
- Stop if screenshot evidence conflicts with written scope; written scope wins and conflict must be reported.
- Stop if auto-bet runner starts leaking Dice-specific concepts; keep that logic Dice-local instead.
- Stop if balance work expands into wallet/header redesign beyond balance display/update.
- Stop if backend endpoint shapes differ from observed contract.
- Stop if browser code would need direct external backend access.
- Stop if fairness verification requires `/fairness/history`, `/fairness/unhashed-seed`, or a backend verification route.
- Stop before introducing Zustand, dependencies, scripts, CI, Playwright, commits, pushes, PR creation, branch deletion, or lifecycle-close without explicit approval.

## Dice Follow-Up Refactor Evidence

- Refactor status: Dice god-component decomposition performed as a separate behavior-preserving follow-up candidate.
- Files changed/added:
  - `src/games/dice/ui/dice-game.tsx`
  - `src/games/dice/ui/dice-controls-panel.tsx`
  - `src/games/dice/ui/dice-manual-controls.tsx`
  - `src/games/dice/ui/dice-auto-controls.tsx`
  - `src/games/dice/ui/dice-auto-configure-modal.tsx`
  - `src/games/dice/ui/dice-bet-amount-control.tsx`
  - `src/games/dice/ui/dice-number-of-bets-control.tsx`
  - `src/games/dice/ui/dice-strategy-control.tsx`
  - `src/games/dice/ui/dice-stop-limit-control.tsx`
  - `src/games/dice/ui/dice-slider.tsx`
  - `src/games/dice/ui/dice-result-marker.tsx`
  - `src/games/dice/ui/dice-recent-results.tsx`
  - `src/games/dice/ui/dice-metric.tsx`
  - `src/games/dice/ui/dice-ui-atoms.tsx`
  - `src/games/dice/model/use-dice-game-controller.ts`
  - `src/games/dice/model/use-dice-auto-bet.ts`
  - `src/games/dice/lib/dice-input.ts`
- Decomposition notes:
  - `dice-game.tsx` is now orchestration/composition only.
  - Dice-specific auto-bet wiring moved into `use-dice-auto-bet.ts`.
  - Shared Dice page state and Manual/Auto wiring moved into `use-dice-game-controller.ts`.
  - Input normalization helpers moved into `dice-input.ts`.
  - Modal, controls, slider, result marker, recent chips, metrics, and Dice-local atoms are extracted into focused UI files.
- Behavior intent:
  - Manual Dice, Auto Dice, Configure Auto-Bet, Increase By, Stop on Profit/Loss, Bet Amount normalization, Number of Bets behavior, recent chips, result marker, slider domain, rollover, balance refresh, Provably Fair modal access, and local `/api/*` browser boundary should remain unchanged.
- Validation:
  - `git diff --check`: passed.
  - `pnpm validate`: initial sandbox build failed because Next/font could not fetch Google Outfit; rerun with network access passed.
  - `pnpm validate` covered `git diff --check`, `pnpm lint`, `pnpm build`, and `pnpm check:docs`.
- Manual QA recommendation:
  - Manual Bet once.
  - Auto run with finite Number of Bets.
  - Auto Configure modal open/apply.
  - Auto Increase By transition.
  - Bet Amount editing in Manual and Auto.
  - Half / 2x.
  - Slider change.
  - Recent chips / result marker.
  - Provably Fair modal opens.
- Remaining risks:
  - This is a structural refactor touching the Dice UI composition heavily; browser smoke QA is recommended before treating it as PR-ready.

## Dice Bet Bounds Fix Evidence

- Fix status: basic Dice bet min/max bounds added for Manual and Auto flows.
- Effective bounds rule:
  - `effectiveMinBet = config.minBet` when available, otherwise `1`.
  - `effectiveMaxBet = min(current GAME_POINTS balance, config.maxBet)` when available, otherwise config max fallback `100000`.
  - If balance is unavailable/loading for an authenticated user, Manual submit and Auto Start remain disabled.
- Files changed:
  - `src/games/dice/lib/dice-input.ts`
  - `src/games/dice/model/use-dice-game-controller.ts`
  - `src/games/dice/model/use-dice-auto-bet.ts`
  - `src/games/dice/ui/dice-bet-amount-control.tsx`
  - `src/games/dice/ui/dice-manual-controls.tsx`
  - `src/games/dice/ui/dice-auto-controls.tsx`
  - `src/games/dice/ui/dice-controls-panel.tsx`
  - `src/games/dice/ui/dice-game.tsx`
- Behavior notes:
  - Manual Bet button is disabled for empty, below-min, above-balance, above-config-max, or balance-loading amounts.
  - Manual request `betSize` is normalized and bounded before POST.
  - Auto Start uses the same validation and bounded normalized amount.
  - Auto runner normalization clamps Increase By next amounts to the effective bounds, and the Dice place-bet adapter validates again before each POST.
  - Half and 2x actions clamp displayed values through the same bounds helper.
  - Minimal inline feedback was added under Bet Amount for below-min, above-balance, above-config-max, and balance-loading states.
- Validation:
  - `git diff --check`: passed.
  - `pnpm validate`: initial sandbox build failed because Next/font could not fetch Google Outfit; rerun with network access passed.
  - `pnpm validate` covered `git diff --check`, `pnpm lint`, `pnpm build`, and `pnpm check:docs`.
- Manual QA recommendation:
  - Manual amount `0.5` cannot submit.
  - Manual amount `1` can submit if balance allows.
  - Manual amount above current balance cannot submit.
  - Manual amount above `100000` / config max cannot submit.
  - Auto Start is disabled for below-min amount.
  - Auto Start is disabled for above-max amount.
  - Half / 2x respect min/max.
  - Auto Increase By never sends a next `betSize` above effective max.
  - Manual and Auto normal valid bets still work.
- Risks:
  - Browser smoke QA should confirm that balance-loading feedback and clamp-on-blur behavior feel natural in both Manual and Auto mode.
