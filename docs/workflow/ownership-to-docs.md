# Ownership To Docs Mapping

This mapping helps agents and reviewers decide which durable documentation must be checked when source ownership areas change.

Task artifacts under `.ai/tasks/**` are lifecycle evidence. They can record what happened during a task, including a docs-not-needed rationale, but they are not durable project architecture documentation.

## How To Use This Mapping

For implementation work:

1. Identify changed files.
2. Match changed files against the ownership areas below and `scripts/docs-ownership-map.json`.
3. If a mapped/significant area changed, update the mapped durable docs or record a source-backed docs-not-needed rationale in the relevant active task artifact.
4. Use `pnpm check:docs` to verify that mapped changes have documentation evidence.
5. Use documentation, review, and pre-commit skills to judge whether the docs or rationale are truthful and sufficient.

Task artifact alone is not sufficient for architecture-sensitive or ownership-sensitive changes.

## Significant Changes

Durable docs update or source-backed docs-not-needed rationale is required for:

- first real implementation of a planned concept;
- new architectural pattern;
- new module ownership;
- API/BFF boundary changes;
- auth, session, token, cookie, or refresh behavior changes;
- global provider or state ownership changes;
- validation, workflow, package-script, or tooling behavior changes;
- public route or module structure changes.

## Rationale-Allowed Changes

A docs-not-needed rationale may be enough for:

- copy or text tweaks;
- isolated UI polish;
- local bugfixes with no architecture or public behavior change;
- refactors with no ownership, boundary, or state-management behavior change;
- mapped files touched only to follow an already documented pattern.

The rationale must be source-backed. It should name the changed files or the matched source area and explain why durable docs remain accurate.

## Script And Skill Responsibilities

Scripts enforce evidence only:

- mapped/significant changed files;
- mapped durable docs changed;
- or a relevant active task artifact contains an explicit docs-not-needed rationale marker and mentions at least one changed mapped file path or matched source pattern.

Skills and review keep semantic judgment:

- whether the mapping applies;
- whether docs are accurate;
- whether the rationale is truthful;
- whether a first architectural pattern needs durable documentation;
- whether API boundary, state ownership, and workflow behavior remain correct.

## Ownership Mapping

| Source area | Durable docs | Impact level | Docs-not-needed rationale allowed | Task artifact alone sufficient | Notes |
| --- | --- | --- | --- | --- | --- |
| `src/app/api/auth/**` | `docs/architecture/auth.md` | Blocking | Yes | No | Auth route/session behavior is architecture-sensitive. |
| `src/app/api/_lib/**` | `docs/architecture/auth.md`, `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Server-only backend URL, cookie, token, and auth error helpers affect the BFF boundary. |
| `src/app/api/games/**` | `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Game BFF route handlers define local API ownership and browser/backend boundary behavior. |
| `src/app/api/user/**` | `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Browser-safe user data BFF routes, including balance, affect app data ownership. |
| `src/app/api/fairness/**` | `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Provably Fair BFF routes define seed and verification boundary ownership. |
| `src/features/auth/**` | `docs/architecture/auth.md` | Blocking | Yes | No | Browser-safe auth clients, session hooks, and auth types define the implemented auth contract. |
| `src/widgets/auth-modal/**` | `docs/architecture/auth.md` | Blocking | Yes | No | Auth flow contract changes can affect login, registration, and verification behavior. |
| `src/widgets/top-bar/**` | `docs/architecture/auth.md`, `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Auth/session display and logout behavior can affect app shell ownership. |
| `src/app/providers.tsx` | `docs/architecture/foundation-decisions.md`, `docs/architecture/auth.md` | Blocking | Yes | No | Global providers define state and data ownership boundaries. |
| `src/app/layout.tsx` | `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Root layout changes can affect app composition and shell boundaries. |
| `src/app/games/**` | `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Public games route structure and shell ownership are part of the approved game-page architecture. |
| `src/widgets/games-lobby/**`, `src/widgets/game-detail/**`, `src/widgets/bet-live/**`, `src/widgets/provably-fair-modal/**` | `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Public games, game actions, Provably Fair, and Live Bets widgets define page-level UI ownership for the implemented games slice. |
| `src/shared/ui/**`, `src/app/globals.css` | `docs/architecture/foundation-decisions.md`, `docs/design/design-source-audit.md` | Blocking | Yes | No | Shared primitives and design tokens are part of the design-system foundation. |
| `src/games/**` | `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | First real game modules and game ownership changes require durable architecture consideration. |
| `src/entities/**` | `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | First real entity modules and domain ownership changes require durable architecture consideration. |
| `src/features/**` except `src/features/auth/**` | `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | New non-auth feature ownership requires durable architecture consideration. |
| `.claude/rules/**` | workflow docs and `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Rule changes can alter workflow behavior and durable project constraints. |
| `.claude/skills/**` | workflow docs | Blocking | Yes | No | Skill changes can alter how agents enforce docs, review, and validation evidence. |
| `docs/workflow/**` | related workflow docs and `docs/architecture/foundation-decisions.md` | Blocking | Yes | No | Workflow documentation should remain internally consistent. |
| `package.json`, `pnpm-lock.yaml` | `docs/architecture/foundation-decisions.md`, `docs/workflow/validation-workflow.md` | Blocking | Yes | No | Package scripts, dependencies, and lockfile changes can alter validation and tooling behavior. |
| `.ai/tasks/**` | None as durable docs | Evidence only | Not applicable | No | Task artifacts may provide rationale/evidence but cannot replace durable docs. |

## Examples

- Updating `src/app/api/auth/session/route.ts` and `docs/architecture/auth.md` passes the docs freshness check.
- Updating `src/widgets/auth-modal/auth-modal.tsx` for copy only can pass if the relevant active task artifact records a source-backed docs-not-needed rationale and names that file or source area.
- Updating `package.json` scripts requires `docs/workflow/validation-workflow.md`, `docs/architecture/foundation-decisions.md`, or a source-backed rationale.
- Updating only `.ai/tasks/active/example.md` does not count as a durable docs update.
- Updating `src/games/dice/**`, Dice BFF routes, or shared balance/fairness/auto-bet feature ownership requires `docs/architecture/foundation-decisions.md` to remain accurate or a source-backed rationale for why existing durable docs already cover the change.
