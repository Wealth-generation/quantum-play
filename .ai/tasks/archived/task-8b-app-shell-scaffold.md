# Task 8b — App Shell + Main Page Static Scaffold

## Goal

Build the static app shell (sidebar + top bar + content slot) and the main page lobby scaffold,
wired into `src/app/layout.tsx` and `src/app/page.tsx`. No backend, no auth logic, no data
wiring — UI skeleton only.

## Branch Mode

- **Mode:** PR-mode
- **Base branch:** `develop` (HEAD at task start: `2ee9f1b`)
- **Task branch:** `feat/app-shell-routing-baseline`
- **Current branch at task start:** `develop`
- **Branch creation command:** `git checkout -b feat/app-shell-routing-baseline`
- **Branch creation evidence:** switched successfully; `git branch --show-current` returns
  `feat/app-shell-routing-baseline`

## Scope

Approved editable files:

```
src/widgets/app-shell/app-shell.tsx       NEW → UPDATED (QA fix: hamburger toggle + scrim)
src/widgets/app-shell/index.ts            NEW
src/widgets/main-nav/nav-items.ts         NEW → UPDATED (pass 3: removed Help & Support)
src/widgets/main-nav/main-nav.tsx         NEW → UPDATED (pass 3: removed H&S section; nav plate)
src/widgets/main-nav/index.ts             NEW
src/widgets/top-bar/top-bar.tsx           NEW
src/widgets/top-bar/index.ts              NEW
src/widgets/footer/footer.tsx             NEW → UPDATED (pass 3: merged into single block)
src/widgets/footer/footer-data.ts         NEW (QA Finding 2)
src/widgets/footer/index.ts              NEW (QA Finding 2)
src/widgets/lobby/lobby-hero.tsx          NEW
src/widgets/lobby/lobby-features.tsx      NEW
src/widgets/lobby/lobby-how-to.tsx        NEW
src/widgets/lobby/lobby.tsx               NEW
src/widgets/lobby/index.ts                NEW
src/widgets/auth-modal/auth-modal.tsx          NEW → UPDATED (pass 4: Register form + social block)
src/widgets/auth-modal/auth-modal-provider.tsx NEW (review-prescribed refactor)
src/widgets/auth-modal/index.ts                NEW → UPDATED (provider export)
src/shared/ui/icons/social-icons.tsx      NEW (pass 4: shared Discord/X/Google inline SVGs)
src/shared/ui/primitives/input.tsx        NEW
src/shared/ui/primitives/checkbox.tsx     NEW
src/shared/ui/primitives/index.ts         UPDATE (add Input + Checkbox exports)
src/app/layout.tsx                        UPDATE (AppShell wrapper + fix stale metadata)
src/app/page.tsx                          UPDATE (render Lobby)
```

Context-only files (not edited):

```
docs/design/design-source-audit.md
docs/architecture/foundation-decisions.md
src/app/globals.css
src/shared/lib/cn.ts
src/shared/lib/index.ts
src/shared/ui/primitives/button.tsx
src/shared/ui/primitives/card.tsx
src/shared/ui/primitives/collapsible.tsx
src/shared/ui/primitives/dialog.tsx
src/shared/ui/primitives/tabs.tsx
src/shared/ui/primitives/popover.tsx
```

## Non-Goals

- No catalog/bet-feed data wiring
- No real auth logic
- No game pages or BFF/API routes
- No TanStack Query, Zustand stores, or Motion
- No dependency installs
- No domain/game colors in global tokens
- No Badge, Tooltip, Avatar, or Table primitives
- No `@radix-ui/react-checkbox` install (not in package.json)
- Nav href slugs are inferred conventions — static strings only; routing not implemented

## Known Gaps (carried from design audit §9)

- Register tab content not designed — rendered as "Coming soon" placeholder [CLOSED pass 4: static form added]
- UI states (hover/focus/loading/disabled) not fully enumerated — relies on existing 8a CVA
- Tablet/intermediate breakpoint not confirmed — `lg:` used for sidebar/drawer boundary
- Logged-in mobile top-bar not captured — logged-in region is static placeholder only; logged-in
  mobile drawer variant (logout button, bell, balance pills) deferred to auth-wiring task
- Nav route slugs are `[inferred]` — will 404 on non-existent routes during development
- Real legal/licensing/regulatory copy not provided — copyright row is a placeholder; business owner
  must supply final text before production
- Nav Lucide icons are functional placeholders — final icon set not confirmed from design; replacement
  deferred to a design-review pass
- Footer social icons duplicated — `social-icons.tsx` (auth-modal) and `footer.tsx` each carry their
  own inline SVG paths for Discord/X; deduplication deferred to a future cleanup pass
- Radix DialogContent "Missing Description" a11y warning — `<DialogDescription>` or
  `aria-describedby={undefined}` needed on `<DialogContent>`; deferred to auth-wiring task
- Hamburger `aria-label="Open navigation"` is static — does not reflect toggle state; dynamic label
  requires passing `drawerOpen` to TopBar; deferred to auth-wiring task

## Stack Primitive Checklist

- `src/app/layout.tsx` — thin composition layer; AuthModalProvider + AppShell as Client
  Component islands; metadata + font stay server-side
- `src/app/page.tsx` — thin route; delegates to `<Lobby />`
- Widget components: orchestration only; no business logic
- State: `collapsed`, `drawerOpen` in AppShell; `authModalOpen` in AuthModalProvider
  (React context, single source of truth — consolidated by auth-modal provider refactor)
- No form state wiring (UI-only scaffold)
- Primitives used: Button, Card, Collapsible, Dialog, Tabs, Input, Checkbox, cn()
- Motion: not used (Tailwind transitions only, per audit recommendation)
- Footer: Server Component (no server-only APIs); imported by Client Component AppShell
  (safe — purely static JSX, Lucide icons, inline SVGs)

## Validation

- [x] `git diff --check` — clean (no whitespace errors)
- [x] `eslint src/widgets src/shared/ui/primitives/{input,checkbox,index}.ts src/app/` — 0 errors
  (Fixed: InputProps/CheckboxProps changed from empty `interface` to `type` alias per
  `@typescript-eslint/no-empty-object-type`)
- [x] `next build` — compiled in 10.9s (QA pass 2), TypeScript 10.1s; 0 errors
- [x] `git diff --check` — clean (pass 3)
- [x] `eslint src/widgets/footer/footer.tsx src/widgets/main-nav/main-nav.tsx src/widgets/main-nav/nav-items.ts` — 0 errors (pass 3)
- [x] `next build` — compiled in 13.0s (pass 3), TypeScript 8.1s; 0 errors
- [x] `git diff --check` — clean (pass 4)
- [x] `eslint src/widgets/auth-modal/auth-modal.tsx src/shared/ui/icons/social-icons.tsx` — 0 errors (pass 4)
- [x] `next build` — compiled in 14.1s (pass 4), TypeScript 9.9s; 0 errors
- [x] Manual scope check: files changed match approved list (see deviations + QA findings)
- [x] Manual API boundary check: no external calls, no backend URLs, no BFF code
- [x] UI QA evidence: collected (see UI QA section below)

## Deviations from Audit

1. **`lobby-hero-cta.tsx` added** (not named in audit) — thin "use client" island for the hero
   CTA button. Required by Next.js App Router: a Server Component (lobby-hero.tsx) cannot hold
   `useState`, so the interactive button is extracted as a client island.

2. **Auth-modal state consolidated via AuthModalProvider** — original implementation used two
   independent `AuthModal` instances (one in TopBar, one in LobbyHeroCta). Review prescribed a
   single provider. Applied: `auth-modal-provider.tsx` exposes `AuthModalProvider` (context
   + single `<AuthModal>`) and `useAuthModal()` hook. Layout.tsx wraps the body in
   `<AuthModalProvider>`. TopBar and LobbyHeroCta consume `useAuthModal()` — no local state,
   no duplicate modal instances.

3. **Lint fix on new primitives** — `InputProps` / `CheckboxProps` changed from `interface`
   extending without additional members to `type` alias, to satisfy
   `@typescript-eslint/no-empty-object-type`.

## QA Findings Addressed

**Finding 1 — Mobile drawer full-width (logged-out variant)**
- `main-nav.tsx`: added optional `className?: string` prop (applied via cn() to `<nav>`),
  allowing the parent to override `w-64` and `border-r` without touching collapse logic.
- `app-shell.tsx`: mobile drawer panel changed from `fixed inset-y-0 left-0` (partial width)
  to `fixed top-14 bottom-0 left-0 right-0` (full viewport width, below top bar h-14).
  Mobile MainNav receives `className="w-full border-r-0"` to fill the full-width container.
  Scrim/backdrop removed (full-width drawer makes it unnecessary).
  Desktop persistent-sidebar behaviour (lg: hidden, w-64/w-16 collapse) is unchanged.
- **Deferred (logged-in drawer variant):** Logout button, notification bell with count, and
  balance pills in the mobile drawer remain deferred per design audit GAP §10 (logged-in
  mobile top bar not captured). Belongs to the future auth-wiring task.

**Finding 2 — Site-wide footer**
- `src/widgets/footer/footer-data.ts` — pure data arrays: `aboutLinks`, `termsLinks`,
  `socialLinks`. Slugs are inferred conventions (same pattern as nav-items.ts). All social
  `href` values are placeholder `"#"`.
- `src/widgets/footer/footer.tsx` — Server Component (no "use client", no server-only APIs).
  Layout: brand block + ABOUT/TERMS/SOCIALS columns + copyright panel. Social icons use
  minimal inline SVGs (brand icons removed from lucide-react 1.x; confirmed by runtime
  check). `ShieldCheck` (lucide-react) used for responsible-gambling mark.
  **Copyright/legal text is a placeholder** — real licensing/regulatory copy must be provided
  by the business owner and is explicitly out of scope.
- `src/widgets/footer/index.ts` — re-export.
- `app-shell.tsx`: Footer rendered inside `<main>` after `{children}` so it scrolls with
  page content site-wide.

**Finding 3 — Duplicate logo in mobile drawer**
- `main-nav.tsx`: the header row (`<div>` containing brand wordmark + collapse toggle) was
  rendered in both the persistent desktop sidebar AND the mobile drawer. Since the top bar
  already provides the logo and hamburger on mobile, this duplicated the logo.
- Fix: changed `flex` → `hidden lg:flex` on the header row `<div>`. On mobile (`< lg`) the
  row is `display:none`; on desktop (`≥ lg`) it is `display:flex` as before. The collapse
  toggle disappears with the header row on mobile, which is correct (collapse is only
  meaningful for the persistent sidebar). Nav items and Games Collapsible are unaffected
  in both contexts. (Help & Support was removed permanently in a later pass — see Pass 3.)
- No new props or state introduced; change is CSS-only using existing Tailwind breakpoint.

**Pass 4 — Register tab form + shared social auth block (closes §10 gap)**
- `auth-modal.tsx`: Register `TabsContent` replaced with a real static form:
  Username (text), Email (email), Password (password) inputs; "To access the platform,
  please confirm:" label with two Checkbox rows — Terms of Service/Privacy Policy (linked
  to `/terms` and `/privacy` inferred slugs) and "I am 18 years old or older"; Register
  Button (`variant="primary"`, `type="button"`, `disabled`) — UI-only, no auth logic.
- Opportunistic fix: Log In tab Button changed from `type="submit"` to `type="button"`
  (review-flagged non-blocking; applied since file was open).
- Log In tab input IDs updated from `auth-email`/`auth-password` to
  `login-email`/`login-password` (avoids duplicate IDs when both tabs exist in DOM).
- `SocialAuthBlock` internal sub-component added (not exported): OR divider + three
  no-op placeholder buttons (Google, Discord, X). Rendered on both Log In and Register
  tabs — factored once, referenced twice. Social-login is NOT a committed feature;
  these buttons are scaffold UI with no onClick/href and no auth behavior.
- `src/shared/ui/icons/social-icons.tsx` NEW: exports `DiscordIcon`, `XIcon`,
  `GoogleIcon`. Discord and X paths reused verbatim from footer.tsx. Google "G" paths
  added (monochromatic, `fill="currentColor"`). Footer.tsx retains its own copy pending
  a future icon deduplication pass (footer is off-limits in this pass).
- Art pane (desktop left panel): unchanged placeholder — no brand asset added.
- `Link` from next/link added to imports for /terms and /privacy static hrefs.

**Pass 3 — Footer unified into a single block**
- `footer.tsx`: removed the separate sibling `<div className="border-t ... bg-bg ...">` copyright
  panel. Copyright row now lives inside the single `<div className="mx-auto max-w-7xl ...">` 
  container, separated by `mt-8 border-t border-border pt-6`. Single `<footer>` element;
  no sibling sections. Layout reference used for structure only — no content copied.
  Wordmark, 18+ mark, placeholder copyright text and social hrefs unchanged.

**Pass 3 — Help & Support removed (excluded feature)**
- `nav-items.ts`: removed `bottomNavItems` export and `HelpCircle` icon import.
  Comment added: "Help & Support excluded from this project — not deferred, removed permanently."
- `main-nav.tsx`: removed the pinned bottom section (`border-t border-border px-2 py-2` div
  containing `bottomNavItems.map`). Import updated to drop `bottomNavItems`.
- Footer is unaffected (Help & Support was never in the footer columns).

**Pass 3 — Resting background plate on top-level nav links**
- `main-nav.tsx`: added module-scoped constant `NAV_PLATE_BG` (CSS `linear-gradient` string).
  Gradient expressed via `color-mix(in srgb, var(--token) 40%, transparent)` — references
  existing tokens `--color-surface-3` (#1b1f26 = Figma stop 1) and `--color-border-2`
  (#2b303b = Figma stop 2). No raw rgba values; no new globals.css tokens; no primitives change.
- `backgroundImage` style prop (not `background` shorthand) applied so Tailwind's
  `hover:bg-surface-3` can still set `background-color` underneath the semi-transparent gradient.
- Applied to: all `primaryNavItems` Links (Lobby, Pointshop, Leaderboard, Rewards, Bonuses)
  when `!isActive`; and always to `CollapsibleTrigger` (Games row, no route-based active state).
- Active items: no `backgroundImage` prop → show `bg-surface-3` solid from className. Active
  state remains visually distinct (solid vs semi-transparent gradient).
- Nested game sub-items (`CollapsibleContent` Links): intentionally plate-less (no style prop).
- `border-radius`: `rounded-md` className (already present); maps to `--radius-md: 8px` via
  Tailwind v4 `@theme` — exact match for the Figma 8px spec.

## UI QA

```txt
UI QA:
  Required: yes
  Routes/screens: / (lobby, desktop 1440x900 and mobile 375x812)
  Viewports: desktop (1440x900), mobile (375x812)
  Interactions/states:
    - Sidebar collapse/expand toggle (desktop)
    - Games collapsible open/close
    - Auth modal from top-bar Log In button
    - Auth modal from hero Play Now button (single instance verification)
    - Auth modal Log In tab: fields, checkboxes, disabled submit, OR+social block
    - Auth modal Register tab: fields, confirm checkboxes, ToS/Privacy links, disabled btn, social block
    - Mobile hamburger → full-width drawer
    - Footer scroll (desktop + mobile)

  Findings:
    PASS — Desktop sidebar: collapses to icon-only (w-16, labels+Daily Claimer hidden), expands to w-64. ✓
    PASS — Nav plate: resting primary items show gradient (color-mix surface-3/border-2 at 40%) via backgroundImage.
             Active "Lobby" item: no backgroundImage, solid bg-surface-3. ✓
    PASS — Games CollapsibleTrigger: gradient plate always applied. ✓
    PASS — Nested game sub-items (All Games, Roulette, Keno, Plinko, Dice): no plate, transparent. ✓
    PASS — No Help & Support in sidebar (removed permanently). ✓
    PASS — Games collapsible: toggles open/closed on click; chevron rotates. ✓
    PASS — Auth modal (top-bar): opens on Log In click. Log In tab has login-email (email),
             login-password (password) inputs; 2 checkboxes; submit button disabled=true
             (aria-label="Log in (coming soon)", type="button"); OR divider; G/Discord/X buttons. ✓
    PASS — Auth modal Register tab: switches via [role="tab"] click. Shows reg-username (text),
             reg-email (email), reg-password (password) inputs; "To access the platform, please
             confirm:" label; ToS+Privacy links (/terms, /privacy); 18+ checkbox; Register button
             disabled=true (aria-label="Register (coming soon)"); OR divider; G/Discord/X buttons. ✓
    PASS — Single dialog instance: document.querySelectorAll('[role="dialog"]').length === 1. ✓
    PASS — Play Now hero opens same modal (Log In tab). Same single AuthModalProvider instance. ✓
    PASS — No duplicate ID console warnings. login-email/login-password and reg-username/
             reg-email/reg-password are distinct across both tab panels. ✓
    PASS — Footer: single unified <footer> element, 1 child div. Copyright "© 2025 Quantum Play.
             Licensing and regulatory information to be provided." inside unified body (not sibling). ✓
    PASS — Mobile (375x812): top bar shows hamburger + "QUANTUM PLAY" wordmark + Log In button. ✓
    PASS — Mobile drawer: full-width below top bar (fixed top-14 bottom-0 left-0 right-0),
             no duplicate logo (header row hidden via hidden lg:flex). ✓
    PASS — Mobile footer: QUANTUM PLAY brand, 18+ mark, ABOUT/TERMS columns, SOCIALS row,
             placeholder copyright — all render correctly. ✓
    NOTE — Console: Radix DialogContent "Missing Description" warning (2×). Non-blocking; requires
             <DialogDescription> or aria-describedby={undefined} on DialogContent. Out of scope for
             this scaffold task.
    NOTE — Console: Next.js Turbopack workspace root warning (lockfile detection). Pre-existing
             environment issue; unrelated to task 8b.

  Blockers/gaps:
    None. The mobile drawer close gap was fixed in the QA-fix pass (see QA Findings Addressed below).

  Residual risk:
    Low. All core visual checkpoints pass. The drawer close gap is a scaffold limitation, not a
    rendering regression. The Radix a11y warning is pre-existing and well-understood.
```

**QA-fix pass — Mobile drawer close mechanism**
- `app-shell.tsx`: hamburger handler changed from `() => setDrawerOpen(true)` to
  `() => setDrawerOpen((v) => !v)`. Clicking the hamburger now both opens and closes the
  drawer — primary close mechanism on mobile.
- `app-shell.tsx`: scrim overlay added — a `div` with `fixed bottom-0 left-0 right-0 top-14
  z-40 bg-black/40 lg:hidden`, rendered only when `drawerOpen` is true. `onClick` calls
  `setDrawerOpen(false)`. Sits at z-40 (below drawer z-50), above page content. SSR-safe
  (no window/document access), Tailwind-only (no Motion). Hidden ≥lg so desktop is unaffected.
- `top-bar.tsx`: unchanged — hamburger button already calls `onOpenDrawer()` and the toggle
  logic lives entirely in the prop passed from AppShell.
- Desktop persistent-sidebar and collapse toggle behaviour: unchanged.
- Note: hamburger `aria-label="Open navigation"` remains static (passing `drawerOpen` to TopBar
  for a dynamic label is deferred — out of scope for this minimal fix).

## Review

Passed. Cumulative review completed after pass 4. Three non-blocking findings (all addressed or
recorded as deferred):
1. Footer social icon paths duplicated vs auth-modal — recorded in Known Gaps (future dedup pass).
2. AuthModalProvider context throw on missing provider — correct pattern; consumers are all inside
   the provider boundary.
3. Nav `aria-current="page"` correct; no other a11y concerns beyond the Radix Description note.

## Pre-Commit

Ready. All gates passed:
- `git diff --check` — clean ✓
- ESLint (all 24 source files) — 0 errors ✓
- `next build` — compiled 12.4s, TypeScript 8.4s, 0 errors ✓
- Scope diff — all changed files within approved scope (lobby-hero-cta.tsx documented as
  Deviation 1; .claude/launch.json is tooling-only, included at committer's discretion) ✓
- API boundary — no fetch/BFF/DTO/backend URLs; trivial pass ✓
- package.json + lockfile — unmodified ✓
- UI QA evidence — complete in artifact ✓
- Review evidence — passed, recorded ✓

Commit: `45f1667 feat(app-shell): static app shell, lobby, auth modal scaffold (task 8b)`
Merge: PR #4 merged into `origin/develop` (`f6aa6bf Merge pull request #4 from
  Wealth-generation/feat/app-shell-routing-baseline`)

## Status

CLOSED — merged to develop via PR #4. Artifact archived.
