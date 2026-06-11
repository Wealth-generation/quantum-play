# Task Lifecycle Record

## Identity

- Task title: Game Action Shell Foundation
- Status: active
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: codex/game-action-shell-foundation
- Current branch at task start: develop
- Branch creation command/evidence:
  - `git status --short --branch` -> `## develop...origin/develop`
  - `git checkout -b codex/game-action-shell-foundation` failed in sandbox because Git could not write refs.
  - `git checkout -b codex/game-action-shell-foundation` rerun with approved escalation -> switched to new branch `codex/game-action-shell-foundation`.

## Scope

- Goal: Implement the first bounded slice of the reusable, capability-driven Game Action Shell under `src/widgets/game-detail/**`.
- Non-goals:
  - Max Bet Dice integration.
  - MAX button in Dice controls.
  - Max Bet warning modal.
  - Turbo animation behavior.
  - Fullscreen / expanded mode.
  - Sound shell, audio engine, volume state, or persistence.
  - Backend/API/BFF changes.
  - Multi-game Provably Fair implementation.
  - Real Keno/Plinko/Roulette modules.
  - Playwright, CI, hooks, worktrees, MCP, subagents.
  - Broad refactoring.
- Approved scope:
  - Task artifact and PR-mode branch setup.
  - Capability model/config under `src/widgets/game-detail/**`.
  - Capability-driven rendering for current game actions/settings.
  - Game Rules modal shell and content boundary.
  - Provably Fair visibility capability, currently Dice only.
  - Follow-up content slice: source-backed Game Rules content for Dice, Keno, Plinko, and Roulette.
- Forbidden scope:
  - Unapproved source outside editable scope.
  - New API/BFF routes, DTOs, clients, query hooks, stores, scripts, automation, or real placeholder game modules.
- Editable files:
  - `.ai/tasks/active/**`
  - `src/widgets/game-detail/**`
- Context-only files:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.claude/rules/**`
  - `.claude/skills/**`
  - `docs/architecture/**`
  - `docs/workflow/**`
  - `.ai/tasks/archived/**`
  - `.ai/context/game-action-shell/**`
  - `src/app/games/[gameSlug]/page.tsx`
  - `src/entities/game/model/**`
  - `src/games/dice/**`
  - `src/features/balance/**`
  - `src/features/provably-fair/**`
  - `src/widgets/provably-fair-modal/**`
  - `src/app/api/**`

## Source Of Truth

- Source-of-truth files inspected:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/architecture/foundation-decisions.md`
  - `docs/architecture/auth.md`
  - `.claude/rules/**`
  - `.claude/skills/implementation/SKILL.md`
  - `docs/workflow/**`
  - `.ai/context/game-action-shell/readme.md`
  - `.ai/context/game-action-shell/reference/**`
  - `.ai/tasks/archived/dice-mvp.md`
  - current game detail, Dice, balance, Provably Fair, and shared primitive files
- Architecture decisions:
  - Shell owner is `src/widgets/game-detail/**`.
  - Game owner remains `src/games/<game>/**`.
  - Dice is the only current playable game.
  - Keno/Plinko/Roulette remain placeholders.
  - Browser code calls only local `/api/*`.
  - Game Action Shell capabilities are not backend-config-driven.
- Relevant rules:
  - Project structure
  - Game frontend architecture
  - State/data/API boundary
  - Design system foundation
  - AI workflow
  - Quality gates
  - Git lifecycle
  - Validation workflow
- Relevant skills:
  - Local implementation skill
  - Documentation skill for docs impact
  - API boundary check skill for manual boundary review
  - UI QA skill for visible UI changes
  - Review/pre-commit skills for later readiness
  - Generic TDD skill inspected; automated TDD is scope-blocked because the repo has no test script and approved editable scope excludes test files.

## Impact

- Docs-not-needed rationale: no durable docs were edited in this slice because editable scope was limited to the active artifact and `src/widgets/game-detail/**`; this change completes approved Game Action Shell UI/content behavior without changing ownership, architecture, route inventory, API boundaries, or durable workflow rules.
- API boundary impact: no API/BFF files changed; shell visibility still reuses the existing Provably Fair modal only for Dice.
- UI QA requirement: source/manual QA required for `/games/dice`, `/games/keno`, `/games/plinko`, and `/games/roulette` action/settings behavior.
- Game Rules content impact: placeholder/confirmation-needed text replaced with per-game rules content while preserving the modal shell and content boundary.
- Stack primitive checklist:
  - Entrypoint remains `src/app/games/[gameSlug]/page.tsx` and `GameDetail`.
  - Shell composition remains under `src/widgets/game-detail/**`.
  - Shared primitives should use existing Button, Popover, Dialog, and Input patterns.
  - No new global state, Zustand store, or cross-route shell state.

## Validation Plan

- Planned commands:
  - `git diff --check`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm check:docs`
  - `pnpm validate` before readiness if earlier checks pass or after docs evidence is resolved
- Manual checks:
  - Scope check against approved files.
  - API boundary check: no external backend calls, no new BFF/API files.
  - UI QA: capability-driven settings/actions for Dice, Keno, Plinko, Roulette.
  - Documentation impact check.
- Skipped checks and reasons:
  - Automated tests/TDD: no repo test script exists in `package.json`, and approved editable scope excludes test files.

## Evidence

- Commands run:
  - `git status --short --branch`
  - `git checkout -b codex/game-action-shell-foundation`
  - source inspection commands for required docs/context/source
  - `git diff --check` -> passed.
  - `pnpm lint` -> passed on rerun with longer timeout.
  - `pnpm check:docs` -> passed; docs freshness accepted the active task artifact rationale.
  - `pnpm build` -> first sandboxed run failed while fetching Google font CSS from `fonts.googleapis.com`; approved escalated rerun passed.
  - `pnpm validate` -> passed with approved escalation for the build/font network step.
  - Follow-up content slice `git diff --check` -> passed.
  - Follow-up content slice `pnpm lint` -> passed.
  - Follow-up content slice `pnpm check:docs` -> first run failed until this artifact included an explicit docs-not-needed rationale; rerun passed.
  - Follow-up content slice `pnpm build` -> first sandboxed run failed while fetching Google font CSS from `fonts.googleapis.com`; approved escalated rerun passed.
  - Follow-up content slice `pnpm validate` -> passed with approved escalation for the build/font network step.
- Review evidence:
  - Changed files remain inside approved editable scope:
    - `.ai/tasks/active/game-action-shell-foundation.md`
    - `src/widgets/game-detail/game-action-config.ts`
    - `src/widgets/game-detail/game-actions.tsx`
    - `src/widgets/game-detail/game-detail.tsx`
    - `src/widgets/game-detail/game-rules-modal.tsx`
  - Capability model is game-slug based and not Dice-shaped:
    - Dice: Game Rules, Turbo, Max Bet, Volume, Provably Fair.
    - Keno: Game Rules, Turbo, Max Bet, Volume.
    - Plinko: Game Rules, Turbo, Max Bet, Volume.
    - Roulette: Game Rules, Volume.
  - Unavailable capabilities are hidden rather than rendered disabled.
  - Follow-up Game Rules content evidence:
    - Dice rules text extracted from `ref-desktop-dice-rules-modal.jpg` and cross-checked with `ref-mobile-dice-rules-modal.jpg`.
    - Keno rules text extracted from `ref-desktop-keno-rules-modal.jpg` and cross-checked with `ref-mobile-keno-rules-modal.jpg`.
    - Roulette rules text extracted from `ref-desktop-roulette-rules-modal.jpg` and cross-checked with `ref-mobile-roulette-rules-modal.jpg`.
    - Plinko rules text came from user-confirmed source text after no Plinko rules-modal screenshot was present in the reference directory.
    - Game Rules content is stored per game in `src/widgets/game-detail/game-action-config.ts`.
    - `src/widgets/game-detail/game-rules-modal.tsx` renders ordered rule items and nested bullet details without changing the modal shell.
- UI QA evidence:
  - Browser plugin/tools were not available in this session after tool discovery, so UI QA is source/manual instead of browser-click verified.
  - Dice renders the settings shell and the existing Provably Fair entry.
  - Keno/Plinko placeholders render settings without Provably Fair.
  - Roulette placeholder renders Game Rules and Volume only, without Turbo, Max Bet, or Provably Fair.
  - Game Rules modal shell exists for all configured games and now renders per-game source-backed rules content.
- API boundary evidence:
  - No `src/app/api/**`, `src/features/**`, or `src/widgets/provably-fair-modal/**` files changed.
  - No new fetch calls, backend URLs, route handlers, DTOs, clients, query hooks, or stores were introduced.
  - Existing Provably Fair modal import remains gated by the Dice-only `provablyFair` capability.

## Risks And Handoff

- Risks:
  - Accidentally making shell behavior Dice-specific.
  - Static current settings controls become capability-driven but Turbo/Max Bet/Volume behavior remains intentionally non-functional in this slice.
  - Plinko rules content depends on user-confirmed text because no Plinko rules-modal screenshot was present in the inspected reference directory.
- Handoff:
  - Implement only the approved first slice in `src/widgets/game-detail/**`.
  - Do not edit Dice, balance, fairness, API, or docs unless explicit approval is requested and granted.
  - Later slices should wire real Max Bet, Turbo behavior, sound/volume behavior, and fullscreen only after approval for each bounded step.
- Lifecycle close notes:
  - Lifecycle close not requested.
