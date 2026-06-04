# Pre-Commit Skill

## Purpose

Report whether changes are ready for a human-controlled commit.

## When To Use

Use before a manual commit or when asked for pre-commit readiness.

## Inputs To Inspect

- `git status --short --branch`.
- `pnpm validate` when available.
- Fallback commands: `git diff --check`, `pnpm lint`, `pnpm build`, and `pnpm check:docs` when available.
- Active task artifact when required.
- Changed files and approved scope.
- Relevant docs, API boundary, and UI QA evidence.

## Procedure

1. Run `git status --short --branch`.
2. Run `pnpm validate` when available.
3. If `pnpm validate` is not available, run `git diff --check`, `pnpm lint`, `pnpm build`, and `pnpm check:docs` when available.
4. Check active task artifact when required.
5. Verify current branch, recorded branch mode, and task branch match the active task artifact.
6. Verify branch creation command/evidence exists for PR-mode tasks.
7. Compare changed files against approved scope.
8. Check docs impact evidence, including mapped durable-docs updates or source-backed docs-not-needed rationale for first architectural patterns. Do not treat `pnpm validate` as a substitute for semantic docs review.
9. Run manual API boundary check when relevant.
10. Run manual UI QA check when UI changed.
11. Report Ready or Blocked with a suggested Conventional Commit message.

## Stop Conditions

- Validation fails.
- Scope mismatch exists.
- Required task artifact or evidence is missing.
- Current branch does not match the task branch recorded in the active task artifact.
- PR-mode branch creation evidence is missing.
- Durable project docs are stale for a changed or newly introduced architectural pattern.
- UI QA or API boundary evidence is required but absent.

## Required Output Format

```txt
Pre-Commit Result: Ready / Blocked
Status:
Changed files:
Scope check:
Task artifact:
Docs impact:
API boundary:
UI QA:
Validation:
Risks:
Suggested commit message:
```

## What Not To Do

Do not stage, commit, push, create PRs, merge, delete branches, or archive task artifacts.
