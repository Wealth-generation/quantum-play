# Task: Rewards Page — Pass 1 (UI-Only, Static Data)

## Goal
Implement the `/rewards` route and full page UI with static data. No API, no BFF, no Zustand, no query hooks.

## Branch Mode
PR-mode

## Base Branch
main

## Task Branch
feat/rewards-page

## Current Branch at Task Start
feat/rewards-page (already in place — pre-confirmed by user context)

## Branch Creation Evidence
Branch `feat/rewards-page` was already active at task start. No new branch created.

## Scope

### Editable (new files — no existing file modified)
- `.ai/tasks/active/rewards-page.md` (this artifact)
- `src/widgets/rewards/rewards-data.ts`
- `src/widgets/rewards/rewards-header.tsx`
- `src/widgets/rewards/rewards-search-bar.tsx`
- `src/widgets/rewards/rewards-card.tsx`
- `src/widgets/rewards/rewards-grid.tsx`
- `src/widgets/rewards/rewards-faq.tsx`
- `src/widgets/rewards/rewards-page.tsx`
- `src/widgets/rewards/index.ts`
- `src/app/rewards/page.tsx`

### Context-Only (read, not modified)
- `src/widgets/main-nav/nav-items.ts` — Rewards link confirmed present
- `src/widgets/leaderboard/rules-accordion.tsx` — accordion pattern reference
- `src/shared/ui/primitives/collapsible.tsx` — exports Collapsible/CollapsibleTrigger/CollapsibleContent
- `src/shared/ui/primitives/button.tsx` — not needed for this pass
- `src/shared/ui/primitives/card.tsx` — not needed for this pass
- `src/app/globals.css` — design tokens confirmed
- `src/app/leaderboard/page.tsx` — route pattern reference
- `docs/architecture/foundation-decisions.md` — foundation source of truth
- `src/shared/assets/rewards/icons/rewards-search.svg` — fill="#6B7280" hardcoded
- `src/shared/assets/nav/icons/star-fild.svg` — fill="#FDFDFD" hardcoded

## Non-Goals
- Interactive search/filter
- Sort dropdown state
- BFF/API layer
- Shared table or card primitives
- Exporting sub-components from widget barrel

## Stack Primitive Checklist
- Radix Collapsible from `src/shared/ui/primitives/collapsible.tsx` — used for FAQ
- `cn()` from `src/shared/lib` — used for conditional card classes
- `next/image` — used for reward card WebP images
- `lucide-react` (`Clock`, `ChevronDown`, `HelpCircle`) — used in cards, search bar, FAQ
- SVGR imports — rewards-search.svg and star-fild.svg
- No CVA (not needed — single-variation components)
- No Button primitive (no CTA in design scope)
- No TanStack Query, Zustand, or BFF

## Docs Impact
`docs/architecture/foundation-decisions.md` must be updated after implementation to record the new `/rewards` route shell and `src/widgets/rewards/**` widget (matching the User Profile route shell precedent). Deferred to docs update step.

## API Boundary Impact
None. Static data only.

## UI QA Impact
Required. New visible page: card grid, accordion expand/collapse, search bar layout. Desktop + mobile viewports.

## Known Deviations from Spec
1. `question-bubble.svg` not found in `src/shared/assets/rewards/icons/` → using `HelpCircle` from `lucide-react`
2. `star-fild.svg` has hardcoded `fill="#FDFDFD"` — SVGR import renders white regardless of `text-primary` class
3. Spec says `text-primary` for H2 "Rewards" heading → corrected to `text-text` (white) to match Figma; `text-primary` = green in our token system which is incorrect for a heading

## Validation
- `pnpm validate` (git diff --check, pnpm lint, pnpm build, pnpm check:docs)
- Manual scope check — only new files in editable scope
- Manual API boundary check — no API calls anywhere
- UI QA evidence — pending after dev server verification

## Risks
- Card image decorative elements (blur glows, ellipses) not implemented — simplified to gradient bg + WebP image (noted polish gap)
- Responsive card widths: `w-full sm:w-[303px]` — mobile wraps to full width; breakpoints not specified in Figma
- Sort dropdowns: static display only, no functionality
