# Audit: Roulette Ball Spin — PixiJS Rendering Strategy for Pass B

**Date:** 2026-06-18
**Branch:** feat/roulette-game
**Skill:** audit (read-only — no implementation)
**Scope:** How PixiJS should be used for the ball's post-bet spin animation in Pass B.
**Predecessor:** roulette-spin-animation-audit.md (Pass A complete; geometry/phases pure-math files shipped).

---

## Audit

### 1. Exact Pixi setup in the repo

**Package:** `pixi.js: ^8.19.0` (major version 8) in `package.json` `dependencies`.
**No `@pixi/react`** — the project uses raw `pixi.js` only. No React wrapper library is installed.

**v8 API implications (material for Pass B):**

| v7 (old) | v8 (current) |
|---|---|
| `new PIXI.Application({ view: canvas })` — synchronous | `new Application(); await app.init({ ... })` — **async** |
| `app.ticker.add(cb)` common pattern | Ticker still present but Plinko uses raw `rAF` instead |
| Static imports common | Dynamic `await import("pixi.js")` used in Plinko to defer load |

---

### 2. Established Pixi mounting pattern (Plinko reference)

Two files define the pattern:

**`src/games/plinko/renderer/pixi-plinko-renderer.ts`** — the renderer factory:
- `export async function createPixiPlinkoRenderer({ container, ...opts }): Promise<PlinkoRenderer>`
- Imports Pixi via **dynamic import** inside the async factory: `const { Application, ... } = await import("pixi.js")`.
- Calls `await app.init({ antialias: true, autoDensity: true, backgroundAlpha: 0, resizeTo: container })`.
- Injects canvas into the container div: `container.appendChild(app.canvas)`.
- Sets `app.canvas.style`: `position: absolute; inset: 0; width: 100%; height: 100%`.
- Animation loop: **raw `requestAnimationFrame`** on `container.ownerDocument.defaultView` — NOT `app.ticker`.
- Returns `{ destroy, resize, setOptions, visualizeRound }` — an opaque renderer handle.
- `destroyed` guard prevents double-init on React StrictMode double-effect.

**`src/games/plinko/ui/plinko-pixi-stage.tsx`** — the React lifecycle wrapper:
- `"use client"` component.
- Holds `containerRef<HTMLDivElement>` — the mount target.
- One `useEffect` calls `createPixiPlinkoRenderer({ container })` async, stores result in `rendererRef`, calls `renderer.setOptions()` and `renderer.resize()`.
- Cleanup: `renderer.destroy()`, `rendererRef.current = null`.
- Separate `ResizeObserver` effect calls `renderer.resize()` on container size changes.
- Renders: `<div className="relative min-h-80 overflow-hidden" ref={containerRef} />`.
- **No imperative ref is exposed upward** — communication is props-in / callback-out.

**Verdict: Pass B must follow this exact pattern.** No `@pixi/react`, no custom hooks, no `app.ticker`, dynamic import inside the factory, `ResizeObserver`-driven resize.

---

### 3. Pixi canvas scope

**Recommended: canvas = the same bounding box as `<RouletteWheel>`'s inner `relative aspect-square` div.**

Rationale:
- The ball's polar position `(angleRad, radius)` from `computeBallState` must be converted to Cartesian pixel coords. This conversion requires knowing the wheel's center in pixels and the rim's pixel radius.
- If the canvas is the same div as the wheel container, the coordinate origin is `(canvas.width/2, canvas.height/2)` — no offset math.
- If the canvas were smaller (ball-only), the origin would need a DOM-layout read to align with the wheel center — more fragile.
- Plinko's canvas spans its entire panel; roulette's canvas spanning the wheel bounding box is strictly smaller and equally safe.

**Canvas is NOT a new HTML element added by Pass B separately.** It is appended into a container div by the Pixi factory — the same pattern as Plinko. The `<RoulettePixiBallStage>` React component provides the container div.

---

### 4. Reading the disc's live angle — unchanged by Pixi decision

`getComputedStyle(discEl).transform` + `DOMMatrix` decomposition is **fully independent** of the ball's rendering technology. The disc is a DOM element with a CSS animation; Pixi only renders the ball on top.

**CSS keyframe verification:** `@keyframes roulette-disc-ccw { to { transform: rotate(-360deg); } }` — this animates the `transform` CSS property directly (not the standalone `rotate` shorthand property). `getComputedStyle(el).transform` will return a matrix string that `DOMMatrix` can parse.

**z-index and layering concerns for Pass B:**

The wheel's `relative aspect-square` div stacks layers via DOM order (no explicit `z-index`):
```
Layer 1 (bottom): outer-bg Image (fill)
Layer 2: ball-track Image (centered, 96.8% width)
Layer 3: disc div + Image (91.7% width, rotates CCW)  ← discRef targets this div
Layer 4: crown div + Image (27.6% width, rotates CW)
Layer 5: orbit wrapper div (absolute inset-0, rotates CW for idle orbit)
          └─ RouletteWheelBall (top: 5.5%, centered)  ← hidden during spin
Layer 6 (top): Pixi canvas (absolute inset-0) ← appended last by factory
```

The Pixi canvas (`position: absolute; inset: 0`) will be appended after the orbit wrapper in the DOM, so it naturally stacks on top — **no explicit `z-index` needed** as long as the canvas is appended to the correct container div.

**Idle-ball suppression during spin:** The CSS orbit wrapper (Layer 5) must be hidden during the post-bet spin so the Pixi ball is the only visible ball. This is a Pass B UI responsibility: a `spinning` boolean prop or CSS class toggles `visibility: hidden` on the orbit wrapper during spin. The Pixi canvas ball is only drawn when a spin is active (renderer draws nothing otherwise, canvas stays transparent).

**Coordinate origin alignment:** With the Pixi canvas being `inset-0` inside the wheel's `aspect-square` div, the Pixi coordinate origin (0, 0) is the top-left corner of the wheel. Wheel center in Pixi coords = `(app.renderer.width / 2, app.renderer.height / 2)`.

**Rim radius in pixels:** Derived at runtime from `app.renderer.width`. The idle orbit ball sits at `top: 5.5%` of the container height — at 360px container: `rim_px = containerHeight * (0.5 - 0.055) = containerHeight * 0.445`. This yields `rim_px ≈ 160px` at 360px, consistent with the comment in `roulette-wheel-ball.tsx`.

```typescript
// Pass B formula (inside renderer factory, called after app.init):
const rimPx = app.renderer.height * 0.445;
const discSurfacePx = rimPx * R_DISC_SURFACE; // R_DISC_SURFACE = 0.6
```

The `0.445` factor is derived from the idle ball CSS position and must be verified visually in Pass B QA. If the Figma disc pocket region is at a different radius, `R_DISC_SURFACE` (currently `0.6`) may need tuning.

---

### 5. computeBallState output is rendering-technology-agnostic

`computeBallState` returns `{ angleRad, radius, phase, settled }` — pure numbers and an enum. Converting to Pixi Sprite/Graphics position:

```typescript
const { angleRad, radius } = computeBallState(elapsed, total, startAngle, targetAngle, omega);
const pixelRadius = radius * rimPx; // rimPx derived above
const cx = app.renderer.width / 2;
const cy = app.renderer.height / 2;
sprite.x = cx + Math.cos(angleRad) * pixelRadius;
sprite.y = cy + Math.sin(angleRad) * pixelRadius;
```

**No rework of Pass A files is needed.** The conversion from polar to Cartesian is two lines of arithmetic added in the Pass B renderer factory. `angleRad` convention: 0 = right (3 o'clock), π/2 = down (6 o'clock), -π/2 = up (12 o'clock, where the idle ball starts). Pass B must verify the angle zero-reference matches the wheel's visual 12-o'clock position and adjust the initial `startBallAngleRad` accordingly (likely `startBallAngleRad = -Math.PI / 2` for 12-o'clock).

---

### 6. Ball asset in Pixi

**Existing asset:** `src/shared/assets/games/roulette/images/roullete-ball.webp` (20×20 px, VP8X with alpha). Currently used in `RouletteWheelBall` via `next/image` for the idle orbit.

**Recommendation: draw the spin ball as Pixi `Graphics` — no Sprite, no asset loading.**

Plinko draws its ball entirely in Pixi Graphics (circle + fill + stroke + highlight circle). The same approach covers the roulette spin ball:

```
ball.clear()
  .circle(x, y, radius)             // body
  .fill({ color: 0xf8fafc })
  .stroke({ color: 0xffffff, alpha: 0.6, width: 1.5 })
  .circle(x - r*0.25, y - r*0.3, r*0.28)  // specular highlight
  .fill({ color: 0xffffff, alpha: 0.72 })
```

A soft drop shadow can be achieved by drawing a slightly larger, darker, offset circle behind the ball with low alpha.

**No new assets needed** for the spin ball if the Graphics approach is used. The "realistic bounce/shadow/highlight" requirement can be met entirely with Pixi Graphics primitives.

**Risk (open):** If design requires a higher-fidelity raster ball (e.g., a pre-rendered sphere texture), `roullete-ball.webp` is too small (20×20) at its current resolution to look sharp at 24–30px rendered size with HiDPI. A larger ball sprite asset would be needed. Flag for design review before Pass B lands; the Graphics approach is the safe default.

---

### 7. Ticker vs rAF recommendation

**Use raw `requestAnimationFrame` — do NOT use `app.ticker`.**

Rationale:
- Plinko uses `view.requestAnimationFrame(tick)` exclusively; `app.ticker` is never called.
- The rAF loop is how elapsed time is tracked (`time - startTime`); this matches the `computeBallState(elapsedMs, ...)` signature directly.
- `app.ticker` adds a dependency on Pixi's ticker lifecycle (pausing when tab hidden, etc.) which introduces a different throttling model. rAF throttles naturally when the tab is hidden and wakes up when it returns.
- Using `container.ownerDocument.defaultView.requestAnimationFrame` (Plinko's pattern) is SSR-safe: `container` only exists in `useEffect` after mount.

**Impact on `triggerSpin` contract:** None. The external contract `triggerSpin(randomPosition): Promise<void>` is unchanged. Internally, the spin loop starts a rAF chain from the trigger call and resolves the Promise when `settled === true` (or when `destroyed`).

---

### Relevant files inspected

| File | Role |
|---|---|
| `package.json` | `pixi.js: ^8.19.0` confirmed; no `@pixi/react` |
| `src/games/plinko/renderer/pixi-plinko-renderer.ts` | Established factory pattern: async, dynamic import, `app.init`, rAF loop, canvas injection |
| `src/games/plinko/ui/plinko-pixi-stage.tsx` | Established React wrapper: `useEffect` mount, `ResizeObserver`, props-in/callback-out |
| `src/games/plinko/renderer/plinko-renderer-types.ts` | Renderer contract shape reference |
| `src/games/plinko/ui/plinko-board-panel.tsx` | Integration: stage receives rounds as props, `onRoundSettled` callback to controller |
| `src/games/roulette/ui/roulette-wheel.tsx` | CSS animation durations; layer stacking; disc div is the `discRef` target |
| `src/games/roulette/ui/roulette-wheel-ball.tsx` | Idle ball: `top: 5.5%` → rim pixel radius derivation; must be hidden during spin |
| `src/games/roulette/ui/roulette-game.tsx` | Integration point for the stage component |
| `src/app/globals.css` | `roulette-disc-ccw` keyframe uses `transform: rotate(-360deg)` — DOMMatrix-compatible |
| `src/shared/assets/games/roulette/images/roullete-ball.webp` | Ball asset; 20×20px; Graphics approach makes it unnecessary for spin phase |
| `src/games/roulette/renderer/roulette-wheel-geometry.ts` | Pass A — R_RIM, R_DISC_SURFACE, DISC_OMEGA_RAD_PER_MS |
| `src/games/roulette/renderer/roulette-ball-phases.ts` | Pass A — computeBallState, SPIN_DURATION_MS |

---

### Ownership

`src/games/roulette/renderer/` — Roulette-local renderer. Follows the same ownership as `src/games/plinko/renderer/`.
`src/games/roulette/ui/` — React stage component and idle-ball suppression logic.

Neither layer may import from other game modules or call any API.

---

### Editable scope proposal for Pass B (revised)

**New files in `src/games/roulette/renderer/`:**

| File | Responsibility |
|---|---|
| `pixi-roulette-ball-renderer.ts` | Async factory: `createPixiRouletteBallRenderer({ container }): Promise<RouletteRendererHandle>`. Owns Pixi app init (dynamic import, `await app.init`), canvas injection, rAF loop driven by `computeBallState`, disc angle read via `getComputedStyle + DOMMatrix`, idle-ball suppression signal, `triggerSpin(randomPosition): Promise<void>`, `destroy()`, `resize()`. |
| `roulette-renderer-types.ts` | `RouletteRendererHandle { triggerSpin(randomPosition): Promise<void>; destroy(): void; resize(): void }` and `RouletteSpinPhase` (re-exported from roulette-ball-phases). No React refs in this file — those are internal to the factory. |

**Update existing `src/games/roulette/renderer/index.ts`** — add Pass B exports.

**New file in `src/games/roulette/ui/`:**

| File | Responsibility |
|---|---|
| `roulette-pixi-ball-stage.tsx` | `"use client"` React component. `containerRef<HTMLDivElement>`. Calls `createPixiRouletteBallRenderer` in `useEffect`. `ResizeObserver`. Receives `pendingSpin: number \| null` prop (the `randomPosition` to animate, `null` = idle). Fires `onSpinSettled()` callback when renderer resolves. Renders `<div className="pointer-events-none absolute inset-0" ref={containerRef} />` inside the wheel's `relative aspect-square` div. |

**Files to modify (integration):**

| File | Change |
|---|---|
| `src/games/roulette/ui/roulette-wheel.tsx` | Add `RoulettePixiBallStage` inside the `relative aspect-square` div (appended last — naturally highest DOM layer). Add `spinning` prop to conditionally hide the orbit wrapper. |
| `src/games/roulette/model/use-roulette-game-controller.ts` | Maintain `pendingSpin: number \| null` state; set on bet result, clear in `onSpinSettled`. Pass to `RouletteGame` → `RouletteWheel` → stage. `handleResult` called inside `onSpinSettled`. |
| `src/games/roulette/model/use-roulette-auto-bet.ts` | If controller's `pendingSpin` state triggers via prop, auto-bet sequencing (await pattern) becomes a state machine rather than a Promise chain. Flag as integration decision for Pass B. |

---

### Context-only files (not to be edited)

- `src/games/roulette/renderer/roulette-wheel-geometry.ts` — Pass A, unchanged
- `src/games/roulette/renderer/roulette-ball-phases.ts` — Pass A, unchanged
- `src/features/auto-bet/model/useAutoBetRunner.ts` — generic contract unchanged
- `src/games/plinko/renderer/pixi-plinko-renderer.ts` — reference only, not modified
- `src/games/roulette/ui/roulette-result.tsx` — receives `lastResult` after `onSpinSettled`
- `src/games/roulette/ui/roulette-history.tsx` — unchanged, fed by `handleResult`
- `src/app/api/games/roulette/bet/route.ts` — BFF unchanged

---

### Risks

| Risk | Severity | Detail |
|---|---|---|
| **Pixi v8 `app.init` is async** | MEDIUM | The `useEffect` must handle the async factory with a `cancelled` flag (Plinko already does this exactly — copy the guard). React StrictMode double-invokes effects; without the guard, two Pixi apps would be created. |
| **Idle ball suppression flicker** | MEDIUM | The CSS orbit wrapper must be hidden before the Pixi ball appears. If the Pixi canvas renders one frame late, both balls could be visible momentarily. Mitigation: hide orbit wrapper on `pendingSpin !== null`, show Pixi ball only after first rAF tick. |
| **Disc angle zero-reference** | MEDIUM | `angleRad = 0` in `computeBallState` corresponds to the 3-o'clock position in standard math. The idle ball starts at 12-o'clock (`top: 5.5%`). Pass B must set `startBallAngleRad = -Math.PI / 2` (or read the disc's actual angle at trigger time, which already handles this). This is a coordinate convention decision. |
| **Rim pixel radius drift on resize** | LOW | `rimPx = renderer.height * 0.445` is derived at trigger time. If the container resizes mid-spin, the ball's radius will drift. Mitigation: the `resize()` method should cancel any active spin (matching Plinko's `cancelAnimation` in `resize()`), or derive `rimPx` each rAF frame from `renderer.height`. |
| **Figma pocket order unconfirmed** | HIGH | Carried from original audit. EUROPEAN_POCKETS array must match the physical disc asset. Visual QA required in Pass B. |
| **`roullete-ball.webp` spelling** | LOW | The asset filename has a typo (`roullete` not `roulette`). Not a blocker — the file exists and imports correctly. Flag for eventual rename. |
| **`R_DISC_SURFACE = 0.6` is an estimate** | LOW | The 60% relative radius for the pocket region has not been verified against the actual disc asset geometry. Pass B QA should compare where the ball lands visually against the physical pocket positions on the disc image. |
| **Auto-bet sequencing with props-based approach** | MEDIUM | Original audit used `await triggerSpin()` in `handleBet`. Props-based approach uses a state machine (`pendingSpin` → `onSpinSettled`). The auto-bet runner's `await placeBet()` must still resolve only after the animation — the timing of setting `pendingSpin` to null must precede the runner seeing the round as complete. Design decision for Pass B. |

---

### Missing information

1. **Figma disc pocket order** — must verify EUROPEAN_POCKETS matches the physical disc WebP asset before Pass B QA.
2. **Design intention for ball fidelity** — Graphics approach or Sprite from WebP? The WebP exists but is 20×20px. If design wants a higher-fidelity sphere, a larger asset is needed (flag to designer).
3. **Rim radius constant sign-off** — `0.445 * container_height` is derived from the idle ball CSS. Confirm this visually in Pass B; if the pocket drop target should be at a different radius than the idle orbit, `R_DISC_SURFACE` may need adjustment.

---

### Docs impact

`src/games/**` → `docs/architecture/foundation-decisions.md` (blocking, rationale-allowed per ownership-to-docs).
Roulette renderer is the first PixiJS usage in the Roulette game module. `foundation-decisions.md` must be updated when Pass B lands to record:
- `src/games/roulette/renderer/` pattern (factory + stage component)
- PixiJS v8 as the ball animation renderer
- Disc angle read via `getComputedStyle + DOMMatrix`
Active task artifact rationale is sufficient for this audit document (read-only, no editable scope changed).

---

### API boundary impact

None. Renderer receives `randomPosition: number` from the controller after the backend response is already resolved. Renderer never calls any API.

---

### UI QA impact

High — same as original audit. Additional Pixi-specific checks:
- Ball phases 1–4 visible and smooth on the Pixi canvas (no CSS ball visible during spin)
- Pixi canvas transparent background (no white rectangle over wheel layers)
- Ball lands on the correct pocket (`EUROPEAN_POCKETS` array → visual position)
- Resize mid-idle: canvas resizes correctly, wheel layers and Pixi canvas stay aligned
- Tab switch mid-spin: rAF pauses, ball snaps to settled state on return

---

### Validation plan

1. `pnpm validate` after Pass B lands.
2. Manual visual: Pixi ball appears at spin start; CSS orbit ball is hidden.
3. Manual visual: ball phases 1–4 animate smoothly, ball lands in correct pocket.
4. Manual: auto-bet second round does not start until animation settles.
5. Manual: history + win overlay appear only after `onSpinSettled`.
6. Manual: resize wheel during idle — no canvas offset or misalignment.

---

### Stop conditions

None blocking this audit. All source files present and readable. Pixi v8 confirmed.

Pass B must not begin until: Figma pocket order confirmed (from original audit, still open).

---

### Summary: Pass B file list (supersedes original audit)

| File | Layer | New/Modify |
|---|---|---|
| `src/games/roulette/renderer/pixi-roulette-ball-renderer.ts` | renderer | New |
| `src/games/roulette/renderer/roulette-renderer-types.ts` | renderer | New |
| `src/games/roulette/renderer/index.ts` | renderer | Modify (add Pass B exports) |
| `src/games/roulette/ui/roulette-pixi-ball-stage.tsx` | ui | New |
| `src/games/roulette/ui/roulette-wheel.tsx` | ui | Modify (add stage, spinning prop) |
| `src/games/roulette/model/use-roulette-game-controller.ts` | model | Modify (pendingSpin state, onSpinSettled) |
| `src/games/roulette/model/use-roulette-auto-bet.ts` | model | Modify (sequencing adjustment) |

Pass A files (`roulette-wheel-geometry.ts`, `roulette-ball-phases.ts`) — **unchanged**.

---

## Pass B Implementation Evidence

**Completed:** 2026-06-18
**Branch:** feat/roulette-game (PR-mode, base: develop)

### Pre-step: Co-rotation math verification

`computeBallState` JSDoc (Pass A) specifies: _"targetPocketAngleRad must already include `discOmegaRadPerMs * totalDurationMs` so the pocket tracks disc rotation over the full spin."_ The function itself only uses `discOmegaRadPerMs` to suppress ESLint; it does not re-apply co-rotation internally.

In `pixi-roulette-ball-renderer.ts`, `visualizeSpin` builds `targetPocketAngleRad` as:

```typescript
const pocketOffset = pocketAngleRad(pocketIndexForNumber(result.randomPosition));
const targetPocketAngleRad =
  spin.discAngleRad             // disc angle at trigger time
  + pocketOffset                // static pocket offset in disc frame
  + DISC_OMEGA_RAD_PER_MS * SPIN_DURATION_MS  // co-rotation over spin duration
  - SPIN_EXTRA_REVOLUTIONS * 2 * Math.PI;     // 6 extra ball revolutions
```

Co-rotation is correctly baked into the target angle by the caller. Pass A files unchanged.

---

### Final prop/callback shape (spin state machine)

**`RouletteWheel` props (added):**
```typescript
interface RouletteWheelProps {
  pendingSpin: RouletteBetResult | null;   // non-null triggers animation
  onSpinSettled: (spin: RouletteRendererSpin, reason: RouletteRendererSettlementReason) => void;
}
```

**`RoulettePixiBallStage` props:**
```typescript
// discRef: ref to the CSS-animated disc div — read-only, passed from RouletteWheel
// pendingSpin: drives animation; betId used as idempotency key
// onSpinSettled: fired after settledFramePending clears + ball.clear()
```

**`RouletteRendererSpin`:**
```typescript
export interface RouletteRendererSpin {
  result: RouletteBetResult;
  discAngleRad: number;  // captured from getComputedStyle at trigger time
}
```

**Controller flow (manual bet):**
1. `handleBet` → `setPendingSpin(result)`
2. `RouletteWheel` receives `pendingSpin !== null` → orbit wrapper hidden, Pixi stage triggered
3. Pixi stage reads disc angle, calls `renderer.visualizeSpin({ result, discAngleRad })`
4. rAF loop runs 4-phase trajectory; `settledFramePending` extra frame shows ball at pocket
5. `renderer.visualizeSpin` → `onSpinSettled` → `handleSpinSettled(spin, reason)`
6. `handleSpinSettled` → `setPendingSpin(null)`, `handleResult(spin.result)`, `resolve?.()`

**Controller flow (auto-bet):**
- `requestSpin(result)`: returns `new Promise<void>` that stores `resolve` in `spinResolveRef`, calls `setPendingSpin(result)`
- Auto-bet `placeBet` closure: `await onSpinRequired(result)` — blocks runner's loop
- `handleSpinSettled` calls `spinResolveRef.current?.()` — unblocks runner
- Next round starts only after animation settles

---

### useAutoBetRunner generic contract — unchanged

`useAutoBetRunner` contract is **unchanged**. No modifications to `src/features/auto-bet/`. The sequencing is achieved entirely by making the roulette-local `placeBet` closure longer: it `await`s `onSpinRequired(result)` after the BFF call before returning. The runner sees a slow `placeBet` — it does not know or care about the animation.

`onRoundComplete` was removed from the runner call (it previously called `onResult`, which would have double-fired `handleResult`). `handleResult` is now called exclusively from `handleSpinSettled`.

---

### Files changed (Pass B)

| File | Change |
|---|---|
| `src/games/roulette/renderer/roulette-renderer-types.ts` | New — `RouletteRendererSpin`, `RouletteRendererSettlementReason`, `RouletteRendererOptions`, `RouletteRenderer` |
| `src/games/roulette/renderer/pixi-roulette-ball-renderer.ts` | New — async factory, rAF loop, 4-phase `computeBallState`, `drawBall` (Graphics), `visualizeSpin`, `cancelActiveSpin`, `settledFramePending` pattern |
| `src/games/roulette/ui/roulette-pixi-ball-stage.tsx` | New — `"use client"` stage, `useEffect` mount, `ResizeObserver`, `betId` idempotency guard, disc angle read |
| `src/games/roulette/renderer/index.ts` | Modified — added Pass B exports |
| `src/games/roulette/ui/roulette-wheel.tsx` | Modified — `discRef`, `spinning`, orbit wrapper `visibility`, `RoulettePixiBallStage` |
| `src/games/roulette/ui/roulette-wheel-ball.tsx` | Modified — comment only (updated to reflect actual Pixi approach) |
| `src/games/roulette/model/use-roulette-game-controller.ts` | Modified — `pendingSpin`, `spinResolveRef`, `handleSpinSettled`, `requestSpin`, `betDisabled` guard |
| `src/games/roulette/model/use-roulette-auto-bet.ts` | Modified — `onResult` → `onSpinRequired: (result) => Promise<void>`, `await onSpinRequired(result)` in closure |
| `src/games/roulette/ui/roulette-game.tsx` | Modified — `handleSpinSettled`, `pendingSpin` wired to `RouletteWheel` |

Pass A files unchanged: `roulette-wheel-geometry.ts`, `roulette-ball-phases.ts`.
Context-only files unchanged: `useAutoBetRunner.ts`, `pixi-plinko-renderer.ts`, all roulette API/result/history files.

---

### Validation evidence

```
pnpm validate  →  PASSED (2026-06-18)
  git diff --check  ✓
  pnpm lint         ✓  0 errors, 0 new warnings (1 pre-existing warning in main-nav.tsx, unrelated)
  pnpm build        ✓  TypeScript clean, all 24 routes generated
  pnpm check:docs   ✓  Active task artifact rationale accepted for all src/games/roulette/** changes
```

---

### QA Bug Fixes (post-Pass-B manual QA)

**Problem 1 — Wrong ball start position (jump/teleport)**

Root cause: `startBallAngleRad = -Math.PI / 2` was hardcoded in `pixi-roulette-ball-renderer.ts`. The idle ball sits at 12 o'clock in the orbit container's local frame, but the orbit wrapper has been spinning CW at 60 s/rev continuously since mount. At trigger time the ball's actual screen angle is `-π/2 + orbitAngleRad`. The hardcoded value conflated the audit's note about the disc's angle zero-reference with the ball's live position — those are independent.

Fix:
- Added `orbitRef: React.RefObject<HTMLDivElement | null>` to `RoulettePixiBallStage` props.
- `RouletteWheel` creates `orbitRef` and attaches it to the orbit wrapper div.
- Stage's trigger effect reads the orbit's live CSS transform (same `getComputedStyle + DOMMatrix` pattern as the disc read): `startBallAngleRad = -π/2 + Math.atan2(m12, m11)`.
- Added `startBallAngleRad: number` to `RouletteRendererSpin` interface.
- Renderer uses `spin.startBallAngleRad` instead of the hardcoded value.

**Problem 2 — Ball lands on wrong pocket (independent of Problem 1)**

Root cause: The `targetPocketAngleRad` formula was missing the initial angle of pocket 0 in the disc image. The disc image has pocket 0 (green) at 12 o'clock (-π/2 in screen trig). The formula treated the disc's CSS rotate(0) reference as "pocket 0 at 3 o'clock (angle 0)". Every landing was off by π/2 clockwise (≈ 9 pockets). Problem 1 (start angle) does not affect landing position — `computeBallState` always settles at `targetPocketAngleRad` regardless of `startBallAngleRad`.

Fix:
- Added `POCKET_ZERO_INITIAL_ANGLE_RAD = -Math.PI / 2` to `roulette-wheel-geometry.ts` with a SYNC REQUIRED note.
- Prepended to target calc: `POCKET_ZERO_INITIAL_ANGLE_RAD + discAngleRad + pocketOffset + …`

**Problem 3 — No visible bounce**

Root cause: `radiusAtS` in `roulette-ball-phases.ts` used simple linear lerps for all phases after phase 1, giving a smooth glide with no bouncing behavior.

Fix: Replaced with damped oscillation — `R_DISC_SURFACE + (R_RIM - R_DISC_SURFACE) * max(0, exp(-2.5t) * cos²(3πt))` over t ∈ [0,1] for s > P1_END. Peak heights: 1.0 → 0.43 → 0.19 → ~0.08 (3 visible bounces). The `lerp` helper was no longer used and removed.

**Problem 4 — Speed too fast**

Root cause: `SPIN_EXTRA_REVOLUTIONS = 6`.

Fix: Reduced to `3`. Same 4000 ms, roughly half the angular distance → perceived speed halved.

**Validation (post-fix):**
```
pnpm validate  →  PASSED
  pnpm lint   ✓  0 errors, 0 new warnings
  pnpm build  ✓  TypeScript clean, 24 routes
  check:docs  ✓
```

**Files changed (QA fixes):**
- `roulette-wheel-geometry.ts` — added `POCKET_ZERO_INITIAL_ANGLE_RAD`
- `roulette-ball-phases.ts` — replaced `radiusAtS` with damped bounce; removed unused `lerp`
- `roulette-renderer-types.ts` — added `startBallAngleRad` to `RouletteRendererSpin`
- `pixi-roulette-ball-renderer.ts` — `SPIN_EXTRA_REVOLUTIONS` 6→3; added `POCKET_ZERO_INITIAL_ANGLE_RAD` to target; use `spin.startBallAngleRad`
- `roulette-wheel.tsx` — added `orbitRef`, attached to orbit div, passed to stage
- `roulette-pixi-ball-stage.tsx` — added `orbitRef` prop; reads orbit transform; computes and passes `startBallAngleRad`

---

### Trajectory + Size Rework (post-QA pass 2)

**Fix: Pixi ball size — matches idle CSS ball**

Root cause: `r = rim * 0.075` was a proportional fraction of the rim, giving ≈ 24px diameter vs. the idle ball's 12px CSS diameter (2× too large).

Fix: `r = 6 * app.renderer.resolution` — 6 CSS px radius (12px diameter), converted to physical pixels via Pixi's DPR resolution. Stays constant across wheel resizes (matches the fixed-pixel idle ball behavior).
SYNC note added: if `roulette-wheel-ball.tsx` `width`/`height` props change, update the `6` constant.

**Fix: 4-stage trajectory rework**

Previous model issues: quadratic ease-in in stage 1 created a "funnel" acceleration; phases 2-3 were a single damped oscillation covering too much of the spin; no distinct rim lap.

New model in `roulette-ball-phases.ts`:

| Stage | Time fraction | Duration | Angular weight | Radius behavior |
|---|---|---|---|---|
| 1 (rim lap) | 0.00–0.25 | 1000 ms | W1 = 0.33 | R_RIM constant |
| 2 (bounce) | 0.25–0.65 | 1600 ms | W2 = 0.40 | Damped oscillation: exp(−2.5t)·cos²(3πt) |
| 3 (rebound) | 0.65–0.75 | 400 ms | W3 = 0.09 | Sine bump: REBOUND_FRACTION=0.3 × gap |
| 4 (settle) | 0.75–1.00 | 1000 ms | W4 = 0.18 | R_DISC_SURFACE constant; angular cubic ease-out |

Angular profile: stages 1–3 are **linear** (near-constant speed — no funnel). All deceleration is in stage 4 (cubic ease-out). Stage 1 covers ≈ 1 revolution with SPIN_EXTRA_REVOLUTIONS=3 (W1 ≈ 1/N coupling documented in SYNC note).

Bounce curve (stage 2): three disc-surface landings at t≈1/6, 1/2, 5/6; peak bounce heights ≈ 100% → 43% → 19% of rim-to-disc gap. Stage 3 rebound: smooth sine bump to 30% of gap height. Stage 4: ball rests at R_DISC_SURFACE, only angular velocity changes (cubic ease-out → settles smoothly into pocket).

Validation: `pnpm validate` → PASSED (0 errors, 0 new warnings).

Files changed: `roulette-ball-phases.ts` (full rewrite), `pixi-roulette-ball-renderer.ts` (drawBall radius only).

---

### Trajectory Refinements (post-QA pass 3)

Four user-specified refinements addressing total angular distance, bounce speed, rebound direction bug, and inter-stage smoothness.

**Fix 1 — Total angular distance reduced to ≤ 1–1.5 revolutions**

Root cause: `SPIN_EXTRA_REVOLUTIONS = 3` gave ≈ 3–4 total revolutions (the extra 3 laps plus pocket offset variance of 0–1 revolution).

Fix: `SPIN_EXTRA_REVOLUTIONS` 3 → 1 in `pixi-roulette-ball-renderer.ts`. Total angular delta is now ≈ 1–1.5 × 2π (1 extra revolution + pocket offset), matching the user's stated maximum.

**Fix 2 — Bounce stage slower and gentler (fewer, wider hops)**

Root cause: `cos²(3πt)` with frequency 3 produced three tightly-spaced, fast hops that were hard to read visually.

Fix: Changed to `cos²(S2_FREQ · π · t)` with `S2_FREQ = 2` — two hops with wider spacing. Increased damping from `exp(−2.5t)` to `exp(−S2_DAMP · t)` with `S2_DAMP = 3.0`, reducing residual lift at stage exit from ~8% to ~5% of the rim-to-disc gap. The two hops land at t=0.25 and t=0.75 of stage 2; the mid-hop peak is at ~22% of gap height.

**Fix 3 — Stage 3 rebound direction: OUTWARD (was incorrectly inward)**

Root cause (two-part):
1. Structural: stage 2 exited at radius ≈ 0.633 (slightly above R_DISC_SURFACE = 0.6 due to residual lift). Stage 3 used `R_DISC_SURFACE + REBOUND_FRACTION * gap * sin(πt)` which starts at R_DISC_SURFACE (=0.6), creating a sudden inward jump of 0.033 at the S2→S3 boundary — visually a sharp inward jerk.
2. Semantic: the intent was an outward rebound, but the jump made it appear to go inward at the boundary moment.

Fix: Stage 3 now uses:
```
R_DISC_SURFACE + (S2_EXIT_RADIUS − R_DISC_SURFACE) · (1 − t) + gap · REBOUND_FRACTION · sin(π · t)
```
Where `S2_EXIT_RADIUS` is precomputed from the stage-2 formula at t=1 (a module-level constant). This guarantees:
- t=0: radius = S2_EXIT_RADIUS (continuous from stage 2, no jump ✓)
- t≈0.5: radius ≈ 0.73 (peak outward, above R_DISC_SURFACE ✓)
- t=1: radius = R_DISC_SURFACE (ready for stage 4 settle ✓)

The velocity reversal at S2→S3 (inward → outward) is intentional: it represents the physical bounce impact. A continuous velocity here would look wrong.

**Fix 4 — Overall smoothness via C0-continuous stage boundaries**

S1→S2: both evaluate to R_RIM at the boundary (cos(0)=1, exp(0)=1 → bounce=1). ✓
S2→S3: fixed by Fix 3 (S2_EXIT_RADIUS formula). ✓
S3→S4: both evaluate to R_DISC_SURFACE at the boundary (sin(π)=0, residual=0 → stage 3 = R_DISC_SURFACE; stage 4 = R_DISC_SURFACE). ✓
Angular velocity: steps at stage transitions are mild (W ratios: 0.35/0.25=1.4, 0.38/0.40=0.95, 0.08/0.10=0.8, stage 4 ease-out). The S1→S2 speed step (1.4→0.95) is the largest and reads as natural deceleration as the ball starts dropping. All others are small.

**Updated stage table:**

| Stage | Time fraction | Duration | Angular weight | Radius behavior |
|---|---|---|---|---|
| 1 (rim arc)  | 0.00–0.25 | 1000 ms | W1 = 0.35 | R_RIM constant |
| 2 (bounce)   | 0.25–0.65 | 1600 ms | W2 = 0.38 | exp(−3t)·cos²(2πt) — two hops |
| 3 (rebound)  | 0.65–0.75 |  400 ms | W3 = 0.08 | Outward arc: residual fade + sin bump |
| 4 (settle)   | 0.75–1.00 | 1000 ms | W4 = 0.19 | R_DISC_SURFACE; angular cubic ease-out |

**Validation:**
```
pnpm validate  →  PASSED (2026-06-18)
  git diff --check  ✓
  pnpm lint         ✓  0 errors, 0 new warnings
  pnpm build        ✓  TypeScript clean, 24 routes
  pnpm check:docs   ✓
```

**Files changed:** `roulette-ball-phases.ts` (S2_FREQ/S2_DAMP params, S2_EXIT_RADIUS constant, stage-3 formula, W values), `pixi-roulette-ball-renderer.ts` (SPIN_EXTRA_REVOLUTIONS 3→1).

---

### Trajectory Re-specification — 5-Phase Model with Hard Floor (post-QA pass 4)

Full replacement of the 4-stage model with an exact 5-phase spec. `roulette-ball-phases.ts` is the only file changed.

**Three radii (normalized to container height):**

| Constant | Value | Meaning |
|---|---|---|
| `R_RIM` | 1.0 | Outer rim — ball laps here in phase 1. Imported from `roulette-wheel-geometry.ts`. |
| `R_POCKET_OUTER` | 0.82 | Outer edge of red/black pocket band — first contact on descent. |
| `R_POCKET_INNER` | 0.62 | Inner edge of pocket band — **hard floor**. Ball never crosses toward crown. |

`R_DISC_SURFACE` import dropped. `R_POCKET_OUTER` / `R_POCKET_INNER` are trajectory-local constants; values are starting estimates for visual QA tuning.

**Phase timeline (70 / 20 / 7 / 3 split):**

| Phase | Internal | Time fraction | Duration | Angular weight | Radius behavior |
|---|---|---|---|---|---|
| 1 (rim lap) | 1 | 0 %–70 % | 2800 ms | W1=0.65 | R_RIM constant |
| 2/3 (descent + bounce) | 2 | 70 %–90 % | 800 ms | W2=0.20 | Descent folded into phase start via rimExtra; bounce in [R_POCKET_INNER, R_POCKET_OUTER] |
| 4 (outward return) | 3 | 90 %–97 % | 280 ms | W3=0.08 | Smoothstep R_POCKET_INNER → R_RIM |
| 5 (settle roll) | 4 | 97 %–100 % | 120 ms | W4=0.07 | Smoothstep R_RIM → R_POCKET_OUTER + damped wobble; clamped |

**Hard floor guarantee (by construction):**
- Phase 1: R_RIM > R_POCKET_INNER ✓
- Phase 2: `R_POCKET_INNER + bounce + rimExtra` where `bounce ≥ 0` (cos²≥0, exp≥0) and `rimExtra ≥ 0` → radius always ≥ R_POCKET_INNER ✓
- Phase 3: smoothstep from R_POCKET_INNER monotone increasing ✓
- Phase 4: `Math.max(R_POCKET_INNER, ...)` explicit clamp ✓

**C0 continuity at all phase boundaries:**
- P1→P2 (s=0.70): phase 2 formula at t2=0 → `R_POCKET_INNER + POCKET_GAP*1*1 + (R_RIM-R_POCKET_OUTER)*1 = R_RIM` ✓
- P2→P3 (s=0.90): phase 2 at t2=1 → `cos²(1.5π)=0, rimExtra≈0 → R_POCKET_INNER`; phase 3 at t3=0 → R_POCKET_INNER ✓
- P3→P4 (s=0.97): smoothstep(1)=1 → R_RIM; phase 4 at t4=0 → `R_POCKET_OUTER + (R_RIM-R_POCKET_OUTER)*(1-0) = R_RIM` ✓
- Settled case: phase 4 at t4=1 → R_POCKET_OUTER; `computeBallState` settled → R_POCKET_OUTER ✓

**Phase-2 bounce character:**
- `P2_FREQ=1.5, P2_DAMP=3.0, P2_RIM_DECAY=20.0`
- cos²(1.5πt2)=0 at t2=1/3 (~265 ms) and t2=1 — 2 inner-edge landings
- First descent: R_RIM→R_POCKET_INNER over ~265 ms; smooth profile
- Second bounce peak: `0.20 * exp(-2.01) ≈ 0.027` — barely lifts above inner edge (gentle)

**Phase-4 settle wobble:** `amp=0.12×gap, freq=3, damp=6` → 1.5 oscillation cycles in 120 ms, decaying to zero by end.

**Validation:**
```
pnpm validate  →  PASSED (2026-06-18)
  git diff --check  ✓
  pnpm lint         ✓  0 errors, 0 new warnings
  pnpm build        ✓  TypeScript clean, 24 routes
  pnpm check:docs   ✓
```

**UI QA required before merge:** rim lap duration ~70% visible, descent at 70% mark without crossing inner edge, 2 gentle bounces in pocket band, outward return visible at ~90%, correct pocket landing, small settle wobble at end.

---

### UI QA — required, not yet run

Manual QA is required before this branch merges. Checklist:

- [ ] Pixi ball renders during spin; idle CSS orbit ball is not visible while spinning
- [ ] 4-phase trajectory is smooth; ball decelerates into pocket
- [ ] Ball visually lands on the correct pocket matching `randomPosition`
- [ ] After settle, orbit wrapper becomes visible again cleanly (no flicker)
- [ ] Win overlay and history entry appear only after `onSpinSettled` fires (not before)
- [ ] Auto-bet second round does not start until animation completes
- [ ] Window resize during spin does not crash or misalign canvas
- [ ] Tab switch during spin: ball snaps to settled state on return (rAF resumes)
- [ ] Pixi canvas background is transparent (no white rectangle over wheel layers)
- [ ] `R_DISC_SURFACE = 0.6` pocket landing radius — verify visually against disc pockets

---

### Risks (Pass B residual)

| Risk | Status |
|---|---|
| Figma pocket order vs disc asset | Open — visual QA required |
| `R_DISC_SURFACE = 0.6` radius estimate | Open — visual QA required |
| `roullete-ball.webp` filename typo | Known, non-blocking |
| Idle ball / Pixi ball flicker on first frame | Mitigated by `visibility: hidden` on `pendingSpin !== null`; verify in QA |

---

### Three Connected Fixes — Forward Calculation, Smooth Angular Cubic, Dwell + Idle Handoff (post-QA pass 5)

**Completed:** 2026-06-19

Three bugs addressed in a single coordinated pass. Files changed: `roulette-ball-phases.ts`, `pixi-roulette-ball-renderer.ts`, `roulette-renderer-types.ts`, `roulette-wheel.tsx`.

---

#### Fix 1 (ROOT BUG) — Forward CCW trajectory with guaranteed minimum lap

**Root cause:** `targetPocketAngleRad = discAngle + pocketOffset + coRotation - SPIN_EXTRA_REVOLUTIONS * 2π` used a backward "subtract extra laps" approach. When the idle ball happened to start near the winning pocket, the implied arc (start → target) collapsed to a tiny forward arc or even flipped CW, making the ball appear to hop or reverse.

**Fix:** Compute the arc forward using modular arithmetic, then guarantee exactly one full CCW lap on top:
```typescript
const rawTargetAngleRad =
  POCKET_ZERO_INITIAL_ANGLE_RAD + spin.discAngleRad + pocketOffset
  + DISC_OMEGA_RAD_PER_MS * SPIN_DURATION_MS;

const ccwArcToTarget =
  ((startBallAngleRad - rawTargetAngleRad) % TWO_PI + TWO_PI) % TWO_PI;

// Total arc ∈ [2π, 4π) — always 1–2 CCW revolutions
const targetPocketAngleRad = startBallAngleRad - (TWO_PI + ccwArcToTarget);
```

`SPIN_EXTRA_REVOLUTIONS` removed. The 70% rim-lap time still produces a long visible rim arc because W1=0.65 covers 65% of the angular distance.

---

#### Fix 2 — Velocity-matched cubic for phase 4 angular progress (C1 continuity at P3→P4)

**Root cause:** The previous phase-4 `easedProgress` used `(1-(1-t)³)*W4` — a standard cubic ease-out. Its initial derivative (angular rate at t=0) was `3*W4/(1-P3_END) ≈ 7.0`. The phase-3 angular rate exiting P3 was `W3/(P3_END-P2_END) ≈ 1.143`. This 500% speed jump was visible as a jarring snap-to-slow at the P3→P4 boundary.

**Fix:** Replace with velocity-matched cubic `p4(t) = A·t³ + B·t² + C·t` satisfying:
- `p4(0) = 0` (starts at zero progress offset)
- `p4(1) = 1` (covers full W4 fraction)
- `p4'(0) = v0` — matched to phase-3 exit rate
- `p4'(1) = 0` — ball stopped at pocket (smooth landing)

`v0 = W3*(1−P3_END) / ((P3_END−P2_END)*W4) ≈ 0.490`

Solving: `A = −1.510, B = 2.020, C = 0.490`

Roots of `p4'(t) = 3At² + 2Bt + C`: t = −0.108 (before range) and t = 1.0 → monotone on [0,1] ✓

In `roulette-ball-phases.ts`:
```typescript
const P4_A = -1.510;
const P4_B =  2.020;
const P4_C =  0.490;
// In easedProgress phase 4:
return W1 + W2 + W3 + W4 * (P4_A * t * t * t + P4_B * t * t + P4_C * t);
```

---

#### Fix 3 — Dwell + return-to-rim tail, seamless CSS idle handoff

**Approach chosen:** Negative CSS `animation-delay` + React `key` increment (option b). After Pixi clears the ball, the orbit wrapper's CSS animation restarts from a delay that places it at the exact exit angle — no visible jump.

**Tail phases appended after SPIN_DURATION_MS (4000 ms):**

| Phase | Duration | Behavior |
|---|---|---|
| Dwell | 750 ms | Ball drawn stationary at `targetPocketAngleRad`, radius `R_POCKET_OUTER` |
| Return to rim | 500 ms | Smoothstep `R_POCKET_OUTER → R_RIM`, angle unchanged |
| Handoff | — | `ball.clear()`, fire `onSpinSettled` with `exitBallAngleRad` |

Total animation time: 4000 + 750 + 500 = **5250 ms**. `onSpinSettled` fires only after the full tail, so auto-bet's `await onSpinRequired(result)` cannot unblock until the CSS orbit is ready.

**`exitBallAngleRad` field added to `RouletteRendererSpin`:**
- Set by renderer in `onSpinSettled` callback
- Undefined in `visualizeSpin` input
- The ball is angularly stationary during the entire tail (does not co-rotate with disc during dwell/return — known acceptable limitation; disc drifts ≈11° in 750ms at 24s/rev)

**CSS animation-delay formula (in `roulette-wheel.tsx` `handleSpinSettledInternal`):**
```typescript
// exitBallAngleRad is a CCW screen angle (-π/2 = 12 o'clock).
// Ball starts at 12 o'clock in orbit's local frame; CW rotation of θ shifts it to -π/2 + θ.
// So: cwRotation = exitAngle + π/2  (how far CW the wrapper must have rotated to place ball here)
const cwAngle = ((spin.exitBallAngleRad + Math.PI / 2) % TWO_PI + TWO_PI) % TWO_PI;
const delaySec = -(cwAngle / TWO_PI) * 60; // 60s per CW revolution
setOrbitAnimState(prev => ({ key: prev.key + 1, delay: `${delaySec.toFixed(3)}s` }));
```

React `key` increment forces the orbit div to remount, restarting the CSS animation from the new delay offset. The negative delay places the animation midway through its cycle at the correct angle.

**Orbit div in `roulette-wheel.tsx`:**
```tsx
<div
  key={orbitAnimState.key}
  ref={orbitRef}
  style={{
    animation: `roulette-ball-orbit-cw 60s ${orbitAnimState.delay} linear infinite`,
    visibility: spinning ? "hidden" : "visible",
  }}
>
```

---

#### Files changed

| File | Change |
|---|---|
| `src/games/roulette/renderer/roulette-renderer-types.ts` | Added `exitBallAngleRad?: number` to `RouletteRendererSpin` |
| `src/games/roulette/renderer/roulette-ball-phases.ts` | Exported `R_POCKET_OUTER`; added `P4_A/B/C` velocity-matched cubic constants; updated `easedProgress` phase-4 branch |
| `src/games/roulette/renderer/pixi-roulette-ball-renderer.ts` | Removed `SPIN_EXTRA_REVOLUTIONS`; added `DWELL_MS=750`, `RETURN_MS=500`; Fix 1 forward CCW calculation; tail phases in tick loop; `exitBallAngleRad` in settled spin |
| `src/games/roulette/ui/roulette-wheel.tsx` | Added `orbitAnimState` state; `handleSpinSettledInternal` callback; `key`/`animationDelay` on orbit div; passes internal handler to stage |

Context-only (unchanged): `roulette-wheel-geometry.ts`, `roulette-ball-phases.ts` (only additive exports), `roulette-pixi-ball-stage.tsx`, `roulette-game.tsx`, `use-roulette-game-controller.ts`, `use-roulette-auto-bet.ts`.

---

#### Validation

```
pnpm validate  →  PASSED (2026-06-19)
  git diff --check  ✓
  pnpm lint         ✓  0 errors, 0 new warnings (pre-existing main-nav.tsx warning unchanged)
  pnpm build        ✓  TypeScript clean, 24 routes
  pnpm check:docs   ✓  Active task artifact rationale accepted
```

---

#### UI QA additions for this pass

- [ ] Ball always travels CCW 1–2 full revolutions regardless of idle start position (Fix 1)
- [ ] No angular velocity snap at the P3→P4 boundary — smooth deceleration into pocket (Fix 2)
- [ ] Ball visibly dwells in pocket for ~750 ms before returning to rim (Fix 3)
- [ ] Rim return is smooth (smoothstep, 500 ms) — no jump to rim (Fix 3)
- [ ] CSS idle orbit resumes seamlessly from the rim exit point — no visible ball jump (Fix 3)
- [ ] Auto-bet second round does not start until after the full 5250 ms tail completes (Fix 3)

---

### Pass C-1: Purely Radial Phase 4 — Eliminate End-of-Spin Angular Jump

**Completed:** 2026-06-19  
**Root cause (from diagnostic audit):** W4=0.07 was calibrated when total arc was 7+ revolutions. With the current 1–2 revolution arc, W4=7% = 25–50° (2.6–5.2 pocket widths) swept in the last 120ms at the outer rim — visible as a large "yank" to the winning pocket.

**Fix (Option 2 — zero angular velocity in phase 4):**

Angular and radial progress are decoupled. `easedProgress` (angular only) now:
- Returns 1.0 for s > P3_END (0.97) — ball frozen at `targetPocketAngleRad`
- Phase 3 uses a C1-continuous cubic that decelerates angular velocity smoothly to zero at P3_END

`radiusAtS` (radial) is **unchanged** — phase 4 still rolls the ball from R_RIM inward to R_POCKET_OUTER with wobble.

**New angular weight distribution (W1_ANG + W2_ANG + W3_ANG = 1.0):**

| Phase | Time | W (angular) | Behavior |
|---|---|---|---|
| 1 (rim lap) | 0%–70% | 0.72 | Linear, near-constant speed (was 0.65) |
| 2 (bounce) | 70%–90% | 0.20 | Linear, near-constant speed (unchanged) |
| 3 (deceleration) | 90%–97% | 0.08 | Cubic C1: starts at phase-2 rate, eases to zero |
| 4 (radial roll) | 97%–100% | **0** | Purely radial — angle frozen at targetPocketAngleRad |

**Phase-3 angular deceleration cubic** `p3(t3) = P3_ANG_A·t3³ + P3_ANG_B·t3² + P3_ANG_C·t3`:
- `p3(0) = 0` (C0 at P2→P3) ✓
- `p3(1) = 0.08` (covers W3_ANG) ✓
- `p3'(0) = 0.07` = C (matches phase-2 angular rate in t3-space, C1 continuity) ✓
- `p3'(1) = 0` (smooth angular stop) ✓
- Monotone: roots of `p3'` at t3 = −0.259 (outside range) and t3 = 1.0 ✓

Constants: `P3_ANG_A = −0.09, P3_ANG_B = 0.10, P3_ANG_C = 0.07`

**Removed:** `W1, W2, W3, W4` (old proportional weights), `P4_A, P4_B, P4_C` (velocity-matched cubic for phase-4 angular — no longer needed).

**Unchanged:** Forward-calc, dwell/return tail, `radiusAtS`, `computeBallState` signature, all other files.

**Phase-4 effective arc:** 0° (was 25°–50°). Ball has been at `targetPocketAngleRad` since s=0.97 (t=3880ms). The phase-4 roll-in and the 750ms dwell together give ~870ms of ball visibly at the correct pocket angle before return-to-rim.

**Validation:**
```
pnpm validate  →  PASSED (2026-06-19)
  git diff --check  ✓
  pnpm lint         ✓  0 errors, 0 new warnings (pre-existing main-nav.tsx warning)
  pnpm build        ✓  TypeScript clean, 24 routes
  pnpm check:docs   ✓
```

**UI QA additions for Pass C-1:**
- [ ] Ball decelerates its sweep during phase 3 (90%–97% / t=3600–3880ms) — visibly slowing angular motion
- [ ] Ball arrives aligned with the winning pocket at s=0.97 (t=3880ms) with zero angular velocity
- [ ] Phase 4 (last 120ms): ball rolls straight radially into pocket with NO lateral sweep
- [ ] No "yank" or last-instant jump to the correct pocket
- [ ] Correct pocket still matches the win overlay number

---

### Pass C-2: Unified Pixi Scene — Disc Sprite + Co-rotating Ball + Resize Fix

**Completed:** 2026-06-19

#### Pre-step: Why the angular jump survived Pass C-1

C-1 correctly froze phase-4 angular motion. The jump survived because phase 3 (s=0.90–0.97, 280 ms) still covers W3_ANG=8 % of the total 1–2 revolution arc = 28.8–57.6° of CCW sweep at the outer rim. Watching the ball sweep 3–6 pocket widths in the final 280 ms is perceptually identical to the pre-C-1 snap. C-2 eliminates the visual mismatch differently: after phase 3 the ball co-rotates with the disc rather than freezing at a pre-computed screen angle, so the ball stays in the pocket instead of drifting away from it during phase 4 and the dwell.

#### Part 1 — Disc as Pixi Sprite

- `wheel-disc.webp` loaded via `Assets.load(discImageUrl)` inside the async factory.
- `discImageUrl: string` added to `CreatePixiRouletteBallRendererOptions`; the stage component passes `wheelDiscAsset.src`.
- `discSprite` (Sprite, anchor 0.5) added as first child of `app.stage` (below ball Graphics).
- `repositionDisc()` sets `discSprite.width = renderer.width × 0.917`, `height = width × (530/519)`, centers on canvas. Called on init and on `resize()`.
- Always-running idle rAF loop (`runIdleDisc`) updates `discSprite.rotation = DISC_OMEGA_RAD_PER_MS × (now − mountTimeMs)` whenever no spin is active. Stops when spin starts, restarts when spin/tail ends.
- CSS disc div (Layer 3) removed from `roulette-wheel.tsx`. `discRef` removed. `discAngleRad` removed from `RouletteRendererSpin`.
- `RoulettePixiBallStage` moved in DOM to before the crown div so the crown (center hub) renders on top of the Pixi canvas. The ball at R_RIM (~44 % radius) never overlaps the crown hub (13.8 % radius), so the crown-above-Pixi ordering is visually safe.

#### Part 2 — Angular jump fix via live co-rotation

- At trigger time: `discAngle0 = discSprite.rotation` (direct Pixi read, no `getComputedStyle`).
- `pocketScreenAngle0 = POCKET_ZERO_INITIAL_ANGLE_RAD + discAngle0 + pocketOffset` — pocket screen angle at t=0.
- `livePocketAtConvergence = pocketScreenAngle0 + DISC_OMEGA_RAD_PER_MS × CONVERGENCE_MS` where `CONVERGENCE_MS = P3_END × SPIN_DURATION_MS = 3880 ms`.
- `ccwArc = 2π + ccwArcToConvergence` — forward guarantee (ball travels CCW ≥ 1 full lap to the pocket's position at t=3880 ms, not t=4000 ms).
- Phases 1–3 (s ≤ P3_END): `angleRad = startBallAngleRad − easedProgress(s) × ccwArc`. At s=P3_END, `easedProgress = 1.0` → ball is exactly at `livePocketAtConvergence ≡ livePocketNow` (within float precision). ✓
- Phase 4 + dwell + return (elapsed > CONVERGENCE_MS): `angleRad = pocketScreenAngle0 + DISC_OMEGA_RAD_PER_MS × elapsed` = pocket's live screen angle.
- `discSprite.rotation = discAngleAt(now)` updated every tick frame (both spin and idle).

#### Part 3 — Dwell co-rotation fix

- During `DWELL_MS` (750 ms) and `RETURN_MS` (500 ms) tail: ball uses `livePocketNow` for its angular position — it tracks the disc pocket continuously. Pocket no longer drifts 11.25° away from the ball during dwell.
- `exitBallAngleRad = livePocketNow` at tail completion — the live pocket angle at that exact moment. `handleSpinSettledInternal` uses this to set CSS `animation-delay` for the idle orbit handoff. ✓

#### Part 4 — Resize no longer aborts spin

- `resize()` calls `app.renderer.resize(…)` and `repositionDisc()` only — does NOT call `cancelActiveSpin`.
- `rimPx()` (`= renderer.height × RIM_HEIGHT_FRACTION`) is called every tick, so ball position adapts automatically to the new canvas size after resize.
- Disc sprite dimensions are updated by `repositionDisc()` in the resize handler.

#### Files changed (Pass C-2)

| File | Change |
|---|---|
| `src/games/roulette/renderer/roulette-ball-phases.ts` | Exported `P3_END`, `easedProgress`, `radiusAtS` |
| `src/games/roulette/renderer/roulette-renderer-types.ts` | Removed `discAngleRad` from `RouletteRendererSpin` |
| `src/games/roulette/renderer/pixi-roulette-ball-renderer.ts` | Full rewrite: disc Sprite, idle rAF loop, co-rotating angular tracking, resize-safe |
| `src/games/roulette/ui/roulette-pixi-ball-stage.tsx` | Removed `discRef` prop; removed disc-angle read; added `discImageUrl` to factory call; imported `wheelDiscAsset` |
| `src/games/roulette/ui/roulette-wheel.tsx` | Removed CSS disc div + `wheelDisc` import + `discRef`; moved `RoulettePixiBallStage` before crown; removed `discRef` from stage props |

Context-only (unchanged): `roulette-wheel-geometry.ts`, `roulette-wheel-ball.tsx`, `use-roulette-game-controller.ts`, `use-roulette-auto-bet.ts`, `roulette-game.tsx`.

#### Validation

```
pnpm validate  →  PASSED (2026-06-19)
  git diff --check  ✓
  pnpm lint         ✓  0 errors, 0 new warnings (pre-existing main-nav.tsx warning)
  pnpm build        ✓  TypeScript clean, 24 routes
  pnpm check:docs   ✓
```

#### UI QA additions for Pass C-2

- [ ] Disc visible immediately on page load — Pixi sprite replaces CSS disc with no visual gap
- [ ] Disc rotates CCW at same speed as before (24 s/rev) — both during idle and spin
- [ ] Ball converges smoothly to the pocket without a last-instant angular yank
- [ ] Ball stays in the pocket during the 750 ms dwell — pocket does NOT drift away from ball
- [ ] CSS idle orbit resumes seamlessly after tail (correct angle, no jump)
- [ ] Window resize during spin: spin continues uninterrupted; disc and ball both rescale
- [ ] Window resize during idle: disc continues rotating at correct size/position
- [ ] Crown hub appears on top of the Pixi disc (correct DOM layering)

---

### Pass C-3: Front-load Angular Alignment — Absolute Bounce Arc Split

**Completed:** 2026-06-19

#### Root cause confirmed (fully)

The proportional-weight scheme (`W1_ANG × ccwArc`, `W2_ANG × ccwArc`, etc.) calibrated each phase as a *percentage* of the total arc. With a 1–2 revolution total arc, W3_ANG=8% still = 28–57°, a large sweep. The fix is structural: replace proportional weights with an *absolute* fixed arc for the bounce/settle phases, so the sweep is constant and small regardless of how many laps the ball does on the rim.

#### The change — `phase1Arc = ccwArc − bounceArc`

**Constants (in `pixi-roulette-ball-renderer.ts`):**
```typescript
BOUNCE_POCKET_COUNT = 4          // ball descends ~4 pockets ahead of the winner
POCKET_ARC_RAD = (2π) / 37       // 9.73° per pocket
bounceArc = 4 × 9.73° ≈ 38.9°  // fixed absolute arc — same every spin
phase1Arc = ccwArc − bounceArc   // absorbs ALL variability (1-vs-2-lap delta)
```

**Angular trajectory (replacing proportional `easedProgress × ccwArc`):**

- Phase 1 (`s ≤ P1_END = 0.70`): linear, covers `phase1Arc`. Ball finishes the rim lap arriving ~4 pockets ahead of the winning pocket. 1-vs-2-lap variability is fully absorbed here.
- Phases 2–3 (`P1_END < s ≤ P3_END`): cubic ease-out (`1 − (1−t)³`) over `bounceArc` (~38.9°). Fast as the ball first touches the disc, decelerating to ~0 at P3_END. Forward-only (monotonically CCW = decreasing angle). No backward oscillation.
- Phase 4 + dwell + return (`s > P3_END` or elapsed > SPIN_DURATION_MS): co-rotates with disc (unchanged from C-2).

**Why this eliminates the jump:**
The bounce/settle arc is now constant ~38.9° regardless of whether the total spin is 1 or 2 revolutions. 38.9° over 1080ms at cubic ease-out gives an *initial* angular speed of ~0.108°/ms — visually gentle deceleration across ~4 pockets. Compare to C-1/C-2 where the final phases covered 28–57° *depending on arc*, causing the speed to vary wildly between spins.

**C1-speed continuity at `P1_END`:**
- Phase 1 exit speed: `phase1Arc / (0.70 × 4000ms)`
  - 1-lap case: `(360°−38.9°) / 2800ms = 0.129°/ms`
  - 2-lap case: `(720°−38.9°) / 2800ms = 0.257°/ms`
- Phase 2 initial speed (ease-out derivative at t=0): `3 × bounceArc / (0.27 × 4000ms) = 3 × 38.9° / 1080ms = 0.108°/ms`

For the 1-lap case the ball decelerates only 17% at the rim→disc transition (natural). For the 2-lap case it decelerates 58% — also natural, as a faster-spinning ball decelerates more sharply when it hits the disc surface.

**Removed from renderer:** `easedProgress` import, `ccwArc` field in `ActiveSpin`. Added: `phase1Arc`, `bounceArc` fields; `ballAngleAtS()` helper.
**Added to `roulette-ball-phases.ts`:** `export const P1_END`.

#### Files changed (Pass C-3)

| File | Change |
|---|---|
| `src/games/roulette/renderer/roulette-ball-phases.ts` | Exported `P1_END` |
| `src/games/roulette/renderer/pixi-roulette-ball-renderer.ts` | Replaced `easedProgress × ccwArc` with `ballAngleAtS(phase1Arc, bounceArc)`; `BOUNCE_POCKET_COUNT=4`, `POCKET_ARC_RAD=2π/37`; `ActiveSpin` updated |

Context-only (unchanged): `roulette-renderer-types.ts`, `roulette-pixi-ball-stage.tsx`, `roulette-wheel.tsx`, all model/game files.

#### Validation

```
pnpm validate  →  PASSED (2026-06-19)
  git diff --check  ✓
  pnpm lint         ✓  0 errors, 0 new warnings
  pnpm build        ✓  TypeScript clean, 24 routes
  pnpm check:docs   ✓
```

#### UI QA additions for Pass C-3

- [ ] Ball spends the vast majority of the spin on the rim; descends onto the disc only ~4 pockets before the winning number
- [ ] Bounce phase covers only ~4 pockets (≈39°) — never a fast lateral sweep
- [ ] Bounce angular motion is forward-only and decelerating (no backward oscillation)
- [ ] Spin with ball starting near AND far from the winning pocket: bounce always covers ~4 pockets, rim phase absorbs the difference
- [ ] Correct pocket still matches the win overlay (pocket landing unchanged)
- [ ] No angular yank or jump visible at any point in the animation
