# quantum-play Claude Entrypoint

`quantum-play` is a Next.js App Router frontend for an iGaming platform with Plinko, Keno, Dice, and Roulette planned. The backend remains authoritative for game results, wallet/balance, and game configuration.

## Where To Look

- Foundation source of truth: `docs/architecture/foundation-decisions.md`
- Rules index: `.claude/rules/index.md`
- Skills: `.claude/skills/**/SKILL.md`
- Prompt starters: `.claude/prompts/**`
- Templates: `.claude/templates/**`
- Task lifecycle records: `.ai/tasks/**`
- Team workflow docs: `docs/workflow/**`

## Default Workflow

1. Audit before implementation when scope, ownership, risks, or validation are unclear.
2. Start implementation in PR-mode by default: inspect current branch/status, confirm the base branch, propose a task branch name, and create/switch branches only after explicit user confirmation.
3. Review changes before pre-commit readiness.
4. Use pre-commit to report readiness only; do not stage or commit.
5. Run lifecycle-close only when explicitly requested.

Use the local skills first: audit, implementation, review, pre-commit, documentation, ui-qa, api-boundary-check, and lifecycle-close. Keep output source-backed and do not duplicate every rule here.
