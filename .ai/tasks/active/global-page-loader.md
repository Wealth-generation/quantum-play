# Task Lifecycle Record

## Identity

- Task title: Global Quantum Play page loader
- Status: Implemented
- Mode: Implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: codex/global-page-loader
- Current branch at task start: develop
- Branch creation command/evidence: `git checkout -b codex/global-page-loader` succeeded and switched to `codex/global-page-loader`.

## Scope

- Goal: Add a simple global Quantum Play loader overlay on initial mount and route/search-param changes.
- Non-goals: No new dependencies, no async-resource loading manager, no Link/router interception, no browser automation, no staging/commit/push/PR/merge/archive.
- Approved scope: AppShell loader integration, app-shell page loader component, top-bar logo cleanup, include `public/images/quantum-play-logo.webp`.
- Forbidden scope: API/BFF changes, auth/session changes, dependency changes, scripts/tooling changes, broad routing interception, waiting for every query/image/resource.
- Editable files:
  - `src/widgets/app-shell/app-shell.tsx`
  - `src/widgets/app-shell/page-loader.tsx`
  - `src/widgets/top-bar/top-bar.tsx`
  - `public/images/quantum-play-logo.webp`
  - `.ai/tasks/active/global-page-loader.md`
- Context-only files:
  - `CLAUDE.md`
  - `docs/architecture/foundation-decisions.md`
  - `docs/architecture/auth.md`
  - `.claude/rules/**`
  - `docs/workflow/**`
  - `scripts/docs-ownership-map.json`
  - `package.json`
  - `src/app/layout.tsx`
  - `src/app/providers.tsx`
  - `src/app/globals.css`
  - `.ai/context/loader/loader-ref.mp4`
  - `.ai/context/loader/cur-loader-order.mp4`
  - `node_modules/next/dist/docs/**`

## Source Of Truth

- Source-of-truth files inspected: `CLAUDE.md`, `docs/architecture/foundation-decisions.md`, `docs/architecture/auth.md`, relevant `.claude/rules/**`, `docs/workflow/ownership-to-docs.md`, `scripts/docs-ownership-map.json`, `package.json`, app-shell/top-bar source.
- Architecture decisions: `src/widgets` owns large product/page composition blocks; Motion is available for lightweight UI transitions; shared primitives remain business-agnostic.
- Relevant rules: implementation workflow, git lifecycle, docs freshness, UI QA, validation workflow.
- Relevant skills: audit, implementation, ui-markup, responsive-layout.

## Impact

- Docs impact: docs-not-needed rationale: `src/widgets/top-bar/top-bar.tsx` changes only correct the already approved logo display; `src/widgets/app-shell/page-loader.tsx` and `src/widgets/app-shell/app-shell.tsx` add app-shell UI behavior within existing widget ownership without changing provider/state/API architecture. Durable docs remain accurate.
- API boundary impact: Not applicable; no API clients, route handlers, backend URLs, auth/session, or BFF logic changed.
- UI QA requirement: Manual UI QA required by user across app routes and responsive viewports; browser automation explicitly skipped.
- Stack primitive checklist: App shell remains thin composition; product UI stays in `src/widgets`; Motion is used for lightweight loader animation; no new state ownership, forms, API, or shared primitive extraction.

## Validation Plan

- Planned commands:
  - `git status --short --branch`
  - `git diff --check`
  - `pnpm check:docs`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm validate` if appropriate after focused checks
- Manual checks: Scope, docs impact, API boundary, reduced-motion logic, z-index behavior by source inspection.
- Skipped checks and reasons: Browser automation/Playwright skipped by user instruction.

## Evidence

- Commands run:
  - `git status --short --branch`
  - `git checkout -b codex/global-page-loader`
  - `git diff --check` passed.
  - `pnpm check:docs` passed.
  - `pnpm validate` failed once at `pnpm lint` because `page-loader.tsx` synchronously set state in an effect; implementation was corrected by remounting a timed loader cycle per route key.
  - `pnpm validate` failed once at `pnpm build` because sandboxed network blocked the existing `next/font` Google Fonts fetch.
  - `pnpm validate` passed with escalation/network access for the Google Fonts fetch.
- Patch evidence:
  - Manual video issue source: `.ai/context/loader/cur-loader-order.mp4`.
  - Root cause: `PageLoader` reads `useSearchParams()`, so the static initial render uses the AppShell Suspense fallback; the previous fallback was `null`, leaving the page content visible until hydration. The Motion overlay also used `initial={{ opacity: 0 }}`, so the hydrated overlay began transparent.
  - Patch: AppShell now uses `PageLoaderFallback` as the Suspense fallback so loader markup exists in the first render, and the hydrated overlay starts visible while the timer controls hide/fade-out.
  - Patch validation: `git status --short --branch` run on `codex/global-page-loader`; `git diff --check` passed; `pnpm check:docs` passed; `pnpm validate` failed once at `pnpm build` due to the existing sandboxed `next/font` Google Fonts fetch and then passed with escalation/network access.
- Patch review evidence: Pass. The patch is limited to `src/widgets/app-shell/page-loader.tsx`, `src/widgets/app-shell/app-shell.tsx`, and this task artifact; the top-bar/logo work was left untouched; no dependencies, API/BFF, auth/session, state ownership, route interception, browser automation, or async-resource loading manager were introduced.
- Animation patch evidence:
  - Manual QA issue: loader appeared correctly with blur/darkening and first-paint ordering, but the logo did not visibly scale/grow in normal-motion mode.
  - Root cause: the normal-motion logo wrapper used `initial={false}`, so the keyframed scale was not applied as a clear mount entrance. The logo could appear already settled instead of visibly growing.
  - Patch: `src/widgets/app-shell/page-loader.tsx` now gives the logo wrapper an explicit normal-motion initial state (`opacity: 0`, `scale: 0.84`, no glow), animates through a visible centered growth pulse (`scale: 1.14`) and settles at `scale: 1`. Reduced-motion remains fade-only with no scale/growth.
- Animation patch validation: `git status --short --branch` run on `codex/global-page-loader`; `git diff --check` passed; `pnpm check:docs` passed; `pnpm validate` failed once at `pnpm build` due to the existing sandboxed `next/font` Google Fonts fetch and then passed with escalation/network access.
- Animation regression fix evidence:
  - Manual QA regression: the previous animation patch made the overlay appear first without the logo, then the logo appeared and grew too sharply.
  - Root cause: normal motion started the hydrated logo wrapper at `opacity: 0` and `scale: 0.84`, which broke continuity with `PageLoaderFallback` and made the logo visually absent before a sharp growth.
  - Patch: `src/widgets/app-shell/page-loader.tsx` keeps the normal-motion logo visible from the first hydrated frame at `opacity: 1` and `scale: 1`, then gently scales the wrapper through `1 -> 1.09 -> 1` with a restrained glow. Reduced-motion remains fade-only with no scale/growth. The fallback continues to render the visible centered logo immediately.
- Animation regression fix validation: `git status --short --branch` run on `codex/global-page-loader`; `git diff --check` passed; `pnpm check:docs` passed; `pnpm validate` failed once at `pnpm build` due to the existing sandboxed `next/font` Google Fonts fetch and then passed with escalation/network access.
- Animation regression fix review evidence: Pass. The fix is limited to `src/widgets/app-shell/page-loader.tsx` and this task artifact; `PageLoaderFallback`, AppShell integration, top-bar/logo cleanup, route/search remount behavior, overlay, blur, z-index, timer, and logo aspect ratio are preserved; no dependencies, API/BFF, auth/session, state ownership, route interception, browser automation, or async-resource loading manager were introduced.
- Animation refinement evidence:
  - Manual QA issue: the visible logo scale still felt like a twitchy pulse because the normal-motion animation scaled `1 -> 1.09 -> 1` within the short loader cycle.
  - Root cause: returning the logo back to `scale: 1` before the loader exit created a scale-back/pulse effect; glow keyframes also reinforced the pulse feel.
  - Patch: `src/widgets/app-shell/page-loader.tsx` now uses a smooth monotonic normal-motion scale from `1` to `1.07` with stable glow. The logo remains visible from the first frame, `PageLoaderFallback` remains visible/centered, and reduced-motion remains fade-only/static with no scale/growth.
- Animation refinement validation: `git status --short --branch` run on `codex/global-page-loader`; `git diff --check` passed; `pnpm check:docs` passed; `pnpm validate` failed once at `pnpm build` due to the existing sandboxed `next/font` Google Fonts fetch and then passed with escalation/network access.
- Animation refinement review evidence: Pass. The refinement is limited to `src/widgets/app-shell/page-loader.tsx` and this task artifact; normal motion is a monotonic scale-up to `1.07` with stable glow; reduced motion has no scale/growth; `PageLoaderFallback`, first-paint ordering, overlay, blur, z-index, timer, route/search behavior, logo asset, and logo aspect ratio are preserved.
- Lift animation refinement evidence:
  - Manual QA issue: growth appeared to start late because `PageLoaderFallback` showed the visible loader/logo before the hydrated Motion animation began.
  - Root cause: the logo visual animation lived only in hydrated Motion state, while the first-paint fallback rendered a static logo. That created a visible static period before animation started after hydration.
  - Patch: `src/widgets/app-shell/page-loader.tsx` now uses shared CSS keyframes rendered by both `PageLoaderFallback` and hydrated `PageLoader`. The logo is visible immediately, then smoothly scales from `1` to `1.07` and lifts upward by `8px` over the `1200ms` loader duration. A subtle decorative shadow ellipse below the logo fades/narrows with the same timing. Reduced motion disables the CSS logo/shadow animation and keeps fade-only/static behavior.
- Lift animation refinement validation: `git status --short --branch` run on `codex/global-page-loader`; `git diff --check` passed; `pnpm check:docs` passed; `pnpm validate` failed once at `pnpm build` due to the existing sandboxed `next/font` Google Fonts fetch and then passed with escalation/network access.
- Lift animation refinement review evidence: Pass. The refinement is limited to `src/widgets/app-shell/page-loader.tsx` and this task artifact; shared CSS keyframes align fallback and hydrated visual timing; reduced motion disables logo/shadow animation; the JS timer, first-paint fallback, route/search behavior, overlay, blur, z-index, logo asset, and logo aspect ratio are preserved.
- Latest manual visual QA evidence:
  - Current loader visual feel is accepted.
  - Logo is visible immediately with the loader.
  - Logo smoothly grows/lifts and does not feel twitchy or pulsed.
  - Shadow is accepted as subtle polish.
  - Exact reference-like shrinking shadow is accepted as non-blocking polish, not a blocker.
  - No further animation tuning is needed for this task.
- Review evidence: Pass. Scope is limited to approved files; loader ownership remains in `src/widgets/app-shell`; top-bar logo cleanup remains in approved scope; animation patch only changes `src/widgets/app-shell/page-loader.tsx` and this task artifact; no API/auth/session/BFF/state ownership changes; docs freshness is satisfied by the source-backed docs-not-needed rationale above.
- Pre-commit evidence: Not requested.
- UI QA evidence: Focused manual QA performed by user for the loader first-paint ordering issue and latest visual animation feel. Result: initial page load now works as expected; the loader appears before readable site content; the previous issue where the site flashed before the loader is resolved; the logo is visible immediately with the loader and smoothly grows/lifts without twitchy or pulsed behavior; shadow polish is accepted. Full route/viewport coverage, reduced-motion verification, and stuck-loader checks were not provided in these QA updates.
- API boundary evidence: No browser API clients, route handlers, backend URLs, auth/session/token logic, or BFF files changed.

## Risks And Handoff

- Risks: Route/search-param loader still appears after route commit, not before navigation starts; this matches approved simple app-shell approach and avoids router interception. Remaining UI QA gaps: full route transition coverage, full mobile/desktop viewport coverage, reduced-motion verification, and stuck-loader checks. Exact reference-like shrinking shadow behavior is accepted as non-blocking polish, not a blocker.
- Handoff: Implementation and mechanical validation complete. Focused manual QA confirms the initial first-paint ordering issue is resolved and the latest visual animation feel is accepted. Broader manual UI QA coverage remains outstanding unless completed separately or explicitly accepted as a handoff risk.
- Lifecycle close notes: Do not archive unless explicitly requested.
