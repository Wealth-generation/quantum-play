# Task Lifecycle Record

## Identity

- Task title: Plinko MVP
- Status: active
- Mode: implementation, Phase 6A Generic AutoBet Infinity support + Plinko AutoBet integration
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
  - Phase 4.4B: install only approved `matter-js` and `@types/matter-js` dependencies.
  - Phase 4.4B: add a Plinko-local Matter.js pre-simulation trajectory builder for animation-only ball motion.
  - Phase 4.4B: replay valid Matter trajectory samples through the existing Pixi renderer.
  - Phase 4.4B: verify simulated final bucket against the backend-derived bucket before using a Matter trajectory.
  - Phase 4.4B: preserve the current custom/hybrid motion plan as automatic fallback.
  - Phase 4.4B: keep settlement, balance/refetch, BFF/API routes, Manual betting state, and Game Shell behavior unchanged.
  - Phase 4.4C: polish the current Matter.js animation path without broad renderer rewrites or new dependencies.
  - Phase 4.4C: improve peg contact readability and reduce levitating/skipping feel with bounded contact assist.
  - Phase 4.4C: tune Matter restitution/friction/velocity response for slightly richer but controlled bounce.
  - Phase 4.4C: improve Pixi replay/contact feedback while keeping no visible trail and preserving burst caps.
  - Phase 4.4C: keep fallback, settlement, balance/refetch, backend/BFF, and Game Shell behavior unchanged.
  - Phase 4.4D: make Matter contact assist row-aware so each backend result row can produce a readable contact moment.
  - Phase 4.4D: improve 8-10 row readability without reducing active balls, row contacts, or bounce.
  - Phase 4.4D: preserve 14-row density, high-energy burst behavior, no visible trail, final bucket verification, and fallback behavior.
  - Phase 4.4E: add bounded replay pacing around selected Matter contacts for top-side peg perch / roll-off feel.
  - Phase 4.4E: improve contact quality and velocity readability without making the ball sticky, route-snappy, or cartoonishly bouncy.
  - Phase 4.4E: reduce always-on ball glow so there is no visible trail, ghost, afterimage, or persistent comet effect.
  - Phase 4.4E: keep Matter/Pixi architecture, dependencies, backend/BFF, settlement, balance/refetch, and fallback behavior unchanged.
  - Phase 4.4F: remove residual detached ball glow/trail/ghost by eliminating large translucent filled ball halos and always-on contact rings from per-frame ball drawing.
  - Phase 4.4F: remove lingering peg-impact dot by removing filled contact-point spark markers and shortening peg pulse lifetime.
  - Phase 4.4F: preserve brief contact-local ball ring, peg pulse, bucket flash, Matter physics, bounce/perch timing, fallback, settlement, and balance/refetch behavior.
  - Phase 4.5: fix desktop fullscreen exit height regression so Plinko returns to the normal board height after leaving fullscreen.
  - Phase 4.5: constrain normal desktop Plinko board sizing, keep expanded board sizing fullscreen-driven, and force Pixi resize/reflow after fullscreen state changes.
  - Phase 4.5: preserve Matter physics, bounce/contact polish, betting, balance, settlement, backend/BFF, mobile layout, bottom navbar, Auto/Turbo/mini-history/PF, and dependencies.
  - Phase 4.6: tighten Plinko mobile layout spacing and vertical order to better match mobile references.
  - Phase 4.6: move the mobile Bet action directly under the board, reduce mobile board/control vertical gaps, and keep 8-row/14-row boards readable.
  - Phase 4.6: preserve desktop layout, Matter physics, animation/contact polish, betting, balance, settlement, backend/BFF, bottom navbar, Auto/Turbo/mini-history/PF, and dependencies.
  - Phase 5A: replace Plinko's direct shared balance query cache arithmetic with a Plinko-local visual balance ledger/projection.
  - Phase 5A: keep `useBalanceQuery` canonical backend server state and add only an opt-in shared display projection for TopBar.
  - Phase 5A: reserve stake visually on accepted local click, roll back failed requests by marking only that round failed, apply payout exactly once on visual settlement, and refetch canonical balance only after the active ledger drains.
  - Phase 5A: harden accepted Plinko response visualization by draining a queued list of accepted rounds instead of overwriting a single visual round slot.
  - Phase 5A: preserve backend/BFF behavior, Matter trajectory physics, animation/contact polish, layout, Auto/Turbo, Provably Fair, and mini-history non-goals.
  - Phase 5B: add Plinko-local mini-history items only after visual bucket settlement.
  - Phase 5B: keep mini-history ordered by visual settlement time, newest first, with five fully visible items and old items exiting through animation.
  - Phase 5B: style mini-history items from the landed bucket tone and use immutable backend multiplier snapshots.
  - Phase 5B: preserve backend/BFF, Phase 5A balance projection, Matter physics, animation pathing, layout beyond board overlay placement, Auto/Turbo, Provably Fair, bottom navbar, and dependencies.
  - Phase 6A: extend the generic `useAutoBetRunner` with explicit infinite mode while preserving finite behavior.
  - Phase 6A: implement Plinko AutoBet finite and Infinity modes through Plinko-local round orchestration.
  - Phase 6A: keep Plinko AutoBet request pacing tied to backend responses, not visual settlement.
  - Phase 6A: keep Plinko payout projection and mini-history attached to visual settlement.
  - Phase 6A: enable Dice Infinity only through the generic runner and existing Dice controls without changing Dice mechanics.
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
  - `src/features/balance/model/balance-display-projection.ts`
  - `src/features/balance/index.ts`
  - `src/widgets/top-bar/top-bar.tsx`
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

## Phase 4.4B Plan

1. Inspect current branch/status and confirm the manual betting checkpoint commit is the latest commit.
2. Install only `matter-js` and `@types/matter-js`.
3. Add a Plinko-local Matter.js trajectory module that pre-simulates one temporary world per accepted ball.
4. Use existing board geometry and backend `results` to create route checkpoints and final-bucket constraints.
5. Verify the final visual bucket matches `sum(results)` before replaying the Matter trajectory.
6. Replay valid Matter samples through Pixi with peg contact and bucket impact effects.
7. Fall back to the existing custom/hybrid `PlinkoMotionPlan` when Matter sampling fails or mismatches the backend bucket.
8. Preserve settlement callback behavior, balance/refetch behavior, local `/api/*` boundaries, and no React frame updates.
9. Update this task artifact with dependency/design/fallback/validation evidence and manual visual check instructions.
10. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.4C Plan

1. Inspect current branch/status and confirm existing dirty files are related to the Plinko Matter spike.
2. Inspect `cur-animation-6.gif`, `ref-animation.gif`, Matter trajectory code, Pixi renderer replay/effects, and the active task artifact.
3. Tune Matter ball/peg restitution, friction, and damping for slightly richer controlled bounce.
4. Add bounded near-peg contact assist to improve readable contacts when physical collision events are visually too soft.
5. Smooth Pixi replay between sampled Matter positions and modestly enrich peg hit/ball pulse feedback.
6. Preserve no-trail behavior, effect caps, backend bucket verification, fallback animation, settlement, and balance/refetch behavior.
7. Update this task artifact with tuning evidence, manual QA instructions, and remaining risks.
8. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.4D Plan

1. Inspect current branch/status and confirm existing dirty files are related to the Plinko Matter work.
2. Inspect the Matter trajectory contact assist and Pixi replay/effects boundaries.
3. Convert proximity-only assist into row-aware contact coverage based on backend `results`.
4. Prefer real Matter collisions, then add bounded row-aware contact assist when a row has no readable contact.
5. Tune lower-row-count contact windows so rows 8-10 feel less empty without making 14-row boards noisy.
6. Preserve high-energy burst behavior by keeping ball motion/contact moments intact and only relying on existing decorative effect caps.
7. Preserve no-trail behavior, final bucket verification, fallback animation, settlement, and balance/refetch behavior.
8. Update this task artifact with row-aware strategy, validation evidence, manual QA instructions, and remaining risks.
9. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.4E Plan

1. Inspect current branch/status and confirm existing dirty files are related to the Plinko Matter work.
2. Inspect `cur-animation-bounce.gif`, `ref-animation-bounce.gif`, Matter trajectory contact code, Pixi replay/effects, and the active task artifact.
3. Add bounded replay-only contact pacing around selected contacts to create short top-side peg perch / roll-off moments.
4. Keep perch selection sparse, especially on dense boards, and favor 8-10 row readability.
5. Preserve final bucket verification by applying pacing only after Matter trajectory acceptance.
6. Reduce always-on ball glow so contact pulse remains readable without a visible trail/ghost following the ball.
7. Preserve no-trail behavior, backend authority, fallback animation, settlement, balance/refetch, burst behavior, and no new dependencies.
8. Update this task artifact with contact quality strategy, perch/roll-off strategy, timing notes, validation evidence, manual QA instructions, and remaining risks.
9. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.4F Plan

1. Inspect current branch/status and confirm existing dirty files are related to the Plinko Matter work.
2. Inspect the provided screenshot and `pixi-plinko-renderer.ts` ball drawing/effect code.
3. Remove residual detached ball trail/ghost by eliminating large translucent per-frame ball glow fills and the always-on ball contact ring.
4. Remove lingering peg-impact dot by eliminating filled contact-point spark markers and shortening peg pulse lifetime.
5. Keep the ball bright with solid fill/stroke/highlight and preserve brief contact-local ring, peg pulse, and bucket flash effects.
6. Do not change Matter trajectory physics, bounce/perch timing, backend/BFF, balance/refetch, settlement, dependencies, fullscreen, or broader animation architecture.
7. Update this task artifact with ghost/dot-removal notes and validation evidence.
8. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.5 Plan

1. Inspect current branch/status and confirm existing dirty files are related to the Plinko MVP phases.
2. Inspect fullscreen evidence screenshot, Plinko board/stage sizing, Pixi resize lifecycle, and reusable expanded-mode shell behavior.
3. Remove Pixi canvas intrinsic height from normal document layout so a fullscreen-sized canvas cannot keep the board stretched after exit.
4. Add Plinko stage resize scheduling for ResizeObserver and `fullscreenchange` so Pixi redraws after the normal layout has collapsed.
5. Constrain normal desktop Plinko board height using the existing 560px desktop layout size while keeping fullscreen mode height layout-driven.
6. Preserve Matter trajectory physics, animation polish, betting, balance/refetch, settlement, backend/BFF, mobile layout, bottom navbar, Auto/Turbo/mini-history/PF, and dependencies.
7. Update this task artifact with root cause, fix summary, validation evidence, manual QA instructions, and remaining follow-ups.
8. Run targeted validation: `git diff --check`, `pnpm lint`, and `pnpm build`.

## Phase 4.6 Plan

1. Inspect current branch/status and confirm existing dirty files are related to Plinko MVP phases.
2. Inspect `ref-mobile-top.jpg`, `ref-mobile-bottom.jpg`, `cur-mobile-top.jpg`, and `cur-mobile-bottom.jpg`.
3. Tighten mobile board height/padding so the board remains prominent without pushing controls too low.
4. Reorder mobile controls so the primary Bet action appears directly below the board, followed by Bet Amount, Risk, Rows, and lower Manual/Auto mode controls.
5. Keep desktop control order and desktop board sizing stable.
6. Preserve Matter physics, animation/contact polish, betting, balance/refetch, settlement, backend/BFF, bottom navbar, Auto/Turbo/mini-history/PF, and dependencies.
7. Update this task artifact with mobile layout notes, validation evidence, manual QA instructions, and remaining follow-ups.
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
  - Phase 4.4B `git status --short --branch` -> clean working tree on `codex/plinko-mvp`.
  - Phase 4.4B `git log -1 --pretty=format:%H%n%s%n%ci` -> latest commit `94a0ea6f732929666d25e2a4c7664c75efa94e10`, `feat(plinko): checkpoint manual betting before physics spike`.
  - Phase 4.4B inspected `package.json`, `plinko-motion-plan.ts`, `pixi-plinko-renderer.ts`, `plinko-path.ts`, `plinko-pixi-stage.tsx`, `plinko-board-panel.tsx`, `use-plinko-manual-betting.ts`, active task artifact, `cur-animation-5.gif`, and `ref-animation.gif`.
  - Phase 4.4B `pnpm add matter-js` -> installed `matter-js 0.20.0`.
  - Phase 4.4B `pnpm add -D @types/matter-js` -> installed `@types/matter-js 0.20.2`.
  - Phase 4.4B `npx ctx7@latest library Matter.js "Matter.js Engine.update collisionStart Bodies.circle Composite.clear TypeScript import"` -> resolved `/websites/brm_io_matter-js`.
  - Phase 4.4B `npx ctx7@latest docs /websites/brm_io_matter-js "Engine.update collisionStart Bodies.circle Bodies.rectangle Composite.add Composite.clear Body.setVelocity Body.setPosition"` -> confirmed `Engine.update`, `collisionStart`, and body position/velocity API shape.
  - Phase 4.4B first `pnpm build` -> failed only on known sandboxed Google Fonts fetch.
  - Phase 4.4B approved-network `pnpm build` -> exposed a nullable `trajectory.bucketImpact` TypeScript error in the Matter replay path.
  - Phase 4.4B final `git diff --check` -> passed.
  - Phase 4.4B final `pnpm lint` -> passed.
  - Phase 4.4B final `pnpm build` with approved network access -> passed.
  - Phase 4.4C `git status --short --branch` -> expected related Matter spike files modified/untracked on `codex/plinko-mvp`.
  - Phase 4.4C inspected `.ai/context/plinko-mvp/cur-animation-6.gif` as the newest current Matter-based evidence and `ref-animation.gif` as the target reference.
  - Phase 4.4C inspected `matter-plinko-trajectory.ts`, `pixi-plinko-renderer.ts`, and the active task artifact.
  - Phase 4.4C `npx ctx7@latest library Matter.js "Matter.js Body restitution friction collisionStart Engine.update setVelocity"` -> resolved `/websites/brm_io_matter-js`.
  - Phase 4.4C `npx ctx7@latest docs /websites/brm_io_matter-js "Body restitution friction frictionAir collisionStart Engine.update Body.setVelocity"` -> confirmed Body velocity, friction, and restitution behavior.
  - Phase 4.4C interim `git diff --check` -> passed.
  - Phase 4.4C interim `pnpm lint` -> passed.
  - Phase 4.4C interim `pnpm build` with approved network access -> passed.
  - Phase 4.4D `git status --short --branch` -> expected related Plinko Matter files modified/untracked on `codex/plinko-mvp`.
  - Phase 4.4D inspected implementation prompt, `matter-plinko-trajectory.ts`, `pixi-plinko-renderer.ts`, active task artifact, and current Plinko Matter dirty tree.
  - Phase 4.4D interim `git diff --check` -> passed.
  - Phase 4.4D interim `pnpm lint` -> passed.
  - Phase 4.4D interim `pnpm build` with approved network access -> passed.
  - Phase 4.4E `git status --short --branch` -> expected related Plinko Matter files modified/untracked on `codex/plinko-mvp`.
  - Phase 4.4E inspected `.ai/context/plinko-mvp/cur-animation-bounce.gif` and `.ai/context/plinko-mvp/ref-animation-bounce.gif`.
  - Phase 4.4E inspected `matter-plinko-trajectory.ts`, `pixi-plinko-renderer.ts`, and the active task artifact.
  - Phase 4.4E interim `git diff --check` -> passed.
  - Phase 4.4E interim `pnpm lint` -> passed.
  - Phase 4.4E interim `pnpm build` with approved network access -> passed.
  - Phase 4.4F `git status --short --branch` -> expected related Plinko Matter files modified/untracked on `codex/plinko-mvp`.
  - Phase 4.4F inspected provided screenshots and `pixi-plinko-renderer.ts` ball/effect drawing code.
  - Phase 4.5 `git status --short --branch` -> expected related Plinko MVP files modified/untracked on `codex/plinko-mvp`.
  - Phase 4.5 inspected `.ai/context/plinko-mvp/cur-after-fullscreen-bug-height.jpg`, `plinko-pixi-stage.tsx`, `plinko-board-panel.tsx`, `plinko-game.tsx`, `pixi-plinko-renderer.ts`, `game-detail-shell.tsx`, and `game-expanded-mode-context.tsx`.
  - Phase 4.5 `git diff --check` -> passed.
  - Phase 4.5 `pnpm lint` -> passed.
  - Phase 4.5 first `pnpm build` -> failed only on the known sandboxed Google Fonts fetch for `Outfit`.
  - Phase 4.5 `pnpm build` with approved network access -> passed.
  - Phase 4.6 `git status --short --branch` -> expected related Plinko MVP files modified/untracked on `codex/plinko-mvp`.
  - Phase 4.6 inspected `ref-mobile-top.jpg`, `ref-mobile-bottom.jpg`, `cur-mobile-top.jpg`, `cur-mobile-bottom.jpg`, `plinko-game.tsx`, `plinko-board-panel.tsx`, and `plinko-controls.tsx`.
  - Phase 4.6 `git diff --check` -> passed.
  - Phase 4.6 `pnpm lint` -> passed.
  - Phase 4.6 first `pnpm build` -> failed only on the known sandboxed Google Fonts fetch for `Outfit`.
  - Phase 4.6 `pnpm build` with approved network access -> passed.
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
  - Phase 4.4B source review confirmed `src/games/plinko/renderer/matter-plinko-trajectory.ts` owns temporary Matter.js trajectory generation and does not call APIs or mutate gameplay state.
  - Phase 4.4B source review confirmed Matter simulation uses one temporary world per generated ball trajectory, bounded attempts, bounded duration, bounded contact sampling, and world/engine cleanup after sampling.
  - Phase 4.4B source review confirmed Matter trajectories are accepted only when the sampled final bucket matches the backend-derived `sum(results)` bucket.
  - Phase 4.4B source review confirmed Pixi remains the renderer and replays sampled positions/contact events without React frame updates.
  - Phase 4.4B source review confirmed invalid/erroring Matter trajectories fall back to the existing custom/hybrid `PlinkoMotionPlan`.
  - Phase 4.4B source review confirmed settlement still flows through the existing renderer `onRoundSettled` callback and the manual betting hook was not changed.
  - Phase 4.4B source review confirmed no BFF, balance/refetch, payout, Auto/Infinity, Turbo runtime, mini-history, Provably Fair modal, fullscreen, or global renderer architecture changes were made.
  - Phase 4.4C source review confirmed Matter ball and peg restitution/friction were tuned only inside the Plinko-local trajectory builder.
  - Phase 4.4C source review confirmed bounded near-peg contact assist adds visual contact timing and a small controlled deflection without deciding the final result.
  - Phase 4.4C source review confirmed final bucket verification and hybrid fallback remain intact after the contact polish.
  - Phase 4.4C source review confirmed Pixi replay interpolation is smoothed between sampled Matter positions and no visible trail was added.
  - Phase 4.4C source review confirmed peg hit feedback and ball contact pulse were enriched under the existing effect cap.
  - Phase 4.4C source review confirmed no manual betting, BFF, balance/refetch, payout, Auto/Infinity, Turbo, mini-history, Provably Fair, fullscreen, dependency, or broad architecture changes were made.
  - Phase 4.4D source review confirmed row contact targets are derived from backend `results` and existing board geometry.
  - Phase 4.4D source review confirmed real Matter collisions remain preferred, with assist only adding a bounded row-aware contact cue when a row has no readable contact.
  - Phase 4.4D source review confirmed assist uses the row's relevant/closest peg and applies only a small controlled local impulse instead of snapping positions.
  - Phase 4.4D source review confirmed lower row counts get a wider row contact window while 14-row density remains protected from duplicate row assists.
  - Phase 4.4D source review confirmed burst behavior keeps active balls, row contacts, bounce, final bucket verification, fallback behavior, and settlement unchanged.
  - Phase 4.4D source review confirmed no dependencies, BFF/API, balance/refetch, payout, Auto/Infinity, Turbo, mini-history, Provably Fair, fullscreen, or broad architecture changes were made.
  - Phase 4.4E source review confirmed selected contact perch/roll-off pacing is applied only after the Matter trajectory has already matched the backend-derived bucket.
  - Phase 4.4E source review confirmed perch/roll-off moments are sparse and bounded to a few short replay samples rather than a new physics architecture.
  - Phase 4.4E source review confirmed contact timing, contact event time offsets, bucket impact timing, and sample times remain monotonic after replay pacing.
  - Phase 4.4E source review confirmed always-on ball glow was reduced so contact pulse remains local without a visible trail/ghost.
  - Phase 4.4E source review confirmed final bucket verification, fallback behavior, burst ball count, settlement, and balance/refetch behavior remain unchanged.
  - Phase 4.4E source review confirmed no dependencies, BFF/API, payout/balance/settlement, Auto/Infinity, Turbo, mini-history, Provably Fair, fullscreen, or broad architecture changes were made.
  - Phase 4.4F source review confirmed `drawBall` no longer paints large translucent filled halo circles around the moving ball.
  - Phase 4.4F source review confirmed `drawBall` no longer paints an always-on outer contact ring; the contact ring appears only during contact pulse.
  - Phase 4.4F source review confirmed `drawPegContactPulse` no longer paints filled contact-point spark markers and peg pulse lifetime is capped shorter.
  - Phase 4.4F source review confirmed the ball remains visible through its solid fill, green stroke, highlight, and brief contact-local ring.
  - Phase 4.4F source review confirmed Matter trajectory physics, bounce/perch timing, peg pulse, bucket flash, fallback, settlement, and balance/refetch behavior were not changed.
  - Phase 4.4F source review confirmed no dependencies, BFF/API, payout/balance/settlement, Auto/Infinity, Turbo, mini-history, Provably Fair, fullscreen, or broad architecture changes were made.
  - Phase 4.5 source review confirmed the fullscreen shell remains the owner of `isExpanded` and Browser Fullscreen API state.
  - Phase 4.5 source review identified the root cause as the Pixi canvas staying in normal document flow with stale fullscreen-sized dimensions, allowing the normal Plinko board panel to keep an oversized measured height after fullscreen exit.
  - Phase 4.5 source review confirmed `PlinkoBoardPanel` now uses the existing normal desktop board height as an explicit `md:h-[560px]` bound while `isExpanded` keeps `h-full min-h-0`.
  - Phase 4.5 source review confirmed `PlinkoPixiStage` schedules renderer resizes on ResizeObserver and `fullscreenchange`, including a delayed resize after the browser restores normal layout, with frame/timer cleanup.
  - Phase 4.5 source review confirmed the Pixi canvas is absolutely positioned inside the stage and no longer contributes stale intrinsic canvas height to parent layout.
  - Phase 4.5 source review confirmed Matter trajectory physics, bounce/contact polish, manual betting, balance/refetch, settlement, backend/BFF, mobile layout, bottom navbar, Auto/Turbo/mini-history/PF, dependencies, and shell lifecycle behavior were not changed.
  - Phase 4.6 source review confirmed mobile `PlinkoBoardPanel` now uses a fixed normal mobile board height with tighter padding, while desktop keeps the existing `md:h-[560px]` sizing and expanded mode keeps `h-full`.
  - Phase 4.6 source review confirmed mobile controls use flex ordering to show Bet immediately below the board, then Bet Amount, Risk, Rows, and Manual/Auto lower in the stack.
  - Phase 4.6 source review confirmed desktop controls preserve their existing source order through `md:order-none`.
  - Phase 4.6 source review confirmed Matter trajectory physics, animation/contact polish, manual betting, balance/refetch, settlement, backend/BFF, bottom navbar, Auto/Turbo/mini-history/PF, dependencies, and shell lifecycle behavior were not changed.
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
  - Phase 4.4B: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4.4B: manual visual checks should inspect `/games/plinko`, one real Manual bet, compare against `cur-animation-5.gif` and `ref-animation.gif`, verify smoother gravity-led motion, visible peg collisions, no route-snapping, no obvious peg skipping, no trail, correct backend-bucket landing, control unlock, balance refetch, rapid 2-3 bets, and console health.
  - Phase 4.4C: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4.4C: manual visual checks should inspect `/games/plinko`, one single bet, one short burst, compare against `cur-animation-6.gif` and `ref-animation.gif`, verify less levitation/peg-skipping feel, slightly richer controlled bounce, readable collision feel, no trail, control unlock, balance refetch, and console health.
  - Phase 4.4D: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4.4D: manual visual checks should inspect `/games/plinko`, one bet on 8 rows, one bet on 14 rows, short bursts on 8 and 14 rows, compare against the latest current GIF and `ref-animation.gif`, verify less levitation, readable row contacts, controlled bounce, no trail, correct settlement/refetch, and console health.
  - Phase 4.4E: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4.4E: manual visual checks should inspect `/games/plinko`, one bet on 8 rows, one bet on 14 rows, short bursts on 8 and 14 rows, compare against `cur-animation-bounce.gif` and `ref-animation-bounce.gif`, verify no trail/ghost, believable peg contacts, occasional top-side perch/roll-off, controlled bounce, no sticky pauses, no snapping, correct settlement/refetch, and console health.
  - Phase 4.4F: autonomous browser smoke checks were intentionally skipped per user request.
  - Phase 4.4F: manual visual checks should inspect `/games/plinko`, one single bet and one short burst, verify no detached green ghost/trail/afterimage behind the ball, no lingering peg-impact dot after contact, the ball remains clearly visible, contact feedback still reads briefly, bounce/perch feel does not regress, settlement/refetch still works, and console health.
  - Phase 4.5: autonomous browser smoke checks were not requested; manual QA should inspect desktop fullscreen enter/exit behavior, board sizing before/after exit, animation render after exit, betting settlement/refetch, and console health.
  - Phase 4.6: autonomous browser smoke checks were not requested; manual QA should compare mobile top/bottom layout against the reference screenshots, including 8-row and 14-row board readability.
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

## Phase 5A Implementation Notes

- Scope:
  - Fix Plinko burst balance/header behavior by separating canonical backend balance from temporary visual Plinko projection.
  - Keep Phase 5A Plinko-local except for a minimal opt-in balance display projection consumed by TopBar.
- Files changed:
  - `src/features/balance/model/balance-display-projection.ts`
  - `src/features/balance/index.ts`
  - `src/widgets/top-bar/top-bar.tsx`
  - `src/games/plinko/model/use-plinko-manual-betting.ts`
  - `src/games/plinko/ui/plinko-game.tsx`
  - `src/games/plinko/ui/plinko-board-panel.tsx`
  - `src/games/plinko/ui/plinko-pixi-stage.tsx`
  - `.ai/tasks/active/plinko-mvp.md`
- Visual ledger/projection model:
  - Plinko manual betting now keeps per-round visual ledger entries with local id, stake, accepted result snapshot, payout, status, and `payoutApplied`.
  - Projection is derived from a canonical game-points anchor plus per-round deltas: active/requesting/animating rounds subtract stake, failed rounds contribute no delta, and settled rounds add payout only after visual settlement.
  - Settlement remains idempotent by local round id and applies payout exactly once.
  - Failed requests roll back only their own reserved stake by marking that round `failed`.
  - Final canonical balance refetch is deferred until no requesting or animating Plinko rounds remain; projection is cleared after reconciliation or on unmount/navigation.
- Shared balance hook safety note:
  - `useBalanceQuery` remains unchanged and continues to represent canonical backend server state for all games.
  - The new balance projection layer is opt-in display state; TopBar reads it when present, while existing game consumers of `useBalanceQuery` continue to receive canonical data.
  - Plinko is the only current owner that sets the projection, and it clears by owner id.
- Playback queue/hardening note:
  - Plinko no longer sends a single `roundToVisualize` slot to the Pixi stage.
  - Accepted backend responses are appended to a visual queue, and the stage drains unvisualized ids so rapid out-of-order responses do not skip accepted rounds.
- Validation evidence:
  - `git diff --check` passed.
  - `pnpm lint` initially failed on `react-hooks/set-state-in-effect` for synchronous auth cleanup in `use-plinko-manual-betting.ts`; the cleanup was adjusted and `pnpm lint` passed on rerun.
  - `pnpm build` initially failed in the sandbox because Next.js could not fetch the configured Google Font from `fonts.googleapis.com`; rerun with approved network escalation passed.
- Manual QA instructions:
  - One bet: confirm stake subtracts immediately in header, payout appears only when the ball lands, and final canonical balance reconciles.
  - Rapid 2-3 bets: confirm header follows visual landing order rather than backend response/refetch order.
  - Larger burst: confirm accepted balls are not skipped and no premature payout jump appears.
  - Failed request if possible: confirm only the failed round's stake is restored.
  - While balls are active: confirm raw backend refetches do not overwrite the projected header balance.
  - After all rounds settle/fail: confirm a canonical backend refetch reconciles the header.
  - Confirm no double payout and no stuck active round after renderer or timeout fallback.
- Remaining follow-up:
  - Mini-history remains separate and should attach only after visual bucket settlement, in visual settlement order, newest first.

## Phase 5B Implementation Notes

- Scope:
  - Add settled-only Plinko mini-history as a Plinko-local model/UI feature.
  - Render mini-history as a compact right-side overlay inside the existing board panel on desktop and mobile.
- Files changed:
  - `src/games/plinko/model/use-plinko-mini-history.ts`
  - `src/games/plinko/model/index.ts`
  - `src/games/plinko/ui/plinko-mini-history.tsx`
  - `src/games/plinko/ui/index.ts`
  - `src/games/plinko/ui/plinko-game.tsx`
  - `src/games/plinko/ui/plinko-board-panel.tsx`
  - `src/games/plinko/renderer/plinko-renderer-types.ts`
  - `src/games/plinko/renderer/pixi-plinko-renderer.ts`
  - `src/games/plinko/renderer/index.ts`
  - `src/games/plinko/lib/plinko-bucket-style.ts`
  - `src/games/plinko/lib/index.ts`
  - `.ai/tasks/active/plinko-mvp.md`
- Mini-history model:
  - `usePlinkoMiniHistory` stores Plinko-local items with local round id, backend bet id, multiplier, bucket index, risk, and rows count.
  - Items are deduped by local round id and inserted newest-first.
  - State keeps the five newest items; `AnimatePresence` keeps removed old items present briefly for exit animation, so the oldest/bottom item fades out when the sixth item arrives.
- Settlement trigger:
  - `PlinkoGame.handleRoundSettled` remains the boundary for visual settlement.
  - Renderer settlement callbacks now include a reason: `visual`, `fallback`, or `cancelled`.
  - Balance settlement still runs for all callback reasons to preserve Phase 5A behavior.
  - Mini-history adds only when the reason is `visual`, so failed requests, backend responses, unmount cleanup, redraw cancellation, and fallback settlement paths do not create history items.
- Bucket style mapping:
  - `getPlinkoBucketDomStyle(bucketIndex, rowsCount + 1)` maps the existing Plinko bucket visual style to a DOM linear gradient and label color.
  - History text uses `formatPlinkoMultiplier(round.result.multiplier)` from the immutable backend result snapshot.
- Desktop/mobile placement:
  - `PlinkoMiniHistory` is rendered as an absolute, pointer-events-none, right-side overlay inside `PlinkoBoardPanel`.
  - The overlay does not add a new layout section and does not change the mobile board/Bet/control order.
- Validation evidence:
  - `git diff --check` passed.
  - `pnpm lint` passed; one initial hook dependency warning in `plinko-game.tsx` was fixed and lint passed cleanly on rerun.
  - `pnpm build` initially failed in the sandbox because Next.js could not fetch the configured Google Font from `fonts.googleapis.com`; rerun with approved network escalation passed.
- Manual QA instructions:
  - One bet: confirm the mini-history item appears only after the ball lands in the bucket.
  - Burst 2-3 bets: confirm items appear in visual landing order, newest at the top.
  - Burst 6+ settled items: confirm five items are fully visible and the oldest bottom item fades out.
  - Failed/request-failed bet: confirm no history item appears.
  - Confirm item color/style matches the landed bucket color and multiplier text matches the backend result snapshot.
  - Compare desktop placement with `ref-desktop-with-history.jpg`.
  - Compare mobile placement with `ref-mobile-history.jpg`.
  - Confirm no balance/header regression, animation regression, or console crash.
- Remaining follow-ups:
  - Auto/Turbo, Provably Fair, bottom navbar, and any broader game history system remain separate.

## Phase 6A Implementation Notes

- Scope:
  - Add generic finite/infinite loop support to the shared AutoBet runner.
  - Implement Plinko AutoBet finite and Infinity modes using the existing Plinko BFF client and visual round ledger.
  - Enable Dice Infinity with the same generic runner because the existing Dice control already had an Infinity affordance and required only small, game-local wiring.
- Files changed:
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/features/auto-bet/index.ts`
  - `src/games/plinko/model/use-plinko-manual-betting.ts`
  - `src/games/plinko/ui/plinko-game.tsx`
  - `src/games/plinko/ui/plinko-controls.tsx`
  - `src/games/dice/model/use-dice-auto-bet.ts`
  - `src/games/dice/ui/dice-auto-controls.tsx`
  - `src/games/dice/ui/dice-controls-panel.tsx`
  - `src/games/dice/ui/dice-game.tsx`
  - `src/games/dice/ui/dice-number-of-bets-control.tsx`
  - `.ai/tasks/active/plinko-mvp.md`
- Generic runner Infinity model:
  - `useAutoBetRunner` now accepts `remainingBets: "infinite"` in start options, setter input, and initial options.
  - Runner state stores infinite mode as `remainingBets: null`; finite mode remains a non-negative number.
  - The runner remains game-agnostic and still only owns loop mode, start/stop/error state, `placeBet`, response-time completion, delay, and unmount cleanup.
  - Existing finite numeric API remains supported for Dice and future games.
- Plinko AutoBet integration model:
  - Manual and Auto now share a Plinko-local accepted-round placement path.
  - Each Plinko AutoBet request validates the current projected balance immediately before the request.
  - A failed validation or failed backend/auth request throws to the runner, stops AutoBet, and does not enqueue a visual ball.
  - An accepted backend response stores the result snapshot, schedules fallback settlement, and enqueues exactly one renderer round.
  - The next AutoBet request can start after backend acceptance; it does not wait for the visual ball to land.
  - Manual Stop requests runner stop; if one backend request is already in flight, at most that final accepted response may enqueue a ball.
- Projected balance handling:
  - `useBalanceQuery` remains canonical backend server state and is unchanged.
  - Plinko keeps the Phase 5A owner-scoped display projection and adds Plinko-local refs for synchronous projected-balance checks during rapid AutoBet loops.
  - Payout still applies only through the existing visual settlement path.
  - Canonical balance refetch remains deferred until active Plinko visual rounds drain.
- Mini-history handling:
  - Phase 5B trigger semantics are unchanged.
  - Mini-history still adds only from renderer settlement reason `visual`, so backend responses, failures, fallback settlement, cancellation, and unmount cleanup do not create history items.
- UI behavior:
  - Plinko Auto mode exposes Bet Amount, Risk, Rows, Number of Bets, Infinity toggle, and Start/Stop button.
  - Idle Auto button uses `Start Autobet`; running Auto button uses red `Stop Autobet`.
  - Bet Amount, amount modifiers, Risk, Rows, Number of Bets, Infinity toggle, and mode tabs are disabled while AutoBet is running or visual Plinko rounds are unsettled.
  - Mobile order follows the Auto references: board, Start/Stop, Bet Amount, Risk, Rows, Number of Bets, then Manual/Auto tabs.
- Dice Infinity adoption result:
  - Dice Infinity was enabled with small game-local wiring only.
  - Dice finite mode still uses numeric counts and preserves its existing countdown behavior.
  - Dice Infinity uses the same generic `"infinite"` runner mode and keeps the displayed Number of Bets as `∞`.
  - Dice game mechanics, result application, configure modal, and finite AutoBet strategy behavior were not redesigned.
- Validation evidence:
  - `git diff --check` passed.
  - `pnpm lint` passed.
  - `pnpm build` initially failed in the sandbox because Next.js could not fetch the configured Google Font from `fonts.googleapis.com`.
  - `pnpm build` rerun with approved network escalation passed.
- Manual QA instructions:
  - Browser smoke evidence: with the existing local dev server at `http://localhost:3000`, `/games/plinko` rendered Manual mode, switched to Auto mode, showed Number of Bets `10`, showed the Infinity button, toggled to `∞`, and reported no browser console errors.
  - Browser smoke evidence: `/games/dice` rendered Manual mode, switched to Auto mode, showed Number of Bets `10`, showed the Infinity button, toggled to `∞`, and reported no browser console errors.
  - Full authenticated real-bet QA remains manual because this session did not have an authenticated browser session.
  - Plinko finite: set Auto, Number of Bets `3`, start, and confirm exactly three accepted backend responses enqueue three visual balls unless stopped/error.
  - Plinko Infinity: enable `∞`, start, then press Stop and confirm no further requests start after the in-flight request completes.
  - Plinko insufficient balance: try a stake larger than the projected balance and confirm AutoBet stops before creating a request/visual ball.
  - Plinko backend/auth error: force logout/session failure if practical and confirm AutoBet stops without enqueuing a ball for the failed request.
  - Plinko burst behavior: confirm rapid accepted responses do not skip visual balls.
  - Plinko balance/header: confirm stake reservation and payout remain visually ordered by reservation and visual settlement.
  - Plinko mini-history: confirm items appear newest-first only after visual bucket settlement.
  - Plinko cleanup: navigate away during AutoBet if practical and confirm no console crash or stale projection.
  - Dice finite: smoke-test existing finite AutoBet behavior.
  - Dice Infinity: enable `∞`, start, stop, and confirm requests continue until Stop/error without changing Dice mechanics.
- Remaining follow-ups:
  - Turbo remains out of Phase 6A.
  - Provably Fair remains out of Phase 6A.
  - Bottom navbar remains out of Phase 6A.
  - Broader automated UI testing remains unavailable because the project has no approved test runner or Playwright setup.

## Phase 6A Follow-up Bugfix Notes

- Scope:
  - Fix AutoBet lifecycle after client-side navigation between game routes.
  - Preserve generic runner ownership and Plinko-local visual/balance/history semantics.
- Root cause:
  - `useAutoBetRunner` marked its mount ref false during cleanup but did not restore it during a later effect setup.
  - The runner also had no lifecycle token to distinguish an old in-flight loop from a later mounted lifecycle if React/Next reuses or replays a client tree during game navigation.
  - Plinko's local accepted-round adapter had the same stale-response risk for backend responses resolving after navigation.
- Files changed:
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/games/plinko/model/use-plinko-manual-betting.ts`
  - `.ai/tasks/active/plinko-mvp.md`
- Fix:
  - `useAutoBetRunner` now restores `mountedRef` on effect setup, stops pending delay/loop state on cleanup, and increments a generic lifecycle id on setup/cleanup.
  - Runner loops capture the current lifecycle id and stop updating state if a response resolves after a different lifecycle has begun.
  - Plinko's `placePlinkoRound` captures the current lifecycle id before calling the backend and ignores/throws stale responses after navigation before they can enqueue a visual ball or mark a failed round.
  - Plinko settlement fallback timers still clear on cleanup, using a local ref snapshot to satisfy hook cleanup rules.
- What was intentionally not changed:
  - No backend/BFF changes.
  - No Matter.js animation changes.
  - No balance projection semantic changes.
  - No mini-history trigger changes.
  - No new dependencies.
  - No route remount key changes were needed.
- Browser QA evidence:
  - Logged-out smoke only: the in-app browser had no authenticated session, so real AutoBet start could not be exercised here.
  - `/games/dice` -> sidebar link to `/games/plinko` -> Auto tab -> Infinity toggle: Plinko Auto controls responded, Number of Bets displayed `∞`, and browser console error/warn logs were empty.
  - `/games/plinko` -> sidebar link to `/games/dice` -> Auto tab -> Infinity toggle: Dice Auto controls responded, Number of Bets displayed `∞`, and browser console error/warn logs were empty.
- Validation evidence:
  - `git diff --check` passed.
  - `pnpm lint` passed.
  - `pnpm build` initially failed in the sandbox because Next.js could not fetch the configured Google Font from `fonts.googleapis.com`.
  - `pnpm build` rerun with approved network escalation passed.
- Manual QA instructions:
  - Plinko AutoBet works after hard refresh.
  - Dice AutoBet works after hard refresh.
  - Dice -> Plinko -> AutoBet starts without refresh.
  - Plinko -> Dice -> AutoBet starts without refresh.
  - Manual tab -> Auto tab after navigation starts AutoBet.
  - Auto tab -> another game -> Auto tab starts AutoBet.
  - Start/Stop still works after navigation.
  - No console errors.
  - No late Plinko visual ball or balance update appears on the wrong game.

## Phase 6B Implementation Notes

- Scope:
  - Verify and fix Plinko Bet Amount / Max Bet behavior against the existing Dice implementation.
  - Keep changes focused on Plinko Bet Amount, shell Max Bet activation for Plinko, and Manual/Auto amount validation.
  - Preserve backend/BFF, AutoBet runner behavior, Matter animation, mini-history, Provably Fair, and Turbo non-goals.
- Files changed:
  - `src/games/plinko/model/use-plinko-manual-betting.ts`
  - `src/games/plinko/ui/plinko-game.tsx`
  - `src/widgets/game-detail/game-action-config.ts`
  - `.ai/tasks/active/plinko-mvp.md`
- Dice reference used:
  - `src/games/dice/lib/dice-input.ts`
  - `src/games/dice/model/use-dice-game-controller.ts`
  - `src/games/dice/model/use-dice-auto-bet.ts`
  - `src/games/dice/ui/dice-bet-amount-control.tsx`
  - `src/games/dice/ui/dice-controls-panel.tsx`
  - `src/games/dice/ui/dice-auto-controls.tsx`
  - `src/features/max-bet/model/max-bet-contract.tsx`
- Dice parity notes:
  - Dice uses the shell Max Bet contract as the active amount cap: normal `100000`, Max Bet mode `500000`.
  - Dice does not reduce the frontend active max by the game config max.
  - Dice Manual and Auto both normalize request amounts through bounds that include active max and balance.
  - Dice Auto disables Bet Amount controls while running and revalidates the request amount before each bet.
- Plinko behavior fixed:
  - Plinko now uses `maxBet.activeMaxBet` directly for the active frontend amount cap, matching Dice normal `100000` and Max Bet mode `500000`.
  - Plinko no longer lets backend config max lower the product shell max in the frontend amount controls.
  - Plinko Manual and Auto request paths now use `normalizePlinkoBetAmountForRequestWithinBounds` with the current projected/effective balance.
  - Plinko Auto runner amount normalization now clamps through current Plinko bounds instead of only formatting.
  - Plinko `MAX` now uses the current projected balance snapshot and the active shell mode max.
  - Plinko shell settings now provide the existing warning/enable flow so Max Bet mode can become active and reveal the Plinko `MAX` button.
- AutoBet interaction:
  - AutoBet finite and Infinity still use the existing Plinko-local `placePlinkoRound` path.
  - AutoBet start remains blocked by the existing guard when the displayed amount is invalid, out of balance, below min, above active max, unauthenticated, config-error, running, settling, or reconciling.
  - While AutoBet is running, Plinko `controlsLocked` still disables Bet Amount, `1/2`, `2X`, `MAX`, mode tabs, risk, rows, Number of Bets, and Infinity.
  - Running AutoBet revalidates and clamps against the latest projected balance before each request, so it cannot bypass amount/max limits.
- Validation evidence:
  - `git diff --check` passed before and after the task artifact update.
  - `pnpm lint` passed after the code changes.
  - `pnpm build` initially failed in the sandbox because Next.js could not fetch the configured Google Font from `fonts.googleapis.com`.
  - `pnpm build` rerun with approved network escalation passed after the code changes.
- Browser/manual QA evidence:
  - Existing local server at `http://localhost:3000` was used.
  - Plinko logged-out smoke: `/games/plinko` rendered with no console errors or warnings.
  - Plinko normal mode: `MAX` button count was `0` before shell Max Bet activation.
  - Plinko Manual: setting Bet Amount to `8`, pressing `1/2`, then `2X` produced `4.00` and `8.00`.
  - Plinko Auto idle: setting Bet Amount to `12`, pressing `1/2`, then `2X` produced `6.00` and `12.00`; Number of Bets accepted `3`; Infinity affordance was present.
  - Plinko shell Max Bet: settings exposed an interactive `Max Bet` switch, warning modal showed Plinko-specific text, `Enable` activated the shell contract, and `MAX` button count became `1`.
  - Dice quick smoke: `/games/dice` rendered with no console errors or warnings; setting Bet Amount to `10`, pressing `1/2`, then `2X` produced `5.00` and `10.00`.
- Manual QA checklist:
  - Plinko Manual authenticated: verify `1/2`, `2X`, and MAX clamp to `min(projected/effective balance, active max)`.
  - Plinko normal mode authenticated: verify the active max clamps to `100000`.
  - Plinko Max Bet mode authenticated: enable shell Max Bet and verify the active max clamps to `500000`.
  - Plinko Auto idle authenticated: verify `1/2`, `2X`, Number of Bets, Infinity, and Start with clamped bet amount.
  - Plinko Auto running authenticated: verify Bet Amount, `1/2`, `2X`, MAX, Risk, Rows, Number of Bets, Infinity, and mode tabs are disabled.
  - Plinko finite AutoBet authenticated: verify invalid/out-of-limit amounts cannot start and running bets do not exceed projected balance or active max.
  - Plinko Infinity authenticated: verify invalid/out-of-limit amounts cannot start and repeated requests stop rather than bypassing projected balance or active max.
  - Dice authenticated quick smoke: verify existing Bet Amount / Max Bet behavior still matches Dice expectations.
- Remaining follow-ups:
  - Authenticated real-bet QA remains required because this session did not have an authenticated browser session.
  - Turbo remains intentionally unimplemented for Plinko.
  - Backend/BFF, Matter animation, mini-history, and Provably Fair were intentionally unchanged.

## Phase 6B Follow-up Bugfix Notes

- Scope:
  - Fix Plinko finite AutoBet Number of Bets display so it reflects the runner's remaining count while accepted backend bets complete.
  - Keep the fix Plinko-local and preserve current AutoBet execution behavior, finite/Infinity semantics, backend/BFF, Matter animation, balance projection, and mini-history trigger semantics.
- Root cause:
  - `useAutoBetRunner` already tracks live `state.remainingBets`, but Plinko only passed the editable `autoBetCountDraft` to `PlinkoControls`.
  - Dice visually counted down by mutating its draft in `onRoundComplete`; Plinko did not have equivalent display wiring.
  - The generic runner did not need changes because it already exposes the game-agnostic remaining count.
- Files changed:
  - `src/games/plinko/model/use-plinko-manual-betting.ts`
  - `src/games/plinko/ui/plinko-game.tsx`
  - `.ai/tasks/active/plinko-mvp.md`
- Fix:
  - Plinko now derives `autoBetCountDisplay` from `autoRunner.state.remainingBets` while finite AutoBet is running or after a finite run naturally completes at `0`.
  - Plinko keeps `autoBetCountDraft` as the editable next-run draft, so manual Stop with remaining bets left returns the field to the configured draft rather than consuming it.
  - After natural finite completion, the displayed/effective next-run count is `0`, keeping Start disabled until the user enters a new finite count.
  - Infinity mode continues to display `∞` through the existing control behavior.
- What was intentionally not changed:
  - No shared AutoBet runner changes.
  - No Dice source changes.
  - No backend/BFF changes.
  - No Matter animation changes.
  - No balance projection semantic changes.
  - No mini-history trigger changes.
  - No control redesign.
- Validation evidence:
  - `git diff --check` passed after the Plinko display fix and task artifact update.
  - `pnpm lint` passed after the Plinko display fix.
  - `pnpm build` initially failed in the sandbox because Next.js could not fetch the configured Google Font from `fonts.googleapis.com`.
  - `pnpm build` rerun with approved network escalation passed after the Plinko display fix.
- Browser/manual QA evidence:
  - Existing local server at `http://localhost:3000` was used.
  - Logged-out Plinko smoke: `/games/plinko` rendered with Auto controls available, no framework overlay, and no console errors/warnings.
  - Plinko Infinity smoke: toggling Infinity displayed `∞` and kept console errors/warnings empty.
  - Browser input helper could not type a finite count through this runtime because the in-app browser reported its virtual clipboard was unavailable; authenticated finite AutoBet countdown still requires manual QA.
- Manual QA checklist:
  - Plinko finite AutoBet 3 authenticated: verify Number of Bets visually counts down `3 -> 2 -> 1 -> 0/complete`.
  - Plinko finite AutoBet 10 authenticated: verify the visual count decreases after each accepted backend response.
  - Plinko Infinity authenticated: verify it displays `∞` while running.
  - Stop during a finite run: verify the field returns to the configured draft for the next run.
  - Start another finite run after stop/complete: verify it works after the displayed count is valid.
  - Dice AutoBet smoke remains recommended only if the shared runner changes in a later pass; this fix was Plinko-local.

## Phase 6C Implementation Notes

- Scope:
  - Implement Plinko Turbo through the existing Game Detail shell Turbo provider.
  - Treat the previously accepted/current Plinko replay speed as Turbo speed.
  - Slow Normal mode replay timing for readability without changing backend results, Matter trajectory generation, settlement semantics, balance projection, mini-history semantics, or AutoBet pacing.
- Speed model:
  - Normal mode uses a `0.75` replay-speed multiplier.
  - Turbo mode uses a `1` replay-speed multiplier, preserving the previously accepted/current Plinko animation pace.
  - The `0.75` value is inside the requested `0.7-0.8x` range and keeps the change conservative while making Normal visibly more readable.
- Files changed:
  - `src/games/plinko/ui/plinko-game.tsx`
  - `src/games/plinko/ui/plinko-board-panel.tsx`
  - `src/games/plinko/renderer/pixi-plinko-renderer.ts`
  - `docs/architecture/foundation-decisions.md`
  - `.ai/tasks/active/plinko-mvp.md`
- Implementation:
  - `PlinkoGame` now reads `turboEnabled` from the shell-owned `useTurboMode()` provider.
  - `PlinkoBoardPanel` passes `turboEnabled` through the existing Plinko renderer options path.
  - The Pixi renderer snapshots the replay speed multiplier when each ball animation starts.
  - Both fallback motion-plan replay and Matter trajectory replay scale elapsed replay time by the snapped multiplier.
  - Turbo state remains outside `boardChanged`, so toggling Turbo updates renderer options without cancelling active balls.
- Settlement safety notes:
  - The existing renderer completion guards still protect each visual/fallback settlement path from duplicate callback dispatch.
  - The existing Plinko model `settledRoundIdsRef` still makes payout settlement idempotent.
  - Existing fallback settlement remains available if renderer playback fails.
  - Mini-history remains attached only to `reason === "visual"` in `PlinkoGame.handleRoundSettled`.
- AutoBet interaction:
  - Plinko keeps `useAutoBetRunner({ delayMs: 0 })`.
  - AutoBet finite and Infinity still start the next request after backend response/runner bookkeeping, not after visual settlement.
  - Turbo only changes visual replay duration for accepted balls.
- What was intentionally not changed:
  - No backend/BFF changes.
  - No payout, multiplier, bucket, `results`, or fairness logic changes.
  - No Matter.js physics generation changes.
  - No balance projection semantic changes.
  - No mini-history trigger semantic changes.
  - No shared AutoBet runner changes.
  - No control/layout redesign.
  - No dependencies.
- Validation evidence:
  - `git diff --check` passed after the Plinko Turbo integration and docs/task artifact updates.
  - `pnpm lint` passed after the Plinko Turbo integration and docs/task artifact updates.
  - `pnpm build` initially failed in the sandbox because Next.js could not fetch the configured Google Font from `fonts.googleapis.com`.
  - `pnpm build` rerun with approved network escalation passed after the Plinko Turbo integration and docs/task artifact updates.
  - `pnpm check:docs` passed after the narrow durable docs update.
- Browser/manual QA evidence:
  - Existing local server at `http://localhost:3000` was used.
  - Logged-out desktop smoke: `/games/plinko` rendered the Plinko renderer surface, settings opened, and Turbo Mode toggled on/off without page errors.
  - Logged-out mobile smoke: `/games/plinko` rendered the Plinko renderer surface, settings opened, and Turbo Mode toggled on/off without console errors or page errors.
  - Desktop smoke reported one unrelated dev-server console error for missing `http://localhost:3000/favicon.ico`.
  - Authenticated real-bet animation speed, AutoBet finite, AutoBet Infinity, balance/header settlement, mini-history ordering, skipped-ball, and duplicate-settlement QA still require an authenticated session.
- Manual QA checklist:
  - Manual Plinko Normal vs Turbo speed comparison.
  - Confirm Normal is more readable/slower.
  - Confirm Turbo feels like the previously accepted/current fast speed.
  - AutoBet finite in Normal and Turbo.
  - AutoBet Infinity in Turbo, then Stop.
  - Confirm no skipped balls.
  - Confirm no duplicate settlement callbacks.
  - Confirm balance/header settlement remains ordered.
  - Confirm mini-history still appears only after bucket settlement.
  - Confirm toggling Turbo does not cancel active balls.
  - Desktop/mobile quick smoke.
  - Console clean.
- Remaining follow-ups:
  - Authenticated real-bet QA remains required for finite AutoBet, Infinity AutoBet, balance/header settlement ordering, and mini-history ordering.
  - Product may tune the Normal replay multiplier if manual QA finds `0.75` too slow or still too fast.
  - Provably Fair remains separate.
  - Bottom navbar remains separate.

## Manual Visual Check Instructions

1. Open `/games/plinko` on a mobile viewport while authenticated.
2. Compare the initial mobile view against `ref-mobile-top.jpg`; confirm the board is prominent but compact and the Bet button sits directly below it.
3. Scroll down and compare against `ref-mobile-bottom.jpg`; confirm Bet Amount, Risk, Rows, and Manual/Auto controls follow with tighter spacing and no awkward large gaps.
4. Check both 8 rows and 14 rows on mobile; confirm pegs and buckets remain readable and content scrolls naturally.
5. Place one small Manual bet and confirm animation renders, settles, unlocks controls, and shared balance refetches/reconciles.
6. Check desktop `/games/plinko`; confirm the left controls and desktop board height did not regress.
7. Optional: check DevTools console for errors.

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
  - Phase 4.4B Matter trajectory quality is still a spike result and must be manually reviewed against `cur-animation-5.gif` and `ref-animation.gif` before claiming success.
  - Phase 4.4B Matter final-bucket guarantee depends on bounded pre-simulation verification; mismatches intentionally fall back to the hybrid renderer.
  - Phase 4.4B Matter dependency adds bundle weight and should be reassessed if manual QA does not show a clear visual improvement.
  - Phase 4.4B many-ball performance uses pre-sampled trajectories rather than live Matter worlds, but mobile and burst performance still need manual QA before Auto/Infinity.
  - Phase 4.4B future Turbo and mini-history work must attach to visual replay timing, not backend response receipt.
  - Phase 4.4C contact assist is intentionally bounded, but manual QA should verify it does not make contacts look artificially sticky or over-signaled.
  - Phase 4.4C richer bounce could still need one narrow tuning pass if some paths look too horizontal or too soft.
  - Phase 4.4C burst behavior preserves caps, but mobile and many-ball performance still need user-led visual QA.
  - Phase 4.4D row-aware assist should reduce low-row levitation, but manual QA should verify row contacts do not read as fake or route-driven.
  - Phase 4.4D 14-row boards should remain readable, but dense bursts may still need secondary effect opacity/cap tuning if they feel busy.
  - Phase 4.4D low-row contact windows are intentionally wider; mobile QA should confirm they do not over-signal on narrow canvases.
  - Phase 4.4E perch/roll-off pacing is replay-only and bounded, but manual QA should verify it does not read as sticky or artificial.
  - Phase 4.4E no-trail cleanup reduces persistent ball glow; if the ball reads too flat, only contact-local pulse should be adjusted.
  - Phase 4.4E contact pacing adds a small duration shift around selected contacts; future Turbo timing should scale from the final replay duration.
  - Phase 4.4F removes large filled ball halos, the always-on outer ring, and filled peg-impact spark dots; if the ball reads too understated in manual QA, adjust only contact-local ring/stroke, not persistent glow or impact markers.
  - Phase 4.5 fullscreen exit sizing now has a Plinko-local guard, but desktop manual QA should confirm browser-specific fullscreenchange timing in Chrome and any target browser before final release.
  - Phase 4.6 improves Plinko within the current app shell, but the reference bottom navbar remains future shell-level work rather than Plinko-local UI.
  - Phase 4.6 keeps bottom navbar and safe-area handling out of scope; bottom navbar safe-area behavior remains a shell-level follow-up.
  - Future Auto/Turbo integration must preserve backend result authority and should scale animation timing from the Matter replay duration.
  - Future mini-history should continue to attach to visual bucket settlement, not backend response receipt.
- Handoff:
  - After Phase 4.6 manual mobile QA passes, move to shell-level bottom navbar/safe-area planning or the next approved Plinko gameplay phase.
- Lifecycle close notes:
  - Do not archive until explicitly requested after implementation is complete.
