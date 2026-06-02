# Foundation Decisions

## Purpose

This document is the project-specific foundation source of truth for `quantum-play` before feature implementation.

`quantum-play` is a fresh Next.js App Router frontend for an iGaming platform with four planned games: Plinko, Keno, Dice, and Roulette. The backend already exists and remains authoritative for real game outcomes, wallet/balance, and game configuration.

Status key:

- Implemented: present in this baseline or already present in the repository.
- Planned: accepted ownership or future direction, not necessarily created.
- Deferred: intentionally postponed to a later approved task.
- Out of scope: not part of this baseline.

## Current Stack And Scripts

Implemented package scripts:

```txt
pnpm dev
pnpm build
pnpm start
pnpm lint
```

Implemented relevant dependencies include Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind CSS 4, class-variance-authority, clsx, tailwind-merge, Radix UI packages, motion, React Hook Form, Zod, TanStack Query, Zustand, Howler, Big.js, Sonner, and Lucide React.

Rule: do not claim scripts, tools, folders, validation commands, or workflow layers exist unless they are present in the repository.

## Project Structure Decision

Planned ownership model:

```txt
src/app       Thin Next.js routing/composition layer and future route handlers.
src/widgets   Large product/page composition blocks.
src/games     Concrete game vertical modules.
src/features  Reusable user actions and use-cases.
src/entities  Domain nouns.
src/shared    Design primitives, generic libraries, config, and assets.
docs          Architecture, workflow, and decision documentation.
.claude       Claude-centered AI rules, skills, prompts, templates, and hook policy.
.ai/tasks     Neutral AI task lifecycle records only.
```

Implemented in this baseline: `docs/architecture`, `docs/workflow`, `.claude`, and `.ai/tasks` infrastructure files.

Deferred: product ownership folders should appear only with a first real file or separately approved task.

Out of scope: empty `src/widgets`, `src/games`, `src/features`, `src/entities`, or `src/shared` folders created only to mirror the target structure.

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

Deferred: primitives, composed components, full component inventory, and first product UI.

Out of scope: Storybook, theme switcher, and design system component implementation.

## State/Data/API/BFF Boundary Decision

Planned boundary:

```txt
Browser UI -> local /api/* -> src/app/api/** route handlers -> external backend API
```

Accepted rules:

- Browser code calls only local `/api/*`.
- Browser code must not call the external backend directly.
- Browser code must not know the backend base URL.
- Backend base URL, auth headers, cookies/session/refresh/token logic are server-side/BFF only.
- `src/app/api/**` is the approved future location for BFF route handlers.
- TanStack Query owns server state.
- Zustand owns local UI/game/playback state.
- React Hook Form owns form draft state.
- Zod validates external or unstable boundaries.
- Big.js is for decimal-safe UI calculations only, not backend authority.
- Backend response is authoritative for game result, wallet/balance, and game config.

Deferred: endpoint mapping and exact route ownership.

Out of scope: BFF route handlers, DTOs, API clients, query hooks, API folders, backend fetch helpers, and server auth helpers.

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
```

The `.claude` hub is primary for persistent AI rules and skills. `AGENTS.md` bridges Codex into the same source-backed workflow. `.ai/tasks` stores neutral task lifecycle records only.

Out of scope: CI, Playwright, active hooks, worktrees, MCP, subagents, release automation, observability, endpoint-specific rules, and API/BFF implementation.

## Validation Workflow Decision

Implemented lightweight validation baseline:

```txt
git diff --check
pnpm lint
pnpm build
manual scope check
manual documentation impact check
manual API boundary check through skill
manual UI QA evidence through skill when UI changes
```

Deferred: `scripts/validate.sh`, docs freshness script, scripted API boundary check, and package `validate` script.

Out of scope: CI, Playwright, active hooks, and scripts directory.

## Implementation Scope

Implemented scope: one lean AI infrastructure baseline before feature implementation.

Allowed in this baseline: operating contracts, rules, skills, workflow docs, prompts, templates, and neutral task lifecycle records.

Out of scope in this baseline: product source implementation, design system components, game implementation, API endpoint mapping, BFF route handlers, DTO implementation, browser API clients, TanStack Query hooks, Zustand stores, renderer implementation, scripts, CI, Playwright, and active hooks.
