# Task: Extract SectionReveal to Shared

## Goal

Relocate `SectionReveal` from `src/widgets/lobby/section-reveal.tsx` to
`src/shared/ui/section-reveal.tsx`. Pure relocation — no behavior change, no new
props, no new dependencies.

## Scope

**Editable files:**
- `src/widgets/lobby/section-reveal.tsx` — DELETE (source of move)
- `src/shared/ui/section-reveal.tsx` — CREATE (destination of move, identical content)
- `src/widgets/lobby/lobby.tsx` — UPDATE import path only

**Context-only files (not edited):**
- `src/widgets/lobby/index.ts` — confirmed SectionReveal is NOT re-exported; no change needed
- `src/shared/ui/primitives/index.ts` — no shared/ui/index.ts barrel exists; no barrel addition needed

## Non-Goals

- Do NOT apply SectionReveal to /leaderboard, /rewards, or any other page.
- Do NOT modify any lobby section component except its import path.
- Do NOT change animation config or expose new props.
- Do NOT add dependencies.
- Do NOT git add / commit / push / open a PR / merge / delete branches.

## Branch Mode

- **Mode:** PR-mode
- **Base branch:** develop
- **Task branch:** chore/extract-section-reveal-to-shared
- **Current branch at task start:** chore/extract-section-reveal-to-shared
- **Branch creation:** Created manually by user (not agent-assisted), confirmed via `git branch --show-current` at task start.

## Pre-Check Findings

- **Lobby barrel** (`src/widgets/lobby/index.ts`): only re-exports `"./lobby"` — SectionReveal is NOT in the barrel. No barrel edit needed.
- **Consumer list**: one consumer — `src/widgets/lobby/lobby.tsx` importing `"./section-reveal"`.
- **Alias convention**: `@/shared/ui/primitives/<file>` — direct file imports, no top-level `src/shared/ui/index.ts` barrel. New import will be `@/shared/ui/section-reveal`.

## Stack Primitive Checklist

- No JSX changes beyond import path in lobby.tsx — not applicable for stack primitive checklist.

## Validation

- `git diff --check` — PASS (no whitespace errors)
- `pnpm lint` — PASS (0 errors; 1 pre-existing warning in main-nav.tsx, unrelated)
- `pnpm build` — PASS (0 errors, 28 pages generated)

## Docs Impact

None. SectionReveal is an implementation detail; no architecture doc maps to this component.

## API Boundary Impact

None. Pure UI relocation.

## UI QA Impact

No visual change — identical component, same behavior, different import path only.

## Risks

Low. Single consumer. Relocation only. Build will catch any missed import.
