# Task Artifact

## Task

- Title: Sound subsystem polish pass — remaining controls + slider ticks + keno:miss
- Task lane: Normal (touches model/controller layer of all 4 games; adds 2 new SoundEvents)
- Status: Implementation complete, pending manual browser UI QA
- Mode: Implementation
- Branch mode: PR-mode
- Base branch: `develop`
- Task branch: `feat/sound-polish`
- Current branch at task start: `develop` (clean except untracked `public/sounds/keno/miss.mp3` and `public/sounds/ui/slide.mp3`)
- Branch creation command/evidence: user confirmed via AskUserQuestion. A local branch named `feat/sound-polish` already existed (0 commits ahead of develop, no diff — stale, not in-progress work), so `git checkout feat/sound-polish` was used instead of `git checkout -b`. Verified `git branch --show-current` → `feat/sound-polish`.

## Scope

- Goal: (1) extend SoundEvent union/registry with `ui:slide` + `keno:miss` (assets already on disk); (2) wire `ui:click` on all remaining un-sounded control-bet buttons across Dice/Keno/Plinko/Roulette, including pass-2-deferred Dice auto-bet Start/Stop/Configure/mode tabs; (3) wire `ui:slide` on discrete sliders (Dice threshold, Plinko rows) with step-change guard against drag-flood; (4) split Keno tile reveal into `keno:match`/`keno:miss`; (5) wire `keno:select` on auto-pick; (6) wire Roulette denomination select + chip placement to `ui:click`.
- Non-goals: no changes to pass-2 mechanic/outcome events; no new audio assets beyond slide+miss; no next.config.ts change; no new deps; no API/BFF work; no service/provider refactor.
- Editable files:
  - `src/features/sound/model/sound-contract.tsx` — SoundEvent union +2 (13 total)
  - `src/features/sound/config/sound-registry.ts` — registry +2 entries
  - `src/games/dice/model/use-dice-game-controller.ts` — `updateMode` ui:click
  - `src/games/dice/model/use-dice-auto-bet.ts` — `toggleAutoBetInfinite`/`startAutoBet`/`stopAutoBet` ui:click; new `openConfigure` wrapper
  - `src/games/dice/ui/dice-game.tsx` — `onConfigure` now uses `auto.openConfigure`
  - `src/games/dice/ui/dice-slider.tsx` — ui:slide on step change
  - `src/games/keno/model/use-keno-game-controller.ts` — `handleAutoPick` ui:click + keno:select per tile; `handleRevealedNumber` else-branch keno:miss; `handleSetRisk`/`handleClearTiles` wrappers
  - `src/games/keno/model/use-keno-auto-bet.ts` — start/stop/toggle-infinite ui:click
  - `src/games/keno/ui/keno-game.tsx` — mode toggle ui:click
  - `src/games/plinko/model/use-plinko-manual-betting.ts` — start/stop/toggle-infinite ui:click
  - `src/games/plinko/ui/plinko-game.tsx` — mode/risk toggle ui:click; rows-slider ui:slide guard
  - `src/games/roulette/model/use-roulette-auto-bet.ts` — start/stop/toggle-infinite ui:click
  - `src/games/roulette/model/use-roulette-game-controller.ts` — chip select + 6 placement handlers + clearBets wrapped ui:click
  - `src/games/roulette/ui/roulette-game.tsx` — mode toggle ui:click
  - `public/sounds/keno/miss.mp3`, `public/sounds/ui/slide.mp3` — new assets (already on disk, untracked)
- Context-only files: `src/shared/lib/sound/**` (service unchanged), `src/shared/ui/primitives/slider.tsx` (primitive left business-agnostic — sound wired at call sites, not in the primitive), all pass-2-wired mechanic/outcome call sites left untouched.

## Deviation / explicit scope decision

- Did NOT wire the Dice `DiceAutoConfigureModal` internals (Reset/Increase By strategy buttons, Apply, Reset all, DialogClose "X") or the `DiceMetric` "mirror rollover" suffix button. These are modal/display-area controls one level removed from the explicitly named "auto-bet Start/Stop, Configure, mode tabs" and the primary control-panel sweep. Flagging as a follow-up candidate if the user wants full modal coverage.
- Did NOT wire `RouletteSoundToggle` (mute button) or `KenoResult` backdrop-dismiss — pre-existing settings/dismiss actions, not control-bet buttons, out of the named scope.

## Current State

- Summary: all 14 source files edited; registry/union extended; validation commands run and passed.
- Last completed step: `pnpm build` clean. Attempted automated browser verification via `preview_start`/`preview_list`/`preview_snapshot` (3 attempts) — the preview tooling reported server start success but then "Server not found" on every follow-up call; treated as unavailable in this session rather than retried indefinitely.
- Next step: manual browser UI QA (sliders, keno reveal match/miss, auto-pick, roulette chips, all newly-sounded buttons) — outstanding; could not be completed via automated tooling this turn, requires manual `pnpm dev` + browser check by the user or a follow-up session with working preview tooling.
- Open risks/blockers: UI QA evidence gate is unmet pending the manual check above; see Risks below for rapid-fire notes.

## Source Of Truth

- Files inspected: `src/features/sound/model/sound-contract.tsx`, `src/features/sound/config/sound-registry.ts`, `.ai/tasks/active/sound-wiring-mechanic.md` (pass-2 precedent for soundRef pattern, event mapping, win/loss rules), `@radix-ui/react-slider` internals (`updateValues`/`hasChanged`) to confirm guard necessity, and all 14 edited files plus their sibling UI/model files across all four `src/games/**` modules.
- Architecture decisions: `ui:click`/`ui:slide` for auto-bet start/stop/toggle-infinite/chip-select/placement wired at the model/controller layer (matching the existing `handleTileToggle` / soundRef precedent from pass 2) rather than duplicated across desktop+tablet+mobile UI call sites, since Keno/Roulette/Plinko/Dice all pass the same controller-exported function to multiple UI instances. Slider step-guards compare the incoming value against current reactive state/props (no new refs needed) — mirrors "fire only on actual step-value change" requirement without touching the shared `Slider` primitive (kept business-agnostic per design-system-foundation rule).
- Relevant rules/skills: implementation, game-frontend-architecture (renderer/module boundaries respected — no cross-game imports), design-system-foundation (Slider primitive untouched), quality-gates (editable-scope, source-of-truth, architecture-ownership), git-lifecycle.

## Impact

- Docs impact: `docs/architecture/foundation-decisions.md` sound section previously listed 11 wired events after pass 2; this pass adds 2 more (13 total) — not yet updated this turn, flagged for follow-up before merge (docs-impact gate).
- API boundary impact: none.
- UI QA requirement: manual browser audio check per game — outstanding (see Current State).
- Stack primitive checklist: no new shared primitives; `useSoundContract()` reused per feature-hook pattern; `Slider` primitive left untouched.

## Validation

- Validation plan: `git diff --check`, `pnpm lint`, `pnpm build`, confirm `package.json`/`pnpm-lock.yaml` unchanged.
- Commands run:
  - `git diff --check` → clean, no output
  - `pnpm lint` → exit 0
  - `pnpm build` → exit 0; Next.js 16.2.6 Turbopack; TypeScript clean; all 4 game routes (`/games/dice`, `/games/keno`, `/games/plinko`, `/games/roulette`) compiled and statically generated
  - `git diff --stat -- package.json pnpm-lock.yaml` → empty (unchanged)
- Review evidence: not yet run this turn (pending).
- Pre-commit evidence: not yet run this turn (pending explicit request).

## Risks And Handoff

- Risks: `ui:slide` on drag and `keno:miss`/`keno:select` on bulk reveal/auto-pick are new high-frequency emitters. Guarded via step-value comparison (sliders) and Howler's native concurrent-instance handling (keno bulk events) — same acceptable-behavior precedent as pass 2's `keno:match` rapid-fire note. Manual audio verification for crackle/stacking still outstanding.
- Handoff: durable docs (`foundation-decisions.md`) sound-event count needs updating from 11→13 before merge. Modal-internal Dice controls and roulette mute/dismiss buttons intentionally left un-sounded (see Deviation section) — confirm with user if broader coverage is wanted.
- Lifecycle close notes: active task; not closed.
