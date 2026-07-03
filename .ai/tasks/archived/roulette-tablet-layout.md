# Task: Roulette Tablet Layout (md–lg Single-Column)

**Date:** 2026-06-19
**Branch mode:** Local / no new branch — continuing existing feature branch
**Base branch:** develop
**Task branch:** feat/roulette-game (pre-existing)
**Current branch at task start:** feat/roulette-game
**Skill:** implementation

---

## Goal

Add a tablet-breakpoint (md–lg) single-column responsive layout for the roulette game controls, distinct from the existing desktop (lg+) two-column layout. No change to desktop layout or behavior.

## Scope

### Editable files

| File | Change |
|---|---|
| `src/games/roulette/ui/roulette-game.tsx` | Hoist `betMode` state; change grid breakpoint to `lg:`; hide desktop panel at md–lg; add tablet controls block below board; pass `onClear`/`clearDisabled` to `RouletteTable` |
| `src/games/roulette/ui/roulette-bet-panel.tsx` | Accept `mode`/`onModeChange` props; remove local `mode` state |
| `src/games/roulette/ui/roulette-table.tsx` | Add `onClear`/`clearDisabled` props; render Clear/Undo icon buttons at end of parity row (`flex lg:hidden`) |
| `.ai/tasks/active/roulette-tablet-layout.md` | This artifact |

### Context-only files (not edited)

- `src/games/roulette/renderer/**` — animation work, out of scope
- `src/games/roulette/ui/roulette-wheel.tsx` — wheel visual, out of scope
- `src/games/roulette/ui/roulette-wheel-ball.tsx` — ball animation, out of scope
- All other roulette files

## Non-goals

- No desktop (lg+) layout change.
- No `<md` mobile layout (deferred).
- No wheel/ball/renderer animation changes.
- No bottom fullscreen/settings/Provably Fair row.
- No new assets.

---

## Breakpoint Strategy

| Range | Layout |
|---|---|
| `lg+` (≥1024px) | Existing two-column grid: 22rem left panel + minmax right area. `RouletteBetPanel` renders in the left column. |
| `md–lg` (768px–1023px) | New single-column stack: Wheel → Board (Clear/Undo at end of parity row) → Bet (full-width) → Chip Value/Bet Amount → 10 chips → Manual/Auto toggle. `RouletteBetPanel` is `hidden`. |
| `<md` (<768px) | Inherits the md–lg single-column stack (temporary acceptable state; proper mobile layout is a separate future task). |

Grid class change: `md:grid-cols-[22rem_minmax(0,1fr)]` → `lg:grid-cols-[22rem_minmax(0,1fr)]`

---

## Clear/Undo Repositioning Strategy

Clear and Undo are **not duplicated** — they use a two-DOM-location pattern with a single shared state:

- **Desktop (lg+):** rendered inside `RouletteBetPanel`'s "Choose action" section (existing). `RouletteBetPanel` wrapper is `hidden lg:block`, so these are only in the DOM and visible at lg+.
- **Tablet (md–lg):** icon-only Clear/Undo buttons rendered at the end of `RouletteTable`'s parity row, gated by `flex lg:hidden`. They receive `onClear` and `clearDisabled` props that flow from `useRouletteGameController` via `roulette-game.tsx` — the same `clearBets` function and the same `clearDisabled` derivation. No state is duplicated.

Both render points call the exact same `clearBets` handler. `clearDisabled` is computed once in `RouletteGame` and threaded to both locations.

## Other Moved Controls: Shared-State Pattern

The remaining tablet controls (Bet button, Chip Value/Bet Amount row, ChipTray, Mode toggle) are rendered in a `lg:hidden` block inside the right column. The desktop `RouletteBetPanel` (hidden at tablet via `hidden lg:block` on its wrapper) renders the same controls for lg+.

Both use:
- Same `betMode` state hoisted to `RouletteGame` (passed as `mode` prop to `RouletteBetPanel`; used directly in tablet block).
- Same controller handlers (`startAutoBet`, `stopAutoBet`, `setSelectedChip`, etc.).
- Same derived values (`betCtaDisabled`, `selectedChipData`, `clearDisabled`).

Style constants (`DISABLED_FILL`, `ACTIVE_TAB`) are duplicated as string literals in `roulette-game.tsx` — same definition as in `roulette-bet-panel.tsx`, acceptable since they're pure CSS strings with no runtime logic.

---

## Stack Primitive Checklist

- Entrypoint: `roulette-game.tsx` remains thin — layout restructuring only.
- No new state stores; `betMode` is a local `useState` in `RouletteGame` (pure UI tab state).
- No new query hooks or API calls.
- Existing handlers (`clearBets`, `startAutoBet`, etc.) unchanged.
- Tailwind responsive utilities used for breakpoints (project standard). ✓

---

## Docs Impact

Layout change within an existing game module. No new architectural pattern introduced. `docs/architecture/foundation-decisions.md` maps `src/games/**` as a blocking area but no structural ownership change occurs — the game module folder structure is unchanged. Docs-not-needed rationale: this is a CSS/JSX responsive layout adjustment within existing `roulette/ui/` ownership; no new module, API, or pattern.

## API Boundary Impact

None. No API calls, BFF routes, or server boundary changes.

## UI QA Impact

Manual QA required at three widths:

- **lg+ (≥1024px):** Desktop two-column layout unchanged — left panel has mode toggle, chip info, chip tray, choose action (Clear/Undo), Bet; right area has wheel and board.
- **md–lg (768px–1023px):** Single column — Wheel → Board (Clear/Undo icon buttons at end of parity row) → full-width Bet → Chip Value/Bet Amount → 10 chips → Manual/Auto toggle.
- **<md (<768px):** Inherits md–lg single-column stack (acceptable temporary state).
- Clear/Undo same behavior at all widths; same disabled gating; no double-trigger.

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Desktop layout regression if grid breakpoint change breaks 2-col | HIGH | Grid stays `lg:grid-cols-[22rem_minmax(0,1fr)]`; panel wrapper `hidden lg:block lg:order-1` restores it at lg+ |
| `betMode` sync between desktop panel and tablet block | MEDIUM | Single state in `RouletteGame`; both render points are controlled by it; no local state in either |
| Tablet Clear/Undo calling stale handler | LOW | `onClear` passed from `roulette-game.tsx` directly from controller; same reference as desktop |
| Auto-bet "Number of bets" input missing on tablet | LOW | Not in tablet spec; users can use auto-bet without setting a count (session runs until stopped) |

---

## Validation

`pnpm validate` — **passed** (2026-06-19).
- `git diff --check`: clean
- `pnpm lint`: 0 errors; 1 pre-existing warning in `main-nav.tsx` (unrelated to this task)
- `pnpm build`: compiled successfully in 29.0s; TypeScript finished with 0 errors
- `pnpm check:docs`: passed; active task artifact rationale found for `src/games/**`

Manual UI QA — pending (requires browser at three widths: lg+, md–lg, <md).
