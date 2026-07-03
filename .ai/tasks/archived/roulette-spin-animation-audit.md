# Audit: Roulette Wheel / Ball Spin Animation

**Date:** 2026-06-17
**Branch:** feat/roulette-game
**Skill:** audit (read-only — no implementation)
**Scope:** `src/games/roulette/renderer/` module design for rAF-driven ball spin phases 1–4.

---

## Audit

### Relevant files

**Source inspected:**

| File | Role |
|---|---|
| `src/games/roulette/model/roulette-types.ts` | `RouletteBetResult.randomPosition: number` — the only backend signal the renderer receives |
| `src/games/roulette/model/roulette-store.ts` | Zustand store; `history`, `hydrated`, placement actions; no animation state yet |
| `src/games/roulette/model/use-roulette-game-controller.ts` | `handleResult` (shared manual + auto path); `handleBet` async function — integration point for animation await |
| `src/games/roulette/model/use-roulette-auto-bet.ts` | `placeBet` closure wrapping `betMutation.mutateAsync`; calls `onResult(result)` after successful bet; uses `useAutoBetRunner` |
| `src/features/auto-bet/model/useAutoBetRunner.ts` | Generic runner: `placeBet` is `async`, runner `await`s it each round; `onRoundComplete` called synchronously (void, not awaited) after the resolved result; `waitBetweenRounds` runs AFTER `onRoundComplete` |
| `src/games/roulette/ui/roulette-game.tsx` | Top-level game composition; renders `RouletteTable`, `RouletteHistory`, `RouletteResult` — NO spinning wheel element |
| `src/games/roulette/ui/roulette-table.tsx` | Flat betting board (number grid, dozens, even-money bets); no rotation, no disc visual |
| `src/games/roulette/ui/roulette-result.tsx` | Static win overlay (2 s auto-dismiss); shows number + payout; integration point for new animation stage (overlay should appear AFTER animation) |
| `src/games/roulette/ui/roulette-history.tsx` | History sidebar; also feeds from `handleResult` — must wait until animation completes |
| `src/games/roulette/config/roulette-defaults.ts` | `getRouletteColor`, chip constants; no wheel geometry; European single-zero wheel pocket order not yet present |
| `src/games/plinko/renderer/plinko-renderer-types.ts` | Reference: class-style imperative renderer interface (`visualizeRound`, `onRoundSettled` callback) |
| `docs/architecture/foundation-decisions.md` | Authoritative — `renderer/` belongs to `src/games/<game>/renderer`; created only when a real approved file is being added; this audit is that approval step |
| `docs/workflow/ownership-to-docs.md` | `src/games/**` → `docs/architecture/foundation-decisions.md` (blocking, rationale-allowed) |

---

### Ownership

`src/games/roulette/renderer/` — Roulette-local renderer. Consistent with established pattern (`src/games/plinko/renderer/`). Must not import from Dice, Plinko, or any other game module. Must not call any API. Must not decide the outcome. Outcome (`randomPosition`) is given to it by the controller after the backend response arrives.

The continuous idle rotation of the disc (CCW) and crown (CW) are CSS, owned by the `ui/` layer. They are NOT owned by the renderer module.

---

### Editable scope proposal

**New folder to create:** `src/games/roulette/renderer/`

**Files to create (5):**

| File | Responsibility |
|---|---|
| `roulette-wheel-geometry.ts` | European wheel pocket order (37-slot array), pocket-index-to-angle lookup (`pocketAngle(position: number): number`), disc angular velocity constant (`DISC_OMEGA_RAD_PER_MS`), ball rim radius and disc surface radius constants. Pure data/math, no React, no DOM. |
| `roulette-ball-phases.ts` | Phase 1–4 trajectory engine. Pure function: given `(elapsedMs, totalDurationMs, startBallAngle, targetPocketAngle, discOmegaRadPerMs)` → `{ angle: number; radius: number; phase: 1\|2\|3\|4; settled: boolean }`. No React, no rAF, no DOM. Independently testable. |
| `roulette-renderer-types.ts` | TypeScript interfaces for the renderer's public contract: `RouletteRendererHandle { triggerSpin: (randomPosition: number) => Promise<void>; discRef: React.RefObject<HTMLElement>; ballCanvasRef: React.RefObject<HTMLCanvasElement> }`, `RouletteSpinPhase`, `RouletteBallState`. |
| `use-roulette-renderer.ts` | React hook: owns the rAF loop, reads disc current angle via `getComputedStyle` matrix decomposition on `discRef`, paints ball onto `ballCanvasRef`, returns `RouletteRendererHandle`. Resolves the `triggerSpin` Promise when phase 4 settle completes. Handles unmount cleanup and re-trigger guard. |
| `index.ts` | Public exports: `useRouletteRenderer`, renderer types. |

**UI layer additions (owned by `ui/`, not `renderer/`):**
- A new `<RouletteWheel>` component (or section inside `roulette-game.tsx`) must be created to render the actual visual disc with CSS idle rotation. This is a prerequisite for the renderer because `discRef` must point to a real CSS-animated DOM element. **This UI component is NOT within the renderer module scope but must be noted as a prerequisite implementation task.**

**Files to modify (integration):**

| File | Change |
|---|---|
| `src/games/roulette/model/use-roulette-game-controller.ts` | Call `useRouletteRenderer()` inside the hook; receive `triggerSpin` + refs; in `handleBet`, `await triggerSpin(result.randomPosition)` before calling `handleResult(result)`; pass `triggerSpin` to `useRouletteAutoBet` |
| `src/games/roulette/model/use-roulette-auto-bet.ts` | Accept `triggerSpin: (position: number) => Promise<void>` in options; inside the `placeBet` closure, after `await placeBet(...)`, call `await triggerSpin(result.randomPosition)`, then `onResult(result)`, then return the runner-shaped result |
| `src/games/roulette/ui/roulette-game.tsx` | Attach `discRef` and `ballCanvasRef` (returned from controller) to the new `<RouletteWheel>` disc element and ball canvas |

---

### Context-only files

Not to be edited during renderer implementation:

- `src/features/auto-bet/model/useAutoBetRunner.ts` — generic contract must remain unchanged (see Integration section)
- `src/games/roulette/ui/roulette-result.tsx` — receives `lastResult` unchanged; the static overlay correctly appears after `handleResult` is called, which now happens post-animation
- `src/games/roulette/ui/roulette-history.tsx` — same: feeds from `addToHistory` inside `handleResult`; sequencing is preserved automatically
- `src/app/api/games/roulette/bet/route.ts` — BFF route unchanged; backend response is authoritative
- `src/games/roulette/config/roulette-defaults.ts` — pocket order constant goes into `renderer/roulette-wheel-geometry.ts`, not here; `getRouletteColor` stays in config as-is

---

### The synchronization problem in detail

**Problem:** At the moment the backend response arrives, the disc has been CSS-animating continuously. Its current rotation angle is unknown to JavaScript unless explicitly read. The target pocket `randomPosition` tells the renderer WHERE to land but not WHEN — the renderer must solve for a trajectory that arrives at the pocket's physical position at the end of phase 4.

**Two approaches for reading the disc's live angle:**

**Option A — `getComputedStyle` + matrix decomposition (RECOMMENDED)**
```
const el = discRef.current;
const matrix = new DOMMatrix(getComputedStyle(el).transform);
const angleRad = Math.atan2(matrix.m12, matrix.m11);   // [-π, π]
```
- Reads the actual CSS animation state at the exact instant `triggerSpin` is called.
- No drift: the CSS animation is the ground truth; the read always reflects what the browser rendered.
- Works even after tab backgrounding/throttling because it reads the current frame's real angle, not an accumulated estimate.
- Requires `discRef` to point to the disc DOM element; the element must have `transform` applied by CSS (not `rotate` shorthand alone, since `DOMMatrix` handles both).
- Risk: returns `none` before the first animation frame; must default to `0` in that case.
- Risk: SSR — `getComputedStyle` and `DOMMatrix` are browser-only; `use-roulette-renderer.ts` is client-only (`"use client"` propagated from `roulette-game.tsx`), so this is safe.

**Option B — Shared JS angle accumulator**
- A `useRef` tracking `startTime`; disc angle = `(performance.now() - startTime) * DISC_OMEGA_RAD_PER_MS`.
- CSS animation is decorative; the JS ref is the read path.
- Risk: the JS clock and CSS animation clock can diverge when the tab is backgrounded (CSS animations may pause or throttle while `performance.now()` keeps advancing; or vice-versa). The result is the ball landing on the WRONG pocket after a tab switch mid-idle.
- Risk: must keep `DISC_OMEGA_RAD_PER_MS` constant perfectly in sync with the CSS `animation-duration`.

**Verdict: Option A.** Direct matrix read is accurate, drift-free, and does not require synchronizing two separate timing sources.

---

### Trajectory model (phases 1–4)

All phases are CCW. At any `t` (ms elapsed from spin trigger), the ball's position is `{ angle, radius }` in polar coordinates centred on the wheel.

**Constants (in `roulette-wheel-geometry.ts`):**
- `R_RIM` — ball rim radius (large; decorative track)
- `R_DISC_SURFACE` — disc surface radius (slightly smaller; pocket region)
- `DISC_OMEGA` — disc angular velocity (rad/ms, CCW negative by convention)
- `SETTLE_DWELL_MS` — how long the ball sits in the pocket before the animation resolves (~800 ms)

**Phase breakdown (in `roulette-ball-phases.ts`):**

| Phase | Duration share | Radius | Angle behavior |
|---|---|---|---|
| 1 — Acceleration | ~20% of total | `R_RIM` (fixed) | Ball accelerates CCW from start angle; angular speed ramps up via easing |
| 2 — Descent | ~15% of total | Lerp `R_RIM → R_DISC_SURFACE` | Ball continues CCW at peak speed while descending onto disc |
| 3 — Bounce | ~10% of total | Lerp `R_DISC_SURFACE → R_RIM` | Ball bounces back out to rim, continues CCW |
| 4 — Deceleration + drop | ~55% of total | Lerp `R_RIM → R_DISC_SURFACE` (final) | Ball decelerates to match disc speed, drops into target pocket angle |

**Landing angle calculation:**
At trigger time `t=0`:
- `discAngle0` = read from CSS matrix (Option A)
- `pocketIndex` = European wheel pocket array index of `randomPosition`
- `pocketOffsetOnDisc` = `(pocketIndex / 37) * 2π` (fixed offset on disc face)
- At time `t`, pocket physical angle = `discAngle0 + pocketOffsetOnDisc + DISC_OMEGA * t`

The trajectory engine's job: choose `totalDurationMs` (within a tunable 4–8 s range) and initial ball angular speed such that the ball's phase-4 final angle equals the pocket's physical angle at `t = totalDurationMs`. This is a solve: iterate or pre-compute.

Simpler approach (recommended for first implementation): fix `totalDurationMs`; compute the required starting ball angle `startBallAngle` = pocket physical angle at `t=0` minus the accumulated ball angular displacement over phases 1–4 at peak speed (closed-form since speed profile is a known easing function). Add a whole-number multiple of `2π` for visual plausibility (typically 5–8 full revolutions in phases 1–3).

---

### Integration points

**Manual bet path (`use-roulette-game-controller.ts:handleBet`):**

Current:
```typescript
const result = await betMutation.mutateAsync({ params: ... });
handleResult(result);
```

After:
```typescript
const result = await betMutation.mutateAsync({ params: ... });
await triggerSpin(result.randomPosition);   // ← renderer wait
handleResult(result);                       // history + lastResult + overlay
```

**Auto-bet path (`use-roulette-auto-bet.ts:placeBet` closure):**

Current:
```typescript
const result = await placeBet({ params: ... });
// onResult called via onRoundComplete after this function returns
return { ...result, didWin };
```

After:
```typescript
const result = await placeBet({ params: ... });
await triggerSpin(result.randomPosition);   // ← renderer wait
onResult(result);                           // called here explicitly, before runner's onRoundComplete
return { ...result, didWin };
```

Note: `onResult` is currently called via `autoRunner`'s `onRoundComplete` callback. When the animation await is added to the `placeBet` closure, `onResult` must be called explicitly inside the closure (before returning) so that history is recorded at the right moment — not via `onRoundComplete` (which fires after `placeBet` returns, which is still fine, but would duplicate the call). **Open question:** decide whether to keep calling `onResult` via both `onRoundComplete` AND the closure, or move it exclusively into the closure. Recommend: move it exclusively into the closure and remove the `onRoundComplete` → `onResult` wiring, since the closure is now the correct sequencing point. Flag for implementation decision.

**Generic `useAutoBetRunner` contract: UNCHANGED.** The runner sees a `placeBet` Promise that resolves later (after animation). Its `waitBetweenRounds` delay still applies AFTER `placeBet` resolves. This means the inter-round delay (`ROULETTE_AUTO_BET_DELAY_MS = 800 ms`) now stacks on top of animation duration (~5–8 s). Consider reducing this to `0` or a short buffer (`200 ms`) once animation is implemented, since the animation itself provides the visual separation between rounds.

**Renderer handle flow:**
`useRouletteRenderer()` → called inside `useRouletteGameController` → returns `{ triggerSpin, discRef, ballCanvasRef }` → `triggerSpin` passed to `useRouletteAutoBet` options → `discRef` and `ballCanvasRef` returned from controller → `RouletteGame` attaches them to the new `<RouletteWheel>` disc element and ball `<canvas>`.

---

### Risks

| Risk | Severity | Detail |
|---|---|---|
| **No spinning wheel visual exists** | **BLOCKING prerequisite** | `roulette-table.tsx` is a flat betting board; `roulette-game.tsx` has no disc/crown/rim element. A `<RouletteWheel>` UI component must be built (with disc CSS idle rotation) before `discRef` has a real target. Renderer implementation without this is inert. |
| **Wrong European pocket order** | HIGH | The 37-number sequence on a European wheel is NOT 0–36 sequential. Encoding it incorrectly makes the ball land on the wrong pocket every round. Source to verify against: standard European roulette pocket sequence (e.g., 0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26). Must be verified against the actual Figma wheel asset pocket order before implementation. |
| **CSS `transform` not available before first paint** | MEDIUM | `getComputedStyle(disc).transform` returns `"none"` before the animation starts (first frame) or if the disc has no `transform`. The renderer must guard: if transform is `"none"`, default `discAngle0 = 0` and proceed; the visual error is sub-pixel at the start of a session. |
| **Tab backgrounding mid-idle** | MEDIUM | Browsers throttle CSS animations and rAF in backgrounded tabs. If a bet result arrives while the tab is backgrounded, `getComputedStyle` may return a stale angle and the rAF loop will not fire at full speed. Mitigation: on `visibilitychange` returning to visible, re-read disc angle from CSS matrix and snap ball if animation has drifted past phase 4. |
| **Re-trigger while spin in progress** | MEDIUM | In auto-bet mode, if two rounds fire in rapid succession (e.g., a previous spin is still in phase 3 when a new spin is triggered), the second `triggerSpin` call must either wait or cancel the first. Recommended: `triggerSpin` rejects any call made while a spin is active (auto-bet await prevents this in practice, but defend it explicitly). |
| **`onResult` call-site duplication** | LOW-MEDIUM | See Integration section: `onResult` is currently called via `onRoundComplete`. After adding animation await to the `placeBet` closure, it should be called once in the closure. The `onRoundComplete` wiring must be removed or the call will fire twice (double history entry). |
| **CSS animation direction vs angle sign** | LOW | CCW disc rotation maps to decreasing angle in standard trigonometry. The CSS `animation-direction: reverse` or a negative `animation` duration are common techniques. The matrix decomposition sign must match the actual CSS rotation direction. Must verify the CSS animation direction of the disc at implementation time. |
| **`DISC_OMEGA` CSS sync** | LOW | `roulette-wheel-geometry.ts` must hard-code `DISC_OMEGA_RAD_PER_MS` matching the disc CSS `animation-duration`. If the CSS duration is changed later, the constant must be updated. Risk: silent mismatch (ball lands slightly off pocket). Consider reading the CSS animation duration from the element at trigger time to derive `omega` dynamically. |

---

### Missing information

1. **Figma wheel asset pocket layout**: the exact SVG/image structure of the spinning disc (which CSS class the disc element will have, what its `animation-duration` and `animation-direction` are) is not yet knowable — the `<RouletteWheel>` UI component doesn't exist. This must be resolved when the UI layer is designed.
2. **European pocket order vs. Figma wheel**: confirm that the physical pocket order on the Figma roulette wheel matches the standard European sequence listed in Risks above. If the Figma asset uses a different ordering, `roulette-wheel-geometry.ts` must use that order.
3. **Animation duration UX target**: total spin duration (4–8 s range) has not been finalized. This should be decided before implementation to bake it into `roulette-ball-phases.ts` constants.
4. **Ball visual asset**: the ball itself (small white circle, or a sprite from `src/shared/assets/`) has not been specified. The renderer will need to know whether to draw it on a `<canvas>` or position an absolutely-placed `<div>` in polar coords.

---

### Docs impact

`src/games/**` is a blocking mapped area (ownership-to-docs mapping). The `renderer/` folder is the first renderer module in Roulette — this is a new architectural pattern for the Roulette game. `docs/architecture/foundation-decisions.md` must be updated when implementation lands to record the `src/games/roulette/renderer/` ownership alongside existing Roulette ownership documentation (currently documented as having no renderer).

A source-backed docs-not-needed rationale is acceptable for this audit document itself (audit only, no editable scope changed). Implementation will require a `foundation-decisions.md` update.

---

### API boundary impact

None. The renderer receives `randomPosition: number` from the already-resolved `RouletteBetResult` passed by the controller. The renderer never calls any API, BFF route, or mutation. All existing BFF boundary rules are preserved.

---

### UI QA impact

High. The animation involves:
- Ball phases 1–4 visible landing on the correct pocket (primary verification)
- Correct disc idle rotation CCW before any bet
- Ball hidden in idle state
- History + win overlay appearing only after phase 4 settles
- Auto-bet mode: second round not starting while first round's animation is active
- Tab-switch / re-focus: animation continues or gracefully snaps to settled state

Manual UI QA is required. Automated tests cannot verify visual animation correctness.

---

### Validation plan

1. `pnpm validate` after each of the two implementation passes.
2. Manual visual check of all four ball phases in the browser.
3. Manual check: bet result `randomPosition` matches the pocket the ball lands in after phase 4.
4. Manual check: auto-bet second round does not start while animation is active.
5. Manual check: history badge and win overlay appear after animation completes, not before.
6. Manual check: tab switch mid-spin, then return — ball behaves gracefully.

---

### Stop conditions

None blocking this audit. All source files are present and readable. The core risk (no wheel visual) is a known implementation prerequisite, not an audit blocker.

The audit proceeds but implementation **must not begin** until a `<RouletteWheel>` UI component (disc + CSS idle rotation) exists and the Figma pocket order is confirmed — those are the two hard preconditions for the renderer to function.

---

### Recommendation: implementation pass split

**Pass A — Trajectory engine + geometry (no UI, no DOM)**
Files: `roulette-wheel-geometry.ts`, `roulette-ball-phases.ts`, `roulette-renderer-types.ts`, `index.ts`.
No integration yet. Pure logic, independently verifiable by logging trajectory output to the console.
Prerequisite: Figma pocket order confirmed.

**Pass B — Hook + integration (requires wheel UI to exist)**
Files: `use-roulette-renderer.ts` (full rAF loop, disc angle read, ball paint).
Integration: `use-roulette-game-controller.ts`, `use-roulette-auto-bet.ts`, `roulette-game.tsx`.
Prerequisite: `<RouletteWheel>` component with CSS-animated disc is present and `discRef` has a real target.

**Splitting is strongly recommended.** Pass A is risk-free and can be done without the wheel UI. Pass B is high-risk (rAF, DOM reads, CSS timing) and should be its own scope with dedicated UI QA evidence.

---

## Pass A Implementation — COMPLETE

**Date:** 2026-06-18
**Branch:** `feat/roulette-game` (PR-mode; base: `develop`)

### Files created

| File | Status |
|---|---|
| `src/games/roulette/renderer/roulette-wheel-geometry.ts` | Created |
| `src/games/roulette/renderer/roulette-ball-phases.ts` | Created |
| `src/games/roulette/renderer/index.ts` | Created |

`roulette-renderer-types.ts` deferred to Pass B: it requires `React.RefObject` (DOM types), violating the no-React/no-DOM boundary for Pass A.

### Direction flag (explicit)

Post-bet spin (all 4 phases) → **CCW** (`DISC_OMEGA_RAD_PER_MS` is negative).
Idle ball orbit in `roulette-wheel-ball.tsx` → **CW** (already shipped, separate system).

### Key constant derived from source

`DISC_OMEGA_RAD_PER_MS = -(2π) / 24_000` — read directly from `roulette-wheel.tsx`
animation string `roulette-disc-ccw 24s linear infinite`. Sync comment added.

### Validation

`pnpm validate` — **passed** (0 errors, 0 new warnings).
`pnpm check:docs` — **passed** (active task artifact rationale found for `src/games/**`).

### Non-goals respected

- No React, no DOM, no rAF, no UI integration.
- No modification of existing files.
- `roulette-renderer-types.ts` and `use-roulette-renderer.ts` remain Pass B scope.

### Pass B prerequisites (unchanged from audit)

1. `<RouletteWheel>` disc CSS animation confirmed present ✓ (040f6cc — already shipped).
2. Figma pocket order vs. physical disc asset — still unconfirmed; must verify before Pass B UI QA.
3. Ball visual: raster asset `roullete-ball.webp` exists in `shared/assets/`.
4. Pass B needs a new task artifact.
