# Task Lifecycle Record

## Identity

- Task title: Roulette game module — first slice (shell + real bets, minimal)
- Status: In progress (implementation)
- Mode: Implementation
- Branch mode: PR-mode
- Base branch: `codex/game-action-shell-foundation` (NON-STANDARD — stacked on the Game Action Shell branch, not `develop`, because its contracts are not yet in `develop`)
- Task branch: `feat/roulette-game` (pre-existing; not created by this task)
- Current branch at task start: `feat/roulette-game`
- Branch creation command/evidence: none — branch already existed before this task. No branch was created or switched. Constraint: this roulette PR must NOT merge into `develop` until the Game Action Shell base merges first.

## Scope

- Goal: Implement deliverable #7 of the roulette audit — the smallest playable vertical: place chips (color + straight only) → send bet to local BFF → reveal winning number statically → refresh shared balance. Mirror the Dice pattern (structure, not logic).
- Non-goals:
  - Animated wheel and the `renderer/` layer.
  - Provably Fair UI/verify; do NOT flip `game-action-config.ts` roulette `provablyFair:false`. Do NOT reuse Dice verify (limit mismatch).
  - Full board (all 10 bet types) — color + straight only this slice (other 8 arrays sent empty).
  - Turbo, Max Bet (keep hidden), volume/audio.
  - Any reliance on `multiplier` for multi-bet payout math.
  - Browser → backend direct calls (browser hits local `/api/*` only).
  - No commit / push / PR / merge / branch creation.
- Approved scope: new `src/games/roulette/**` module, one new BFF route `src/app/api/games/roulette/bet/route.ts`, route wiring in `src/app/games/[gameSlug]/page.tsx`, durable docs update in `docs/architecture/foundation-decisions.md`.
- Forbidden scope: editing Game Action Shell / colleague files (read+reuse only), config BFF route (backend has none), any other game module, shared primitives, auth.
- Editable files:
  - `src/games/roulette/config/roulette-defaults.ts` (new)
  - `src/games/roulette/lib/roulette-decimal.ts` (new — game-local BigInt decimal, NOT Big.js; see conflict note in Risks)
  - `src/games/roulette/lib/roulette-bets.ts` (new)
  - `src/games/roulette/lib/roulette-storage.ts` (new)
  - `src/games/roulette/model/roulette-types.ts` (new)
  - `src/games/roulette/model/roulette-client.ts` (new)
  - `src/games/roulette/model/roulette-query.ts` (new)
  - `src/games/roulette/model/roulette-store.ts` (new)
  - `src/games/roulette/model/use-roulette-game-controller.ts` (new)
  - `src/games/roulette/ui/roulette-game.tsx` (new)
  - `src/games/roulette/ui/roulette-table.tsx` (new)
  - `src/games/roulette/ui/roulette-chip-tray.tsx` (new)
  - `src/games/roulette/ui/roulette-result.tsx` (new)
  - `src/games/roulette/index.ts` (new)
  - `src/app/api/games/roulette/bet/route.ts` (new)
  - `src/app/games/[gameSlug]/page.tsx` (edit — render `<RouletteGame/>` for slug `roulette`)
  - `docs/architecture/foundation-decisions.md` (edit — durable docs)
- Context-only files: `src/games/dice/**`, `src/app/api/games/dice/**`, `src/app/api/_lib/**`, `src/features/balance/**`, `src/features/provably-fair/**`, `src/widgets/game-detail/**`, `src/entities/game/model/**`, `src/shared/ui/primitives/**`, `src/app/globals.css`.

## Source Of Truth

- Source-of-truth files inspected: `docs/architecture/foundation-decisions.md`, `.claude/rules/**`, `src/app/api/games/dice/bet/route.ts`, `src/app/api/_lib/{auth-backend,auth-cookies}.ts`, `src/games/dice/**`, `src/features/balance/**`, `src/widgets/game-detail/**`, `package.json` (big.js ^7, zustand ^5, @tanstack/react-query ^5).
- Architecture decisions: backend authoritative for outcome/payout; browser → local `/api/*` only; Zustand owns local game state; Big.js for decimal-safe UI; game modules must not import other game modules.
- Relevant rules: game-frontend-architecture, state-data-api-boundary, design-system-foundation, project-structure, quality-gates, git-lifecycle.
- Relevant skills: implementation (this), api-boundary-check, documentation, ui-qa, review, pre-commit.

## Impact

- Docs impact: BLOCKING. `src/games/**`, `src/app/api/games/**`, and `src/features/**` (Zustand store is first such use) map to `docs/architecture/foundation-decisions.md`. First roulette module + new roulette BFF route = new architectural-pattern instance → durable docs updated.
- API boundary impact: New local BFF route `POST /api/games/roulette/bet` only. Backend URL + auth cookies stay server-side via `_lib` helpers. No config route. Manual api-boundary check required at review.
- UI QA requirement: BLOCKING — new table/chip UI, result reveal, responsive + fullscreen-portal behavior. ui-qa evidence required at review.
- Stack primitive checklist:
  - Entrypoint thinness: `[gameSlug]/page.tsx` stays thin (renders `<RouletteGame/>`).
  - Orchestration: `use-roulette-game-controller.ts`.
  - Component split: table / chip tray / result / game shell.
  - Data/state/form ownership: TanStack Query (bet mutation + shared balance), Zustand (chip placement, runtime source of truth), no RHF (no form drafts).
  - Project primitives: reuse `Button`, `cn`, design tokens; reuse `features/balance`, `features/auth`. No new shared primitive.

## Validation Plan

- Planned commands: `pnpm validate` (git diff --check, lint, build, check:docs).
- Manual checks: scope check vs editable list; documentation impact check; API boundary check; UI QA evidence.
- Skipped checks and reasons: no test runner / Playwright exists in repo — none claimed.

## Evidence

- Commands run:
  - `git diff --check` → exit 0.
  - `pnpm lint` → exit 0 (0 errors; 1 pre-existing unrelated warning in `main-nav.tsx`).
  - `pnpm build` → exit 0; route `ƒ /api/games/roulette/bet` and `● /games/roulette` (SSG) present in route manifest.
  - Bet-mapping proof check (2026-06-15 node inline): straight-0 → `{straightNumber:0,amount:"1.00"}`; RED → `{color:"RED",amount:"2.00"}`; 10-array envelope confirmed; zero-amount filtered; `isStraightNumber(0)` true. All 7 assertions passed.

### Bet-panel pass (Manual UI to Figma spec) — 2026-06-16

- Branch mode: PR-mode on existing `feat/roulette-game`; no branch created (user-directed, conflicts with skill default — flagged & user wins).
- Design source: Figma node 3855-15173 (audited spec) + node 3973-62490 (selected-chip glow). Code Connect unavailable (no Developer seat).
- Editable files (this pass):
  - `src/games/roulette/config/roulette-defaults.ts` (edit — add `ROULETTE_CHIPS` {value,label,image}, 10 webp static imports; denominations/default derived from it)
  - `src/games/roulette/ui/roulette-chip-tray.tsx` (rework — 10-chip image grid + selected glow)
  - `src/games/roulette/ui/roulette-bet-panel.tsx` (new — tabs, readouts, tray, choose-action, Bet CTA)
  - `src/games/roulette/ui/roulette-game.tsx` (edit — left column renders `<RouletteBetPanel/>`)
  - `src/shared/assets/games/roulette/icons/{clear,undo,infinity}-icon.svg` (edit — normalized to `currentColor`, removed fixed width/height, kept viewBox)
- Chip mapping value→file→label: 1→coin-1→"1", 5→coin-5→"5", 25→coin-25→"25", 50→coin-50→"50", 250→coin-250→"250", 500→coin-500→"500", 2000→coin-2000→"2K", 5000→coin-5000→"5K", 25000→coin-25000→"25K", 50000→coin-50000→"50K". Denomination is baked into the coin art → label used for a11y/readout, not overlay.
- No-token fills via `color-mix` (no new @theme tokens): disabled button bg = `color-mix(in srgb, var(--color-border-2) 50%, transparent)`; active-tab gradient = `from color-mix(--color-surface-3 40%) to color-mix(--color-border-2 40%)`. Bet enabled = existing primary gradient (`from-primary-tint to-primary`, `shadow-btn`).
- Selected-chip glow (node 3973-62490): design uses a 59px green raster halo offset −5.5px around the 48px chip. NOT transplanted (brand art); reproduced in CSS as `ring-2 ring-primary` + `box-shadow 0 0 12px 2px color-mix(--color-primary 55%)` on a `-inset-[5.5px]` overlay.
- Behavior: Manual active; Auto = static placeholder (local `useState`, no auto-bet/inputs; infinity-icon normalized but unused). Chip select → store `selectedChip`; Chip Value readout reflects it. Bet Amount = `formatMoney(totalBet)` (app formatter, period separator — design comma not hardcoded). Clear = functional (store `clearBets`, enabled when total > 0). Undo = disabled placeholder. Bet `type="submit"` → existing form handler; disabled gate unchanged (auth/min/balance). All-10-arrays send contract untouched.
- Validation: `pnpm lint` → 0 errors (1 pre-existing unrelated warning in `main-nav.tsx`); `pnpm build` → exit 0, `/games/roulette` compiled.
- UI QA: deferred to human visual review per task (no screenshots this pass).

#### Fix pass (glow asset + readout icons) — 2026-06-16

- Fix 1 (glow): replaced the CSS box-shadow/ring select styling with the shared
  `selected-chip-glow.webp` (static import), rendered only behind the SELECTED chip —
  absolutely centered, 72px (bleeds around the 48px chip), `z-0` + `pointer-events-none`,
  chip image lifted to `z-10`. Deselected chips show no glow.
- Fix 2 (readout icons via SVGR): `chip-value-icon.svg` → Chip Value glyph;
  `bet-amount-icon.svg` → Bet Amount glyph (replaced the prior `<Image>` chip glyph and
  the CSS `bg-primary` dot). Per-file color: BOTH are multi-color (chip-value = gold coin
  `#FFE372`/`#FACC15` + gradient; bet-amount = `#4ADE80` + gradients) → kept as-authored,
  neither converted to currentColor (would flatten); sized via `className` (CSS overrides
  intrinsic SVG dims), so no SVG file edits needed. `next/image` `Image` import dropped
  from bet-panel (now unused).
- Unchanged: Undo stays disabled placeholder; chip value→file→label map, all-10-arrays
  contract, Zustand source of truth, localStorage persistence — intact.
- Validation: `pnpm lint` → 0 errors (same pre-existing warning); `pnpm build` → exit 0.

#### Fix pass (glow size + 5-per-row grid) — 2026-06-16

- Fix 1 (glow size): reduced the selected-chip halo from 72px → 60px (hugs the 48px
  chip, ~25% larger). Still absolute, centered, `z-0`, `pointer-events-none` — out of flow.
- Fix 2 (5-per-row): replaced `flex flex-wrap` with a fixed grid
  `grid-cols-[repeat(5,48px)] gap-4` (`mx-auto w-max` = exactly 5×48 + 4×16 = 304px) so it
  can never reflow to 4. Glow is absolute/out-of-flow → selected cell stays 48px (no grid shift).
- Layout fit: widened the panel column `20rem → 22rem` (352px) in `roulette-game.tsx` so
  `p-6` leaves 304px content — matches the audited panel (352) / content (304) and lets the
  304px tray sit flush without clipping. Tabs/readouts/buttons (`w-full`) now also = 304px.
- Validation: `pnpm lint` → 0 errors (same pre-existing warning); `pnpm build` → exit 0.

#### Fix pass (tab-parity fixed height) — 2026-06-16

- Figma micro-audit: Manual hug = 516px (content 468 + 24/24 padding); Auto hug = 512px →
  Manual taller by 4px = the switch jump. Only differing block: Manual "Choose action" 80px
  vs Auto "Number of bets" 76px; all else (tabs/readouts/tray/Bet, gaps 24/32) identical.
- Fix: added `min-h-[516px]` to the bet-panel `<section>` (the element owning `p-6`;
  Tailwind border-box → min-height includes padding → rendered hug = 516px). Both tab states
  now occupy ≥516px so switching does not shift the Bet button.
- `min-height` (not `height`) deliberately: if the Auto block ever un-hides its Label/Helper
  text (~124px), the panel grows instead of clipping. Value is a measured design constant (px);
  no new @theme token.
- Validation: `pnpm lint` → 0 errors (same pre-existing warning); `pnpm build` → exit 0.

#### Fix pass (tab jump — pin desktop column) — 2026-06-16 (supersedes the min-h-[516px] approach)

- Diagnosis: the prior `min-h-[516px]` was on the wrong element. In this build Auto replaces
  the ENTIRE settings block (readouts+tray+action = 296px) with a ~122px placeholder, so the
  bet-panel `<section>` renders ≈568px (Manual, logged-out) vs ≈394px (Auto). The left grid
  item `<div order-2 md:order-1>` (roulette-game.tsx) tracks that; the grid implicit row =
  max(left,right) follows → BOTH columns resize. `min-h` is only a floor, so Manual overshot it.
- Fix (two parts):
  1. `roulette-game.tsx`: left side column `<div order-2 md:order-1>` → added `lg:h-[668px]`
     (Figma artboard height; lg+ only). Column is now independent of tab content; `<lg` stays fluid.
     `roulette-bet-panel.tsx` `<section>` got `lg:h-full` so the panel surface fills the 668 column
     (content top-aligned, slack at bottom — matches the artboard).
  2. `roulette-bet-panel.tsx`: wrapped the Manual/Auto swap region in `min-h-[296px]` (the Manual
     settings height) so the content above the Bet button is identical in both states → Bet never
     moves. Auto placeholder uses `flex-1` to fill the reserved 296px. This also keeps the section a
     constant height at md and mobile (no resize at any breakpoint).
- Removed the earlier `min-h-[516px]` from the section (wrong element + redundant). Decision recorded.
- Live preview verification not possible (Windows next-dev single-instance lock drops the preview MCP
  server immediately — same limitation noted above); fix rests on deterministic DOM analysis.
- Validation: `pnpm lint` → 0 errors (same pre-existing warning); `pnpm build` → exit 0.

#### Feature pass (Auto mode: number of bets + ∞) — 2026-06-16

- Reuses `src/features/auto-bet/useAutoBetRunner` (unmodified). NO sizing/stop options (a Roulette bet
  is a fixed multi-array placement, not a scalable amount) — runner used in count/∞ mode only.
- ADD `src/games/roulette/model/use-roulette-auto-bet.ts`: `useAutoBetRunner<RouletteBetResult & {didWin}>`
  with `placeBet` that (a) throws if `!authenticated` / `!hasAnyBet`; (b) pre-checks balance
  (`compareMoney(total, balance) > 0` → throw — runner has no balance guard); (c) places via
  `betMutation.mutateAsync({ params: buildRouletteBetParams(placements) })` (mutation → invalidates
  `balanceQueryKey` each round); (d) returns `didWin = Number(payout) > Number(betSize)` (type-only, no
  scaling). Reads LIVE placements via `useRouletteStore.getState()` each round; `onRoundComplete` →
  `setLastResult`. Local count/∞ state + handlers mirror Dice; stops on auth loss.
- EDIT controller: composes `useRouletteAutoBet` (shares auth/balance/mutation/setLastResult), surfaces
  auto state + handlers. Manual flow unchanged.
- EDIT `roulette-bet-panel.tsx`: Auto tab swap region now renders "Number of bets" + numeric `<Input>`
  (shows `∞`/readOnly when infinite) + ∞ toggle (infinity-icon.svg, SVGR/currentColor); CTA is mode-aware
  — Manual keeps Bet (submit), Auto shows Start/Stop (button). Fixed-height tab parity preserved.
- Placements are NEVER cleared between rounds (only explicit Clear / no clear-on-result) → auto replays
  the same placement N times. Clear also disabled while `autoRunning`.
- API boundary: unchanged — reuses local `/api/games/roulette/bet` via the existing mutation/client.
- Validation: `pnpm lint` → 0 errors (same pre-existing warning); `pnpm build` → exit 0. Live behavior
  (run N → stop, ∞ until Stop, per-round balance) deferred to human review (Windows preview limitation).

---

(Original first-slice evidence below.)

- `pnpm check:docs` → "Docs freshness check passed"; mapped `src/games/**`, `src/app/api/games/**`, `src/app/games/**` changes matched durable docs change in `foundation-decisions.md`.
  - Runtime smoke (live dev server): `GET /games/roulette` → 200 (renders Spin / Total bet / Clear bets / "Sign in to place a bet"); `POST /api/games/roulette/bet` no auth → 401; `POST` with cookie + incomplete `params` → 400; `GET /games/keno` → 200 "coming soon" (placeholder regression guard passed).
- Review evidence: (pending review skill)
- Pre-commit evidence: (pending pre-commit skill)
- UI QA evidence: runtime SSR render confirmed via HTTP + accessibility text; browser-preview MCP could not hold a server on this Windows host (next dev single-instance lock) — visual screenshot not captured. Full ui-qa skill pass still pending.
- API boundary evidence: browser calls only `/api/games/roulette/bet`; backend URL + `access_token` cookie handled server-side via `_lib`; 401/400 gates verified at runtime. Manual api-boundary-check skill still pending.

## Risks And Handoff

- Risks:
  - PROMPT/SKILL CONFLICT (flagged): prompt asked for "Big.js wrappers", but `big.js` ships no types and `@types/big.js` is not installed → strict-build failure; adding it is approval-gated (Dependency/Security Approval Gate). Resolved by following the Dice precedent (hand-rolled game-local BigInt decimal in `roulette-decimal.ts`, re-derived, not importing Dice). No dependency added. If the team prefers literal Big.js, approve `@types/big.js` and the helper can be swapped behind its stable API.
  - `colorValues` entry shape VERIFIED (2026-06-15) against captured prod payload: `{ color: "RED" | "BLACK", amount }`. No fix was needed. Isolated in `ROULETTE_COLOR_CODES` + mapper.
  - `multiplier` semantics for mixed multi-bet unconfirmed → result/winnings derived from authoritative `payout` string only; `multiplier` shown for display, never used for math.
  - Zustand store is the first in the repo (new pattern); persisted via localStorage as a persistence layer only.
  - No backend config endpoint → min/max bet, chip denominations, payouts are frontend constants (not authoritative limits).
- Handoff: after implementation, run review → ui-qa → api-boundary-check → pre-commit. Do not commit/push/PR until requested.
- Lifecycle close notes: keep active until explicitly closed.
