# fix/rewards-mobile-cards

## Goal
Fix the mobile (< lg) layout of the Rewards page main cards section to match Figma.
Figma file: EY3yBnmcrxTIhGBPQKNnnO — nodes 4141:11499 (section) and 4141:11513 (single card).

## Branch mode
PR-mode

## Base branch
develop

## Task branch
fix/rewards-mobile-cards

## Current branch at task start
develop (clean, up to date with origin/develop)

## Branch creation evidence
```
git checkout develop && git pull && git checkout -b fix/rewards-mobile-cards
```

## Scope
- src/widgets/rewards/rewards-grid.tsx   — 2-column mobile grid (< lg), desktop unchanged
- src/widgets/rewards/rewards-card.tsx   — card sizing/typography/border/hover for mobile

## Non-goals
- No rewards-data.ts changes (static data, timeLabel string kept as-is)
- No rewards-page.tsx changes
- No shared Card primitive changes
- No total-rewards/* changes
- No new tokens in globals.css
- No pagination
- No API/BFF changes
- No new dependencies

## Context-only files (not edited)
- src/app/rewards/page.tsx
- src/widgets/rewards/rewards-page.tsx
- src/widgets/rewards/rewards-data.ts
- src/widgets/rewards/rewards-header.tsx
- src/widgets/rewards/rewards-search-bar.tsx
- src/widgets/rewards/rewards-faq.tsx
- src/shared/ui/primitives/card.tsx
- src/features/total-rewards/**
- src/app/api/total-rewards/**

## Figma gap → implementation mapping

| Gap | Figma value | Token / class used |
|---|---|---|
| Grid layout | flex-col of 2-col rows, gap 8px | grid grid-cols-2 gap-2 (< lg), lg:flex lg:flex-wrap lg:gap-6 |
| 3rd card | half-width left column | grid-cols-2 natural; 3rd item occupies col-1 of row 2 |
| Card width | flex-[1_0_0] within row | removed sm:w-[303px]; lg:w-[303px] guards desktop |
| Border | 0.5px border-default uniform | border-[0.5px] border-border (all cards) |
| Hover border | green active border on hover | hover:border-2 hover:border-border-2 hover:shadow-[0px_3px_14px_rgba(34,197,94,0.09)] |
| Border radius | ~6.6px (Figma scaled) | rounded-md (--radius-md = 8px) |
| Image height | ~110px | h-[110px] (< lg), lg:h-[200px] |
| Body padding | 12px | p-3 (< lg), lg:p-5 |
| Body min-height | 219px | min-h-[219px] (< lg), lg:min-h-0 |
| Title size | 16px SemiBold | text-base font-semibold (< lg), lg:text-xl |
| Description size | 12px Regular | text-xs (< lg), lg:text-base |
| Title→desc gap | ~2px | gap-0.5 (< lg), lg:gap-1 |
| Label text | "Time left:" | changed from "Duration" |
| Time badge bg | rgba(43,48,59,0.5) | kept as bg-[rgba(43,48,59,0.5)] (no token — pre-existing) |

## Accepted risks
- **0.5px border:** border-[0.5px] is subpixel; renders inconsistently across displays/DPR (may appear 0px or 1px). This is the intended Figma value accepted by the team.
- **Odd card (3rd):** With 2-col grid, 3rd card occupies left half of row 2 at mobile. Design showed only even-count pages; half-width lonely card is the confirmed approach per task scope.
- **Touch/hover:** hover: green border is not triggered on touch devices. Expected per spec.
- **Fixed min-h-[219px]:** Long copy may make the body taller than 219px; min-h allows growth.

## Stack primitive checklist
- JSX edits: 2 files in src/widgets/rewards/ (widget layer, correct FSD placement)
- Component split: no new components introduced
- Data/state/form: no changes (static data)
- Project primitives: cn() used; no CVA needed for this bespoke card; no Radix
- Not-applicable: shared Card primitive not reused (non-matching structure per audit)

## Docs impact
Layout fix of existing widget. No new architectural pattern, no new BFF, no new store, no workflow change. docs-not-needed rationale: change is a visual/layout fix within an existing approved widget with no new patterns introduced.

## API boundary impact
None. Static data only.

## UI QA impact
Required after implementation: /rewards at 375px and 768px (mobile), 1280px (desktop isolation check).

## Validation plan
pnpm validate (lint + build + docs check)

## Review
Pending.

## Pre-commit
Pending.
