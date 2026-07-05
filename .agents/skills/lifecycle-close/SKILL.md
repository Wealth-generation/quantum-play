---
name: lifecycle-close
description: Use only when the user explicitly asks to close a task.
---

# Lifecycle Close Skill

## Purpose

Close and archive task lifecycle records only after explicit request and completion evidence.

## When To Use

Use only when the user explicitly asks to close a task.

## Inputs To Inspect

- Active task artifact.
- Review evidence.
- Pre-commit evidence.
- Commit, PR, merge, or local completion evidence when applicable.
- Current git status.

## Procedure

1. Confirm explicit lifecycle-close request.
2. Verify implementation, review, pre-commit, and local or PR completion evidence.
3. Verify the active task artifact is complete.
4. Move artifact to `.ai/tasks/archived/` only if approved.
5. Report remaining manual steps and risks.

## Stop Conditions

- Closure was not explicitly requested.
- Completion evidence is incomplete.
- Archive move is not approved.
- Git state is unsafe or unclear.

## Required Output Format

```txt
Lifecycle Close:
  Requested:
  Completion evidence:
  Active artifact:
  Archive action:
  Remaining steps:
  Risks:
  Result: Closed / Blocked
```

## What Not To Do

Do not delete branches, merge, push, stage, commit, or archive without explicit approval.
