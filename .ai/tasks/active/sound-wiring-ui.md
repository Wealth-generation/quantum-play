# Task Artifact

## Task

- Title: Sound subsystem slice 2, pass 1 — UI layer audible
- Task lane: Normal (architecture-sensitive: vocabulary change, asset registry activation, first per-game sound emission)
- Status: In progress (implementation)
- Mode: Implementation
- Branch mode: PR-mode
- Base branch: `develop`
- Task branch: `feat/sound-wiring-ui`
- Current branch at task start: `develop` (clean except untracked `public/sounds/**`; up to date with `origin/develop`; slice 1 already merged via PR #31)
- Branch creation command/evidence: user explicitly confirmed via AskUserQuestion before creation. Commands run: `git checkout develop` (already current), `git pull` (already up to date), `git checkout -b feat/sound-wiring-ui`. Verified with `git branch --show-current` → `feat/sound-wiring-ui`.

## Scope

- Goal: Make the sound chain audibly work for the UI layer only — finalize the `SoundEvent` vocabulary to the final 11 events, fill the asset registry with real `/sounds/**` paths, make the Roulette mute toggle real, and emit `ui:click`/`ui:tick` from Dice's bet-panel controls (pilot game, per explicit user decision).
- Non-goals:
  - No `play(event)` for any game mechanic event (`dice:throw/rolling/score`, `keno:*`, `plinko:*`, `roulette:spin`) in any game controller/renderer.
  - No `bet:win` emission (outcome event from game controllers — pass 2).
  - No new audio files, no `next.config.ts` change, no new dependencies.
  - No API/BFF work.
  - Plinko/Keno/Roulette bet-panel `ui:click`/`ui:tick` wiring — explicitly deferred per user decision (Dice-only pilot this pass).
- Scope deviation found and resolved: the prompt assumed bet-panel controls live in `src/widgets/bet-live/**`. Inspection showed `bet-live` is the live-bets feed table (other players' bets), not a betting control panel. Real stake/Bet controls live per-game under `src/games/<game>/ui/`. Flagged to user via AskUserQuestion; user selected "Dice only as pilot, defer the other 3."
- Approved scope (files to create/edit): see Editable files below.
- Forbidden scope: Plinko/Keno/Roulette `src/games/**` UI edits this pass; any `play()` call for game-mechanic or `bet:win` events; asset sourcing; dependency changes; API/BFF.
- Editable files:
  - `src/features/sound/model/sound-contract.tsx` (edit — vocabulary → final 11)
  - `src/features/sound/config/sound-registry.ts` (edit — real `/sounds/**` paths)
  - `src/games/roulette/ui/roulette-sound-toggle.tsx` (edit — real mute toggle)
  - `src/games/dice/ui/dice-bet-amount-control.tsx` (edit — `ui:tick` on 1/2, 2X, MAX)
  - `src/games/dice/ui/dice-manual-controls.tsx` (edit — `ui:click` on Bet button)
  - `public/sounds/**` (new — 12 untracked audio asset files, now registered)
- Context-only files: `src/shared/lib/sound/sound-service.ts` (unchanged — vocabulary-agnostic, no edits needed), `src/widgets/game-detail/game-detail-shell.tsx`, `src/widgets/game-detail/game-actions.tsx` (already wired in slice 1, no changes this pass), `src/games/dice/ui/dice-game.tsx`, `docs/architecture/foundation-decisions.md`.

## Current State

- Summary: branch created; task artifact written; implementing files now.
- Last completed step: branch setup + bet-panel location discovery + user scope confirmation.
- Next step: edit vocabulary, registry, roulette toggle, dice bet controls; validate.
- Open risks/blockers: none blocking.

## Source Of Truth

- Files inspected: `src/features/sound/model/sound-contract.tsx`, `src/features/sound/config/sound-registry.ts`, `src/games/roulette/ui/roulette-sound-toggle.tsx`, `src/widgets/bet-live/bet-live.tsx`, `src/games/dice/ui/dice-bet-amount-control.tsx`, `src/games/dice/ui/dice-manual-controls.tsx`, `src/games/dice/ui/dice-game.tsx`, `public/sounds/**` (file listing + sizes), `docs/architecture/foundation-decisions.md`.
- Architecture decisions: `src/shared/lib/sound` stays vocabulary-agnostic (no edits this pass — confirmed no game/event knowledge leaked into it). `src/features/sound` owns the `SoundEvent` vocabulary and event→key registry. Game modules must not import from other game modules — sound wiring uses the shared `useSoundContract()` feature hook only, no cross-game imports.
- Relevant rules/skills: implementation, game-frontend-architecture (game UI edits stay within Dice's own module), design-system-foundation (no new primitives, reuse lucide icons matching slice-1 pattern), git-lifecycle, quality-gates (editable-scope gate — flagged and resolved the bet-live discrepancy before editing).

## Impact

- Docs impact: Durable docs update planned in `docs/architecture/foundation-decisions.md` — the slice-1 paragraph said "no game module emits play(event) calls yet" and registry was no-op; both are now false. Will update before pre-commit readiness.
- API boundary impact: None — no API/BFF touched.
- UI QA requirement: Audible behavior — manual browser check expected per task instructions (sound becomes audible). UI QA skill is the gate for verifying audible behavior; this implementation pass records code-level evidence (lint/build/registry path checks) and flags manual audio verification as outstanding.
- Stack primitive checklist:
  - Entrypoint thinness: n/a (no route entrypoint touched).
  - Orchestration: unchanged — `SoundProvider` already mounted in `GameDetailShell` (slice 1).
  - Component split: registry (features/sound/config) vs contract (features/sound/model) vs per-game UI emission (games/dice/ui, games/roulette/ui).
  - Data/state/form ownership: no new state; `useSoundContract()` consumed directly in presentational components.
  - Project primitives: reuse lucide-react `Volume2`/`VolumeX` for Roulette toggle (no existing SVG asset found for mute/volume in repo — confirmed via search).

## Validation Plan

- Planned commands: `git diff --check`, `pnpm lint`, `pnpm build`.
- Manual checks: confirm `public/sounds/**` paths resolve (file existence + Next.js public/ serving convention); confirm `package.json`/`pnpm-lock.yaml` unchanged; manual browser audio check flagged as outstanding (UI QA gate).
- Skipped checks and reasons: no test runner exists in repo.

## Evidence

- Bet-panel location discovery: `src/widgets/bet-live/**` is the live-bets feed table (other players' bets), not a betting control panel. Real per-game stake/Bet controls located at:
  - `src/games/dice/ui/dice-bet-amount-control.tsx` — amount input + 1/2, 2X, MAX buttons (wired this pass)
  - `src/games/dice/ui/dice-manual-controls.tsx` — Bet submit button (wired this pass)
  - `src/games/plinko/ui/plinko-controls.tsx` — deferred
  - `src/games/keno/ui/keno-bet-amount-control.tsx` — deferred
  - `src/games/roulette/ui/roulette-bet-panel.tsx` — deferred
  - User confirmed "Dice only as pilot, defer the other 3."
- Other Dice controls NOT wired (deferred as ambiguous/not in core ask): auto-bet Start/Stop, Configure modal open, mode tab toggles.
- Registry path verification: all 12 `public/sounds/**` files confirmed present on disk with non-zero sizes. Next.js serves `public/` at root, so `/sounds/...` paths resolve correctly without config changes.
- Unlock / discard behavior: `SoundProvider` attaches `pointerdown`/`keydown` listeners on `window`. The Bet button's `pointerdown` fires `tryUnlock()` → `service.unlock()` → `Howler.ctx?.resume()` (async). `play()` in `service` checks `Howler.ctx.state !== "running"` synchronously — first-click audio may be discarded if resume hasn't completed yet (expected, documented in slice-1 design); subsequent clicks will play. No stale events are queued.
- Files created: none (only edits).
- Files edited:
  - `src/features/sound/model/sound-contract.tsx` (vocabulary → final 11)
  - `src/features/sound/config/sound-registry.ts` (real `/sounds/**` paths)
  - `src/games/roulette/ui/roulette-sound-toggle.tsx` (real mute toggle via useSoundContract)
  - `src/games/dice/ui/dice-bet-amount-control.tsx` (ui:tick on 1/2, 2X, MAX)
  - `src/games/dice/ui/dice-manual-controls.tsx` (ui:click on Bet)
  - `docs/architecture/foundation-decisions.md` (durable docs updated)
- `public/sounds/**` (12 files): now tracked (was untracked on develop)
- Commands run:
  - `git diff --check` → clean (exit 0)
  - `pnpm lint` → exit 0, 0 errors, 0 warnings
  - `pnpm build` → exit 0; all routes compile including all 4 game pages
  - `pnpm check:docs` → "Docs freshness check passed" — mapped docs evidence for `src/games/**` and `src/features/**`
  - `git diff develop -- package.json pnpm-lock.yaml | wc -l` → 0 (lockfile unchanged)
- Outstanding: manual browser audio verification (UI QA gate — audible behavior must be verified in browser; not mechanically checkable via lint/build).

## Risks And Handoff

- Risks: removing old vocabulary entries (`bet:place`, `bet:loss`, `bet:push`, `dice:roll`, `plinko:land`, `keno:reveal` rename, `roulette:land`, `ui:toggle`) is a breaking type change — verified no current `play()` call site references the removed events (grep confirmed zero `play(` call sites exist anywhere pre-this-pass), so this is safe.
- Handoff: Plinko/Keno/Roulette bet-panel `ui:click`/`ui:tick` wiring deferred to a follow-up pass. Pass 2 will wire per-game mechanic events and `bet:win` from game controllers.
- Lifecycle close notes: not closed — active task.
