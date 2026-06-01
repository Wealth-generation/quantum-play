# Pre-Commit Skill

## Purpose

Report whether changes are ready for a human-controlled commit.

## When To Use

Use before a manual commit or when asked for pre-commit readiness.

## Inputs To Inspect

- `git status --short --branch`.
- `git diff --check`.
- `pnpm lint`.
- `pnpm build`.
- Active task artifact when required.
- Changed files and approved scope.
- Relevant docs, API boundary, and UI QA evidence.

## Procedure

1. Run `git status --short --branch`.
2. Run `git diff --check`.
3. Run `pnpm lint`.
4. Run `pnpm build`.
5. Check active task artifact when required.
6. Compare changed files against approved scope.
7. Check docs impact evidence.
8. Run manual API boundary check when relevant.
9. Run manual UI QA check when UI changed.
10. Report Ready or Blocked with a suggested Conventional Commit message.

## Stop Conditions

- Validation fails.
- Scope mismatch exists.
- Required task artifact or evidence is missing.
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
