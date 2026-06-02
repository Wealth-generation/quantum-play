# Documentation Skill

## Purpose

Keep documentation source-backed, accurate, and scoped.

## When To Use

Use when docs change or an implementation affects documented behavior, workflow, architecture, validation, API boundary, or UI expectations.

## Inputs To Inspect

- Source files or rules being documented.
- `docs/architecture/foundation-decisions.md`.
- Relevant workflow docs.
- Active task artifact when required.

## Procedure

1. Inspect source before writing docs.
2. Distinguish implemented, planned, partial, deferred, out of scope, and unverified states.
3. Update docs only within approved scope.
4. Avoid claims about non-existing scripts, tools, folders, or files.
5. Record docs-not-needed rationale when documentation is not changed.

## Stop Conditions

- Source cannot be verified.
- Requested docs would claim unimplemented behavior.
- Docs update exceeds approved scope.

## Required Output Format

```txt
Documentation:
  Source files inspected:
  Docs changed:
  Status labels used:
  Docs-not-needed rationale:
  Risks:
```

## What Not To Do

Do not invent tools, commands, APIs, folders, automation, components, or implementation status.
