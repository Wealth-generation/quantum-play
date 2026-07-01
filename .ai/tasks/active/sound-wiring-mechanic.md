# Task Artifact

## Task

- Title: Sound subsystem slice 2, pass 2 — game mechanic + outcome events
- Task lane: Normal (architecture-sensitive: first per-game mechanic sounds; touches all 4 game models + UI)
- Status: In progress (implementation)
- Mode: Implementation
- Branch mode: PR-mode
- Base branch: `develop`
- Task branch: `feat/sound-wiring-mechanic`
- Current branch at task start: `develop` (clean, up to date; slice 2 pass 1 merged)
- Branch creation command/evidence: user confirmed via AskUserQuestion. Commands: `git pull` (already up to date), `git checkout -b feat/sound-wiring-mechanic`. Verified `git branch --show-current` → `feat/sound-wiring-mechanic`.

## Scope

- Goal: Emit all remaining SoundEvents from their natural trigger points — (A) ui:tick/ui:click for Plinko/Keno/Roulette bet panels, (B) per-game mechanic + outcome events from model/controller layer. No registry or vocabulary changes.
- Non-goals: no audio assets, no registry/vocabulary changes, no next.config.ts, no new deps, no API/BFF work, no changes to shared service/provider unless a real defect is found.
- Editable files:
  - `src/games/plinko/ui/plinko-controls.tsx` — ui:tick on 1/2 2X MAX; ui:click on Bet
  - `src/games/keno/ui/keno-bet-amount-control.tsx` — ui:tick on 1/2 2X MAX
  - `src/games/keno/ui/keno-bet-panel.tsx` — ui:click on Bet CTA
  - `src/games/roulette/ui/roulette-bet-panel.tsx` — ui:click on Bet CTA (desktop)
  - `src/games/roulette/ui/roulette-game.tsx` — ui:click on tablet/mobile Bet button
  - `src/games/dice/model/use-dice-game-controller.ts` — dice:throw / dice:rolling / dice:score in handleBet
  - `src/games/dice/model/use-dice-auto-bet.ts` — dice:throw / dice:rolling / dice:score in auto placeBet
  - `src/games/keno/model/use-keno-game-controller.ts` — keno:select / keno:reveal / keno:match / bet:win
  - `src/games/plinko/model/use-plinko-manual-betting.ts` — plinko:drop / plinko:pocket / bet:win via handlePlaybackLifecycle
  - `src/games/roulette/model/use-roulette-game-controller.ts` — roulette:spin / bet:win
  - `docs/architecture/foundation-decisions.md` — durable docs
- Context-only files: `src/shared/lib/sound/**` (service unchanged), `src/features/sound/**` (contract/registry unchanged), `src/games/dice/ui/dice-bet-amount-control.tsx` (wired in pass 1), `src/games/dice/ui/dice-manual-controls.tsx` (wired in pass 1).

## Bet-panel files located

- `src/widgets/bet-live/bet-live.tsx` — live-bets feed table (other players' bets); NOT a bet panel. No wiring needed.
- `src/games/plinko/ui/plinko-controls.tsx` — stake steppers (1/2, 2X, MAX) + Bet submit button. Wired this pass.
- `src/games/keno/ui/keno-bet-amount-control.tsx` — stake steppers only (1/2, 2X, MAX; Bet CTA is in keno-bet-panel). Wired this pass.
- `src/games/keno/ui/keno-bet-panel.tsx` — Bet CTA button (type=submit in manual mode). Wired this pass.
- `src/games/roulette/ui/roulette-bet-panel.tsx` — Bet CTA button (desktop, lg+ panel, type=submit in manual). No stake steppers (chip tray instead). Wired this pass.
- `src/games/roulette/ui/roulette-game.tsx` — betControlsBlock Bet button (tablet/mobile layout, type=submit in manual). Wired this pass.

## Event → trigger-point mapping

| Event | Trigger point | File |
|---|---|---|
| ui:tick | onClick on 1/2, 2X, MAX stepper buttons | plinko-controls.tsx, keno-bet-amount-control.tsx |
| ui:click | onClick on Bet CTA button | keno-bet-panel.tsx, roulette-bet-panel.tsx, roulette-game.tsx, plinko-controls.tsx |
| dice:throw | before `betMutation.mutateAsync()` in handleBet + auto placeBet | use-dice-game-controller.ts, use-dice-auto-bet.ts |
| dice:rolling | after result received in handleBet + auto placeBet | use-dice-game-controller.ts, use-dice-auto-bet.ts |
| dice:score | when `result.didWin === true` after mutation | use-dice-game-controller.ts, use-dice-auto-bet.ts |
| keno:select | wrapped toggleTile (user tile selection) | use-keno-game-controller.ts |
| keno:reveal | at start of reveal sequence (in requestReveal) | use-keno-game-controller.ts |
| keno:match | wrapped addRevealedNumber when revealed number ∈ selectedTiles | use-keno-game-controller.ts |
| plinko:drop | `event.phase === "started"` in handlePlaybackLifecycle | use-plinko-manual-betting.ts |
| plinko:pocket | `event.phase === "completed"` in handlePlaybackLifecycle | use-plinko-manual-betting.ts |
| roulette:spin | after `setPendingSpin(result)` in handleBet + requestSpin | use-roulette-game-controller.ts |
| bet:win | keno: in handleRevealSettled payout>betSize; plinko: phase=completed payout>betSize; roulette: in handleResult payout>betSize | each game controller |

## Win/loss/push outcome rule

- Dice: `result.didWin === true` → `dice:score` (NOT `bet:win`). Loss → silent.
- Keno: `Number(result.payout) > Number(result.betSize)` → `bet:win`. Sub-1× returns (0.7×, 0.4×) are silent. Loss → silent.
- Plinko: `Number(result.payout) > Number(result.betSize)` → `bet:win`. Loss → silent. Fires from `handlePlaybackLifecycle` phase "completed" only (visual ball settled); "simulated" (fallback) and failure phases are silent.
- Roulette: `Number(result.payout) > Number(result.betSize)` → `bet:win`. Loss → silent.

## Implementation notes

- useCallback dep arrays: controller callbacks that emit sound use a `soundRef` pattern (`React.useRef(sound)` + `useEffect` to sync) so that adding sound does not pollute existing dependency arrays or create unexpected re-renders.
- Keno rapid-fire keno:match: fires once per matched number (up to 10 per round). In turbo mode, step = 0ms → 10 plays may fire near-simultaneously. Howler manages concurrent audio nodes natively; sound files are very short (7KB). Acceptable behavior; noted.
- keno:select is NOT emitted from exitFreeze (the player clicking a selected tile after freeze) — that path uses the raw store toggleTile directly. Only user-initiated pre-bet tile selection emits keno:select.
- roulette:spin: emitted from both `handleBet` (manual) and `requestSpin` (auto). Both paths set `pendingSpin`, which triggers the renderer. The Howl is owned by SoundService singleton and survives overlay unmount.
- dice auto-bet: sound emitted from `useDiceAutoBet.placeBet` callback, which is re-created but captured by `useAutoBetRunner` internally via its own ref pattern — no stale closure issue.

## Current State

- Summary: branch created, artifact written. Implementing files now.
- Last completed step: branch setup + bet-panel discovery + planning.
- Next step: edit all 10 source files, then validate.
- Open risks/blockers: none blocking.

## Source Of Truth

- Files inspected: `src/features/sound/model/sound-contract.tsx`, `src/features/sound/config/sound-registry.ts`, all 10 editable files listed above, `src/games/dice/model/dice-types.ts`, `src/games/keno/model/keno-types.ts`, `src/games/roulette/model/roulette-types.ts`, `src/games/plinko/renderer/plinko-renderer-types.ts`.
- Architecture decisions: mechanic sounds emitted from model/controller layer; service singleton owns Howl instances (survives overlay unmount); ref pattern for sound in useCallback to avoid dep-array churn; game modules must not import each other (each only imports @/features/sound); backend result is authoritative (no sound changes outcome display).
- Relevant rules/skills: implementation, game-frontend-architecture, quality-gates (editable-scope, source-of-truth, architecture-ownership), git-lifecycle.

## Impact

- Docs impact: foundation-decisions.md sound section updated — "no game module emits play(event) calls" is no longer true; update to list all wired events.
- API boundary impact: None.
- UI QA requirement: Manual browser audio check per game is the real gate.
- Stack primitive checklist: no new shared primitives; useSoundContract() reused as a feature hook per spec.

## Validation Plan

- Commands: `git diff --check`, `pnpm lint`, `pnpm build`, `git diff develop -- package.json pnpm-lock.yaml | wc -l`.
- Outstanding: manual browser audio verification.

## Evidence

- Files edited (10 source + docs):
  - `src/games/plinko/ui/plinko-controls.tsx` — ui:tick on 1/2, 2X, MAX; ui:click on Bet submit
  - `src/games/keno/ui/keno-bet-amount-control.tsx` — ui:tick on 1/2, 2X, MAX
  - `src/games/keno/ui/keno-bet-panel.tsx` — ui:click on Bet CTA
  - `src/games/roulette/ui/roulette-bet-panel.tsx` — ui:click on Bet CTA (desktop)
  - `src/games/roulette/ui/roulette-game.tsx` — ui:click on tablet/mobile Bet button
  - `src/games/dice/model/use-dice-game-controller.ts` — dice:throw/rolling/score in handleBet
  - `src/games/dice/model/use-dice-auto-bet.ts` — dice:throw/rolling/score in async placeBet
  - `src/games/keno/model/use-keno-game-controller.ts` — keno:select/reveal/match/bet:win
  - `src/games/plinko/model/use-plinko-manual-betting.ts` — plinko:drop/pocket/bet:win via handlePlaybackLifecycle
  - `src/games/roulette/model/use-roulette-game-controller.ts` — roulette:spin/bet:win
  - `docs/architecture/foundation-decisions.md` — durable docs updated
- Commands run:
  - `git diff --check` → CLEAN
  - `pnpm lint` → exit 0, 0 errors, 0 warnings
  - `pnpm build` → exit 0; all 4 game routes compile; TypeScript clean
  - `pnpm check:docs` → passed; all 10 `src/games/**` files mapped to durable docs
  - `git diff develop -- package.json pnpm-lock.yaml | wc -l` → 0 (lockfile unchanged)
- Outstanding: manual browser audio verification per game (UI QA gate).

## Risks And Handoff

- Risks: keno:match rapid-fire in turbo mode (10 near-simultaneous plays) is managed by Howler; no stacking fix needed this pass.
- Handoff: All 11 SoundEvents now have wired emission points. Remaining work is audio quality tuning (sound levels, timing) and deferred bet-panel control wiring for non-Dice games only.
- Lifecycle close notes: active task.
