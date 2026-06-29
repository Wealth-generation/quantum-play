# Foundation Decisions

## Purpose

This document is the project-specific foundation source of truth for `quantum-play`.

`quantum-play` is a Next.js App Router frontend for an iGaming platform with four planned games: Plinko, Keno, Dice, and Roulette. The backend already exists and remains authoritative for real game outcomes, wallet/balance, and game configuration.

Status key:

- Implemented: present in the repository.
- Planned: accepted ownership or future direction, not necessarily created.
- Deferred: intentionally postponed to a later approved task.
- Out of scope: not part of the current approved project scope.

## Current Stack And Scripts

Implemented package scripts:

```txt
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm check:docs
pnpm validate
```

Implemented relevant dependencies include Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind CSS 4, class-variance-authority, clsx, tailwind-merge, Radix UI packages, motion, React Hook Form, Zod, TanStack Query, Zustand, Howler, Big.js, Sonner, and Lucide React. The normal Plinko visual path uses Canvas 2D static-trajectory replay. PixiJS and Matter.js package declarations remain temporarily while their package-manager removal is blocked; no Plinko source imports them.

Rule: do not claim scripts, tools, folders, validation commands, or workflow layers exist unless they are present in the repository.

## Project Structure Decision

Planned ownership model:

```txt
src/app       Thin Next.js routing/composition layer and local route handlers.
src/widgets   Large product/page composition blocks.
src/games     Concrete game vertical modules.
src/features  Reusable user actions and use-cases.
src/entities  Domain nouns.
src/shared    Design primitives, generic libraries, config, and assets.
docs          Architecture, workflow, and decision documentation.
.claude       Claude-centered AI rules, skills, prompts, templates, and hook policy.
.ai/tasks     Neutral AI task lifecycle records only.
```

Implemented: `src/app`, `src/features/auth`, `src/shared`, `src/widgets`, lean `src/entities/game/model` metadata, lean `src/entities/bet/model` DTO/display helpers, `src/games/dice` as the first real game module, `docs/architecture`, `docs/workflow`, `.claude`, and `.ai/tasks` infrastructure files.

Deferred: broader `src/entities` expansion beyond the approved game metadata and bet DTO/display model remains deferred until a concrete task needs it. Additional concrete game modules should appear only with their first approved real implementation file.

Out of scope: empty ownership folders created only to mirror the target structure.

Implemented User Profile MVP:

```txt
src/app/user/page.tsx                       Thin server route that resolves the `tab` query parameter.
src/widgets/user-profile/**                 Thin read-only User Profile page orchestrator.
src/features/user-profile/**                Mostly read-oriented browser-safe profile clients, the approved username mutation client/query wiring, profile/bets types, display helpers, tab/filter models, and feature-local UI panels.
src/app/api/user/profile/route.ts           GET /api/user/profile
src/app/api/user/profile/username/route.ts  PATCH /api/user/profile/username
src/app/api/user/profile/stats/route.ts     GET /api/user/profile/stats
src/app/api/user/bets/route.ts              GET /api/user/bets
src/app/api/fairness/history/route.ts       GET /api/fairness/history
```

`/user` supports the default Profile tab plus `connections`, `bets-history`, and `seed-history` query tabs. Missing, unknown, or repeated `tab` values resolve to Profile. The page reads authenticated profile data, profile stats, paginated my-bets history, and paginated seed history through local `/api/*` BFF routes only. Desktop uses horizontal tabs and mobile uses a dropdown tab selector. Username edit is implemented as the only Profile Page MVP mutation: browser code calls local `PATCH /api/user/profile/username`, the BFF maps server-side to backend `PATCH /user/command/update/user-info` through `backendFetch()` and `BACKEND_BASE_URL`, the browser receives only a safe local success payload, and successful edits refetch profile/session state. The rest of the MVP remains read-only: private mode, reset password, avatar/email edits, wallet address updates, social connect/OAuth, DegenCity apply/connect, Points Shop, Affiliates, seed update/reset/copy behavior, and auth/session behavior changes are deferred.

## Design System Foundation Decision

Planned foundation:

```txt
Tailwind CSS + CSS variables + cn() + CVA + Radix wrappers + Motion + single dark theme first
```

Rules:

- Tailwind CSS is the styling foundation.
- CSS variables define stable design tokens.
- `cn()` means `clsx` plus `tailwind-merge`.
- CVA is used for reusable primitive variants.
- Radix primitives should be wrapped through `src/shared/ui/primitives`.
- Motion is used for UI transitions, reveal states, feedback, tabs, and lightweight interactions.
- Game renderer animation belongs in `src/games/<game>/renderer`.
- Start with a single dark theme.
- Shared primitives must be business-agnostic.
- Product-specific UI belongs in widgets, entities, features, or games.

Implemented: initial shared primitives under `src/shared/ui/primitives`, including the generic Radix Slider wrapper; `cn()` support; design tokens; app shell; top bar; auth modal; and lobby-oriented product UI foundation. Shared primitives remain business-agnostic. Dice-specific slider labels, markers, threshold/chance behavior, result coloring, and roll history are composed in `src/games/dice/**`, not in the shared Slider primitive.

Deferred: composed component expansion and full component inventory.

Out of scope: Storybook, theme switcher, and unapproved broad design system component expansion.

## State/Data/API/BFF Boundary Decision

Accepted boundary:

```txt
Browser UI -> local /api/* -> src/app/api/** route handlers -> external backend API
```

Accepted rules:

- Browser code calls only local `/api/*`.
- Browser code must not call the external backend directly.
- Browser code must not know the backend base URL.
- Backend base URL, auth headers, cookies/session/refresh/token logic are server-side/BFF only.
- `src/app/api/**` is the approved location for local BFF route handlers.
- Local Auth Integration is implemented as the first real auth/BFF slice. Durable details live in `docs/architecture/auth.md`.
- TanStack Query owns server state.
- Zustand owns local UI/game/playback state.
- React Hook Form owns form draft state.
- Zod validates external or unstable boundaries.
- Big.js is for decimal-safe UI calculations only, not backend authority.
- Backend response is authoritative for game result, wallet/balance, and game config.

Implemented auth ownership:

```txt
src/app/api/auth/**      Local auth BFF route handlers.
src/app/api/_lib/**      Server-only auth backend, cookie, and error helpers.
src/features/auth/**     Browser-safe auth client, session hooks, and auth types.
src/widgets/auth-modal   Auth modal UI and interaction flow.
```

Implemented Dice, balance, and fairness BFF ownership:

```txt
src/app/api/games/dice/config/route.ts   GET  /api/games/dice/config
src/app/api/games/dice/bet/route.ts      POST /api/games/dice/bet
src/app/api/games/plinko/config/route.ts GET  /api/games/plinko/config
src/app/api/games/plinko/bet/route.ts    POST /api/games/plinko/bet
src/app/api/user/balance/route.ts        GET  /api/user/balance
src/app/api/user/profile/route.ts        GET  /api/user/profile
src/app/api/user/profile/username/route.ts PATCH /api/user/profile/username
src/app/api/user/profile/stats/route.ts  GET  /api/user/profile/stats
src/app/api/user/bets/route.ts           GET  /api/user/bets
src/app/api/fairness/seed/route.ts       GET/PUT /api/fairness/seed
src/app/api/fairness/history/route.ts    GET  /api/fairness/history
```

Browser code calls these local `/api/*` routes only. The Dice BFF routes map server-side to backend Dice config and bet endpoints. The Plinko BFF foundation maps server-side to backend Plinko config and bet endpoints, forwards auth cookies only from route handlers, and enriches browser-safe Plinko config with Plinko-local rows, risks, and multiplier tables because the observed backend config returns only min/max bet bounds. The balance route maps server-side to the backend current-user query and returns only browser-safe `gamePoints` and `watchPoints`. The profile routes map server-side to backend current-user, username update, profile-stats, and my-bets endpoints, forward auth cookies only from route handlers, validate response shapes, and return browser-safe profile, stats, balance, crypto-address, connection, and bet-history data. The username update route forwards only `{ username }` and returns only a safe local success payload, never the raw backend user object. The fairness routes map server-side to seed read/change and paginated seed-history endpoints; the seed-history response omits backend-only `id`, `userId`, and `hashedServerSeed` fields. Backend URL construction and auth cookie forwarding remain server-side only.

Implemented browser-safe non-auth feature ownership:

```txt
src/features/balance/**        Shared balance client/query/types consumed by TopBar and game flows.
src/features/user-profile/**   Mostly read-oriented Profile page clients, query hooks, types, display helpers, and the approved username edit mutation wiring.
src/features/provably-fair/**  Fairness seed client/query/types and client-side Dice/Plinko verify helpers.
src/features/auto-bet/**       Generic game-agnostic finite and infinite auto-bet runner.
src/features/game-bet/**       Game-bet-only browser helper for local auth-refresh retry policy.
```

TopBar uses the shared balance query for `GAME_POINTS` and `WATCH_POINTS`. `useBalanceQuery` remains the canonical backend server-state source. The existing opt-in display projection overlay carries typed `GAME_POINTS` display events for a stake debit or a settled win/loss; TopBar consumes only that generic display metadata to animate its local balance digits and temporary settlement feedback. Settlement events set a win/loss outcome only when payout differs from stake; break-even/push settlements omit it and retain neutral styling. Dice temporarily projects its stake debit and backend-result settlement for display, then refetches and clears the projection. Plinko preserves its accepted-round visual reservation and payout application while publishing equivalent debit/settlement metadata, then reconciles after its existing settlement flow. These projections are display-only: browser code does not decide authoritative balances, results, or payouts. The auto-bet runner is game-agnostic: games pass `placeBet`, amount normalization, finite or infinite remaining-bet mode, sizing configuration, and stop conditions; the runner must not import Dice- or Plinko-specific logic.

The game-bet helper is intentionally narrow: browser game clients may use it only for local `POST /api/games/*/bet` requests. If a bet request returns `401 Unauthorized`, it runs one in-memory, single-flight local `/api/auth/refresh` attempt through the auth feature and then retries the exact same serialized bet payload once. It does not persist requests, create a retry queue, retry non-auth failures, expose backend URL or tokens, or replace game-specific clients.

Backend response remains authoritative for Dice bet outcome, payout, multiplier, random value, threshold, and win/loss result. Browser-side Dice helpers may format and verify values for UI, but they do not decide backend-authored outcomes.

Deferred non-auth API scope: wallet/progression endpoints, profile mutations other than the approved username edit, social connect/OAuth endpoints, DegenCity mutations, unhashed seed lookup, backend-side verification route, full wallet APIs, realtime/socket APIs, and endpoint mappings not listed above.

Implemented Live Bets BFF slice:

```txt
src/app/api/bets/**        Public local Live Bets BFF route handlers.
src/widgets/bet-live/**    Browser-safe Live Bets UI, local API client, and TanStack Query wiring.
src/entities/bet/model/**  LiveBet DTO shape and pure display helpers.
```

Implemented Live Bets route inventory:

```txt
GET /api/bets/latest
GET /api/bets/latest/high-rollers
GET /api/bets/latest/lucky
```

These are local BFF routes. Browser code calls these routes, not the external backend. The external backend URL remains server-only through `BACKEND_BASE_URL`.

Deferred Live Bets scope:

```txt
GET /site-config/live-bets
Live Bets "Your" tab integration
game-specific live bet filtering
pagination or realtime updates
```

Implemented Roulette BFF ownership:

```txt
src/app/api/games/roulette/bet/route.ts   POST /api/games/roulette/bet
```

This is the only Roulette BFF route. The backend exposes no Roulette config endpoint, so no `config` route exists; Roulette presentation defaults (board layout, chip denominations, payouts, bet bounds) are frontend-only constants. The bet route maps server-side to the backend Roulette bet endpoint, forwards the auth cookie server-side, validates that the request `params` object contains all ten bet-type arrays with valid entry shapes and numeric-string amounts, and validates/normalizes the `{ betId, createdAt, betSize, payout, randomPosition, multiplier }` response. Backend URL and auth cookies remain server-side only. Backend response stays authoritative for the winning position and payout. The Roulette bet response carries no balance and no fairness fields.

Out of scope: unapproved or premature BFF route handlers, DTOs, API clients, query hooks, API folders, backend fetch helpers, server auth helpers, auth/session expansion, and non-auth endpoint mapping.

## Game Frontend Architecture Decision

Planned concrete games live under:

```txt
src/games/<game>/
  ui/
  model/
  renderer/
  lib/
  config/
  index.ts
```

Rules:

- Backend result is authoritative.
- Renderer never decides outcome.
- Renderer never calls API.
- Renderer visualizes an already received result.
- Game modules must not import from other game modules.
- Shared abstractions appear only after repeated real usage proves need.

Deferred: `features/place-bet`, broader `entities/bet`, broader `entities/game`, `widgets/game-layout`, and non-Dice game API ownership.

Implemented placeholder and game-detail ownership:

```txt
src/app/games/**           Public games routes.
src/widgets/games-lobby/** Public games lobby UI.
src/widgets/game-detail/** Public game detail shell UI and game action shell.
src/entities/game/model/** Game slug, label, route, and image metadata.
```

Implemented Dice game ownership:

```txt
src/games/dice/config/**   Dice constants and display/default configuration.
src/games/dice/lib/**      Dice-specific decimal/math helpers.
src/games/dice/model/**    Dice browser-safe client/query/types and local UI model.
src/games/dice/ui/**       Dice Manual/Auto UI composition.
src/games/dice/index.ts    Dice module public exports.
```

`/games/dice` renders the real Dice game UI through the game detail route. Other game slugs remain placeholders. Dice owns Dice-specific UI/model/lib/config behavior and must not be treated as a shared game engine. Dice does not create a renderer module yet; current result visualization is UI composition around backend-authored bet results.

Implemented Dice UI behavior:

- Manual Dice mode.
- Auto Dice mode with finite Number of Bets only.
- Configure Auto-Bet modal.
- On Win / On Loss Reset or Increase By.
- Stop on Profit / Stop on Loss.
- Bet Amount normalization in Manual and Auto.
- Number of Bets placeholder and completed `0` state.
- Recent roll chips and result marker.
- Rollover behavior.
- Responsive desktop/mobile layout.
- Local `/api/*` browser boundary.

Implemented Plinko MVP ownership:

```txt
src/games/plinko/config/**    Plinko rows, risks, default bounds, and multiplier tables for rows 8-14.
src/games/plinko/lib/**       Plinko path, bucket, input, money, motion, result, and backend contract warning helpers.
src/games/plinko/model/**     Plinko browser-safe config/bet client, query, manual/auto betting state, visual settlement ledger, fairness snapshot, and mini-history model.
src/games/plinko/renderer/**  Plinko-local renderer interface plus Canvas 2D static-trajectory replay implementation.
src/games/plinko/ui/**        Plinko playable route UI, controls, Canvas board host, board panel, and mini-history.
src/games/plinko/index.ts     Plinko foundation public exports.
```

`/games/plinko` renders the real Plinko MVP through the existing `GameDetail` shell. Browser code calls only local `GET /api/games/plinko/config` and `POST /api/games/plinko/bet`; the backend result remains authoritative for accepted outcomes, multiplier, payout, result path, and balance reconciliation. Manual betting creates visual rounds only after accepted BFF responses. Failed requests create no visual ball. Plinko keeps a game-local accepted-round ledger, opt-in display balance projection, visual settlement/payout application, settled-only mini-history, finite AutoBet, Infinity AutoBet, Max Bet controls, Turbo replay timing, and a latest accepted result snapshot for the shared Provably Fair modal. The Canvas renderer fetches approved same-origin static trajectory assets, validates the accepted result path and bucket, then replays one deterministic trajectory variant per accepted round. It never calls APIs, decides outcomes, mutates business state, or changes settlement authority. The legacy Pixi/Matter Plinko source has been removed. The renderer boundary remains Plinko-local and must not become a shared renderer or global game engine without a future approved repeated-use need.

Implemented Roulette game ownership (first slice):

```txt
src/games/roulette/config/**   Frontend-only constants: board/number→color map, chip denominations, display payouts, bet bounds, backend color codes.
src/games/roulette/lib/**      Pure helpers: chip-placement → 10 bet-type arrays mapper, game-local decimal-safe money helpers, localStorage persistence helpers.
src/games/roulette/model/**    DTO types, local BFF client, bet mutation query, Zustand chip-placement store, game controller.
src/games/roulette/ui/**       Chip tray, betting table (straight + color), static result display, game composition.
src/games/roulette/index.ts    Roulette module public exports.
```

`/games/roulette` renders the first real Roulette slice through the game detail route: place chips → send bet → reveal the winning number statically → refresh the shared balance. This slice supports only Straight and Color bets, but always sends all ten bet-type arrays (the rest empty) in the request `params`. Roulette owns Roulette-specific UI/model/lib/config and must not import Dice logic or be treated as a shared engine. There is no animated wheel and no `renderer` module yet; the winning position from `randomPosition` is visualized through UI composition. The authoritative `payout` string drives win/loss and winnings display; `multiplier` is shown for reference only and is never used for math, because multi-bet multiplier semantics are unconfirmed.

The Roulette chip-placement Zustand store is the first Zustand store in the codebase and is the runtime source of truth for placed chips, consistent with the accepted "Zustand owns local UI/game/playback state" boundary. localStorage is a persistence layer only: it is hydrated into the store after mount and written through on placement changes under a versioned key (`roulette:bets:v1`) with corrupt/invalid data discarded; bet `params` are always built from the store, never from localStorage. Roulette currently keeps Turbo, Max Bet, and Provably Fair hidden through the existing Game Action Shell capability map; client-side fairness verification is intentionally not reused from Dice because the Dice verification range does not match Roulette.

Implemented Provably Fair baseline:

```txt
src/widgets/provably-fair-modal/**
src/features/provably-fair/**
src/app/api/fairness/seed/route.ts
src/app/api/fairness/history/route.ts
```

Seed read/change is routed through local `/api/fairness/seed`. Paginated seed history is routed through local `GET /api/fairness/history` for the read-only Profile Seed History tab. Client-side Dice verification is implemented in the shared Provably Fair modal. Plinko uses the same Game Detail shell action and shared modal pattern. The Plinko Verify tab works as a standalone local calculator from client seed, server seed, nonce, rows, and risk: local verification derives one generated binary value per row, computes `bucketIndex = sum(results)`, and selects the displayed multiplier from the local Plinko multiplier table. When the game publishes a latest accepted backend result snapshot to the fairness feature boundary and that snapshot matches the selected rows/risk context, the modal compares the generated row path with backend `results` and compares the generated bucket with the accepted backend bucket. A bucket mismatch is treated as a verification error; a bucket match with a different row path is shown only as compact diagnostic context because multiple Plinko paths can land in the same final bucket. The Verify tab recalculates Dice and Plinko verification locally after required inputs change, while seed change remains an explicit action. The Verify game selector lists the existing game labels, but only Dice and Plinko implement local verification; Keno and Roulette show an unavailable state. Backend bet responses remain authoritative for real-game multiplier, payout, wallet, and game outcome display outside the local verification calculator. Unhashed seed lookup and backend/server-side verification endpoints are not implemented.

Implemented Game Action Shell ownership:

```txt
src/widgets/game-detail/**        Capability-driven game detail actions/settings, Game Rules, and shell composition.
src/features/max-bet/**           Reusable Max Bet contract.
src/features/game-expanded-mode/** Reusable local expanded/fullscreen contract.
src/features/turbo-mode/**        Reusable Turbo Mode contract.
```

The Game Detail shell owns per-game action capabilities, settings/action rendering, Game Rules modal composition, route-keyed shell provider composition, and shell-root fullscreen/overlay support. Game Rules modal content exists for Dice, Keno, Plinko, and Roulette within the approved shell scope. The shared Provably Fair action is enabled for Dice and Plinko through the same shell action pattern. Unsupported actions are hidden by capability, so Roulette does not show Turbo, Max Bet, or Provably Fair.

Max Bet is implemented as a reusable feature contract with Dice as the first playable consumer. Dice normal max remains `100000`; Dice Max Bet mode uses the approved `500000` max, exposes the Dice `MAX` control only while enabled, and clamps active Dice bet controls to the current active max without changing backend/API/BFF, result, odds, payout, balance authority, or fairness behavior.

Local expanded/fullscreen mode is implemented as a reusable feature contract. The Game Detail shell registers the fullscreen target, uses the Browser Fullscreen API on the shell root target, hides BetLive while fullscreen is active, and provides a fullscreen-local portal container so settings, Game Rules, Provably Fair, Max Bet warning, and Dice Auto Configure overlays can render inside the fullscreen subtree. Normal mode keeps default portal behavior.

Turbo Mode is implemented as a reusable route-local/session-local feature contract. The Game Detail shell owns the route-keyed Turbo provider boundary and settings toggle. Dice is the first playable Turbo consumer: Turbo speeds Dice visual result animations and changes only the Dice Auto Mode inter-round wait from `800ms` to `400ms` while preserving the existing sequential auto runner and backend-authored request/result flow. Plinko consumes the same shell Turbo state inside its game-local renderer path: Normal mode slows visual replay to `0.75x`, Turbo preserves the previously accepted `1x` replay pace, and only Canvas trajectory playback elapsed time is scaled. Plinko backend results, request pacing, payout settlement, balance projection, mini-history trigger semantics, and fairness logic remain unchanged.

Deferred game-action capabilities and visible UI debt:

- Sound/volume shell behavior, audio engine, global mute/volume, per-game event mappings, and persistence.
- Real Keno and Roulette gameplay integrations, plus future game-specific Turbo behavior beyond the implemented Dice and Plinko consumers.
- Future product tuning for Dice Turbo visual timing and Dice Auto Mode `800ms` / `400ms` pacing.
- Broader game-specific polishing where not implemented by the approved Game Action Shell, Max Bet, fullscreen, or Turbo slices.

Out of scope: universal game engine, shared renderer, game factory, global animation engine, universal round machine, and universal payout calculator.

## AI Infrastructure Decision

Implemented in this baseline:

```txt
AGENTS.md
CLAUDE.md
docs/architecture/foundation-decisions.md
docs/workflow/**
.claude/rules/**
.claude/skills/**
.claude/hooks/README.md
.claude/prompts/**
.claude/templates/**
.ai/tasks/**
scripts/docs-ownership-map.json
scripts/check-docs-freshness.mjs
scripts/validate.mjs
```

The `.claude` hub is primary for persistent AI rules and skills. `AGENTS.md` bridges Codex into the same source-backed workflow. `.ai/tasks` stores neutral task lifecycle records only.

Out of scope: CI, Playwright, active hooks, worktrees, MCP, subagents, release automation, observability, and endpoint-specific rules beyond the implemented auth/BFF slice.

## Validation Workflow Decision

Implemented lightweight validation baseline:

```txt
git diff --check
pnpm lint
pnpm build
pnpm check:docs
pnpm validate
manual scope check
manual documentation impact check
manual API boundary check through skill
manual UI QA evidence through skill when UI changes
```

Implemented docs freshness baseline:

```txt
docs/workflow/ownership-to-docs.md      Human-readable ownership-to-docs mapping.
scripts/docs-ownership-map.json         Machine-readable mapping for scripts.
scripts/check-docs-freshness.mjs        Mechanical docs evidence check.
scripts/validate.mjs                    Validation aggregator.
```

The docs freshness script checks evidence only: mapped/significant changed files require mapped durable docs changes or an active task artifact with a source-backed docs-not-needed rationale. Documentation, review, and pre-commit skills still judge semantic correctness.

Deferred: scripted API boundary check.

Out of scope: CI, Playwright, active hooks, git hooks, semantic documentation analyzer, and scripted API boundary scanner.

## Implementation Scope

Implemented scope:

- lean AI infrastructure baseline;
- design system and app shell foundation;
- Local Auth Integration as the first real auth/BFF slice;
- public Games Lobby and Game Detail shell with a small public Live Bets BFF slice;
- Dice MVP as the first active game module, including Dice BFF routes, shared balance query, Provably Fair baseline, generic auto-bet runner, and shared Slider primitive usage.

Allowed only with explicit approval: additional product source, additional BFF route handlers, DTO implementation, browser API clients, TanStack Query hooks, Zustand stores, renderer implementation, game implementation, scripts, CI, Playwright, and active hooks.

Out of scope without explicit approval: unapproved or premature product/API/BFF/auth expansion, non-auth endpoint mapping, social OAuth, socket integration, wallet/profile/progression APIs, game APIs, and lifecycle/tooling automation.
