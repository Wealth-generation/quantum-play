# API Boundary Check Skill

## Purpose

Enforce the accepted BFF boundary model manually.

## When To Use

Use when changes touch browser API access, future BFF route handlers, auth/session/token logic, API docs, or API boundary rules.

## Inputs To Inspect

- Changed files and diffs.
- `docs/architecture/foundation-decisions.md`.
- `.claude/rules/state-data-api-boundary.md`.
- Active task artifact when required.

## Procedure

1. Check browser code calls only local `/api/*`.
2. Check no browser code calls the external backend directly.
3. Check no public backend base URL is introduced.
4. Check auth/session/refresh/token logic stays server-side/BFF.
5. Check no premature API/BFF folders, DTOs, API clients, or query hooks are created.
6. Record not-applicable rationale when API boundary is unaffected.

## Stop Conditions

- Browser external backend access appears.
- Public backend base URL appears in browser code.
- Browser auth/session/token handling appears.
- Premature API/BFF implementation appears.

## Required Output Format

```txt
API Boundary Check:
  Applicable: yes/no
  Files checked:
  Browser external calls:
  Public backend URL:
  Browser auth/session/token logic:
  Premature API/BFF files:
  Result: Pass / Blocked
```

## What Not To Do

Do not enforce endpoint mapping yet. Do not create scripts or API implementation.
