# Task Artifact

## Task

- Title: Sound subsystem slice 1 — "silent" plumbing + connect existing volume UI
- Task lane: Normal (architecture-sensitive: new feature contract pattern, FSD layer split)
- Status: In progress (implementation)
- Mode: Implementation
- Branch mode: PR-mode
- Base branch: `develop`
- Task branch: `feat/sound-shell`
- Current branch at task start: `develop` (clean, up to date with `origin/develop`)
- Branch creation command/evidence: user explicitly confirmed via AskUserQuestion before creation. Commands run: `git checkout develop` (already on develop, up to date), `git checkout -b feat/sound-shell`. Verified with `git branch --show-current` → `feat/sound-shell`.

## Scope

- Goal: Build the sound contract as standalone, vocabulary-correct plumbing that other branches will later wire games into. This slice ships NO audible sound (no-op asset registry) and connects the EXISTING volume slider UI in `game-actions.tsx` to real state.
- Non-goals:
  - No audio asset files; registry stays no-op (`src: []` for every entry).
  - No `RouletteSoundToggle` replacement (deferred to slice 2).
  - No per-game `.play(event)` emission in any `src/games/**` controller.
  - No `next.config.ts` changes; no new dependencies (`howler@2.2.4` already installed).
  - No API/BFF work.
- Approved scope (files to create/edit): see Editable files below.
- Forbidden scope: any `src/games/**` controller edits, asset sourcing, new dependencies, BFF/API routes, RouletteSoundToggle rework.
- Editable files:
  - `src/shared/lib/sound/sound-service.ts` (new)
  - `src/shared/lib/sound/index.ts` (new)
  - `src/features/sound/model/sound-contract.tsx` (new)
  - `src/features/sound/config/sound-registry.ts` (new)
  - `src/features/sound/index.ts` (new)
  - `src/widgets/game-detail/game-detail-shell.tsx` (edit — mount `SoundProvider`)
  - `src/widgets/game-detail/game-actions.tsx` (edit — wire volume slider)
- Context-only files: `src/features/turbo-mode/**` (pattern mirror), `src/features/max-bet/**`, `src/games/roulette/ui/roulette-sound-toggle.tsx`, `docs/architecture/foundation-decisions.md`.

## Current State

- Summary: implementation complete. All planned files created/edited; lint, build, docs-freshness, and git diff --check pass; package.json/lockfile confirmed unchanged.
- Last completed step: durable docs update in `docs/architecture/foundation-decisions.md` + validation.
- Next step: human review / pre-commit skill invocation when user is ready.
- Open risks/blockers: none blocking.

## Source Of Truth

- Files inspected: `docs/architecture/foundation-decisions.md`, `src/features/turbo-mode/model/turbo-mode-contract.tsx`, `src/widgets/game-detail/game-detail-shell.tsx`, `src/widgets/game-detail/game-actions.tsx`, `src/widgets/game-detail/game-action-config.ts`, `package.json` (howler ^2.2.4 + @types/howler ^2.2.13 already present).
- Architecture decisions: feature-contract pattern (interface + Context + Provider + hook) proven by `turbo-mode`/`max-bet`/`game-expanded-mode`; `src/shared` must stay business-agnostic; `src/features` owns use-case-aware contracts; renderer/game modules untouched this slice.
- Relevant rules/skills: implementation, game-frontend-architecture (n/a — no game edits), design-system-foundation (volume slider styling unchanged), state-data-api-boundary (n/a — no API), git-lifecycle, quality-gates.

## Impact

- Docs impact: First instance of the sound feature pattern — `docs/architecture/foundation-decisions.md` updated under the Game Action Shell section with a new "Sound shell slice 1" paragraph (ownership split, provider mount point, registry no-op state, persistence key) and the Deferred list updated to reflect what remains (assets, per-game emission, Roulette toggle wiring). `pnpm check:docs` confirms mapped docs evidence found for `src/widgets/game-detail/**` and `src/features/**`.
- API boundary impact: None — no API/BFF touched.
- UI QA requirement: Minor — volume slider gains real state (value/onChange) but no visual redesign. Manual check that slider still renders/behaves; no audio to verify (no-op registry).
- Stack primitive checklist:
  - Entrypoint thinness: n/a (no route entrypoint touched).
  - Orchestration: `SoundProvider` in `src/features/sound/model/sound-contract.tsx`.
  - Component split: service (shared/lib) vs contract (features) vs registry (features/config).
  - Data/state/form ownership: React state in provider for muted/volume/unlocked; localStorage persistence (`sound:prefs:v1`), mirrors `roulette:bets:v1` pattern.
  - Project primitives: no new shared UI primitive; existing `<input type="range">` reused as-is.

## Validation Plan

- Planned commands: `git diff --check`, `pnpm lint`, `pnpm build`.
- Manual checks: scope check vs editable list; confirm `package.json`/lockfile unchanged (no installs); docs impact rationale recorded.
- Skipped checks and reasons: `pnpm check:docs` / `pnpm validate` deferred to pre-commit skill invocation per workflow; no test runner exists in repo.

## Evidence

- Files created:
  - `src/shared/lib/sound/sound-service.ts`
  - `src/shared/lib/sound/index.ts`
  - `src/features/sound/model/sound-contract.tsx`
  - `src/features/sound/config/sound-registry.ts`
  - `src/features/sound/index.ts`
- Files edited:
  - `src/widgets/game-detail/game-detail-shell.tsx` (mounted `SoundProvider` parallel to `TurboModeProvider`, keyed by `game.slug`)
  - `src/widgets/game-detail/game-actions.tsx` (volume slider now controlled via `useSoundContract()`; added a mute toggle button reusing the existing `Volume2` icon slot, swapping to `VolumeX` when muted — no popover redesign)
  - `docs/architecture/foundation-decisions.md` (durable docs: new Sound shell slice 1 paragraph + Deferred list update)
- Commands run:
  - `git diff --check` → exit 0, clean, both before and after the docs edit.
  - `pnpm lint` → exit 0 (0 errors; 1 pre-existing unrelated warning in `main-nav.tsx`, same as before this task).
  - `pnpm build` → exit 0; all routes compiled including `/games/dice`, `/games/plinko`, `/games/keno`, `/games/roulette`.
  - `pnpm check:docs` → "Docs freshness check passed." Mapped changes found for `src/widgets/game-detail/**` and `src/features/**`.
  - `git diff develop -- package.json pnpm-lock.yaml` → empty (0 lines) — confirmed no dependency changes.

## Risks And Handoff

- Risks: Howler is a global singleton — must guard SSR (`typeof window`) and lazy-create `Howl` instances only on `register()`/`play()`, never at module load.
- Handoff: slice 2 will replace `RouletteSoundToggle`, source real assets, and wire `.play(event)` calls into game controllers.
- Lifecycle close notes: not closed — active task.
