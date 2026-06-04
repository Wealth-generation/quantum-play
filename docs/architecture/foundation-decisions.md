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

Implemented relevant dependencies include Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind CSS 4, class-variance-authority, clsx, tailwind-merge, Radix UI packages, motion, React Hook Form, Zod, TanStack Query, Zustand, Howler, Big.js, Sonner, Lucide React, and react-google-recaptcha.

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

Implemented: `src/app`, `src/features/auth`, `src/shared`, `src/widgets`, `docs/architecture`, `docs/workflow`, `.claude`, and `.ai/tasks` infrastructure files.

Deferred: `src/games` and `src/entities` should appear only with a first real file or separately approved task.

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

Implemented: initial shared primitives under `src/shared/ui/primitives`, `cn()` support, design tokens, app shell, top bar, auth modal, and lobby-oriented product UI foundation.

Deferred: composed component expansion, full component inventory, and game-specific UI.

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

Deferred: non-auth endpoint mapping and exact non-auth route ownership.

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

Deferred: `features/place-bet`, `entities/bet`, `entities/game`, `widgets/game-layout`, and game API ownership.

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
- Local Auth Integration as the first real auth/BFF slice.

Allowed only with explicit approval: additional product source, additional BFF route handlers, DTO implementation, browser API clients, TanStack Query hooks, Zustand stores, renderer implementation, game implementation, scripts, CI, Playwright, and active hooks.

Out of scope without explicit approval: unapproved or premature product/API/BFF/auth expansion, non-auth endpoint mapping, social OAuth, socket integration, wallet/profile/progression APIs, game APIs, and lifecycle/tooling automation.
