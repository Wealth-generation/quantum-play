# Review Skill

## Purpose

Perform read-only semantic review of completed changes.

## When To Use

Use after implementation and before pre-commit readiness for meaningful changes.

## Inputs To Inspect

- User request and approved scope.
- Changed files and diffs.
- Active task artifact when required.
- Relevant rules and foundation decisions.
- Validation evidence.

## Procedure

1. Check correctness and scope compliance.
2. Check architecture ownership.
3. Check BFF/API boundary.
4. Check state ownership.
5. Check design system boundary.
6. Check game architecture boundary.
7. Check docs truthfulness.
8. Check validation evidence and residual risks.

## Stop Conditions

- Diff exceeds approved scope.
- Required evidence is missing.
- Blocking correctness, security, architecture, or docs issue exists.

## Required Output Format

```txt
Findings:
  - [severity] file:line - issue
Open questions:
Validation evidence:
Residual risks:
Result: Pass / Blocked
```

## What Not To Do

Do not edit files, stage, commit, push, create PRs, merge, or archive task artifacts.
