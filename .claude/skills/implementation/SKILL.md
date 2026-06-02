# Implementation Skill

## Purpose

Execute approved implementation tasks within explicit scope.

## When To Use

Use after the task goal, non-goals, and approved editable files are clear.

## Inputs To Inspect

- User request and approved scope.
- `CLAUDE.md`.
- `docs/architecture/foundation-decisions.md`.
- Relevant `.claude/rules/**`.
- Active task artifact when required.
- Existing files to edit.

## Procedure

1. Confirm explicit task scope.
2. Inspect current branch/status.
3. Confirm branch mode. PR-mode is the default for implementation tasks unless the user explicitly approves local/no-PR or a not-applicable rationale.
4. Confirm the base branch, usually `develop`, and propose a task branch name.
5. Create and switch to the task branch only after explicit user confirmation in Codex/Claude.
6. Confirm active task artifact for implementation tasks, except baseline-only creation of the task template/placeholders.
7. Record branch mode, base branch, task branch, current branch at task start, and branch creation command/evidence in the active task artifact.
8. Record editable files and context-only files.
9. Apply changes only within approved files.
10. Enforce architecture, API boundary, docs, and validation rules.
11. Record validation and handoff evidence.

## Stop Conditions

- Scope is missing or conflicts with foundation decisions.
- Required artifact is missing when required.
- Branch mode, base branch, task branch, current branch at task start, or required branch creation evidence is missing.
- PR-mode task branch creation is not explicitly confirmed by the user.
- Change would create forbidden files/folders.
- Change would require product source, route handlers, DTOs, API clients, query hooks, stores, renderers, scripts, CI, Playwright, active hooks, worktrees, MCP, subagents, release automation, or observability.

## Required Output Format

```txt
Implementation Summary:
  Scope:
  Files changed:
  Non-goals respected:
  Branch mode:
  Validation:
  Docs impact:
  API boundary impact:
  UI QA impact:
  Risks:
```

## What Not To Do

Do not stage, commit, push, create PRs, merge, delete branches, archive tasks, implement product source, or create forbidden files/folders.
