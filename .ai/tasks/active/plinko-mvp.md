# Task Lifecycle Record

## Identity

- Task title: Plinko MVP
- Status: active
- Mode: implementation, Phase 4.3C hybrid motion tuning/stabilization
- Branch mode: PR-mode
- Base branch: codex/game-action-shell-foundation
- Task branch: codex/plinko-mvp
- Current branch at task start: codex/game-action-shell-foundation
- Branch creation command/evidence:
  - `git status --short --branch` -> `## codex/game-action-shell-foundation`
  - `git branch --list 'codex/plinko-mvp' 'codex/game-action-shell-foundation'` -> only `codex/game-action-shell-foundation` existed.
  - `git checkout -b codex/plinko-mvp` failed in sandbox because Git could not write refs.
  - `git checkout -b codex/plinko-mvp` rerun with approved escalation -> switched to new branch `codex/plinko-mvp`.

## Scope

- Goal: Start Plinko MVP with Phase 1 foundations for BFF, model/config/result validation, fairness verification, and a Plinko-local Pixi renderer boundary.
- Non-goals:
  - Full Plinko gameplay UI.
  - Full board animation/path playback.
  - Manual betting loop.
  - Auto or Infinity mode.
  - Turbo runtime behavior beyond keeping renderer contracts compatible with later speed options.
  - Mini-history UI.
  - Full Provably Fair modal wiring.
  - Broad shared renderer engine.
  - Physics engines, WebGPU-specific packages, rows 15-16, external runtime animation JSON, direct browser backend calls.
  - Staging, commit, push, PR creation, merge, or lifecycle archival.
- Approved scope:
  - Create this active task artifact.
  - Install only `pixi.js`.
  - Add local Plinko BFF route foundation.
  - Add Plinko-local config, multipliers, types, and result helpers for rows 8-14 and LOW/MEDIUM/HIGH.
  - Extend existing fairness verification helper with a backward-compatible Plinko bucket helper.
  - Add Plinko-local renderer interface and client-only Pixi skeleton.
  - Phase 2: wire Plinko into `/games/[gameSlug]` and render a non-playable responsive route shell.
  - Phase 2: render static Plinko pegs, bucket backgrounds, and multiplier labels for selected rows/risk.
  - Phase 2: add Manual/Auto, bet amount, risk, rows, and disabled action scaffolds without real betting.
  - Phase 2: fetch Plinko config through the local BFF and fall back safely to local config for the scaffold.
  - Phase 2.1: remove duplicate bucket rendering by keeping buckets and multiplier labels in one Pixi coordinate system.
  - Phase 2.1: split `plinko-game.tsx` into smaller Plinko-local controls and board components.
  - Phase 2.1: keep the scaffold non-playable and compatible with later `useAutoBetRunner` integration.
  - Phase 2.2: make selected Risk control styling semantic for LOW/MEDIUM/HIGH.
  - Phase 2.2: replace flat bucket fills with Plinko-local Pixi gradient/gloss bucket styling.
  - Phase 2.2: use row-position bucket tone mapping with dark labels while preserving one Pixi bucket row.
  - Phase 3: refine Plinko-local board geometry for rows 8-14.
  - Phase 3: add a pure backend-like results path planner and single-ball Pixi animation.
  - Phase 3: add a clearly non-betting preview trigger that never calls the bet BFF route.
  - Phase 3: emit one renderer settlement callback after the preview ball reaches its target bucket.
  - Phase 4: remove visible preview/debug controls and static Min/Max helper labels.
  - Phase 4: wire Manual Bet to local `POST /api/games/plinko/bet` only.
  - Phase 4: add a Plinko-local accepted-round ledger for requesting, animating, settled, and failed rounds.
  - Phase 4: reserve/rollback/settle shared balance through the existing balance query cache.
  - Phase 4: allow multiple real backend responses to spawn overlapping Pixi balls at a basic level.
  - Phase 4.1: fix Pixi interpolation crash and guard malformed/short paths.
  - Phase 4.1: add renderer and hook fallback settlement so accepted backend bets cannot leave active rounds stuck forever.
  - Phase 4.1: ensure successful accepted bets add backend payout and invalidate/refetch shared balance after visual settlement or fallback.
  - Phase 4.1: preserve rollback only for failed bet requests.
  - Phase 4.1: align Plinko Bet Amount structure with the Dice/reference single input container.
  - Phase 4.1: hide the local `MAX` amount button unless the existing Game Shell Max Bet mode is active.
  - Phase 4.2: improve Plinko-local Pixi ball motion/easing without changing backend result mapping.
  - Phase 4.2: add bounded peg contact, trail/glow, and bucket hit feedback inside the renderer.
  - Phase 4.2: preserve Phase 4.1 settlement, balance refetch, manual betting, and fallback behavior.
  - Phase 4.3B: add a pure Plinko-local motion planner for backend-constrained micro-trajectories.
  - Phase 4.3B: replace global waypoint interpolation with timed segment/contact motion execution.
  - Phase 4.3B: remove the visible trail effect.
  - Phase 4.3B: trigger peg contact effects from planned contact event timing.
  - Phase 4.3B: preserve settlement callback, balance/refetch behavior, and basic multi-ball support.
  - Phase 4.3C: tune hybrid motion timing and quality constants for smoother gravity-led motion.
  - Phase 4.3C: reduce lateral impulse and soften correction/rebound to avoid sideways slingshot motion.
  - Phase 4.3C: adjust contact geometry/timing so peg impacts read closer to actual ball contact.
  - Phase 4.3C: keep trail removed and preserve settlement/balance behavior.
- Forbidden scope:
  - Changes to unrelated games.
  - New global game engine or shared renderer abstraction.
  - Unapproved scripts, CI, Playwright, hooks, subagents, release automation, or observability.
- Editable files:
  - `.ai/tasks/active/plinko-mvp.md`
  - `package.json`
  - `pnpm-lock.yaml`
  - `src/app/api/games/plinko/**`
  - `src/games/plinko/**`
  - `src/features/provably-fair/lib/fairness-verify.ts`
  - `src/features/provably-fair/index.ts`
  - `docs/architecture/foundation-decisions.md`
- Context-only files:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.claude/rules/**`
  - `.claude/skills/audit/SKILL.md`
  - `.claude/skills/implementation/SKILL.md`
  - `docs/architecture/auth.md`
  - `docs/workflow/**`
  - `.ai/context/plinko-mvp/**`
  - `src/widgets/game-detail/**`
  - `src/features/max-bet/**`
  - `src/features/turbo-mode/**`
  - `src/features/game-expanded-mode/**`
  - `src/features/balance/**`
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/app/api/_lib/**`
  - `src/app/api/games/dice/**`
  - `src/games/dice/**`
  - `src/widgets/provably-fair-modal/**`

## Source Of Truth

- Source-of-truth files inspected:
  - `CLAUDE.md`
  - `docs/architecture/foundation-decisions.md`
  - `docs/architecture/auth.md`
  - `.claude/rules/**`
  - `.claude/skills/audit/SKILL.md`
  - `.claude/skills/implementation/SKILL.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - `.ai/context/plinko-mvp/**`
  - Existing Dice BFF, balance, fairness, Game Action Shell, Max Bet, Turbo, and expanded-mode source files.
- Audit summary:
  - Existing Game Action Shell contracts are present on the base branch.
  - Browser code must call only local `/api/*`.
  - Plinko backend result is authoritative; local helpers can warn about contract mismatches without crashing UI.
  - PixiJS is justified for later many-ball Plinko rendering, but Phase 1 should keep it Plinko-local and client-only.
- Architecture decisions:
  - Plinko game ownership lives under `src/games/plinko/**`.
  - Plinko BFF ownership lives under `src/app/api/games/plinko/**`.
  - Renderer never calls API and never decides game outcome.
  - Provably Fair remains an existing shared feature; Phase 1 only extends helper logic.
- Relevant rules:
  - Project structure.
  - State/data/API boundary.
  - Game frontend architecture.
  - AI workflow.
  - Quality gates.
  - Git lifecycle.
  - Validation workflow.
- Relevant skills:
  - Local audit skill used in the previous step.
  - Local implementation skill.
  - Context7 docs lookup for PixiJS.
  - Verification-before-completion skill for final evidence.

## Impact

- Docs impact: Phase 1 adds the first Plinko BFF/model/renderer foundation and the approved `pixi.js` dependency, so `docs/architecture/foundation-decisions.md` needs a narrow source-backed update.
- API boundary impact: New local Plinko routes must forward to backend through server-only BFF helpers and must not expose backend URL to browser code.
- UI QA requirement: No playable UI is implemented in Phase 1. Later phases require desktop/mobile/fullscreen QA.
- Phase 2 UI QA requirement: rendered smoke check for `/games/plinko`; final visual QA remains deferred because the page is still non-playable.
- Phase 2.1 UI QA requirement: rendered smoke check for the single bucket row and Pixi-hosted multiplier labels on desktop and mobile.
- Phase 2.2 UI QA requirement: rendered smoke check for semantic Risk selected states and gradient/gloss bucket tones, especially High / 14.
- Phase 3 UI QA requirement: no autonomous browser automation by request; provide manual visual check steps instead.
- Phase 4 UI QA requirement: no autonomous browser automation by request; provide manual real-bet visual check steps.
- Phase 4.1 UI QA requirement: no autonomous browser automation by request; provide manual stabilization check steps.
- Phase 4.2 UI QA requirement: no autonomous browser automation by request; provide manual animation polish check steps.
- Phase 4.3B UI QA requirement: no autonomous browser automation by request; provide manual hybrid motion check steps.
- Phase 4.3C UI QA requirement: no autonomous browser automation by request; provide manual tuning check steps against `cur-animation-4.gif` and `ref-animation.gif`.
- Stack primitive checklist:
  - Entrypoint remains unchanged; `/games/plinko` is not wired to a playable Plinko UI yet.
  - Plinko code remains game-local.
  - Pixi imports are dynamic inside a client lifecycle boundary to avoid SSR evaluation.
  - No new global provider, store, engine, or shared renderer is introduced.

## Phase 1 Plan

1. Install approved `pixi.js` dependency.
2. Add Plinko BFF `config` and `bet` routes following Dice route conventions.
3. Add Plinko config, multipliers, types, and result contract helpers.
4. Extend fairness verification with `verifyPlinko`.
5. Add renderer boundary and client-only Pixi host/skeleton.
6. Update durable architecture docs narrowly.
7. Run validation and record evidence.

## Phase 2 Plan

1. Inspect existing Game Detail shell, fullscreen, Max Bet, Turbo, and Phase 1 Plinko files.
2. Add a Plinko config client/query for `GET /api/games/plinko/config`.
3. Extend the Plinko renderer boundary to accept board state and draw static pegs and bucket backgrounds.
4. Add responsive Plinko UI scaffold with Manual/Auto tabs, bet amount, risk, rows, and disabled action controls.
5. Wire `PlinkoGame` into `/games/plinko` through the existing `GameDetail` route flow.
6. Update durable docs only for implemented Phase 2 behavior.
7. Run validation and UI smoke checks.

## Phase 2.1 Plan

1. Inspect current branch/status and verify existing changes are Plinko MVP related.
2. Inspect the duplicated bucket screenshot, Plinko UI/renderer files, and `useAutoBetRunner` future integration contract.
3. Move multiplier labels into the Pixi bucket rendering pass so buckets have one visual source of truth.
4. Remove the DOM bucket overlay from the board UI.
5. Split controls and board panel into Plinko-local components while keeping `PlinkoGame` as the thin query/state orchestrator.
6. Update this task artifact with cleanup evidence.
7. Run validation and rendered smoke checks.

## Phase 2.2 Plan

1. Inspect current branch/status and confirm existing changes are Plinko MVP related.
2. Inspect current and reference screenshots for risk selected states and bucket tones across rows 8-14.
3. Add Plinko-local bucket visual tokens and position-based tone mapping.
4. Update Pixi bucket rendering to use gradient/gloss fills, larger radius, and dark labels while keeping one bucket row.
5. Update Risk control selected styling to use green, amber, or red by selected risk.
6. Update this task artifact with visual refinement evidence.
7. Run validation and rendered smoke checks.

## Phase 3 Plan

1. Inspect current branch/status and confirm existing changes are Plinko MVP related.
2. Inspect Plinko renderer, UI, config, result helpers, and `useAutoBetRunner` compatibility context.
3. Add a Plinko-local pure geometry and path planner for backend-like `results` arrays.
4. Refactor the Pixi renderer to draw pegs, buckets, labels, and the ball from the same geometry source.
5. Add single-ball Pixi-owned preview animation and a settlement callback.
6. Add a separate non-betting `Preview Drop` trigger and lock preview controls while the ball is active.
7. Update this task artifact with Phase 3 evidence and manual visual check instructions.
8. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4 Plan

1. Inspect current branch/status and confirm existing changes are Plinko MVP related.
2. Inspect Dice input/bet patterns, shared balance query, auth session, Max Bet contract, Plinko BFF/client/model, and renderer settlement contracts.
3. Add Plinko-local money/input helpers matching Dice validation behavior.
4. Add real `placePlinkoBet` browser client for local `/api/games/plinko/bet`.
5. Add a Plinko-local manual betting hook with accepted-round ledger, balance reservation, rollback, payout settlement, and refetch.
6. Remove visible `Preview Drop` and static Min/Max helper labels.
7. Wire the real Bet button, lock config controls while rounds are unsettled, and keep Bet available when validation/balance allow.
8. Update the renderer to support multiple active balls at a basic level.
9. Update this task artifact with Phase 4 evidence and manual visual check instructions.
10. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.1 Plan

1. Inspect current branch/status and confirm existing changes are Plinko MVP related.
2. Inspect renderer/path planning, manual betting settlement, balance query/cache pattern, Dice Bet Amount control, Max Bet contract, and current/reference Bet Amount screenshots.
3. Make path interpolation safe for final progress, zero/short paths, and missing waypoints.
4. Add accepted-bet fallback settlement from renderer cancellation/path failure and hook timeout fallback.
5. Make settlement idempotent and balance reconciliation independent from stale React round closures.
6. Align Plinko Bet Amount layout to the Dice/reference single input container and make `MAX` conditional on shell Max Bet active state.
7. Update this task artifact with Phase 4.1 evidence and manual visual check instructions.
8. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.2 Plan

1. Inspect current branch/status and confirm existing changes are Plinko MVP related.
2. Inspect current/reference animation GIFs, Pixi renderer/path code, manual settlement hook, and active task artifact.
3. Improve the existing backend-driven path motion with non-linear segment easing, stronger arc/bounce, and small horizontal inertia.
4. Add bounded renderer-owned peg contact pulses, ball glow, short trail dots, and stronger bucket hit feedback.
5. Keep effects in Pixi display layers with timeout cleanup and avoid React state updates per animation frame.
6. Preserve balance/refetch and settlement contracts without changing BFF, result mapping, or manual betting behavior.
7. Update this task artifact with Phase 4.2 evidence and manual visual check instructions.
8. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.3B Plan

1. Inspect current branch/status and confirm existing changes are Plinko MVP related.
2. Inspect current/reference animation GIF context, renderer/path files, settlement hook, Pixi stage boundary, and active task artifact.
3. Add a pure `plinko-motion-plan.ts` helper that converts backend `results` and board geometry into timed segments, contact events, and final bucket impact.
4. Replace renderer execution of `interpolatePathPosition` with motion-plan segment evaluation.
5. Remove visible trail effects and trigger peg pulses only from planned contact events.
6. Preserve `onRoundSettled`, animation failure fallback, balance/refetch behavior, and local `/api/*` boundaries.
7. Update this task artifact with Phase 4.3B evidence and manual visual check instructions.
8. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.3C Plan

1. Inspect current branch/status and confirm existing changes are Plinko MVP related.
2. Inspect latest current/reference animation GIF context and Phase 4.3B motion planner/renderer files.
3. Tune `PlinkoMotionPlan` timing and quality defaults for longer, smoother, more gravity-led row segments.
4. Reduce lateral impulse and rebound strength so horizontal movement redirects instead of dominating.
5. Adjust contact geometry/timing to reduce peg skipping and tie pulses closer to visible ball contact.
6. Tune renderer segment evaluation to smooth inbound/outbound motion and hide final correction earlier.
7. Keep trail removed, settlement unchanged, and no browser/API/balance changes.
8. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Deferred Phases

- Phase 5: mini-history and settle animations.
- Phase 6: Auto/Infinity.
- Phase 7: Turbo timing integration.
- Phase 8: Provably Fair modal wiring.
- Phase 9: full UI QA and performance review.

## Validation Plan

- Planned commands:
  - `git diff --check`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm check:docs` only if docs change or docs freshness requires it.
  - `pnpm validate` only if a later scope requires full validation.
- Manual checks:
  - Scope check against approved files.
  - API boundary check for new browser/server routes.
  - Docs impact check.
- Skipped checks and reasons:
  - Automated unit tests/TDD: no test script or test framework exists in `package.json`; Phase 1 and Phase 2 behavior is validated through TypeScript/build, manual source review, and rendered smoke checks.
  - Full UI QA: deferred because Phase 2 is a non-playable scaffold rather than final visual polish.
  - Phase 3 browser automation: explicitly skipped by user request; manual visual check instructions are recorded instead.

## Evidence

- Commands run:
  - `git status --short --branch`
  - `git branch --show-current`
  - `git branch --list 'codex/plinko-mvp' 'codex/game-action-shell-foundation'`
  - `git checkout -b codex/plinko-mvp`
  - `pnpm add pixi.js`
  - Context and source inspection commands for listed source-of-truth files.
  - `npx ctx7@latest library PixiJS "client-only SSR-safe PixiJS Application init destroy React Next.js canvas renderer skeleton"` -> first run timed out; rerun resolved `/pixijs/pixijs`.
  - `npx ctx7@latest docs /pixijs/pixijs "PixiJS v8 Application async init destroy cleanup canvas view React Next.js client-only renderer skeleton"` -> confirmed v8 async `Application.init`, `app.canvas`, and `app.destroy(...)` lifecycle.
  - `git diff --check` -> passed.
  - `pnpm lint` -> passed.
  - `pnpm build` -> first sandboxed run failed on Google Fonts fetch for `Outfit`; approved network rerun reached TypeScript and found `getPlinkoBucketIndex` accumulator inference issue.
  - `pnpm lint` after fix -> passed.
  - `git diff --check` after fix -> passed.
  - `pnpm build` with approved network access after fix -> passed and listed `ƒ /api/games/plinko/bet` and `ƒ /api/games/plinko/config`.
  - `pnpm check:docs` -> passed with mapped durable docs changes recognized.
  - `pnpm validate` with approved network access -> passed.
  - Phase 2 `git status --short --branch` -> expected Phase 1 modified/untracked files on `codex/plinko-mvp`.
  - Phase 2 source/context inspection for `src/widgets/game-detail/**`, `src/app/games/[gameSlug]/page.tsx`, `src/games/plinko/**`, shared primitives, and Plinko design references.
  - Phase 2 `npx ctx7@latest library PixiJS "PixiJS v8 Graphics circle rounded rectangle fill stroke drawing API"` -> resolved `/pixijs/pixijs`.
  - Phase 2 `npx ctx7@latest docs /pixijs/pixijs "PixiJS v8 Graphics circle rounded rectangle fill stroke Text drawing API"` -> confirmed v8 shape-then-fill/stroke Graphics API.
  - Phase 2 `pnpm lint` -> initially passed with warnings for an unused import and a hook dependency; both were fixed.
  - Phase 2 `git diff --check` -> passed.
  - Phase 2 `pnpm lint` after fixes -> passed.
  - Phase 2 `pnpm build` with approved network access -> passed and included `/games/plinko` in generated static params.
  - Phase 2 `pnpm validate` -> first sandboxed run failed only on the known Google Fonts fetch; approved-network rerun passed.
  - Phase 2.1 `git status --short --branch` -> expected Plinko MVP modified/untracked files on `codex/plinko-mvp`.
  - Phase 2.1 inspected `.ai/context/plinko-mvp/curr-buckets-doubling.jpg` and confirmed the issue was split bucket rendering: Pixi buckets plus DOM label row.
  - Phase 2.1 inspected `src/features/auto-bet/model/useAutoBetRunner.ts`; no Auto runtime wiring added.
  - Phase 2.1 `npx ctx7@latest library PixiJS "PixiJS v8 Text labels style anchor positioning destroy Graphics bucket labels"` -> resolved `/pixijs/pixijs`.
  - Phase 2.1 `npx ctx7@latest docs /pixijs/pixijs "PixiJS v8 Text labels style anchor positioning destroy Graphics bucket labels"` -> confirmed v8 options-object `Text` construction and anchor positioning.
  - Phase 2.1 `pnpm lint` -> passed.
  - Phase 2.1 `pnpm validate` -> first sandboxed run failed only on the known Google Fonts fetch; approved-network rerun passed.
  - Phase 2.2 `git status --short --branch` -> expected Plinko MVP modified/untracked files on `codex/plinko-mvp`.
  - Phase 2.2 inspected `curr-risk-medium.jpg`, `curr-risk-high.jpg`, `ref-risk-medium.jpg`, `ref-risk-high.jpg`, `curr-buckets-color-14.jpg`, and `ref-buckets-color-8..14.jpg`.
  - Phase 2.2 `npx ctx7@latest library PixiJS "PixiJS v8 Graphics gradient fill texture CanvasTexture rounded rectangle glossy bucket rendering"` -> resolved `/pixijs/pixijs`.
  - Phase 2.2 `npx ctx7@latest docs /pixijs/pixijs "PixiJS v8 Graphics gradient fill texture CanvasTexture rounded rectangle glossy bucket rendering"` -> confirmed `FillGradient` and texture-capable `Graphics.fill`.
  - Phase 2.2 `npx ctx7@latest docs /pixijs/pixijs "PixiJS v8 FillGradient linear gradient colorStops Graphics fill"` -> confirmed linear gradient `start`/`end` and `colorStops` syntax.
  - Phase 2.2 `pnpm lint` -> passed.
  - Phase 2.2 `pnpm validate` -> first sandboxed run failed only on the known Google Fonts fetch; approved-network rerun initially exposed a Next worker OOM, then a Pixi gradient fill type mismatch after a narrowing attempt.
  - Phase 2.2 `pnpm build` after the local Pixi gradient fill type boundary fix -> passed.
  - Phase 2.2 final `pnpm validate` with approved network access -> passed.
  - Phase 3 `git status --short --branch` -> expected Plinko MVP modified/untracked files on `codex/plinko-mvp`.
  - Phase 3 source inspection covered `src/games/plinko/renderer/**`, `src/games/plinko/ui/**`, `src/games/plinko/lib/**`, `src/games/plinko/config/**`, `src/games/plinko/model/**`, and `src/features/auto-bet/model/useAutoBetRunner.ts`.
  - Phase 3 `npx ctx7@latest library PixiJS "PixiJS v8 Application ticker Container Graphics animation loop cleanup"` -> timed out.
  - Phase 3 `npx ctx7@latest library PixiJS "Application ticker animation cleanup"` -> resolved `/pixijs/pixijs`.
  - Phase 3 `npx ctx7@latest docs /pixijs/pixijs "PixiJS v8 Application ticker animation loop Container Graphics cleanup"` -> timed out; implementation used existing local Pixi v8 patterns and project validation.
  - Phase 3 `pnpm lint` -> passed.
  - Phase 3 `git diff --check` -> passed.
  - Phase 3 `pnpm build` -> first sandboxed run failed only on the known Google Fonts fetch; approved-network rerun passed.
  - Phase 4 `git status --short --branch` -> expected Plinko MVP modified/untracked files on `codex/plinko-mvp`.
  - Phase 4 source inspection covered Dice input/controller/client/query patterns, shared balance query, auth session, Max Bet contract, Plinko BFF/client/model files, and renderer contracts.
  - Phase 4 `pnpm lint` -> passed.
  - Phase 4 `git diff --check` -> passed.
  - Phase 4 `pnpm build` -> first sandboxed run failed only on the known Google Fonts fetch; approved-network rerun passed.
  - Phase 4.1 `git status --short --branch` -> expected Plinko MVP modified/untracked files on `codex/plinko-mvp`.
  - Phase 4.1 inspected `pixi-plinko-renderer.ts`, `plinko-path.ts`, `use-plinko-manual-betting.ts`, Plinko controls/game/pixi host files, Dice Bet Amount control, balance query, Max Bet contract, and `cur-bet-amount.jpg` / `ref-bet-amount.jpg`.
  - Phase 4.1 `git diff --check` -> passed.
  - Phase 4.1 `pnpm lint` -> passed.
  - Phase 4.1 `pnpm build` -> first sandboxed run failed only on the known Google Fonts fetch; approved-network rerun passed.
  - Phase 4.2 `git status --short --branch` -> expected Plinko MVP modified/untracked files on `codex/plinko-mvp`.
  - Phase 4.2 inspected `.ai/context/plinko-mvp/cur-animation.gif` and `.ai/context/plinko-mvp/ref-animation.gif`.
  - Phase 4.2 inspected `pixi-plinko-renderer.ts`, `plinko-path.ts`, `use-plinko-manual-betting.ts`, and the active task artifact.
  - Phase 4.2 `git diff --check` -> passed.
  - Phase 4.2 `pnpm lint` -> passed.
  - Phase 4.2 `pnpm build` -> first sandboxed run failed only on the known Google Fonts fetch; approved-network rerun passed.
  - Phase 4.3B `git status --short --branch` -> expected Plinko MVP modified/untracked files on `codex/plinko-mvp`.
  - Phase 4.3B inspected `.ai/context/plinko-mvp/cur-animation_v2.gif` and `.ai/context/plinko-mvp/ref-animation.gif`.
  - Phase 4.3B inspected `pixi-plinko-renderer.ts`, `plinko-path.ts`, `use-plinko-manual-betting.ts`, `plinko-pixi-stage.tsx`, `plinko-board-panel.tsx`, and Plinko lib exports.
  - Phase 4.3B `git diff --check` -> passed.
  - Phase 4.3B `pnpm lint` -> passed.
  - Phase 4.3B `pnpm build` -> first sandboxed run failed only on the known Google Fonts fetch; approved-network rerun passed.
  - Phase 4.3C `git status --short --branch` -> expected Plinko MVP modified/untracked files on `codex/plinko-mvp`.
  - Phase 4.3C inspected `.ai/context/plinko-mvp/cur-animation-4.gif`, `.ai/context/plinko-mvp/ref-animation.gif`, and historical current animation GIFs.
  - Phase 4.3C inspected `plinko-motion-plan.ts`, `pixi-plinko-renderer.ts`, `plinko-path.ts`, `use-plinko-manual-betting.ts`, and the active task artifact.
  - Phase 4.3C `git diff --check` -> passed.
  - Phase 4.3C `pnpm lint` -> passed.
  - Phase 4.3C `pnpm build` -> first sandboxed run failed only on the known Google Fonts fetch; approved-network rerun passed.
- Review evidence:
  - Source review confirmed new browser-facing route contracts remain local `/api/*`; backend URL/cookie forwarding stays inside route handlers.
  - Source review confirmed Pixi import is dynamic inside the Plinko renderer factory and the skeleton is not wired into the public route.
  - Phase 2 source review confirmed `/games/plinko` uses existing `GameDetail` shell and does not duplicate shell actions/settings/fullscreen.
  - Phase 2 source review confirmed UI calls only `GET /api/games/plinko/config` and does not call the bet route.
  - Phase 2.1 source review confirmed the DOM bucket overlay was removed from `plinko-game.tsx`.
  - Phase 2.1 source review confirmed bucket rectangles and multiplier labels now share the Pixi renderer bucket geometry.
  - Phase 2.1 source review confirmed `plinko-game.tsx` is a thin orchestrator and controls/board layout live in Plinko-local components.
  - Phase 2.2 source review confirmed Risk selected state classes are semantic by risk.
  - Phase 2.2 source review confirmed bucket tone mapping is row-position based and no longer derived only from multiplier thresholds.
  - Phase 2.2 source review confirmed Pixi remains the only bucket row source of truth.
  - Phase 3 source review confirmed `src/games/plinko/lib/plinko-path.ts` owns board geometry and backend-like result path planning.
  - Phase 3 source review confirmed the Pixi renderer uses that geometry for pegs, buckets, labels, path waypoints, and ball landing.
  - Phase 3 source review confirmed `Preview Drop` creates local zero-bet `preview-*` rounds and does not call `/api/games/plinko/bet`.
  - Phase 3 source review confirmed preview settlement updates React only on completion, not every animation frame.
  - Phase 4 source review confirmed visible preview/debug controls were removed.
  - Phase 4 source review confirmed static Min/Max helper labels were removed while min/max stay internal to validation.
  - Phase 4 source review confirmed Manual Bet calls only local `/api/games/plinko/bet`.
  - Phase 4 source review confirmed accepted rounds track `requesting`, `animating`, `settled`, and `failed` states.
  - Phase 4 source review confirmed balance query cache is reserved on accepted click, rolled back on request failure, paid out after renderer settlement, and invalidated after settlement.
  - Phase 4 source review confirmed the renderer no longer cancels existing balls on each new `visualizeRound` call.
  - Phase 4.1 source review confirmed `interpolatePathPosition` now clamps progress/segment indexes and returns safe fallback points for empty or single-waypoint paths.
  - Phase 4.1 source review confirmed renderer path-plan creation/tick failures and resize/board-cancel interruptions settle accepted backend rounds instead of crashing or leaving controls locked.
  - Phase 4.1 source review confirmed manual settlement is idempotent through accepted-result and settled-id refs, adds backend payout once, clears fallback timers, and invalidates shared balance.
  - Phase 4.1 source review confirmed request failures still rollback only the reserved bet amount and do not spawn balls.
  - Phase 4.1 source review confirmed Plinko Bet Amount now uses a single Dice-like input container with coin icon, input, `1/2`, `2X`, and conditional `MAX`.
  - Phase 4.1 source review confirmed `MAX` is passed only when `manualBetting.maxBet.enabled` is true.
  - Phase 4.2 source review confirmed renderer motion remains driven by backend `results` waypoints and does not change bucket/result mapping.
  - Phase 4.2 source review confirmed ball glow/contact pulse is drawn inside the existing Pixi ball object.
  - Phase 4.2 source review confirmed peg contact rings, trail dots, and bucket hit flashes are short-lived Pixi effects with bounded timeout cleanup.
  - Phase 4.2 source review confirmed `setOptions` no longer redraws the board for callback-only option changes, preserving short-lived effects and avoiding unnecessary board churn.
  - Phase 4.2 source review confirmed settlement callback timing remains at bucket hit/fallback, preserving balance refetch behavior.
  - Phase 4.3B source review confirmed `src/games/plinko/lib/plinko-motion-plan.ts` owns pure backend-constrained motion planning without Pixi imports.
  - Phase 4.3B source review confirmed renderer execution now creates a `PlinkoMotionPlan` and evaluates local segment motion instead of global waypoint interpolation.
  - Phase 4.3B source review confirmed `interpolatePathPosition`, `drawTrailDot`, and trail references were removed from Plinko source.
  - Phase 4.3B source review confirmed peg effects are triggered from `PlinkoContactEvent` timing and bucket feedback from `PlinkoBucketImpact`.
  - Phase 4.3B source review confirmed renderer still calls `onRoundSettled` after final impact or fallback and does not alter balance/request logic.
  - Phase 4.3B source review confirmed no dependency or physics engine was added.
  - Phase 4.3C source review confirmed planner timing now uses longer row durations with less per-row acceleration to smooth segment transitions.
  - Phase 4.3C source review confirmed lateral impulse, rebound, damping, correction strength, and pulse scale were reduced/softened.
  - Phase 4.3C source review confirmed contact timing moved later in the row and contact points moved closer to pegs.
  - Phase 4.3C source review confirmed renderer evaluation makes vertical fall more dominant and removes the old horizontal slingshot emphasis.
  - Phase 4.3C source review confirmed trail/interpolation symbols remain absent from Plinko source.
- Pre-commit evidence:
  - Not requested; no staging or commit.
- UI QA evidence:
  - Phase 1: not applicable because no playable UI was wired.
  - Phase 2: Browser smoke check passed on `/games/plinko` at desktop and mobile widths.
  - Phase 2: Desktop check confirmed shell integration, static peg/bucket rendering, high-risk + 14-row state, disabled Bet/Start Autobet controls, and no console warnings/errors.
  - Phase 2: Mobile check confirmed board-first responsive order, renderer surface sizing, bucket labels, controls presence, default 8-row low-risk state, and no console warnings/errors.
  - Phase 2.1: Browser desktop check confirmed one renderer canvas, no DOM multiplier labels in the board section, high-risk + 14-row state, disabled Bet control, and no console warnings/errors.
  - Phase 2.1: Browser desktop screenshot confirmed visible multiplier labels inside the Pixi bucket row with no second lower bucket row.
  - Phase 2.1: Browser mobile check confirmed one renderer canvas after mount, no DOM multiplier labels in the board section, default 8-row low-risk state, and no console warnings/errors.
  - Phase 2.1: Browser mobile screenshot capture timed out in the browser tool after runtime checks passed; viewport was reset.
  - Phase 2.2: Browser desktop check confirmed Medium selected uses amber tint, High selected uses red tint, one renderer canvas is present, no DOM multiplier labels returned, High / 14 state renders, and no console warnings/errors.
  - Phase 2.2: Browser desktop screenshot confirmed reference-like High / 14 bucket sequence: red edges, orange near edges, yellow inner buckets, green center, dark labels, and softer bucket radius.
  - Phase 2.2: Browser mobile check confirmed Low selected uses green tint, one renderer canvas is present after mount, no DOM multiplier labels returned, and no console warnings/errors.
  - Phase 3: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 3: manual visual checks should inspect `/games/plinko`, rows 8 and 14, LOW and HIGH risk, `Preview Drop`, correct bucket landing, no duplicate bucket rows, and console health if the user chooses to inspect DevTools.
  - Phase 4: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4: manual visual checks should inspect `/games/plinko`, real small Manual bets, balance reservation/settlement, invalid amount feedback, rapid Manual clicks, controls lock/unlock, no Preview Drop, no static Min/Max labels, and no duplicate bucket rows.
  - Phase 4.1: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4.1: manual visual checks should inspect `/games/plinko`, Bet Amount buttons inside the input, no `MAX` in normal mode, real bet without animation crash, bucket settlement, balance reconciliation/refetch, control unlock, and rapid 2-3 bet behavior.
  - Phase 4.2: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4.2: manual visual checks should inspect `/games/plinko`, one real bet, rapid 2-3 bets, peg contact pulses, ball glow/trail readability, bucket hit feedback, no stuck active round, balance refetch after landing, and console health.
  - Phase 4.3B: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4.3B: manual visual checks should inspect `/games/plinko`, one real bet, compare against `cur-animation_v2.gif` and `ref-animation.gif`, verify trail removal, gravity-like motion, timed peg contacts/rebounds, bucket impact, control unlock, balance refetch, rapid 2-3 bets, and console health.
  - Phase 4.3C: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4.3C: manual visual checks should inspect `/games/plinko`, one real bet, compare against `cur-animation-4.gif` and `ref-animation.gif`, verify smoother gravity-led motion, no trail, readable peg contacts, fewer apparent peg skips, softer rebound/correction, control unlock, balance refetch, rapid 2-3 bets, and console health.
  - Full final UI QA remains deferred because this is a non-playable scaffold.
- API boundary evidence:
  - `src/app/api/games/plinko/config/route.ts` calls backend config server-side through `backendFetch`.
  - `src/app/api/games/plinko/bet/route.ts` requires `access_token` via `backendCookieHeader`, forwards cookies server-side, and returns browser-safe normalized result data with non-fatal contract warnings.
  - No Plinko browser client or UI fetch code was added in Phase 1.
  - Phase 2 browser client fetches only `/api/games/plinko/config`.
  - Phase 2 added no browser call to `POST /api/games/plinko/bet` and no direct backend URL usage.
  - Phase 3 preview animation is local-only and adds no browser call to `POST /api/games/plinko/bet`.
  - Phase 4 browser Manual Bet calls only local `POST /api/games/plinko/bet`.
  - Phase 4 adds no direct browser backend URL usage.

## Manual Visual Check Instructions

1. Open `/games/plinko` while authenticated.
2. Place one small real Manual bet and compare the motion against `cur-animation-4.gif` and `ref-animation.gif`.
3. Confirm the visible trail effect remains removed.
4. Confirm the ball falls primarily downward, with lateral redirects that do not dominate.
5. Confirm peg contacts are readable and the ball does not obviously skip past pegs.
6. Confirm rebound/correction feels softer and segment transitions look less jerky than `cur-animation-4.gif`.
7. Confirm bucket hit feedback is readable without creating a duplicate bucket row or hiding labels too long.
8. Confirm controls unlock after landing and shared balance still refetches/reconciles.
9. Try rapid 2-3 valid Manual bets and confirm basic overlapping balls still work without stuck active rounds.
10. Optional: check DevTools console for errors.

## Risks And Handoff

- Risks:
  - Backend Plinko config may not include multiplier tables, so Phase 1 serves Plinko-local multiplier config alongside backend min/max.
  - Pixi v8 requires async app initialization; future UI must handle mount/unmount races carefully.
  - Fairness UI is still Dice-specific until a later modal wiring phase.
  - Rapid manual betting and visual balance reservation are deferred and remain the highest state-management risk.
  - Phase 2 static board geometry is intentionally approximate and needs Phase 3 refinement before animation.
  - Phase 2 config query may show the safe unavailable state when the backend is not reachable; the scaffold falls back to local min/max/multipliers.
  - Phase 2.1 Pixi text labels use responsive scaling; very narrow future layouts may still need geometry tuning during animation work.
  - Phase 2.1 kept Auto mode as scaffold state only; future `useAutoBetRunner` integration must keep response receipt separate from visual ball settlement.
  - Phase 2.2 Pixi gradient fills use the documented `FillGradient` runtime with a local type cast because the current `Graphics.fill` TypeScript surface did not accept the gradient instance directly.
  - Phase 2.2 bucket tones are position-based and approximate the references; final polish may still tune exact row-by-row tone thresholds.
  - Phase 3 path geometry is stable enough for preview animation, but peg contact realism and exact bounce timing need final polish.
  - Phase 3 implements one active preview ball only; many-ball performance and concurrent animation are deferred.
  - Phase 3 keeps response receipt and visual settlement separate in shape, but the real accepted-round ledger is deferred to Phase 4.
  - Phase 4 balance updates are optimistic and cache-based; rapid request/settlement races should be hardened further before Auto/Infinity.
  - Phase 4 many-ball support is basic and not final performance polish.
  - Phase 4 backend/auth failures roll back reservation and surface safe error text, but auth-session invalidation is not wired here.
  - Phase 4 Max Bet integration consumes shell max limits and local MAX control; there is still no shell-level callback to set Plinko amount directly.
  - Phase 4.1 settlement has renderer and timeout fallbacks, but rapid balance reservation remains optimistic and should be hardened before Auto/Infinity.
  - Phase 4.1 many-ball animation remains basic and may need performance tuning under larger bursts.
  - Phase 4.1 Max Bet visibility is correctly tied to shell state; shell-level amount mutation remains a possible future enhancement.
  - Phase 4.2 animation feel is closer to reference but still not a full physics simulation.
  - Phase 4.2 effect readability should be manually tuned against real gameplay because no autonomous browser/video QA was run.
  - Phase 4.2 many-ball effects are bounded but still need performance review before Auto/Infinity.
  - Phase 4.2 mini-history timing should later coordinate with bucket-hit settlement so result history appears after the visual hit.
  - Phase 4.3B hybrid motion is deterministic and backend-constrained, but final animation quality still needs user-led GIF/manual review against the reference.
  - Phase 4.3B many-ball performance is protected by bounded effects, but larger bursts still need profiling before Auto/Infinity.
  - Phase 4.3B final-bucket correction is soft by design; if it appears fake or snappy in manual review, stop further cosmetic tuning and run a focused physics-engine spike.
  - Phase 4.3B mini-history should attach to bucket settlement after visual landing, not response receipt.
  - Phase 4.3C tuning reduces horizontal/jerky motion but still needs user-led GIF/manual review for acceptance.
  - Phase 4.3C final bucket correction remains a product-quality risk; if it still looks fake/snappy, prefer a focused physics-engine spike over more constants.
  - Phase 4.3C many-ball performance remains basic and should be profiled before Auto/Infinity.
- Handoff:
  - Continue with Phase 5 only after Phase 4 manual visual review.
- Lifecycle close notes:
  - Do not archive until explicitly requested after implementation is complete.
