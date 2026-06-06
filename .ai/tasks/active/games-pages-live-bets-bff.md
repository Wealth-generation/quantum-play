# Task Lifecycle Record

## Identity

- Task title: Games Lobby and Game Detail Shell with Live Bets BFF Slice
- Status: Active
- Mode: Implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: codex/games-pages-live-bets-bff
- Current branch at task start: develop
- Branch creation command/evidence: `git checkout -b codex/games-pages-live-bets-bff` succeeded; current branch is `codex/games-pages-live-bets-bff`.

## Scope

- Goal: Implement public `/games` and `/games/[gameSlug]` shells with reusable Live Bets UI and local Live Bets BFF route handlers.
- Non-goals: No real game mechanics, bet placement, wallet integration, auth modal changes, social auth, sockets, pagination, infinite scroll, `/all-games` redirect, Playwright setup, new dependencies, or real `Your bets` API integration.
- Approved scope: `/games`, `/games/[gameSlug]`, lean game/bet model entities, Live Bets BFF routes for latest/high-rollers/lucky endpoints, reusable BetLive widget, lobby/game-detail widgets, navigation nested `/games/*` active state, directly required docs.
- Forbidden scope: `src/games/<game>`, universal game engine, shared renderer, unconfirmed `Your bets` endpoints, `/site-config/live-bets`, unrelated app shell redesign, broad feature/entity substructure.
- Editable files: `src/app/games/**`, `src/app/api/bets/**`, `src/entities/game/model/**`, `src/entities/bet/model/**`, `src/widgets/games-lobby/**`, `src/widgets/game-detail/**`, `src/widgets/bet-live/**`, `src/widgets/main-nav/**`, directly required docs, this task artifact, and `public/images/*.webp`.
- Context-only files: `AGENTS.md`, `CLAUDE.md`, `docs/architecture/foundation-decisions.md`, `docs/architecture/auth.md`, `docs/workflow/**`, `.claude/rules/**`, `.claude/skills/**`, existing auth BFF and auth feature files, existing app shell/footer/lobby/shared primitive files, installed Next.js docs under `node_modules/next/dist/docs/**`.

## Source Of Truth

- Source-of-truth files inspected: `AGENTS.md`, `CLAUDE.md`, `docs/architecture/foundation-decisions.md`, `docs/architecture/auth.md`, `.claude/rules/**`, `.claude/skills/implementation/SKILL.md`, `.claude/skills/api-boundary-check/SKILL.md`, `.claude/skills/ui-qa/SKILL.md`, `docs/workflow/task-lifecycle.md`, `docs/workflow/ownership-to-docs.md`, `package.json`, installed Next.js App Router docs for pages, dynamic routes, `notFound`, images, route handlers, and BFF.
- Architecture decisions: Browser code calls only local `/api/*`; external backend URL remains server-side/BFF; TanStack Query owns server state; shared primitives are business-agnostic; concrete game modules are deferred.
- Relevant rules: project structure, design system foundation, game frontend architecture, state/data/API boundary, git lifecycle, validation workflow, quality gates.
- Relevant skills: local implementation, API boundary check, UI QA.

## Impact

- Docs impact: Required. `docs/architecture/foundation-decisions.md` was updated narrowly for the first non-auth BFF slice, first lean `entities/**` domain files, and public games route/module structure.
- API boundary impact: Required. New browser API client/query code and local `/api/bets/**` route handlers.
- UI QA requirement: Required. New visible routes, responsive layouts, tabs/dropdown, FAQ, popover, navigation active state.
- Stack primitive checklist: Use thin app routes, widgets for page/product UI, lean entities for domain facts/types, local BFF handlers under `src/app/api/**`, TanStack Query for live bets server state, existing Tailwind/Radix primitives where available.

## Validation Plan

- Planned commands: `git diff --check`, `pnpm lint`, `pnpm build`, `pnpm check:docs`, `pnpm validate`.
- Manual checks: desktop/mobile `/games`, four game detail routes, invalid slug not found, image rendering through `next/image`, BetLive tabs/dropdown, horizontal mobile table, FAQ one-open behavior, settings popover, API boundary check.
- Skipped checks and reasons: None planned.

## Evidence

- Commands run: `git status --short --branch --untracked-files=all`; `git checkout -b codex/games-pages-live-bets-bff`; `git diff --check`; `pnpm lint`; `pnpm build` failed in sandbox due to Google Fonts network fetch; `pnpm validate` failed in sandbox at build for the same font fetch; escalated `pnpm validate` first failed at `pnpm check:docs`; `pnpm validate` after durable docs update passed; `pnpm validate` after focused UI polish passed; `pnpm validate` after final BetLive cache/animation polish passed; `pnpm validate` after final empty-state polish passed; `pnpm validate` after final Quantum Play brand-copy fix passed.
- Review evidence: Pending.
- Pre-commit evidence: Pending.
- UI QA evidence: Focused manual evidence supplied by user and applied. Screenshots used: `cur-desktop-games.jpg`, `cur-desktop-betlive.jpg`, `cur-desktop-action-bar.jpg`, `cur-mobile-popover.jpg`, plus references `ref-desktop-games.jpg`, `ref-desktop-bet-live.jpg`, `ref-desktop-game-details.jpg`, `ref-desktop-settings-popover.jpg`, `ref-mobile-settings-popover.jpg`, `ref-mobile-dropdown-live.jpg`, the Live Bets animation behavior screenshot, `cur-empty-state.png`, and `ref-empty-state.jpg`. Polish applied: widened `/games` and game detail content containers to `max-w-6xl`, added approved `/images/game-point.svg` icons to Bet and Prize cells, separated game detail action bar into its own strip, moved settings popover above the settings button with viewport collision padding and higher z-index, constrained mobile BetLive dropdown width/z-index, preloaded public BetLive tabs on mount with TanStack Query cache reuse, added local Motion row entrance/highlight animation with reduced-motion handling, and changed BetLive empty state from a bordered block to a centered inline table-area state with `CircleOff` icon and `No bets yet`. Per user instruction, no external frontend-testing skill, browser automation, Playwright, or dev server was used by Codex.
- API boundary evidence: Initial manual search checked `src/widgets`, `src/entities`, `src/app/games`, and `src/app/api/bets`. Browser-side BetLive fetches only tab endpoints from `/api/bets/*`. External backend base URL and backend fetch occur only in `src/app/api/bets/_lib/live-bets-backend.ts`.
- Docs-not-needed rationale: Final brand-copy fix changed only user-facing copy in `src/widgets/games-lobby/games-lobby.tsx` and `src/widgets/games-lobby/games-faq.tsx`, replacing demo Doctor-branded text with Quantum Play wording. Durable ownership, API/BFF boundaries, route structure, widget responsibilities, entity boundaries, assets, and documented deferred scope remain unchanged.

## Risks And Handoff

- Risks: Live bet endpoints may be unavailable without `BACKEND_BASE_URL`; approved image assets remain untracked until staged by a human; final visual acceptance still depends on user review of the focused polish because Codex did not run a browser or dev server by instruction.
- Handoff: Focused UI polish pass complete within approved scope. Continue within approved scope only; do not stage, commit, push, create PR, merge, or archive.
- Lifecycle close notes: Do not archive unless explicitly requested.
