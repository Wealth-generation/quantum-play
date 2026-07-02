# Audit: Lobby Polish Slice

**Date:** 2026-07-02  
**Branch:** feat/lobby-total-rewards-bff (audit-only, no writes)  
**Skill:** audit  
**Mode:** READ-ONLY — no code written, no branch created

---

## Audit Output

```
Audit:
  Relevant files:
    src/widgets/lobby/lobby-hero-cta.tsx
    src/widgets/lobby/lobby-hero.tsx
    src/widgets/lobby/lobby.tsx
    src/widgets/lobby/features-section.tsx
    src/widgets/lobby/feature-card-button.tsx
    src/widgets/lobby/games-section.tsx
    src/widgets/lobby/game-card.tsx
    src/widgets/auth-modal/auth-modal-provider.tsx
    src/widgets/auth-modal/auth-modal.tsx
    src/features/auth/model/auth-session.ts
    src/features/auth/api/auth-client.ts
    src/features/auth/types/auth-types.ts
    src/features/auth/index.ts
    src/shared/ui/primitives/button.tsx
    src/shared/ui/primitives/collapsible.tsx
    src/app/games/[gameSlug]/page.tsx
    src/app/games/page.tsx
    src/app/leaderboard/page.tsx
    src/app/rewards/page.tsx
    src/app/user/page.tsx
    src/app/api/auth/session/route.ts
    package.json

  Ownership:
    src/widgets/lobby/**       — lobby widget layer (page composition blocks)
    src/widgets/auth-modal/**  — auth modal widget (shared across the app)
    src/features/auth/**       — auth feature (client hooks + API client)
    src/shared/ui/primitives/  — shared design primitives
    src/app/**                 — Next.js routing layer (thin)

  Editable scope proposal:
    (AUDIT ONLY — no editable scope active yet)

  Context-only files:
    All files above inspected for read only.
```

---

## Item 1 — Auth / Logged-In State

### Findings

`useAuthSession()` exists and is fully wired end-to-end:

- **Hook:** `src/features/auth/model/auth-session.ts:18` — TanStack Query hook calling
  `getAuthSession()` (staleTime 30 s).
- **Client API:** `src/features/auth/api/auth-client.ts:53` — `GET /api/auth/session`
- **BFF route:** `src/app/api/auth/session/route.ts` — proxies to backend `/user/query/me`
  using the `access_token` cookie (and falls back to token refresh). Returns
  `{ authenticated: boolean, user: {...} | null }`.
- **Type:** `src/features/auth/types/auth-types.ts:1` — `AuthSession` is a discriminated
  union on `authenticated: boolean`.
- **Export:** `src/features/auth/index.ts:2` — `useAuthSession` is a public export.

`LobbyHeroCta` is already `"use client"` (`lobby-hero-cta.tsx:1`), so importing
`useAuthSession` there is valid with no further architecture work.

### VERDICT: BUILDABLE NOW

The "hide the hero Register button when logged in" feature is **not blocked**.
`data?.authenticated` from `useAuthSession()` gives the client login state immediately.
Estimated change: ~3 lines in `lobby-hero-cta.tsx`.

---

## Item 2 — Hero Register Button

### Location
`src/widgets/lobby/lobby-hero-cta.tsx`

### Current behaviour (quoted)
```tsx
const { setOpen } = useAuthModal();
// ...
<Button ... onClick={() => setOpen(true)}>
  Register
</Button>
```
Clicking opens the auth modal. The modal **always defaults to the "login" tab**.

### Auth-modal context API
`src/widgets/auth-modal/auth-modal-provider.tsx:8`:
```ts
interface AuthModalContextValue {
  setOpen: (open: boolean) => void;
}
```
Only `setOpen(boolean)` is exposed — **no tab parameter**.

`AuthModal` owns its own tab state (`useState<AuthTab>("login")`) and always
initialises to `"login"` (`auth-modal.tsx:102`). Callers cannot currently specify
the initial tab.

### What a minimal extension would look like (description only — not implemented)
1. Add `openToTab: (tab: "login" | "register") => void` to `AuthModalContextValue` in
   `auth-modal-provider.tsx`. Store a `defaultTab` state alongside `open`.
2. Thread `defaultTab` as a prop into `<AuthModal>` so the modal uses it as its
   initial `useState` value.
3. `LobbyHeroCta` calls `openToTab("register")` instead of `setOpen(true)`.

Affected files: 2 (`auth-modal-provider.tsx`, `auth-modal.tsx`).  
Risk: shared widget — existing callers (`setOpen(true)`) must not regress.

---

## Item 3 — Feature Cards

### Location
`src/widgets/lobby/features-section.tsx`

### Current markup
Cards are plain `<article>` elements — **not links**. The chevron is a `motion.button`
(`feature-card-button.tsx`) with `aria-label="Open {label}"` but **no `onClick`
handler and no `href`**. The comment in `features-section.tsx:24` is explicit:

> "Routing for each card is deferred (Track B / route decisions), so cards are not
> yet links — the chevron button is a placeholder action."

### Route existence table

| Card title  | Intended slug   | Route file                       | 404 today? |
|-------------|-----------------|----------------------------------|------------|
| Leaderboard | `/leaderboard`  | `src/app/leaderboard/page.tsx`   | **No**     |
| Rewards     | `/rewards`      | `src/app/rewards/page.tsx`       | **No**     |
| Games       | `/games`        | `src/app/games/page.tsx`         | **No**     |

All three target routes already exist. No new pages need to be built.

### What routing requires
Convert each `<article>` + its `FeatureCardButton` into a navigable unit. Options:
- Wrap the entire `<article>` in `<Link href={...}>` (simplest, makes whole card clickable).
- Or replace `FeatureCardButton` with a `<Link>` rendering an `<a>` styled as the chevron button.

Both are small changes; the second preserves the article/button semantic separation
and is closer to current FSD intent.

---

## Item 4 — Games Section

### Existence
The lobby **already has a GamesSection**. `src/widgets/lobby/lobby.tsx:30` composes it:
```tsx
<SectionReveal>
  <GamesSection />
</SectionReveal>
```
The assumption "8b lobby was hero/features/how-to" is out of date. GamesSection is live.

### Current game cards
`src/widgets/lobby/games-section.tsx` — 4 cards: roulette, dice, keno, plinko.  
`src/widgets/lobby/game-card.tsx` — `motion.div` with `cursor-pointer` class but
**no `onClick` and no routing**. Comment: "Routing per game is deferred."

### Game route existence table

| Game card | `key`      | Route path             | Routed via                                        | 404 today? |
|-----------|------------|------------------------|---------------------------------------------------|------------|
| Roulette  | `roulette` | `/games/roulette`      | `src/app/games/[gameSlug]/page.tsx` static param  | **No**     |
| Dice      | `dice`     | `/games/dice`          | same                                              | **No**     |
| Keno      | `keno`     | `/games/keno`          | same                                              | **No**     |
| Plinko    | `plinko`   | `/games/plinko`        | same                                              | **No**     |

`generateStaticParams()` in `src/app/games/[gameSlug]/page.tsx:15` enumerates all four.
All game slugs resolve. Routing is purely a matter of adding `<Link>` wrappers.

---

## Item 5 — Pointer Cursors

### Shared Button primitive
`src/shared/ui/primitives/button.tsx:8-10` CVA base class:
```
"inline-flex select-none items-center justify-center font-medium transition-colors
 outline-none focus-visible:shadow-glow disabled:pointer-events-none disabled:opacity-50"
```
**`cursor-pointer` is absent.** Tailwind's preflight resets `<button>` cursor to inherit
(which is `auto`/arrow in most browsers). Every `<Button>` rendered by the primitive
therefore shows the default arrow cursor.

### Interactive element inventory

| Element | File | Has `cursor-pointer`? |
|---|---|---|
| `Button` primitive (all usages) | `shared/ui/primitives/button.tsx` | **Missing** |
| `FeatureCardButton` (`motion.button`) | `lobby/feature-card-button.tsx` | **Missing** |
| `GameCard` (`motion.div`) | `lobby/game-card.tsx:29` | ✓ Present |
| `DialogClose` button | `auth-modal/auth-modal.tsx:255` | ✓ Present |
| Checkbox `<label>` wrappers | `auth-modal/auth-modal.tsx:366,375,462,481` | ✓ Present |
| Top-bar element (line 221) | `widgets/top-bar/top-bar.tsx:221` | ✓ Present |
| Feature `<article>` elements | `lobby/features-section.tsx` | N/A (not yet interactive) |

### Recommended fix strategy
- **One-line global fix:** add `cursor-pointer` to the `Button` CVA base class in
  `shared/ui/primitives/button.tsx`. This heals all `<Button>` usages in a single place.
- **Per-element fix:** add `cursor-pointer` to `FeatureCardButton`'s `className`.
- Feature card `<article>` elements will automatically gain a pointer cursor once they are
  wrapped in a Next.js `<Link>` (which renders `<a>`; anchor default cursor is pointer).
- Total changes: 2 files, 2 lines.

---

## Item 6 — FAQ / Accordion (Figma)

**Figma URL:** https://www.figma.com/design/EY3yBnmcrxTIhGBPQKNnnO/Evoverse--Copy-?node-id=4593-5965  
**File key:** `EY3yBnmcrxTIhGBPQKNnnO` — node `4593-5965`

### Section structure (from Figma MCP)

- **Section header:** `question-bubble` icon (24×24) + "Frequently asked questions" label
  (20px semibold, `--text/primary = #fdfdfd`). Mirrors the existing section header
  pattern (crown/puzzle icon + label) used in FeaturesSection and GamesSection.
- **List container:** `flex-col gap-[8px]`, max-width ~928px, horizontally centred inside
  the page frame (Figma uses `px-[280px]` on the outer wrapper — this is desktop-frame
  centering, map to `max-w-[928px] mx-auto` rather than literal padding).
- **Item count:** **5 accordion items** (1 shown open, 4 shown closed in the reference).

### Per-item anatomy

| State  | Layout | Elements |
|--------|--------|----------|
| Closed | `flex items-center justify-between` | Question text (bold 16px, `#fdfdfd`) + chevron-down icon (16px) |
| Open   | `flex-col gap-[8px]` | Header row (question + chevron-up icon) + answer paragraph (regular 14px, `#c7cbd4`) |

Token mapping:
- Item background: `#0e121c` → `bg-surface` / `bg-row` (existing token family)
- Border radius: `12px` → `rounded-xl` (Tailwind) or `rounded-[12px]`
- Padding: `16px` → `p-4`
- Question text: semibold 16px, `#fdfdfd` → `font-semibold text-base text-text`
- Answer text: regular 14px, `#c7cbd4` → `text-sm text-text-muted`
- Gap between items: `8px` → `gap-2`

### Mapping to existing primitives

`src/shared/ui/primitives/collapsible.tsx` wraps `@radix-ui/react-collapsible`
(which IS installed — `package.json:15`).  
It exports `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`.

**Each FAQ item maps cleanly to one `<Collapsible>` + `<CollapsibleTrigger>` + `<CollapsibleContent>`.**

`CollapsibleContent` from Radix supports CSS animation via `data-[state=open]` /
`data-[state=closed]` attributes — height transition can be applied with
`overflow-hidden` + Motion's `AnimatePresence` or plain CSS.

`@radix-ui/react-accordion` is **NOT installed** and is not in `package.json`.

### Mutual-exclusion question
Figma shows one item open and four closed but gives no explicit single-open constraint.
If independent open/close per item is acceptable: use 5 independent `<Collapsible>`s —
**no new primitive, no new dependency**.  
If "only one at a time" (true accordion) is required: either (a) controlled state via a
shared `openIndex` value driving 5 Collapsibles, or (b) a new
`src/shared/ui/primitives/accordion.tsx` wrapping `@radix-ui/react-accordion`
(new dep install, requires explicit approval per quality-gates rules).

**Recommendation:** treat as independent Collapsibles until the business confirms
mutual-exclusion requirement. No new dep needed for the default approach.

### COPY WARNING
All text in the Figma node is lorem ipsum placeholder ("Question close", "Question open",
"Sed do eiusmod tempor…"). The "Evoverse Copy" file is a third-party reference.
**Real FAQ question/answer text must be supplied by the business owner before
implementation can produce final copy.** The section can be built with structural
placeholder copy, but must not ship placeholder text to production.

---

## Route Existence Summary

### Feature cards → target routes

| Card        | Route         | Exists? |
|-------------|---------------|---------|
| Leaderboard | `/leaderboard`| ✓ Yes   |
| Rewards     | `/rewards`    | ✓ Yes   |
| Games       | `/games`      | ✓ Yes   |

### Game cards → target routes

| Game     | Route             | Exists? |
|----------|-------------------|---------|
| Roulette | `/games/roulette` | ✓ Yes   |
| Dice     | `/games/dice`     | ✓ Yes   |
| Keno     | `/games/keno`     | ✓ Yes   |
| Plinko   | `/games/plinko`   | ✓ Yes   |

No links would 404.

---

## Scope Classification Per Item

| # | Item | Classification | Verdict |
|---|------|----------------|---------|
| 1 | Auth-gate Register button | **Small** — ~3 lines in LobbyHeroCta | Buildable now |
| 2a | Open modal to Register tab | **Small** — 2 files, extend context API | Buildable now |
| 2b | Hide button when logged in | **Micro** (subset of item 1) | Buildable now |
| 3 | Feature card routing | **Small** — wrap articles/buttons in Link | Buildable now |
| 4 | Game card routing | **Small** — wrap GameCard in Link | Buildable now |
| 5 | Pointer cursors | **Micro** — Button CVA base + FeatureCardButton | Buildable now |
| 6 | FAQ accordion section | **Normal** — new widget, uses Collapsible | Buildable (blocked on copy) |

---

## Proposed FSD Placement (new pieces)

| Piece | Proposed path | Primitive needed? |
|-------|---------------|-------------------|
| FAQ section widget | `src/widgets/lobby/faq-section.tsx` | No — uses existing Collapsible |
| (Optional) Accordion primitive | `src/shared/ui/primitives/accordion.tsx` | Only if single-open is required |

---

## Recommended Implementation Slicing

Safe first slice (no blocking deps between items; can be done in parallel):

1. **Cursor polish (micro):** `Button` CVA base + `FeatureCardButton` — 2 files, 2 lines.
2. **Feature card routing (small):** Wrap each `<article>` in `<Link>` per FEATURES map.
3. **Game card routing (small):** Accept `href` prop in `GameCard`; wrap with `<Link>`.
4. **Hero auth-gating (small):** Add `useAuthSession()` to `LobbyHeroCta`; conditionally
   suppress button when `authenticated === true`.
5. **Modal "Register" tab (small):** Extend `AuthModalContext` with `openToTab()`; thread
   through `AuthModal` as `initialTab` prop.  
   *This is independent of auth-gating — do either order.*
6. **FAQ section (normal):** New `faq-section.tsx` with 5 `<Collapsible>` items.
   **Cannot ship without real copy.** Build with structural placeholder; hand off
   to business for final Q&A content before merge.

---

## Risks and Open Questions

| # | Risk / Question | Severity |
|---|----------------|----------|
| R1 | `AuthModal` tab extension touches a shared widget. Existing callers pass `setOpen(true)` only — must not regress login tab. | Medium |
| R2 | Feature card `<article>` → `<Link>` change: `<Link>` renders `<a>`, which is a block-level anchor; verify responsive sizing (flex-wrap layout) is unaffected. | Low |
| R3 | `GameCard` is a `motion.div` — converting to Link: wrapping in `<Link>` (`<a>`) around a `<div>` is valid HTML and Next.js supports it; no issue. | Low |
| R4 | FAQ copy is undefined. Implementation must not ship with placeholder text. Business owner must supply Q&A content. | High (for shipping) |
| R5 | Single-open accordion behaviour not confirmed by Figma. Use independent Collapsibles until confirmed; if true accordion required, a new dep (`@radix-ui/react-accordion`) needs explicit approval per quality-gates. | Medium |
| R6 | `useAuthSession()` makes a network request on every lobby page load (staleTime 30 s). Budget impact is minimal; the existing `/api/auth/session` call is already used by nav/top-bar for the user avatar display, so this is not a new network cost in practice — confirm top-bar usage to avoid duplicate query keys. | Low |

---

## Docs Impact

- Changes to `lobby-hero-cta.tsx` and `auth-modal-provider.tsx` touch the auth pattern —
  check `docs/architecture/auth.md` after implementation.
- No new BFF routes. No external API boundary changes.
- FAQ section is the first accordion/collapsible usage in the lobby widgets — may warrant
  a note in `docs/architecture/foundation-decisions.md` (interactive primitive usage).

## API Boundary Impact
None. All items use existing BFF routes. No new backend calls.

## UI QA Impact
All items produce visible UI changes. Required evidence at pre-commit:
- Hero: button hidden when logged in (test with authenticated session).
- Feature cards: all 3 links navigate correctly; no broken styles.
- Game cards: all 4 links navigate correctly.
- Cursor: verify pointer on Button and FeatureCardButton across viewports.
- FAQ: expand/collapse animation; keyboard navigation (Enter/Space on trigger).

## Validation Plan
`pnpm validate` (lint + build + docs check) after each implementation task.
Manual API boundary check: not needed (no new BFF work).

## Stop Conditions
None. All items are buildable. Item 6 (FAQ) is blocked only on **copy content**,
not on architecture or missing primitives.

---

## Implementation Record (2026-07-02)

```
Implementation Summary:
  Scope:
    1. Auth-gate hero Register button (hide during load + when authenticated).
    2. Auth modal open-to-tab support (openToTab("register") from hero CTA).
    3. Feature cards routed via FeatureCardButton → Next Link.
    4. Game cards routed via Link wrapper in GamesSection.
    5. Pointer cursors: Button CVA base + FeatureCardButton.
    6. FAQ accordion section (new faq-section.tsx, Collapsible primitive).

  Files changed:
    src/shared/ui/primitives/button.tsx           — added cursor-pointer to CVA base
    src/widgets/auth-modal/auth-modal-provider.tsx — extended context: openToTab, tab state lifted
    src/widgets/auth-modal/auth-modal.tsx          — tab/onTabChange props, removed internal tab state
    src/widgets/lobby/lobby-hero-cta.tsx           — useAuthSession gate + openToTab("register")
    src/widgets/lobby/feature-card-button.tsx      — href prop, motion(Link), cursor-pointer
    src/widgets/lobby/features-section.tsx         — href per FEATURES entry, passed to button
    src/widgets/lobby/games-section.tsx            — Link wrapper per game card
    src/widgets/lobby/faq-section.tsx              — NEW: 5-item FAQ, Collapsible, placeholder copy
    src/widgets/lobby/lobby.tsx                    — FaqSection mounted after LeaderboardSection

  Non-goals respected:
    No balance pills / avatar / shell variant. No real FAQ copy (placeholders only).
    No new dependencies. No rewards widget changes. No route pages built. No git writes.

  Branch mode: PR-mode
  Base branch: develop
  Task branch: feat/lobby-polish
  Current branch at task start: feat/lobby-polish (pre-confirmed by user)

  Validation:
    git diff --check — clean (0 whitespace errors)
    pnpm lint — 0 errors
    pnpm build — 0 errors, 0 TypeScript errors
    / (lobby) — ○ Static (prerendered, not forced dynamic) ✓
    /games/[gameSlug] — ● SSG, all 4 slugs ✓

  Docs impact:
    No durable architecture doc changes required (no new BFF routes, no new primitives,
    no new architectural patterns beyond existing auth + Collapsible usage).

  API boundary impact:
    None. useAuthSession() calls existing /api/auth/session BFF (no new routes).

  UI QA impact:
    Required before merge:
    - Hero register button hidden when authenticated; hidden during session load.
    - Modal opens on Register tab when hero CTA is clicked.
    - Feature card chevrons navigate to /leaderboard, /rewards, /games.
    - Game cards navigate to /games/roulette, /games/dice, /games/keno, /games/plinko.
    - Button pointer cursor visible on all Button usages app-wide.
    - FAQ accordion expands/collapses; first item open by default.
    - Keyboard navigation (Enter/Space on CollapsibleTrigger).

  Risks:
    Auth modal tab state lifted to provider — existing setOpen(true) callers
    (top-bar, etc.) still work; tab resets to "login" on every close. Verify
    no regression in the login flow during UI QA.
```

---

## Addendum — Rewards Accordion Reuse Audit (2026-07-02)

### Scope
Micro-audit to determine whether the existing accordion on `/rewards` can be reused
for the lobby FAQ, and to lock in the FSD verdict before implementation.

### Audit block

```
Audit:
  Relevant files:
    src/app/rewards/page.tsx                    (entry point — thin route)
    src/widgets/rewards/rewards-page.tsx        (page composition)
    src/widgets/rewards/rewards-faq.tsx         (the accordion component)
    src/widgets/rewards/rewards-data.ts         (FAQ data source)
    src/shared/ui/primitives/collapsible.tsx    (shared primitive it builds on)

  Ownership:
    src/widgets/rewards/**  — rewards widget layer (domain-scoped)
    src/shared/ui/primitives/collapsible.tsx — shared primitive

  Editable scope proposal:
    (AUDIT ONLY — none)

  Context-only files:
    All files above inspected read-only.
```

### Finding 1 — File and build basis

**File:** `src/widgets/rewards/rewards-faq.tsx`

**What it builds on** (quoted imports, lines 1–8):
```ts
import { ChevronDown } from "lucide-react";
import QuestionBubbleIcon from "@/shared/assets/rewards/icons/icon-question.svg";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/primitives/collapsible";
import { faqItems } from "./rewards-data";
```

It uses the **shared `Collapsible` primitive** directly — no separate accordion package,
no hand-rolled solution. `@radix-ui/react-accordion` is not involved.

### Finding 2 — Classification

`RewardsFaq` is a **rewards-scoped widget component**. It lives in
`src/widgets/rewards/` and hard-wires its content by importing `faqItems` from
`./rewards-data` — a rewards-domain data module. It accepts **no external props**;
there is no injection point for items, children, or render props.

It is **not** a reusable primitive. It cannot accept lobby FAQ items without
modification.

### Finding 3 — Behavior: independent (multiple can be open)

Each FAQ item is a **separate, independent `<Collapsible>`** (`rewards-faq.tsx:24`).
The first item pre-opens via `defaultOpen={index === 0}` (`rewards-faq.tsx:26`), but
all items are independently controllable — there is no shared state enforcing
single-open behaviour. **Multiple items can be open simultaneously.**

This matches the lobby FAQ requirement: the prior audit found Figma shows one item open
but no single-open constraint. Independent behaviour is correct for both.

### Finding 4 — Props / API surface

`RewardsFaq` signature: `export function RewardsFaq()` — **zero props**. Content is
sourced directly from `rewards-data.ts`:
```ts
export const faqItems: FaqItem[] = [
  { title: "What are rewards?", content: LOREM },
  { title: "How do I earn rewards?", content: LOREM },
  ...  // 5 items total
];
```

`FaqItem` is `{ title: string; content: string }` — a generic shape with no rewards
coupling in the type itself, but the data and the component are co-located in the
rewards widget with no extraction seam.

To feed the lobby's own placeholder Q&A, the component would need to be refactored to
accept `items: FaqItem[]` as a prop. That refactor is non-trivial for a shared promotion
(it also changes the rewards widget's current call site).

### FSD Verdict: **(c) MIRROR**

**Rationale:**

- `RewardsFaq` lives in `src/widgets/rewards/` — a different widget scope than the lobby.
  Cross-widget imports are **prohibited** by project rules; the lobby cannot import it directly.
- The component has **no props/injection point**. Reusing it as-is for the lobby is
  structurally impossible without either cross-widget coupling (blocked) or modification.
- The abstraction is **trivially thin** — 45 lines wrapping the shared `Collapsible`
  primitive in a `section` with a header and a `faqItems.map()`. The value extracted by
  a formal promotion is minimal: the lobby FAQ would be ~40 lines of nearly identical code.
- A promotion to `src/shared/ui/` would require: (1) refactoring `RewardsFaq` to accept
  an `items` prop, (2) updating `rewards-faq.tsx`'s call site, (3) updating the rewards
  import path. That is scope beyond this task and produces a shared abstraction of ~40
  lines that both call sites would still mostly re-implement themselves.
- The cleanest path is for the lobby FAQ to write its own `faq-section.tsx` in
  `src/widgets/lobby/`, building directly on `Collapsible` / `CollapsibleTrigger` /
  `CollapsibleContent` from `src/shared/ui/primitives/collapsible`, using `rewards-faq.tsx`
  as a structural reference (not as an import).

**The raw-Collapsible approach from the prior audit stands. No change to that recommendation.**

### Side effects of verdict (c)

- Zero. No existing file is moved or modified. The rewards widget is untouched.
- The lobby `faq-section.tsx` implementation will naturally duplicate the ~40-line
  structural pattern — this is intentional per FSD (per-domain composition, not premature
  shared abstraction).

### What to use as an implementation reference

`src/widgets/rewards/rewards-faq.tsx` is the clearest structural reference for the
lobby's `faq-section.tsx`. Key differences the lobby version should account for:
- The icon asset path differs (`rewards/icons/icon-question.svg` → lobby may reuse the
  same asset or source a lobby-specific one; the Figma reference uses a question-bubble icon).
- The lobby FAQ data will be lobby-specific placeholder items (5 items per Figma) — do not
  import from `rewards-data.ts`.
- Token mapping is identical (`bg-surface`, `rounded-lg`, `text-text`, `text-text-muted`,
  `text-sm`, `text-base`, `font-semibold`).
- `defaultOpen={index === 0}` to pre-open the first item matches Figma's open-state reference.
