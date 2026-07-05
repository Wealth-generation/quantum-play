# Rules Index

These rules apply to AI-assisted work in `quantum-play`.

## Precedence

1. User instructions.
2. Repository source of truth currently present in the repo.
3. `docs/architecture/foundation-decisions.md`.
4. `.claude/rules/**`.
5. `.claude/skills/**`.
6. Task artifacts under `.ai/tasks/**`.

If a generic bootstrap reference conflicts with `foundation-decisions.md` or `docs/architecture/foundation-decisions.md`, the foundation decision wins.

## Rule Files

- `project-structure.md`: ownership layers, folder creation, and scope boundaries.
- `design-system-foundation.md`: Tailwind, tokens, primitives, Radix, Motion, and design-system non-goals.
- `state-data-api-boundary.md`: browser/API/BFF boundary and state ownership.
- `game-frontend-architecture.md`: concrete game modules, renderer boundary, and game abstraction limits.
- `ai-workflow.md`: audit, implementation, review, pre-commit, documentation, UI QA, API boundary check, and lifecycle close.
- `quality-gates.md`: executable gates, evidence, and failure conditions.
- `validation-workflow.md`: current lint/build/diff checks and manual gates.
- `git-lifecycle.md`: human-controlled staging, commits, PRs, merges, branch deletion, and lifecycle archival.

Use local skills before generic workflows.
