# Task Lifecycle Record

## Identity

- Task title: Landing Page — Detailed Implementation (multi-pass)
- Status: in_progress
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: feat/landing-page-redesign
- Current branch at task start: develop
- Branch creation command/evidence: `git checkout -b feat/landing-page-redesign` from develop;
  confirmed on branch via `git branch --show-current` → feat/landing-page-redesign;
  HEAD commit at branch creation: c061fa4 chore: enable sharp/unrs-resolver build scripts

## Scope

- Goal: Implement the full Figma-designed landing page (6 sections) across 6 sequential passes
  on one task branch, with a UI-kit pass first to update the shared primary button gradient.

- Non-goals:
  - No BFF, API client, TanStack Query hooks, or Zustand stores.
  - No new npm dependencies.
  - No game renderer or game module changes.
  - No footer changes (social icon unification is a separate future task).
  - No CI, Playwright, or scripted validation.
  - No Storybook or design system documentation.
  - No backend-authoritative data wiring (rewards total, leaderboard rows are STATIC PLACEHOLDER).
  - No brand/legal copy transplanted from Figma reference design.

- Approved scope (by pass):
  Pass 1 — Primary Button Gradient (UI-kit)
    Edit: src/shared/ui/primitives/button.tsx (primary variant only)
    No globals.css change needed (all tokens already present)

  Pass 2 — Hero section
    Edit:   src/widgets/lobby/lobby.tsx
            src/widgets/lobby/lobby-hero.tsx
            src/widgets/lobby/lobby-hero-cta.tsx
    Create: src/shared/assets/landing/hero/ (art files: hero-character.webp,
            hero-coins-large.webp, hero-coins-small.webp, hero-chip.webp)
    Note:   Art placeholders first; next/image imports added once Figma exports arrive.

  Pass 3 — Rewards Banner
    Delete: src/widgets/lobby/lobby-how-to.tsx (not in Figma; import removed from lobby.tsx)
    Create: src/widgets/lobby/lobby-rewards-banner.tsx
            src/shared/assets/landing/rewards/rewards-coins.webp (once exported)

  Pass 4 — Features + Games grids + Icon registry (crown)
    Rewrite: src/widgets/lobby/lobby-features.tsx → lobby-feature-cards.tsx
    Create:  src/widgets/lobby/lobby-games-grid.tsx
             src/shared/ui/icons/crown.tsx
             src/shared/ui/icons/registry.ts
             src/shared/assets/landing/features/ (4 thumbnails)
             src/shared/assets/landing/games/ (4 thumbnails)

  Pass 5 — Monthly Leaderboard + trophy icon
    Create: src/widgets/lobby/lobby-leaderboard.tsx
            src/shared/ui/icons/trophy.tsx (if not in Lucide v1.17)
            src/shared/assets/landing/leaderboard/ (orb + rocket decoratives)

  Pass 6 — FAQ
    Create: src/widgets/lobby/lobby-faq.tsx (uses existing Collapsible primitive)

- Forbidden scope:
  - src/app/api/** (BFF boundary — no browser-side backend calls)
  - Any new npm dependency install
  - Staging, committing, pushing, PR creation, branch deletion
  - Editing files outside approved scope per pass

- Editable files (Pass 1 — active):
  - src/shared/ui/primitives/button.tsx
  - .ai/tasks/active/landing-page-redesign.md (this file)

- Context-only files (Pass 1):
  - src/app/globals.css (tokens confirmed, no edit needed)
  - src/widgets/lobby/lobby-hero-cta.tsx (future Pass 2 consumer)
  - src/widgets/top-bar/top-bar.tsx (primary consumer — UI QA target)
  - src/widgets/auth-modal/auth-modal.tsx (primary consumer — UI QA target)

## Source Of Truth

- Source-of-truth files inspected:
  - docs/architecture/foundation-decisions.md
  - src/app/globals.css
  - src/shared/ui/primitives/button.tsx
  - package.json

- Architecture decisions:
  - Design system: Tailwind CSS + CSS variables + cn() + CVA + Radix wrappers + Motion + single dark theme
  - State boundary: browser UI → local /api/* only; no direct backend calls
  - Shared primitives must be business-agnostic
  - Product UI belongs in widgets, entities, features, or games

- Relevant rules:
  - .claude/rules/design-system-foundation.md
  - .claude/rules/project-structure.md
  - .claude/rules/git-lifecycle.md
  - .claude/rules/quality-gates.md

- Relevant skills:
  - audit, implementation, review, pre-commit, ui-qa

## Impact

- Docs impact: None for Pass 1. After Pass 4 (icon registry), one-liner addition to
  foundation-decisions.md may be warranted — defer to review skill.

- API boundary impact: None. No browser-to-backend calls in any landing pass.

- UI QA requirement: HIGH. All 6 sections involve visible layout/interactive changes.
  Pass 1 specifically: all primary button consumers must be verified post-merge.
  Primary consumers affected by Pass 1:
    1. src/widgets/top-bar/top-bar.tsx — "Log In" button (logged-out state)
    2. src/widgets/auth-modal/auth-modal.tsx — "Log In" and "Register" tab CTAs
    3. src/widgets/lobby/lobby-hero-cta.tsx — future "Register" CTA (Pass 2)
  UI QA targets: desktop + mobile viewports, all three above.

- Stack primitive checklist:
  - Entrypoint thinness: n/a (editing shared primitive only)
  - Component split: n/a
  - Data/state/form ownership: n/a
  - Project primitives: CVA + cn() used correctly; Tailwind v4 gradient utilities confirmed

## Validation Plan

- Planned commands:
  - git diff --check
  - pnpm lint
  - pnpm build

- Manual checks:
  - Scope check: only button.tsx primary variant changed
  - UI QA: primary button consumers (post-pass, separate ui-qa prompt)

- Skipped checks and reasons:
  - Playwright: not present in repo (foundation-decisions.md)
  - CI: not present in repo

## Evidence

- Commands run:
  Pass 1:
    git diff --check     → clean (no output)
    pnpm lint            → clean (no errors)
    pnpm build           → ✓ Compiled successfully in 12.4s, TypeScript ✓, 9/9 static pages generated
  Note: pre-existing Next.js workspace-root warning (multiple lockfiles) — unrelated to this change.
- Review evidence: pending
- Pre-commit evidence: pending
- UI QA evidence:
  Pass 1 — manual sign-off by user (ui-qa skill not run for this pass):
    Method: manual visual check, desktop + mobile viewports.
    Consumers verified:
      - top-bar "Log In" button (logged-out state, desktop sidebar + mobile)
      - auth-modal "Log In" CTA (Log In tab)
      - auth-modal "Register" CTA (Register tab)
    Result: all render token gradient (#4ade80 → #22c55e), text legible, states correct.
    Gradient hover snap: ACCEPTED as known CSS limitation; logged as future ui-polish backlog item.
    Sign-off: PASS
- API boundary evidence: not applicable

## Risks And Handoff

- Risks:
  R1 — Figma art assets not yet renamed/exported. Passes 2–5 will use <div> placeholders
       until WebP files arrive. Implementation can proceed; art is drop-in.
  R2 — `--color-primary-tint` (#4ade80) already in @theme — confirmed. No token addition needed.
  R3 — `hover:bg-primary-hover` (flat bg override) does not visually override a gradient bg in CSS.
       Resolved in Pass 1 by switching hover/active to gradient-from/to shifts instead.
  R4 — Glow color #1DBA4B not in @theme. Will use inline style scoped to LobbyHero only
       in Pass 2 — does not require a new token.
  R5 — lobby-how-to.tsx deletion (Pass 3) — confirmed no imports outside lobby.tsx.
  R6 — Rewards counter total is STATIC PLACEHOLDER; Track B wires real endpoint.
  R7 — Leaderboard rows are STATIC PLACEHOLDER; Track B wires real endpoint.
  R8 — FAQ copy is fully placeholder; business copy TBD.

- Handoff:
  - Pass 1 complete when: button.tsx edited, validation passes, primary consumers listed for ui-qa.
  - Subsequent passes proceed section by section; one review+ui-qa per pass before next.
  - Branch stays open until all 6 passes + review + pre-commit complete.

- Lifecycle close notes:
  - Close only after explicit user request + completion evidence for all 6 passes.
