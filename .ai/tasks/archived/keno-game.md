# Task Lifecycle Record

## Identity

- Task title: Keno Game — BFF + Types + Client + Query (Slice 1 of N)
- Status: active
- Mode: implementation (slice 1)
- Branch mode: PR-mode
- Base branch: develop
- Task branch: feat/keno-game
- Current branch at task start: feat/keno-game (already branched from develop at e97f544)
- Branch creation command/evidence:
  - `git branch --show-current` → `feat/keno-game`
  - `git log --oneline -1 develop` → `e97f544 chore(tasks): archive auth refresh bet retry`
  - `git merge-base HEAD develop` → `e97f5445ccd91794e810acb2194890672c834fee`
  - Branch is at develop tip; 0 commits ahead; no uncommitted changes at task start.
  - Branch creation confirmed by user in prompt (user-confirmed per branch-discipline policy).

## Scope

- Goal: Implement the full Keno bet integration boundary, config, and pure lib layer.
- Non-goals:
  - Zustand store, game controller, auto-bet hook.
  - UI components (tile, grid, bet panel, game root).
  - Multiplier rows for pickCount 1..9 (known gap; values not yet verified).
  - Docs update (deferred to a later slice).
  - Page wire-up (src/app/games/[gameSlug]/page.tsx).
  - PixiJS renderer (none for Keno at all).
  - Staging, commit, push, PR creation, merge, or lifecycle archival.
- Approved scope (slice 1 — BFF + types):
  - src/games/keno/model/keno-types.ts ✓
  - src/games/keno/model/keno-client.ts ✓
  - src/games/keno/model/keno-query.ts ✓
  - src/app/api/games/keno/bet/route.ts ✓
- Approved scope (slice 2 — config + lib):
  - src/games/keno/config/keno-defaults.ts ✓
  - src/games/keno/lib/keno-decimal.ts ✓
  - src/games/keno/lib/keno-input.ts ✓
  - src/games/keno/lib/keno-tiles.ts ✓
- Approved scope (slice 3 — store + controller + auto-bet):
  - src/games/keno/model/keno-store.ts ✓
  - src/games/keno/model/use-keno-auto-bet.ts ✓
  - src/games/keno/model/use-keno-game-controller.ts ✓
- Approved scope (slice 4 — KenoTile + KenoGrid UI):
  - src/games/keno/ui/keno-tile.tsx ✓
  - src/games/keno/ui/keno-grid.tsx ✓
- Approved scope (slice 5a — bet panel + risk selector + multiplier strip):
  - src/games/keno/config/keno-defaults.ts (fill rows 1..9) ✓
  - src/games/keno/ui/keno-bet-amount-control.tsx (new) ✓
  - src/games/keno/ui/keno-bet-panel.tsx (new) ✓
  - src/games/keno/ui/keno-multiplier-strip.tsx (new) ✓
  - .ai/tasks/active/keno-game.md (this artifact) ✓
- Approved scope (slice 5b — 5a cleanups + win overlay + root + wire-up + responsive + real assets):
  - src/app/globals.css (accent-blue + accent-yellow tokens) ✓
  - src/games/keno/ui/keno-bet-panel.tsx (token swap + mode lift + form→div) ✓
  - src/games/keno/ui/keno-multiplier-strip.tsx (Figma two-card redesign + chip-green icon) ✓
  - src/games/keno/ui/keno-tile.tsx (diamond.webp wired; leading-[24px] at lg) ✓
  - src/games/keno/ui/keno-bet-amount-control.tsx (chip-green icon replaces placeholder) ✓
  - src/games/keno/ui/keno-result.tsx (new — win overlay + real assets: chip-green + diamond) ✓
  - src/games/keno/ui/keno-game.tsx (new — root composition) ✓
  - src/games/keno/index.ts (new — barrel export) ✓
  - src/app/games/[gameSlug]/page.tsx (KenoGame mount) ✓
- Approved scope (slice 5c — animation timing & phases):
  - src/games/keno/config/keno-defaults.ts (5 timing constants) ✓
  - src/games/keno/ui/keno-grid.tsx (KENO_REVEAL_STEP_MS default + pulsingTiles prop) ✓
  - src/games/keno/ui/keno-tile.tsx (pulsing prop + looped glow motion.span) ✓
  - src/games/keno/model/use-keno-game-controller.ts (staggered autoPick, overlay persistence,
    pulsingTiles state, wrappedPlaceBet) ✓
  - src/games/keno/ui/keno-result.tsx (remove DISMISS_MS timer — parent-driven clearing) ✓
  - src/games/keno/ui/keno-game.tsx (wire currentResult, pulsingTiles, handleAutoPick) ✓
  - .ai/tasks/active/keno-game.md (this artifact) ✓
- Approved scope (shell max-bet wiring — Pass 2):
  - src/widgets/game-detail/game-action-config.ts (keno maxBetWarning entry) ✓
  - src/games/keno/model/use-keno-game-controller.ts (useMaxBetContract + maxBetEnabled) ✓
  - src/games/keno/ui/keno-game.tsx (maxBetEnabled destructured; onMax gated) ✓
  - src/games/keno/ui/keno-bet-panel.tsx (onMax made optional) ✓
  - src/games/keno/ui/keno-bet-amount-control.tsx (MAX button conditional on onMax) ✓
  - .ai/tasks/active/keno-game.md (this artifact) ✓
- Approved scope (shell turbo-mode wiring — Pass 1):
  - src/games/keno/config/keno-defaults.ts (turbo timing constants) ✓
  - src/games/keno/ui/keno-grid.tsx (turbo prop replaces staggerMs seam) ✓
  - src/games/keno/model/use-keno-game-controller.ts (useTurboMode + turbo auto-pick) ✓
  - src/games/keno/ui/keno-game.tsx (turboEnabled destructured + turbo prop to KenoGrid) ✓
  - .ai/tasks/active/keno-game.md (this artifact) ✓
- Approved scope (slice 5g — bet-control full-width fix, tablet + mobile):
  - src/games/keno/ui/keno-game.tsx (move lg:hidden KenoBetPanel from inside
    the right-area div to a direct <form> sibling with order-2 lg:hidden) ✓
  - .ai/tasks/active/keno-game.md (this artifact) ✓
- Approved scope (slice 5f — mobile layout correction per Figma node 4107:124226):
  - src/games/keno/ui/keno-tile.tsx (tile size: clamp → w-full aspect-square on mobile; lg:size-[67px] unchanged) ✓
  - src/games/keno/ui/keno-grid.tsx (gap: 4.75px → 2px on mobile, md:gap-[4.75px] md:w-fit md:mx-auto unchanged) ✓
  - src/games/keno/ui/keno-game.tsx (grid+strip wrapper: w-fit → w-full on mobile, md:w-fit md:mx-auto) ✓
  - src/games/keno/ui/keno-bet-panel.tsx (section: max-md:rounded-none, max-md:px-4;
    Bet CTA + Clear+AutoPick wrapped in mobile-group div with gap-3 + lg:contents) ✓
  - .ai/tasks/active/keno-game.md (this artifact) ✓
- Approved scope (slice 5e — tile-state visual corrections + freeze-exit broadening):
  - src/games/keno/ui/keno-tile.tsx (FIX1: hit → dark bg + green contour; FIX2: drawn → red;
    TEXT_CLASSES hit→text-text, drawn→text-danger; canInteract comment updated) ✓
  - src/games/keno/ui/keno-grid.tsx (FIX3: remove selectedTiles.has guard — any tile exits freeze) ✓
  - .ai/tasks/active/keno-game.md (this artifact) ✓
- Approved scope (slice 5d — freeze-phase + overlay/exit + tile state visuals):
  - src/games/keno/ui/keno-tile.tsx (hit: bright green fill + glow; miss: red border; canInteract simplified) ✓
  - src/games/keno/ui/keno-grid.tsx (onExitFreeze prop; freeze-aware tile routing) ✓
  - src/games/keno/model/use-keno-game-controller.ts (remove resetRevealPhase from handleRevealSettled; add exitFreeze) ✓
  - src/games/keno/ui/keno-game.tsx (wire exitFreeze to KenoGrid; currentResult ?? revealResult to strip) ✓
  - .ai/tasks/active/keno-game.md (this artifact) ✓
- Approved scope (micro-fixes — post-review, 2026-06-24):
  - src/games/keno/model/use-keno-game-controller.ts (comment only — design decision) ✓
  - src/games/keno/ui/keno-result.tsx (comment only — design decision) ✓
  - src/widgets/game-detail/game-action-config.ts (remove placeholder marker from copy) ✓
  - src/games/keno/ui/keno-multiplier-strip.tsx (cumulative highlight 0..matchCount + lifetime fix) ✓
  - src/games/keno/ui/keno-game.tsx (pass revealedNumbers to strip, remove currentResult??revealResult) ✓
  - .ai/tasks/active/keno-game.md (this artifact) ✓
- Forbidden scope: everything outside the approved scopes above.

- Editable files (cumulative):
  - src/games/keno/model/keno-types.ts (new, slice 1)
  - src/games/keno/model/keno-client.ts (new, slice 1)
  - src/games/keno/model/keno-query.ts (new, slice 1)
  - src/app/api/games/keno/bet/route.ts (new, slice 1)
  - src/games/keno/config/keno-defaults.ts (new, slice 2; rows 1..9 filled, slice 5a)
  - src/games/keno/lib/keno-decimal.ts (new, slice 2)
  - src/games/keno/lib/keno-input.ts (new, slice 2)
  - src/games/keno/lib/keno-tiles.ts (new, slice 2)
  - src/games/keno/model/keno-store.ts (new, slice 3)
  - src/games/keno/model/use-keno-auto-bet.ts (new, slice 3)
  - src/games/keno/model/use-keno-game-controller.ts (new, slice 3)
  - src/games/keno/ui/keno-tile.tsx (new, slice 4; diamond.webp + leading fix, 5b)
  - src/games/keno/ui/keno-grid.tsx (new, slice 4)
  - src/games/keno/ui/keno-bet-amount-control.tsx (new, slice 5a; chip-green icon, 5b)
  - src/games/keno/ui/keno-bet-panel.tsx (new, slice 5a; modified 5b)
  - src/games/keno/ui/keno-multiplier-strip.tsx (new, slice 5a; Figma redesign 5b)
  - .ai/tasks/active/keno-game.md (this artifact)

- Editable files added in shell max-bet wiring (Pass 2):
  - src/widgets/game-detail/game-action-config.ts (modified — keno maxBetWarning)
  - src/games/keno/model/use-keno-game-controller.ts (modified — useMaxBetContract)
  - src/games/keno/ui/keno-game.tsx (modified — maxBetEnabled gate)
  - src/games/keno/ui/keno-bet-panel.tsx (modified — onMax optional)
  - src/games/keno/ui/keno-bet-amount-control.tsx (modified — conditional MAX button)

- Editable files added in shell turbo-mode wiring (Pass 1):
  - src/games/keno/config/keno-defaults.ts (modified — turbo timing constants)
  - src/games/keno/ui/keno-grid.tsx (modified — turbo prop)
  - src/games/keno/model/use-keno-game-controller.ts (modified — useTurboMode + auto-pick)
  - src/games/keno/ui/keno-game.tsx (modified — turboEnabled prop to KenoGrid)

- Editable files added in slice 5b:
  - src/app/globals.css (modified)
  - src/games/keno/ui/keno-bet-panel.tsx (modified)
  - src/games/keno/ui/keno-multiplier-strip.tsx (modified — full Figma redesign)
  - src/games/keno/ui/keno-tile.tsx (modified — diamond.webp + text leading)
  - src/games/keno/ui/keno-bet-amount-control.tsx (modified — chip-green replaces placeholder)
  - src/games/keno/ui/keno-result.tsx (new)
  - src/games/keno/ui/keno-game.tsx (new)
  - src/games/keno/index.ts (new)
  - src/app/games/[gameSlug]/page.tsx (modified)

- Context-only files:
  - feat/roulette-game:src/games/roulette/lib/roulette-decimal.ts (reference via git show)
  - feat/roulette-game:src/games/roulette/lib/roulette-bets.ts (reference via git show)
  - feat/roulette-game:src/games/roulette/lib/roulette-chips.ts (reference via git show)
  - feat/roulette-game:src/games/roulette/model/roulette-store.ts (slice 3 structural mirror)
  - feat/roulette-game:src/games/roulette/model/use-roulette-auto-bet.ts (slice 3 structural mirror)
  - feat/roulette-game:src/games/roulette/model/use-roulette-game-controller.ts (slice 3 structural mirror)
  - src/features/auto-bet/model/useAutoBetRunner.ts (shared, consumed directly)
  - src/games/dice/lib/dice-decimal.ts (BigInt precedent reference)
  - src/games/dice/lib/dice-input.ts (input normalisation precedent)
  - src/app/api/_lib/auth-backend.ts (shared helper, not changed)
  - src/app/api/_lib/auth-cookies.ts (shared helper, not changed)
  - src/features/balance/index.ts (balanceQueryKey, not changed)
  - docs/architecture/foundation-decisions.md (architecture reference)

- Known gap: KENO_MULTIPLIERS rows for pickCount 1..9 are undefined (TODO marked
  in keno-defaults.ts). Must be filled with verified values before the multiplier-
  strip UI can display anything for those pick counts.

## Source Of Truth

- Source-of-truth files inspected:
  - docs/architecture/foundation-decisions.md
  - src/app/api/games/roulette/bet/route.ts (primary structural mirror)
  - src/games/roulette/model/* (types/client/query pattern)
  - src/app/api/_lib/auth-backend.ts
- Architecture decisions:
  - Browser calls only local /api/* (never backend directly).
  - Backend URL, auth cookie forwarding remain server-side only.
  - TanStack Query owns server state; mutation invalidates balanceQueryKey on success.
  - Backend response is authoritative for outcome and payout.
  - 0-based tile indices used throughout wire layer; +1 display offset lives in UI only.
- Relevant rules: state-data-api-boundary.md, game-frontend-architecture.md, ai-workflow.md
- Relevant skills: implementation

## Wire Shapes (Verified Against Prod Payloads 2026-06-21)

- Request (browser → BFF → backend):
  ```json
  { "betSize": "1.00", "risk": "CLASSIC", "selected": [0,1,2,3,4,5,6,7] }
  ```
  - betSize: positive numeric string
  - risk: "CLASSIC" | "LOW" | "MEDIUM" | "HIGH" (UPPERCASE)
  - selected: 1–10 unique integers each in [0,39]

- Response (backend → BFF → browser), verified sample:
  ```json
  {
    "createdAt": "2026-06-21T15:51:22.098Z",
    "betId": "8e15e5a6-bec3-4d22-a778-a0f7ac3c6623",
    "betSize": "1",
    "payout": "2.2",
    "multiplier": 2.2,
    "results": [38,21,28,19,17,7,18,16,2,0]
  }
  ```
  - multiplier is a number (not string) — differs from roulette
  - results is always exactly 10 drawn 0-based indices

## Impact

- Docs impact:
  - src/app/api/games/keno/bet/route.ts maps to docs/architecture/foundation-decisions.md
    (ownership area: src/app/api/games/**).
  - src/app/globals.css maps to docs/architecture/foundation-decisions.md and
    docs/design/design-source-audit.md (ownership area: src/shared/ui/**, src/app/globals.css).
  - Docs impact: not needed — foundation-decisions.md and design-source-audit.md document
    complete, stable architectural decisions; updating them mid-task for each incremental Keno
    slice would be premature and would require re-updating as slices land. A single docs update
    will be recorded when the full Keno game module is complete at lifecycle close.
- API boundary impact:
  - New local BFF route POST /api/games/keno/bet created.
  - Browser client calls /api/games/keno/bet only (never backend directly).
  - Backend path ASSUMED-BY-ANALOGY as "/games/house/keno/bet" — must be verified.
  - Auth cookie forwarding via backendCookieHeader(["access_token"]) — same as roulette.
  - Balance invalidated via TanStack Query on success — same as roulette.
- UI QA requirement: Not applicable for this slice (no UI).
- Stack primitive checklist: Not applicable for this slice (no JSX).

## Validation Plan

- Planned commands: pnpm lint && pnpm build
- Manual checks:
  - API boundary check: browser client calls /api/* only ✓
  - Scope check: no files outside approved scope ✓
  - 0-based index rule: no +1 offset anywhere in this layer ✓
- Skipped checks and reasons:
  - pnpm check:docs: deferred — docs update is explicitly non-goal for slice 1.
    Will be enforced in the final slice before lifecycle close.

## Evidence

- Commands run:
  - Slice 1: `pnpm lint` → 0 errors, 1 pre-existing warning in main-nav.tsx (unrelated)
  - Slice 1: `pnpm build` → compiled successfully; ƒ /api/games/keno/bet in route manifest;
    TypeScript finished with no errors
  - Slice 2: `pnpm lint` → 0 errors, same 1 pre-existing warning only
  - Slice 2: `pnpm build` → compiled successfully; TypeScript finished with no errors
  - Slice 3: `pnpm lint` → 0 errors, same 1 pre-existing warning only
  - Slice 3: `pnpm build` → compiled successfully; TypeScript finished with no errors
  - Slice 4: `pnpm lint` → 0 errors, same 1 pre-existing warning only
  - Slice 4: `pnpm build` → compiled successfully; TypeScript finished with no errors
  - Slice 5a: `pnpm lint` → 0 errors, same 1 pre-existing warning only (main-nav.tsx)
  - Slice 5a: `pnpm build` → compiled successfully; TypeScript finished with no errors
  - Slice 5b (initial): `pnpm lint` → 0 errors, same 1 pre-existing warning only (main-nav.tsx)
  - Slice 5b (initial): `pnpm build` → compiled successfully; TypeScript finished with no errors;
    /games/keno confirmed in static-params route manifest (/games/[gameSlug])
  - Slice 5b (asset + Figma pass): `pnpm lint` → 0 errors, same 1 pre-existing warning
  - Slice 5b (asset + Figma pass): `pnpm build` → compiled successfully; TypeScript clean;
    /games/keno confirmed in manifest; chip-green.svg + diamond.webp bundled
  - Slice 5c (animation timing pass): `pnpm validate` → lint 0 errors (1 pre-existing
    main-nav.tsx warning); build compiled successfully; TypeScript clean; check:docs passed
  - Slice 5d (freeze-phase + tile state visuals): `pnpm validate` → lint 0 errors (1 pre-existing
    main-nav.tsx warning); build compiled successfully; TypeScript clean; check:docs passed
  - Slice 5e (tile-state visual corrections + freeze-exit broadening): `pnpm validate` → lint 0
    errors (1 pre-existing main-nav.tsx warning); build compiled successfully; TypeScript clean;
    check:docs passed
  - Slice 5f (mobile layout correction): `pnpm validate` → lint 0 errors (1 pre-existing
    main-nav.tsx warning); build compiled successfully; TypeScript clean; check:docs passed
  - Slice 5g (bet-control full-width fix): `pnpm validate` → lint 0 errors (1 pre-existing
    main-nav.tsx warning); build compiled successfully; TypeScript clean; check:docs passed
  - Shell max-bet wiring (Pass 2): `pnpm validate` → lint 0 errors (1 pre-existing
    main-nav.tsx warning); build compiled successfully; TypeScript clean; check:docs passed
  - Shell turbo-mode wiring (Pass 1): `pnpm validate` → lint 0 errors (1 pre-existing
    main-nav.tsx warning); build compiled successfully; TypeScript clean; check:docs passed
- Review evidence: Cumulative review completed 2026-06-24 covering all slices 1–5g + turbo Pass 1 + max-bet Pass 2.
  Result: PASS — no blocking findings. See review report below.

  ### Review Findings (2026-06-24)

  #### BLOCKING
  None.

  #### HIGH — should resolve before ship (not commit-blocking)
  - [HIGH] keno-result.tsx:21 + use-keno-game-controller.ts:95 — Win overlay condition
    `result.multiplier > 0` triggers for LOW pick=1 match=0 (multiplier=0.7) and MEDIUM
    pick=1 match=0 (multiplier=0.4). Both are net-loss outcomes (payout < betSize) but
    display a Trophy overlay with a "0.7x" or "0.4x" multiplier. The design comment says
    "Overlay only for wins" — with sub-1x multipliers this is misleading. Fix:
    change `multiplier > 0` to `Number(result.payout) > Number(result.betSize)` (or
    `multiplier > 1`) in both use-keno-game-controller.ts:95 and keno-result.tsx:21.
    Needs product confirmation before changing (game may intentionally count any payout
    as a "partial win" worthy of acknowledgment).

  #### MEDIUM — fix before deploy / product decision
  - [MEDIUM] game-action-config.ts:180 — maxBetWarning body contains the literal string
    "[confirm copy at ui-qa]" which is user-visible text in the Enable Max Bet modal.
    Known TODO carried into commit per user decision. Must be finalized before deploy.
  - [MEDIUM] keno-multiplier-strip.tsx:90 + keno-result.tsx:43 — Hard-coded inline hex
    `linear-gradient(to bottom, #0a271a, #39b17d)` in two separate components. No @theme
    token for these gradient stops. Flagged in task artifact as future design-token
    alignment. Must be tokenized before final ship.
  - [MEDIUM] keno-result.tsx:33 — Hard-coded inline `rgba(14,18,28,0.8)` backdrop.
    No @theme token for this opacity variant. Flagged for future alignment.
  - [MEDIUM] globals.css:4 vs globals.css:39-41 — File comment says "Domain/game colors
    (§1.2) are intentionally excluded" but accent-blue/yellow are added under the comment
    "Keno accent tokens." Token names are generic (not keno-prefixed) so the tokens
    themselves are acceptable; the inline comment creates a misleading contradiction.
    Update the comment to clarify these are general design-system accent colors first used
    for keno, not keno-only exclusions.

  #### LOW — notes / nits
  - [LOW] keno-tile.tsx:192 — `leading-none` appears in both the base class string and
    the font-size/leading class string. Redundant, harmless; can be cleaned up.
  - [LOW] route.ts:56–62 — `isPositiveNumericString` accepts scientific notation (e.g.
    "1e5") since `Number("1e5") = 100000`. The trimmed betSize is forwarded to the
    backend as-is; backend must validate. Not a security issue (BFF validates it is
    a positive number; backend is authoritative). Minor note.
  - [LOW] route.ts:38–43 — `backendBetError` re-uses the backend's HTTP status code
    directly. A backend 5xx would propagate to the client rather than normalizing to 502.
    Consider clamping non-4xx backend errors to 502 for consistency with
    `invalidBackendResponse`.

  #### Accepted / known items — confirmed present
  - Backend path ASSUMED-BY-ANALOGY ("/games/house/keno/bet") flagged in route.ts:5-7
    and task artifact risks section ✓
  - revealResultRef/revealResolveRef hang if unmounted: accepted, mirrors roulette ✓
  - Balance check one-render lag in auto-bet closure: accepted ✓
  - Diamond + coin assets wired (chip-green.svg, diamond.webp) ✓
  - UI QA skipped (accepted risk — see below) ✓
  - MAX-BET wiring known TODO — placeholder copy is the only remaining gap ✓

  #### Accepted risk: UI QA skipped
  Per user decision, qualitative/browser UI QA is not run in this review cycle.
  The following remain [inferred] and unverified against a running browser:
    • Tile states vs. Figma screenshots (hit dark bg + green glow; drawn red; idle neutral).
    • Mobile 320px / 375px tile sizing (fluid approach, not pixel-verified).
    • Bet-control full-width at mobile (order-2 lg:hidden sibling, not browser-confirmed).
    • Freeze transitions (board holds on win/loss; overlay dismiss; tile-click exit-freeze).
    • Turbo timing experience (0ms stagger, 150ms total sequence).
    • Multiplier strip achieved-cell highlight (opacity-40 dim + ring-primary).
    • Win overlay at exactly 0.7x / 0.4x (sub-1x, LOW/MEDIUM risk — see HIGH finding above).
    • maxBetWarning modal copy (placeholder text confirmed above).
    • Duplicate KenoBetPanel DOM instances (a11y: two sets of form controls visible in
      the DOM; only one visible via CSS; tabIndex=-1 guards in auto mode. Confirm no
      screen-reader duplication.)
  This accepted risk must be resolved before production deploy.

  #### Mandatory checks per review prompt (all verified):
  1. BFF trust boundary — route.ts: betSize positive numeric string ✓; risk ∈ 4 UPPERCASE
     values ✓; selected 1–10 unique ints in [0,39] ✓; uniqueness checked ✓; results
     exactly 10 valid 0-based indices ✓; multiplier finite number ✓; strings for
     betId/createdAt/betSize/payout ✓. Backend path flagged ASSUMED-BY-ANALOGY ✓.
     Browser never calls backend directly ✓; auth cookie server-side only ✓.
  2. Cross-game isolation — grep over src/games/keno confirms zero imports from
     roulette/plinko/dice game internals ✓.
  3. 0-based index integrity — sole +1 is tileLabel(index) in keno-tiles.ts:114 ✓.
     All other layers (selected[], results[], revealedNumbers[], matchCount filters)
     use raw 0-based indices ✓.
  4. Reveal-settled completion contract — handleRevealSettled fires on last tile in both
     normal (200ms stagger × 10 + 320ms + 600ms) and turbo (0ms × 10 + 50ms + 100ms)
     paths ✓. Auto-bet runner's await onRevealRequired resolves via revealResolveRef ✓.
     Infinite diamond pulse (motion repeat:Infinity) is purely CSS/animation-frame, not
     a Promise — does NOT gate handleRevealSettled ✓.
  5. Turbo wiring — 3 reveal timings derived from turbo flag at reveal-start ✓; captured
     once (turbo excluded from useEffect deps, eslint-disable documented) ✓; auto-pick
     step 0ms ✓; pulse/freeze/auto-bet-delay unchanged ✓; 50ms post-reveal floor ✓.
  6. Freeze phase — board freezes (isRevealComplete=true, revealResult=null) for win AND
     loss ✓; win shows overlay (multiplier>0 — see HIGH finding), loss does not ✓; exits
     via dismissOverlay (overlay only) / handleBet clearReveal / any tile exitFreeze ✓.
     No mixed frozen+live state ✓.
  7. Tile-state visual logic — hit: dark bg + green contour glow (no green fill) ✓; drawn
     = red (same visual as miss, logical state preserved for match counting) ✓; idle:
     neutral dark ✓. TEXT_CLASSES hit→text-text for diamond readability ✓.
  8. Multiplier table — full pickCount 1..10 for all 4 risks ✓; row lengths = pickCount+1
     ✓; non-zero match-0 rows (LOW pick=1: 0.7, MEDIUM pick=1: 0.4) intact ✓; strip
     display-only (payout from backend) ✓.
  9. Theme tokens — 3 inline hex exceptions (keno-multiplier-strip.tsx:90,
     keno-result.tsx:43, keno-result.tsx:33) — no @theme token exists for these values,
     flagged ✓. All other keno colors use CSS token references ✓.
  10. Decimal safety — BigInt throughout keno-decimal.ts ✓; multiplier (number) display-
      only (never mixed into decimal-safe string math) ✓; keno-input.ts uses Number()
      only for intermediate halve/double arithmetic before re-entering BigInt via
      formatMoney — safe at 8-decimal SCALE ✓.
- Pre-commit evidence: (to be filled before commit)
- UI QA evidence: not applicable (slice 1)
- API boundary evidence: manual — browser client calls /api/games/keno/bet only;
  backendFetch in route.ts calls BACKEND_KENO_BET_PATH server-side only

## Risks And Handoff

- Risks:
  - Backend path "/games/house/keno/bet" is ASSUMED-BY-ANALOGY from roulette.
    Wrong path produces 404/503 at runtime; easily fixed once backend docs confirmed.
  - results array length enforced as exactly 10 in normalizer — if backend varies
    (e.g. returns fewer on edge cases), normalizer will reject and return 502.
    Can be relaxed to >= 1 if needed after backend confirmation.
- Handoff:
  - Slice 1 complete: BFF route, types, client, query.
  - Slice 2 complete: config (keno-defaults.ts), lib (keno-decimal, keno-input, keno-tiles).
  - Slice 3 complete: store (keno-store.ts), auto-bet hook (use-keno-auto-bet.ts),
    game controller (use-keno-game-controller.ts).
  - Slice 4 complete: KenoTile (keno-tile.tsx), KenoGrid (keno-grid.tsx).
    Inferred decisions pending ui-qa:
      • drawn state visual (no Figma node; muted neutral treatment)
      • mobile tile size clamp(39px, 10.4vw, 67px) from node 4107:124226
      • mobile gap 3px (from node 4107:124226)
      • diamond asset slot placeholder (data-keno-diamond span) pending WebP
  - Slice 5a complete: keno-defaults.ts (rows 1..9 filled), keno-bet-amount-control.tsx,
    keno-bet-panel.tsx, keno-multiplier-strip.tsx.
  - Slice 5b complete (full pass including Figma board comparison + real assets):
      • globals.css: accent-blue (#2563EB) + accent-yellow (#FACC15) @theme tokens.
      • keno-bet-panel.tsx: token swap, mode lift, inner form→div.
      • keno-multiplier-strip.tsx: complete Figma redesign — two-card cells (green
        gradient header from-[#0a271a] to-[#39b17d] + dark gradient body from-surface-3
        to-border-2), chip-green.svg icon in header, gap-[6px], achieved-cell dimming
        opacity-40 + ring-1 ring-primary highlight. Matches Figma node 4047:70842.
      • keno-tile.tsx: diamond.webp wired (absolute fill overlay, opacity-75, p-1.5
        padding, below number z-10); text leading-none → lg:leading-[24px] per Figma.
      • keno-bet-amount-control.tsx: placeholder CoinIcon removed; chip-green.svg used.
      • keno-result.tsx: win overlay with chip-green.svg (payout) + diamond.webp (match
        count); no placeholder spans remain.
      • keno-game.tsx: root composition (new). keno/index.ts (new). page.tsx: KenoGame
        mounted on slug "keno".
    Game is live on /games/keno. All placeholder asset slots resolved.

    Remaining [inferred] items for ui-qa confirmation:
      • Win overlay: no explicit Figma loss state — loss shows nothing [inferred correct].
      • Multiplier strip green gradient (#0a271a → #39b17d): no @theme token; uses
        inline style — flagged for future design-token alignment.
      • Multiplier strip achieved-cell: opacity-40 dim + ring-primary highlight [inferred].
        Confirm feel vs full dim at ui-qa.
      • Diamond overlay on hit tile: absolute fill, p-1.5, opacity-75 — [inferred sizing].
        Exact diamond position/size vs Figma hit node 3986:44638 to be confirmed at ui-qa.
      • Tablet/mobile panel: two KenoBetPanel DOM instances (one lg:hidden, one
        hidden lg:block) — only one visible at a time; confirm no a11y regressions.
      • keno-result overlay backdrop: raw rgba hex at 80% opacity — no @theme token
        for this opacity variant; flagged for future alignment.

  - Slice 5d complete (freeze-phase + overlay/exit + tile state visuals):
      • keno-tile.tsx: hit state → bright green fill (from-primary-tint to-primary) + stronger
        glow (shadow 20px 80% primary). miss state → added border border-danger/60.
        canInteract: removed state gate; contract is that KenoGrid passes onToggle only to
        interactive tiles, so KenoTile doesn't need to re-check state.
      • keno-grid.tsx: onExitFreeze? prop added. isFrozen = isRevealComplete && revealResult===null.
        Per-tile routing: freeze → selected tiles get exitFreeze handler, others get undefined;
        normal → all tiles get onToggleTile.
      • use-keno-game-controller.ts: handleRevealSettled no longer calls resetRevealPhase();
        isRevealComplete stays true after settle → freeze phase. exitFreeze(index) added:
        calls clearReveal + setCurrentResult(null) + setPulsingTiles(new Set()) + toggleTile(index).
      • keno-game.tsx: exitFreeze destructured + passed as onExitFreeze to KenoGrid.
        KenoMultiplierStrip receives currentResult ?? revealResult so the achieved-cell
        highlight persists through the freeze phase when revealResult is null.

    Freeze-phase behaviour summary:
      WIN: board freezes (hit=green, miss=red, drawn=neutral) + win overlay card shown.
           Pulse continues on hit tiles. Multiplier strip shows achieved match.
           Exit triggers: (1) click overlay backdrop → dismiss card, board stays frozen;
           (2) click Bet → clearReveal + new round; (3) click selected tile → exitFreeze.
      LOSS: board freezes same way, no overlay card. Pulse on any hit tiles.
           Exit triggers: (2) click Bet; (3) click selected tile.

  - Slice 5e complete (tile-state visual corrections + freeze-exit broadening):
      • keno-tile.tsx FIX 1: hit state reverts from green fill to dark bg
        (from-surface-3 to-border-2) + green contour border (primary/60) + outer
        glow shadow (primary/80). Diamond glyph renders clearly on dark background.
        TEXT_CLASSES hit: text-on-primary → text-text (light number visible under diamond).
      • keno-tile.tsx FIX 2: drawn state visual converges to red (bg-danger/10 +
        border-danger/60 + text-danger) — same as miss. Every in-results position
        without a diamond is red; every not-in-results position stays dark neutral.
        Logical state value "drawn" unchanged so match-counting remains correct.
      • keno-grid.tsx FIX 3: freeze-exit routing broadened — removed selectedTiles.has(i)
        guard. During freeze, ALL tiles receive onExitFreeze handler. Click on any
        tile (hit/miss/drawn/idle during freeze) exits freeze + toggles that index:
        select if empty, deselect if was selected. Normal selection rules resume.

    State-visual model FINALIZED:
      hit    = selected ∩ results     → dark bg + green glow/border + diamond + pulse
      miss   = selected \ results     → red bg + red border
      drawn  = results \ selected     → red bg + red border  (same visual as miss)
      idle   = ¬selected ∧ ¬results  → dark neutral (unchanged, never red)
      selected (during reveal)        → green fill (pre-settle state, transient)

  - Slice 5f complete (mobile layout correction per Figma node 4107:124226):
      • keno-tile.tsx: tile size changed from `clamp(39px,10.4vw,67px)` to
        `w-full aspect-square` on mobile; `lg:size-[67px] lg:aspect-auto` unchanged.
        Tiles now fill their grid column proportionally — ≈41px@375px, ≈34px@320px —
        no horizontal overflow. Matches Figma's 42px tiles [inferred: fluid responsive
        approach replaces Figma's fixed 42px since Figma frame is ~414px].
      • keno-grid.tsx: gap changed from flat `gap-[4.75px]` to `gap-[2px]` on mobile,
        `md:gap-[4.75px]` restores desktop value. Grid width: `w-full` on mobile
        (was `w-fit`), `md:w-fit md:mx-auto` restores tablet/desktop behaviour.
      • keno-game.tsx: grid+strip wrapper changed from `w-fit flex-col gap-4 mx-auto`
        to `flex flex-col gap-4 w-full md:w-fit md:mx-auto`. Tablet/desktop unchanged.
      • keno-bet-panel.tsx: section gets `max-md:rounded-none` (removes rounded-l-xl
        on mobile; Figma betcontrol is full-width with no rounding) and `max-md:px-4`
        (reduces horizontal padding from 24px to 16px, matching Figma px-16px).
        Bet CTA + Clear/AutoPick wrapped in `div.order-1.flex.flex-col.gap-3.lg:contents`:
        gap between Bet CTA and action row is now 12px on mobile (was 24px; Figma
        btns group gap-12px). At lg+, `display:contents` makes children direct
        section-flex items with `lg:order-6` / `lg:order-5` — desktop layout unchanged.

    Overflow verification:
      375px: tiles = (375 - 32 - 7×2) / 8 = 329/8 ≈ 41px — no overflow ✓
      320px: tiles = (320 - 32 - 14) / 8 = 34.25px — no overflow ✓
      Desktop (lg): tiles fixed at 67px via `lg:size-[67px]` — unchanged ✓

    [inferred] metrics for ui-qa confirmation:
      • Tile size on mobile: fluid ~41px@375px (Figma shows 42px at 414px frame — close match).
      • Grid outer padding on mobile: inherits outer container p-4 (16px); Figma shows p-32px
        on game board section at larger frame. Net result: similar visual spacing.
      • Panel px on mobile: 16px (max-md:px-4); Figma betcontrol px-16px — matches exactly ✓.
      • Tablet (md–lg): md: breakpoint restores gap-[4.75px], w-fit mx-auto, rounded-l-xl,
        p-6 — tablet layout unchanged from slice 5b.

  - Slice 5g complete (bet-control full-width fix, tablet + mobile):
      • keno-game.tsx: removed `<div className="lg:hidden"><KenoBetPanel /></div>` from
        inside the right-area div (which has `p-4 md:p-6`, constraining panel width).
        Added it as a direct <form> child: `<div className="order-2 lg:hidden">`.
        Below lg the <form> is a single-column grid; this new child occupies the full
        column width without inheriting the board container's padding. At lg+ it is
        `display:none` — desktop two-column layout unaffected.
        Figma confirmation: tablet node 4107:111884 "bet control" is a direct sibling
        of node 4107:111875 "board", both children of the same column container, each
        with their own `w-full` / `w-[768px]`. Mobile node 4107:131250 "betcontrol"
        is likewise a direct sibling of the "game board" section.
      • Right-area div now contains only: grid+strip wrapper + KenoResult overlay.
        Board padding (p-4 md:p-6), radial gradient, and relative positioning unchanged.

  - Shell max-bet wiring (Pass 2) complete:
      • game-action-config.ts: keno entry added to maxBetWarningContent. Copy is
        balance-aware ("full available balance with one click") — no fixed numeric cap.
        [confirm copy at ui-qa]. This flips the settings panel from VisualSwitch
        (non-interactive) to InteractiveSwitch + MaxBetWarningModal for Keno.
      • use-keno-game-controller.ts: imports and calls useMaxBetContract(). Exposes
        maxBetEnabled: maxBet.enabled in return. handleMaxBet unchanged — ceiling
        remains maxBetAmount(balance) = full balance. No activeMaxBet cap applied.
      • keno-game.tsx: destructures maxBetEnabled. panelProps.onMax is now
        maxBetEnabled ? handleMaxBet : undefined (as const assertion removed to allow
        the union type). Both KenoBetPanel instances receive the gated onMax.
      • keno-bet-panel.tsx: onMax made optional (onMax?: () => void). Passes through
        to KenoBetAmountControl unchanged.
      • keno-bet-amount-control.tsx: onMax made optional. ½ and 2X remain in the static
        map. MAX button rendered separately with {onMax ? <button>MAX</button> : null}.
    Single source of truth: shell contract owns gate (visibility); keno lib owns amount
    (balance). No competing max-bet ceiling. No phantom 100k/500k cap for Keno.
    Validation: pnpm validate → lint 0 errors (1 pre-existing main-nav.tsx warning);
      build compiled successfully; TypeScript clean; check:docs passed.
  - Shell turbo-mode wiring (Pass 1) complete:
      • keno-defaults.ts: 4 turbo timing constants added alongside normal ones:
        KENO_AUTOPICK_STEP_TURBO_MS=0, KENO_REVEAL_STEP_TURBO_MS=0,
        KENO_POST_REVEAL_SETTLE_TURBO_MS=50, KENO_FINALISE_TO_SETTLED_TURBO_MS=100.
        Existing KENO_POST_REVEAL_SETTLE_MS=320 and KENO_FINALISE_TO_SETTLED_MS=600
        promoted from keno-grid.tsx inline constants to named exports.
      • keno-grid.tsx: `staggerMs?: number` prop replaced with `turbo?: boolean`.
        All three reveal timings (stagger, post-reveal settle, finalise-to-settled)
        derived inside the component from the turbo flag using the named constants.
        Turbo is captured once at reveal start; mid-reveal toggles intentionally
        ignored (turbo excluded from useEffect deps — design unchanged).
      • use-keno-game-controller.ts: calls useTurboMode() at hook top; handleAutoPick
        uses turboEnabled ? KENO_AUTOPICK_STEP_TURBO_MS (0) : KENO_AUTOPICK_STEP_MS (150).
        turboEnabled exposed in return object.
      • keno-game.tsx: destructures turboEnabled from controller; passes turbo={turboEnabled}
        to KenoGrid.
    Timing summary (normal → turbo):
      reveal stagger:        200 ms → 0 ms
      post-reveal settle:    320 ms → 50 ms
      finalise-to-settled:   600 ms → 100 ms
      auto-pick step:        150 ms → 0 ms
      diamond pulse:         2000 ms → 2000 ms (unchanged)
      auto-bet inter-round:  800 ms → 800 ms (unchanged)
    Reveal-settled contract preserved: handleRevealSettled still fires; auto-bet
    runner's await onRevealRequired(result) still resolves. Total turbo sequence ~150 ms.
    Validation: pnpm validate → lint 0 errors (1 pre-existing main-nav.tsx warning);
      build compiled successfully; TypeScript clean; check:docs passed.
    - Micro-fixes pass (2026-06-24, post-review):
      • FIX 1 (comment only — no logic change): Trophy overlay condition `multiplier > 0`
        is INTENTIONAL PRODUCT DESIGN. Sub-1x returns (LOW pick=1: 0.7x, MEDIUM pick=1:
        0.4x) intentionally surface the overlay — any non-zero payout is acknowledged.
        Comments added at use-keno-game-controller.ts:95 and keno-result.tsx:21 to record
        this decision explicitly. No code change.
      • FIX 2: Removed placeholder marker "[confirm copy at ui-qa]" from
        game-action-config.ts keno maxBetWarning body. Final copy:
        "Max Bet in Keno lets you set your bet amount to your full available balance
        with one click."
      • FIX 3: keno-multiplier-strip.tsx cumulative highlight: changed from single-cell
        (exact matchCount) to 0..matchCount inclusive run. Cells 0 through the achieved
        match index all receive a lighter lower-block bg (bg-surface-3 vs normal
        from-surface-3 to-border-2 gradient). The exact match cell additionally retains
        ring-1 ring-primary on the outer div. Cells beyond matchCount remain opacity-40.
        isCumulative derives from `highlightedIndex !== undefined && matchCount <= highlightedIndex`.
        No hard-coded hex. Freeze/reveal behavior unchanged.
        Highlight lifetime fix: strip's revealResult prop replaced with revealedNumbers
        (the store array). revealedNumbers persists through the full freeze phase —
        cleared only by clearReveal() on next bet or freeze exit — so the cumulative
        highlight survives overlay dismiss. keno-game.tsx updated to pass
        revealedNumbers={revealedNumbers} instead of revealResult={currentResult ?? revealResult}.
        KenoBetResult import removed from strip (no longer needed).
      Validation: pnpm validate → lint 0 errors (1 pre-existing main-nav.tsx warning);
        build compiled successfully; TypeScript clean; check:docs passed.
- Next: ui-qa → pre-commit gates.
- Lifecycle close notes: deferred — multi-slice task; close after all slices land.
