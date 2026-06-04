# Design Source Audit — quantum-play (Task 1)

## Purpose

This document is the consolidated output of **Task 1 — Design source intake / Figma audit**.
It is the **source-of-reference input for Phase 2 implementation tasks** (Design System
Foundation, then App Shell scaffold). A future implementer who never saw the audit
conversation must be able to act on this document alone.

## Status

- **Task 1: complete.** Audit-only — no code, no repository files, no git were produced.
- Built from two passes: **Pass 1** (screen/layout/primitive/widget audit, eyeballed) and
  **Pass 2** (Figma Inspect/Dev-Mode confirmation: tokens, Outfit font, nav labels).
- **Pass 2 overrides Pass 1 wherever they conflict** — Pass 2 values are Inspect-confirmed;
  Pass 1 colors/radii were eyeballed from screenshots.
- Tag convention below: `[confirmed: Inspect]` = read from the Inspect file;
  `[inferred]` = derived/assumed, not directly measured.
- Supersession note: this audit preserves the original design-source findings. Its
  "auth modal UI only" and "real auth/BFF excluded" statements are no longer current
  architecture after Local Auth Integration. Use `docs/architecture/auth.md` for the
  implemented auth/BFF state.

---

## 1. Confirmed design tokens

CSS-variable candidates for a **single dark theme**. Values map closely onto the **Tailwind
default palette** (green/purple/yellow/gray ramps) over a custom navy base — Phase 2 can lean
on Tailwind tokens plus a thin custom layer rather than a bespoke palette.

### 1.1 Global colors

```txt
/* Backgrounds & surfaces */
--color-bg            #0A0D19   [confirmed: Inspect]  app base (root, sidebar)
--color-surface       #0E121C   [confirmed: Inspect]  header/top bar, panels
--color-surface-2     #11121A   [confirmed: Inspect]  deep content surface
--color-surface-3     #1B1F26   [confirmed: Inspect]  cards / elevated; also used as hairline
--color-control       #131517   [confirmed: Inspect]  input & balance-pill fill
--color-row           #0E1519   [confirmed: Inspect]  table row surface (bets feed)

/* Borders */
--color-border        #1B1F26   [confirmed: Inspect]  default hairline
--color-border-2      #2B303B   [confirmed: Inspect]  lighter border / gradient pair

/* Text */
--color-text             #FDFDFD  [confirmed: Inspect]  primary
--color-text-muted       #C7CBD4  [confirmed: Inspect]  secondary
--color-text-subtle      #6B7280  [confirmed: Inspect]  tertiary / disabled
--color-text-placeholder #566374  [confirmed: Inspect]  input placeholder
--color-on-primary       #07111A  [confirmed: Inspect]  text on green button

/* Primary (green) — Tailwind green family */
--color-primary        #22C55E   [confirmed: Inspect]  green-500, CTAs / active
--color-primary-hover  #16A34A   [confirmed: Inspect]  green-600
--color-primary-press  #15803D   [confirmed: Inspect]  green-700
--color-primary-tint   #4ADE80   [confirmed: Inspect]  green-400 (gradient top)
--color-primary-soft   #86EFAC   [confirmed: Inspect]  green-200
--color-primary-softer #DCFCE7   [confirmed: Inspect]  green-100

/* Accent (purple) */
--color-accent         #7E22CE   [confirmed: Inspect]  purple-700 (active tab underline)

/* Feedback */
--color-danger         #DC2626   [confirmed: Inspect]  red-600 (error)
```

> Correction applied: the former two-value `--color-primary-soft (#86EFAC / #DCFCE7)` is now
> split into `--color-primary-soft #86EFAC` and `--color-primary-softer #DCFCE7`.

### 1.2 Domain / game-scoped colors — **NOT GLOBAL**

These are **not** part of the shared token layer. They belong to `src/games/<game>/config`
(or the catalog-card / currency / auth-social config that owns them). Do **not** promote these
into `globals.css` design tokens.

```txt
Catalog card accent borders:
  Dice #7E22CE · Roulette #DC2626 · Keno #FACC15 · Plinko #22C55E   [confirmed: Inspect]

Roulette board:
  red #DC2626 / #F42727 · green #22C55E (zero) · black #11121A      [confirmed: Inspect]

Currency coins:
  gold #FACC15 / #FFE372, glow box-shadow 0 0 9px #807346           [confirmed: Inspect]
  green coin reuses --color-primary                                 [confirmed: Inspect]

Auth social-login brand colors:
  Google #4285F4 / #34A853 / #FBBC05 / #EB4335                      [confirmed: Inspect]
  Steam  #0073A3 / #07547A                                          [confirmed: Inspect]
```

### 1.3 Typography — family confirmed: **Outfit**

```txt
--font-sans: 'Outfit'      [confirmed: Inspect]
Line-height ≈ 1.25 (e.g. 16/20, 14/18)   [confirmed: Inspect]

Weights in use:
  300 Light · 400 Regular · 500 Medium · 600 SemiBold · 700 Bold · 900 Black   [confirmed: Inspect]

Named text scale (collapsed from Inspect styles):
  caption   10–12px   badges, helper text            [confirmed: Inspect]
  body-sm   14px      nav, table rows, controls       [confirmed: Inspect]
  body      16px      default body                    [confirmed: Inspect]
  title     18–24px   section / card titles           [confirmed: Inspect]
  display   36–48px / weight 900 / UPPERCASE  hero     [confirmed: Inspect]

Modifiers seen: Light / Regular / Medium / Bold + Uppercase variants   [confirmed: Inspect]
```

### 1.4 Spacing — 4px base scale (2px half-steps)

```txt
2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 32 · 40 · 48        [confirmed: Inspect]
Dominant gap: 8px.  Control padding: 12px 16px.  Badge/pill: 2px 8px.  Button: 12px 24px.
→ Maps to Tailwind default spacing; no custom scale required.
```

### 1.5 Radius

```txt
--radius-sm    4px     [confirmed: Inspect]  inputs, chips, small controls
--radius-md    8px     [confirmed: Inspect]  buttons, cards (most common)
--radius-lg    12px    [confirmed: Inspect]  large cards
--radius-xl    16px    [confirmed: Inspect]  modal / hero panels
--radius-pill  9999px  [confirmed: Inspect]  badges, avatars, balance pills
(2px = incidental; sub-pixel radii in Inspect are icon artifacts — ignore)
```

### 1.6 Shadows

```txt
--shadow-overlay   0px 20px 60px rgba(8,10,13,0.8)              [confirmed: Inspect]  modal
--shadow-glow      0px 0px 15px rgba(255,255,255,0.38)          [confirmed: Inspect]  focus/hover glow
--shadow-btn       0px 0.86px 0px #08923A,
                   inset 0px 0.8px 0px rgba(211,255,243,0.1)    [confirmed: Inspect]  green button bevel
--shadow-inset-hi  inset 0px 0.8px 0px rgba(195,255,239,0.2)    [confirmed: Inspect]  control top highlight
(gold-coin glow 0 0 9px #807346 is domain — see §1.2, not global)
```

---

## 2. Token confidence delta (Pass 1 eyeballed → Pass 2 Inspect-confirmed)

| Token | Pass 1 (eyeballed) | Pass 2 (confirmed) | Note |
|-------|--------------------|--------------------|------|
| `--color-bg` | `#0b0e13` | **`#0A0D19`** | Bluer/navier than guessed |
| surface / border | `#161b22` / `#262d38` | **`#0E121C` / `#1B1F26` / `#2B303B`** | 3 surface tiers, not 1 |
| `--color-primary` | `#2fd673` | **`#22C55E`** (green-500) | It's the Tailwind green ramp |
| primary hover/press | unknown | **`#16A34A` / `#15803D`** | Now defined |
| text / muted | "near-white" / "gray" | **`#FDFDFD` / `#C7CBD4`** | Now exact |
| accent purple | "purple, unmeasured" | **`#7E22CE`** (purple-700) | Now exact |
| currency gold | "yellow/gold" | **`#FACC15`** (yellow-400) | Now exact, and domain-scoped |
| font family | GAP | **`Outfit`** | Closed |
| card radius | "~10–12px" | **8px cards / 12px large** | Smaller than guessed |
| spacing scale | "Tailwind default?" | **4px base confirmed** | Hypothesis confirmed |

Net correction: palette is **Tailwind default green/purple/yellow/gray over a custom navy base.**

---

## 3. Screen inventory & layout model

### 3.1 Screens documented

| Screen | State | Evidence |
|--------|-------|----------|
| **Lobby / landing** | Logged-out: hero, rewards counter, Features grid, How-to-get-started grid | confirmed (screenshot + Inspect) |
| **Auth modal** (Log In / Register tabs) | Overlay on lobby; **only Log In tab captured** | confirmed (screenshot + Inspect); Register = GAP |
| **Games catalog** | Logged-in: 2×2 game cards + "Bet Live" feed | confirmed (screenshot + Inspect) |
| **Roulette game page** | Logged-in: control panel + wheel/board + bets table | confirmed (screenshot + Inspect) |
| **App shell — logged-in top bar** | dual balance, bell + count badge, user menu | confirmed (derived from catalog/Roulette) |
| **Mobile shell** | hamburger + centered logo + Log In | confirmed (screenshot + Inspect mobile) |

Auth is an **overlay modal, not a route** [confirmed].

### 3.2 App-shell regions

- **Left sidebar** — fixed, vertical, collapsible (collapse chevron). Contains: brand logo,
  "Daily Claimer" promo card, primary nav list, expandable **Games** group (Collapsible),
  with "Help & Support" pinned at bottom. [confirmed]
- **Top bar** — right-aligned. Logged-out: single **Log In** button. Logged-in: dual-currency
  balance pills, notification bell + count badge, user avatar + name dropdown. [confirmed]
  (Logged-in **mobile** top bar not captured — GAP.)
- **Content region** — scrollable, right of sidebar, below top bar. [confirmed]

### 3.3 Content grids

- **Lobby:** full-bleed hero → rewards counter strip → Features 3-col card grid →
  How-to-get-started 3-col card grid. [confirmed desktop]
- **Catalog:** hero → **2×2 game card grid** → "Bet Live" table. [confirmed desktop]
- **Game page:** two-column — control panel (left) + game visual area (right) →
  full-width bets table below. [confirmed desktop] — **see §5/§6 deferral note.**

---

## 4. Navigation labels

The sidebar defines the navigation set. The following are **labels** (confirmed text); the
slugs are a **proposed NAMING CONVENTION to be confirmed at real-routing time (Phase 4)** —
they are **not** confirmed URLs.

| Label | Proposed slug *(convention, confirm Phase 4)* | Evidence |
|-------|-----------------------------------------------|----------|
| Lobby / Home | `/` | confirmed (logo/home) |
| Pointshop | `/pointshop` | confirmed: Inspect nav + screenshot |
| Leaderboard | `/leaderboard` | confirmed: Inspect nav + screenshot |
| Games (catalog) | `/games` | confirmed: Inspect nav + screenshot |
| Roulette | `/games/roulette` | confirmed: Inspect nav + screenshot |
| Keno | `/games/keno` | confirmed: Inspect nav + screenshot |
| Plinko | `/games/plinko` | confirmed: Inspect nav + screenshot |
| Dice | `/games/dice` | confirmed: Inspect nav + screenshot |
| Rewards | `/rewards` | confirmed: Inspect nav + screenshot |
| Bonuses | `/bonuses` | confirmed: Inspect nav + screenshot |
| **The Wheel** | `/wheel` | ⚠ **weaker evidence** — screenshot only, **not** in Inspect fragment |
| **Bonus Buy Winners** | `/bonus-buy-winners` | ⚠ **weaker evidence** — screenshot only, **not** in Inspect fragment |
| **Help & Support** | `/help` | ⚠ **weaker evidence** — screenshot only, **not** in Inspect fragment |

> Routes are **not** treated as a closed blocker. Slug strings are `[inferred]`. Confirm the
> actual routing scheme (and the three weaker-evidence labels) before Phase 4 routing work.

---

## 5. Primitive & widget candidates

### 5.1 Shared primitives — `src/shared/ui/primitives`

Only primitives the captured screens demand. Radix-wrapped where interactive; CVA where
variant-bearing.

| Primitive | Evidence | Backing |
|-----------|----------|---------|
| **Button** (primary / secondary / ghost / icon) | CTAs, mute/settings/fullscreen/collapse icons | CVA + `--shadow-btn` / `--shadow-glow` |
| **Card / Surface** | feature, how-to, game, panel surfaces | CVA |
| **Input** (text / password) | auth fields | — |
| **Checkbox** | ToS + 18+ confirms | plain (or Radix) |
| **Tabs** | Log In/Register, Manual/Auto, All Bets/High Rollers/Lucky Bets | `@radix-ui/react-tabs` |
| **Dialog / Modal** | auth modal | `@radix-ui/react-dialog` |
| **Popover / Dropdown** | user menu, balance dropdown | `@radix-ui/react-popover` |
| **Collapsible** | sidebar "Games" group | `@radix-ui/react-collapsible` |
| **Tooltip** | "Provably Fair" / icon affordances | `@radix-ui/react-tooltip` |
| **Avatar** | user identity | plain |
| **Badge** | notification count | CVA |
| **Table** | bets feed | plain |

**Deferred / not yet justified:** Slider (installed, but no slider in captured screens — likely
a future game control), Toast/Sonner (installed, none shown). Chip/token selector and board
cells are **game-scoped, not shared primitives.**

### 5.2 Product widgets — `src/widgets`

- `app-shell` — sidebar + top bar + content slot.
- `main-nav` (sidebar) — nav list, Games Collapsible group, daily-claimer card slot, collapse.
- `top-bar` — two variants: logged-out (Log In) / logged-in (balances, notifications, user menu).
- `auth-modal` — Log In/Register tabbed dialog (UI only).
- `lobby` sections — hero, rewards counter strip, features grid, how-to-get-started grid.
- `game-catalog` — 2×2 game card grid.
- `bet-feed` — live bets table with tab filters.
- `daily-claimer` card.

### 5.3 Game-page layout — DEFERRED / GAME-SCOPED

The Roulette (and future game) **two-column layout — control panel + visual area** is
**game-scoped and DEFERRED to `src/games/<game>`** (maps to the deferred `widgets/game-layout`
concept). It is **not** a shared widget or primitive and **must not** be folded into `app-shell`
or shared scope. Build it only when the first real game file is approved.

---

## 6. Responsive notes

| Region | Desktop | Mobile |
|--------|---------|--------|
| Sidebar | Persistent, collapsible | Hidden → hamburger **drawer** [confirmed] |
| Top bar | Full (balances + bell + user) / Log In | Logo centered + hamburger + Log In; logged-in mobile treatment **not captured (GAP)** |
| Auth modal | Centered two-pane (art + form) | Full-width, **art pane drops**, form only [confirmed] |
| Lobby grids | 3-col features / how-to | Stack to 1-col **[inferred]** |
| Catalog | 2×2 | 1-col stack **[inferred]** |
| Game page | 2-col (panel \| visual) | Stack; exact order **not captured [inferred]** |

Inspect covers **desktop @1920 + mobile only**; tablet/intermediate breakpoint is a **GAP**.
Content-page mobile reflows are `[inferred]` except the auth modal and shell header.

---

## 7. Placeholder strategy

**Build static now (no backend):**
- Shell chrome (sidebar, top-bar frame), nav structure, route stubs.
- Token layer + primitives.
- Lobby marketing content (hero copy, Features cards, How-to-get-started cards).
- Auth modal **UI only** (no submission/auth wiring).
- Game catalog cards as static links.
- Empty/skeleton states for data regions.

**Waits for backend data (placeholder/skeleton only):**
- Dual-currency balances; notification count; user identity/avatar.
- "Total rewards given back" counter value.
- Daily-claimer state (claim availability/timer).
- Bet feed / "Bet Live" rows.
- Any real game outcome, bet placement, or wallet mutation.

**Hard rule:** static placeholders may render hardcoded marketing copy, but **dynamic regions
must be visually-marked placeholders/skeletons — never fabricated "live" data** — so the backend
swap is clean and no fake data ships.

---

## 8. Phase 2 scope — two sequential implementation tasks

These are **two separate tasks, each its own branch**, run in order.

### 8a. Design System Foundation (tokens + cn() + first primitives)
1. Define the **§1 confirmed tokens** as CSS variables in `globals.css` `:root` (single dark
   theme), wired through Tailwind v4 `@theme`. Reuse Tailwind's green/purple/yellow/gray where
   they match; add only the custom navy surfaces + named shadows.
2. Register **Outfit** as `--font-sans` (loading mechanism is an impl detail).
3. Add `cn()` (`clsx` + `tailwind-merge`) in `src/shared/lib`.
4. Create `src/shared/ui/primitives` with **only** what the shell/auth demand first:
   **Button, Card/Surface**, and the Radix wrappers (**Dialog, Tabs, Popover, Collapsible**);
   Input/Checkbox/Tooltip/Badge/Avatar/Table as demanded.
5. CVA variants for **Button, Badge, Card** only.

*Excluded:* Storybook, theme switcher, full inventory, Slider, Toast, game/chip primitives,
domain colors.

### 8b. App Shell + main page scaffold
1. `widgets/app-shell` = sidebar + top bar + content slot; wire into `src/app/layout.tsx`.
2. `widgets/main-nav` (sidebar) — static nav items + Games Collapsible + collapse toggle;
   daily-claimer card as static placeholder.
3. `widgets/top-bar` — logged-out variant first; logged-in variant as **static placeholders**
   (balances/bell/user) pending backend.
4. `widgets/lobby` static sections on `src/app/page.tsx` (hero, features, how-to).
5. `widgets/auth-modal` UI-only (Dialog + Tabs) — no auth logic.
6. Responsive: sidebar → drawer + grid stacking per §6.

*Excluded:* catalog data wiring, bet-feed live data, real auth, game pages, BFF/API,
game-layout widget.

**Sequence:** 8a must land before 8b (8b consumes 8a's tokens + primitives).

---

## 9. Remaining GAPS

Not covered by either pass; **must not be silently filled.**

- **Register tab** content — only Log In captured.
- **UI states** — hover / focus / active / loading / empty / error / disabled not enumerated.
- **Tablet / intermediate breakpoint** — Inspect has desktop @1920 + mobile only.
- **Logged-in mobile top bar** (balances/bell/user on mobile).
- **Expanded dropdown / settings panels** — user menu, balance dropdown, game settings gear
  (triggers visible; expanded panels not captured).
- **Static-vs-dynamic text notes** — never supplied; §7 strategy is the working assumption.
- **Secondary page layouts** — Pointshop, Leaderboard, Keno/Plinko/Dice, Rewards, Bonuses,
  The Wheel, Bonus Buy Winners, Help & Support (nav-confirmed; no layouts).
- **Route URL strings** — slugs are a convention (§4), not confirmed.

**Impact:** these do **NOT block Phase 2 steps 8a–8b** (token layer + app-shell scaffold with
static placeholders). They **DO block**: the **auth Register flow**, **interactive states**,
and **individual secondary pages** — resolve before building those.

---

## 10. Constraints carried from foundation decisions

An implementer acting on this document must honor these accepted, non-negotiable rules:

- **Layering / ownership:** `src/app` (thin routing/composition) · `src/widgets` (page
  composition blocks) · `src/games/<game>` (vertical game modules) · `src/features` (use-cases)
  · `src/entities` (domain nouns) · `src/shared` (primitives, libs, config, assets).
- **Design system:** Tailwind CSS + CSS variables; `cn()` = `clsx` + `tailwind-merge`; **CVA**
  for primitive variants; **Radix via `src/shared/ui/primitives` wrappers**; **Motion** for UI
  transitions only (game renderer animation lives in `src/games/<game>/renderer`); **single
  dark theme first**.
- **Explicitly out of scope:** Storybook, theme switcher, full component inventory upfront.
- **API boundary:** browser UI calls **only local `/api/*`**; external backend base URL, auth
  headers, and session/token logic are **server-side/BFF only** (not in scope for Phase 2).
- **Game modules:** created **only when the first real game file is needed** — no empty
  ownership folders, no universal game engine / shared renderer / game factory upfront.
- **State ownership (for later phases):** TanStack Query = server state · Zustand = local
  UI/game/playback state · React Hook Form = form draft · Zod = boundary validation · Big.js =
  decimal-safe UI math only. **Backend is authoritative** for game result, wallet/balance,
  and game config.
- **No empty folders** created just to mirror target structure; create a folder only with its
  first approved real file.
