# Task: Legal Pages (Terms + Privacy)

## Goal

Add two static legal pages — `/terms` and `/privacy` — linked from the footer and auth-modal. Both pages are structurally identical: page title + subtitle + 5 numbered content sections (badge + heading + intro + pill rows). All text is Lorem ipsum placeholder.

## Branch Mode

- Mode: **PR-mode**
- Base branch: `develop`
- Task branch: `feat/legal-pages`
- Current branch at task start: `develop`
- Branch creation command: `git checkout -b feat/legal-pages`
- Branch creation evidence: switched successfully, confirmed via `git branch --show-current`

## Scope

### Editable files (new — all created in this task)

```
src/app/terms/page.tsx
src/app/privacy/page.tsx
src/widgets/terms/index.ts
src/widgets/terms/terms-page.tsx
src/widgets/terms/terms-data.ts
src/widgets/terms/legal-section.tsx
src/widgets/privacy/index.ts
src/widgets/privacy/privacy-page.tsx
src/widgets/privacy/privacy-data.ts
src/widgets/privacy/legal-section.tsx
.ai/tasks/active/legal-pages.md   (this file)
```

### Context-only files (read, NOT edited)

```
src/widgets/footer/footer-data.ts       — slug source of truth (/terms, /privacy confirmed)
src/widgets/auth-modal/auth-modal.tsx   — secondary slug confirmation
src/shared/ui/section-reveal.tsx        — consumed pattern
src/shared/ui/primitives/card.tsx       — consumed primitive
src/app/globals.css                     — design token reference
src/widgets/app-shell/app-shell.tsx     — back-chevron ownership confirmed (global, no per-page control needed)
src/widgets/leaderboard/leaderboard-page.tsx — composition convention reference
src/widgets/rewards/rewards-page.tsx    — composition convention reference
```

## Non-Goals

- No edits to footer-data.ts, footer.tsx, auth-modal.tsx
- No edits to section-reveal.tsx, card.tsx, globals.css, app-shell.tsx
- No shared legal/numbered-section primitive in src/shared/ui
- No cross-import between src/widgets/terms and src/widgets/privacy
- No BFF route handlers, API clients, or query hooks
- No new dependencies
- No dev server launch
- No staging, committing, or pushing

## Docs Impact

No new architectural pattern introduced. Same FSD slice + SectionReveal + route convention already established. Docs-not-needed rationale: pattern is identical to leaderboard/rewards, both already in foundation-decisions.md.

## API Boundary Impact

None. Static content pages only.

## UI QA Impact

Required before pre-commit. Two new routes (/terms, /privacy), scroll reveal sections, mobile + desktop viewports. Visual QA is owner-supplied.

## Stack Primitive Checklist

- Entrypoint thinness: route files ~4 lines, import widget Page only ✓
- Orchestration: in widget *-page.tsx ✓
- Component split: page → SectionReveal → LegalSection sub-components ✓
- Data/state: no state; data in *-data.ts arrays ✓
- Form: not applicable ✓
- Primitives: Card from @/shared/ui/primitives; SectionReveal from @/shared/ui/section-reveal ✓

## Validation Plan

- git diff --check
- pnpm lint (0 errors target)
- pnpm build (both /terms and /privacy must prerender static, 0 errors)
- pnpm check:docs (via pnpm validate)

## Risks

- Pill row rounding: pill rows are rounded-lg/xl (rectangle), NOT rounded-full. Dot bullet is the circle.
- Badge shape: rounded-lg (rounded square), NOT rounded-full.
- Slugs: /privacy NOT /privacy-policy — confirmed against footer-data.ts and auth-modal.tsx.

---

## Pass 2 — Visual Polish (same branch, follow-up)

**Pass added:** 2026-07-06

### Additional scope (4 existing files edited, no new files)

```
src/widgets/terms/legal-section.tsx    — add border-primary/40 bg-primary/10 p-6 rounded-lg to <section>
src/widgets/privacy/legal-section.tsx  — mirror of above
src/widgets/terms/terms-page.tsx       — wrap <main> in relative div + absolute full-bleed gradient layer
src/widgets/privacy/privacy-page.tsx   — mirror of above
```

### Recipe applied

Section tint + border (from profile-ui-primitives.tsx pattern):
  `rounded-lg border border-primary/40 bg-primary/10 p-6` added to `<section>` root

Full-bleed page gradient (two offset radials, color-mix + primary token):
  `pointer-events-none absolute inset-0 -z-10` div wrapping the <main>,
  gradient: `radial-gradient(circle_at_20%_15%,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_55%),
             radial-gradient(circle_at_85%_80%,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_55%)`

### Non-goals (pass 2)

- No text, data, structure, or SectionReveal wiring changes
- No app-shell, globals.css, shared/ui, or footer edits
- No new tokens, dependencies, or shared wrappers
- No cross-import between the two widgets
