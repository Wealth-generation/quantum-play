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
2. Confirm branch mode or not-applicable rationale.
3. Confirm active task artifact for implementation tasks, except baseline-only creation of the task template/placeholders.
4. Record editable files and context-only files.
5. Apply changes only within approved files.
6. Enforce architecture, API boundary, docs, and validation rules.
7. Record validation and handoff evidence.

## Stop Conditions

- Scope is missing or conflicts with foundation decisions.
- Required artifact is missing when required.
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
