# Task: Suppress loader on client-side navigation

## Goal
The global page loader overlay (1200 ms branded splash) fires on initial load,
full reload, AND client-side route navigation. Keep it for initial load and
reload; suppress it for navigation.

## Scope
- **Editable:** `src/widgets/app-shell/page-loader.tsx` (primary)
- **Editable:** `src/widgets/app-shell/app-shell.tsx` (cleanup)
- **Context-only:** `src/app/layout.tsx`, `src/app/providers.tsx`,
  `src/shared/ui/section-reveal.tsx`, all game model hooks

## Non-goals
- No `src/app/loading.tsx` or `template.tsx` creation
- No changes to SectionReveal, legal pages, layout.tsx, providers.tsx,
  or any game-model `isLoading`
- No new state flag / ref / module-level `hasLoaded`
- No loader duration, styling, or animation changes
- No dev server; static analysis + build only

## Branch mode
PR-mode

## Base branch
`develop`

## Task branch
`fix/loader-navigation-suppress`

## Current branch at task start
`develop`

## Branch creation command/evidence
```
git checkout develop
git pull
git checkout -b fix/loader-navigation-suppress
```
Output: `Switched to a new branch 'fix/loader-navigation-suppress'`

## Root cause (from audit)
`PageLoader` computes `routeKey` from `usePathname()` + `useSearchParams()`
and passes `key={routeKey}` to `<TimedPageLoader>`. On navigation, `routeKey`
changes → React force-remounts `TimedPageLoader` → restarts with `visible=true`
→ 1200 ms overlay flashes.

## Planned changes

### page-loader.tsx
1. Remove `key={routeKey}` from `<TimedPageLoader>` so it is never
   force-remounted on navigation.
2. Remove `usePathname`, `useSearchParams`, and `routeKey` from `PageLoader`.
3. Simplify `PageLoader` to `return <TimedPageLoader />;`
4. Remove `routeKey` prop from `TimedPageLoader` interface/signature.
5. Remove inner `key={routeKey}` on the `motion.div` inside `TimedPageLoader`.

### app-shell.tsx
1. Remove `React.Suspense` wrapper (no longer needed without `useSearchParams`).
2. Render `<PageLoader />` directly.
3. Remove `PageLoaderFallback` import (verify no other consumers first).

## Validation plan
- `pnpm validate` (git diff --check + lint + build + check:docs)

## Validation evidence
- `git diff --check`: clean
- `pnpm lint`: 0 errors
- `pnpm build`: 0 errors, 39 static pages generated, all routes intact
- `pnpm check:docs`: passed (no mapped docs affected)

## PageLoaderFallback status
Definition retained in `page-loader.tsx` (exported). Import removed from
`app-shell.tsx` — the only consumer. No other usages exist in the codebase.

## Status
Implementation complete — awaiting UI QA and commit
