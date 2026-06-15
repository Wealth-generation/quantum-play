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

Implemented relevant dependencies include Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind CSS 4, class-variance-authority, clsx, tailwind-merge, Radix UI packages, motion, React Hook Form, Zod, TanStack Query, Zustand, Howler, Big.js, Sonner, Lucide React, react-google-recaptcha, and PixiJS for the Plinko-local renderer foundation.

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
src/app/api/fairness/seed/route.ts       GET/PUT /api/fairness/seed
```

Browser code calls these local `/api/*` routes only. The Dice BFF routes map server-side to backend Dice config and bet endpoints. The Plinko BFF foundation maps server-side to backend Plinko config and bet endpoints, forwards auth cookies only from route handlers, and enriches browser-safe Plinko config with Plinko-local rows, risks, and multiplier tables because the observed backend config returns only min/max bet bounds. The balance route maps server-side to the backend current-user query and returns only browser-safe `gamePoints` and `watchPoints`. The fairness route maps server-side to seed read/change endpoints. Backend URL construction and auth cookie forwarding remain server-side only.

Implemented browser-safe non-auth feature ownership:

```txt
src/features/balance/**        Shared balance client/query/types consumed by TopBar and game flows.
src/features/provably-fair/**  Fairness seed client/query/types and client-side Dice/Plinko verify helpers.
src/features/auto-bet/**       Generic game-agnostic finite auto-bet runner.
```

TopBar uses the shared balance query for `GAME_POINTS` and `WATCH_POINTS`. Dice bet activity invalidates/refetches that shared balance query after successful bets. The auto-bet runner is game-agnostic: games pass `placeBet`, amount normalization, sizing configuration, and stop conditions; the runner must not import Dice-specific logic.

Backend response remains authoritative for Dice bet outcome, payout, multiplier, random value, threshold, and win/loss result. Browser-side Dice helpers may format and verify values for UI, but they do not decide backend-authored outcomes.

Deferred non-auth API scope: wallet/profile/progression endpoints, fairness history, unhashed seed lookup, backend-side verification route, full wallet APIs, realtime/socket APIs, and endpoint mappings not listed above.

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
Your bets API integration
game-specific live bet filtering
pagination or realtime updates
```

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

Implemented Plinko Phase 1 foundation ownership:

```txt
src/games/plinko/config/**    Plinko rows, risks, default bounds, and multiplier tables for rows 8-14.
src/games/plinko/lib/**       Plinko path, bucket, expected multiplier, and backend contract warning helpers.
src/games/plinko/model/**     Plinko browser-safe config, bet request/result, and warning types.
src/games/plinko/renderer/**  Plinko-local renderer interface and client-only PixiJS lifecycle skeleton.
src/games/plinko/ui/**        Plinko non-playable route shell, controls scaffold, board scaffold, and Pixi host.
src/games/plinko/index.ts     Plinko foundation public exports.
```

The Plinko Phase 2 scaffold is wired into `/games/plinko` through the existing `GameDetail` shell and renders static pegs, bucket backgrounds, bucket multiplier labels, Manual/Auto tab scaffolding, risk/rows controls, and disabled betting controls. It does not implement real betting, ball animation, rapid manual betting, balance reservation, Auto/Infinity runtime, Turbo runtime, mini-history, or Provably Fair modal wiring. The renderer boundary is Plinko-local and must not become a shared renderer or global game engine without a future approved repeated-use need.

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

Implemented Provably Fair baseline:

```txt
src/widgets/provably-fair-modal/**
src/features/provably-fair/**
src/app/api/fairness/seed/route.ts
```

Seed read/change is routed through local `/api/fairness/seed`. A client-side Dice verification helper exists as a baseline, and Plinko Phase 1 adds a helper that derives the final Plinko bucket index from one generated binary value per row. Fairness history, unhashed server seed lookup, full Plinko Provably Fair modal wiring, and backend/server-side verification endpoints are not implemented.

Implemented Game Action Shell ownership:

```txt
src/widgets/game-detail/**        Capability-driven game detail actions/settings, Game Rules, and shell composition.
src/features/max-bet/**           Reusable Max Bet contract.
src/features/game-expanded-mode/** Reusable local expanded/fullscreen contract.
src/features/turbo-mode/**        Reusable Turbo Mode contract.
```

The Game Detail shell owns per-game action capabilities, settings/action rendering, Game Rules modal composition, route-keyed shell provider composition, and shell-root fullscreen/overlay support. Game Rules modal content exists for Dice, Keno, Plinko, and Roulette within the approved shell scope. Unsupported actions are hidden by capability, so Roulette does not show Turbo, Max Bet, or Provably Fair.

Max Bet is implemented as a reusable feature contract with Dice as the first playable consumer. Dice normal max remains `100000`; Dice Max Bet mode uses the approved `500000` max, exposes the Dice `MAX` control only while enabled, and clamps active Dice bet controls to the current active max without changing backend/API/BFF, result, odds, payout, balance authority, or fairness behavior.

Local expanded/fullscreen mode is implemented as a reusable feature contract. The Game Detail shell registers the fullscreen target, uses the Browser Fullscreen API on the shell root target, hides BetLive while fullscreen is active, and provides a fullscreen-local portal container so settings, Game Rules, Provably Fair, Max Bet warning, and Dice Auto Configure overlays can render inside the fullscreen subtree. Normal mode keeps default portal behavior.

Turbo Mode is implemented as a reusable route-local/session-local feature contract. The Game Detail shell owns the route-keyed Turbo provider boundary and settings toggle. Dice is the first playable Turbo consumer: Turbo speeds Dice visual result animations and changes only the Dice Auto Mode inter-round wait from `800ms` to `400ms` while preserving the existing sequential auto runner and backend-authored request/result flow. Plinko consumes the same shell Turbo state inside its game-local renderer path: Normal mode slows visual replay to `0.75x`, Turbo preserves the previously accepted `1x` replay pace, and only Matter/custom replay elapsed time is scaled. Plinko backend results, request pacing, payout settlement, balance projection, mini-history trigger semantics, and fairness logic remain unchanged.

Deferred game-action capabilities and visible UI debt:

- Sound/volume shell behavior, audio engine, global mute/volume, per-game event mappings, and persistence.
- Infinite auto-bet mode.
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
