# Documentation Skill

## Purpose

Keep documentation source-backed, accurate, and scoped.

## When To Use

Use when docs change or an implementation affects documented behavior, workflow, architecture, validation, API boundary, or UI expectations.

## Inputs To Inspect

- Source files or rules being documented.
- `docs/architecture/foundation-decisions.md`.
- `docs/workflow/ownership-to-docs.md` and `scripts/docs-ownership-map.json` when present.
- Relevant workflow docs.
- Active task artifact when required.

## Procedure

1. Inspect source before writing docs.
2. Distinguish implemented, planned, partial, deferred, out of scope, and unverified states.
3. Use the ownership-to-docs mapping to identify durable docs affected by mapped/significant source areas.
4. Update docs only within approved scope.
5. Avoid claims about non-existing scripts, tools, folders, or files.
6. Treat task artifacts as lifecycle evidence, not durable project documentation.
7. If the task introduces the first real implementation of an architectural pattern, update durable project docs or record an explicit source-backed docs-not-needed rationale.
8. Record docs-not-needed rationale when documentation is not changed.
9. Run `pnpm check:docs` when mapped/significant files changed and the package script exists.

## Stop Conditions

- Source cannot be verified.
- Requested docs would claim unimplemented behavior.
- Docs update exceeds approved scope.

## Required Output Format

```txt
Documentation:
  Source files inspected:
  Ownership mapping checked:
  Docs changed:
  Status labels used:
  Durable-docs decision:
  Docs-not-needed rationale:
  Docs freshness check:
  Risks:
```

## What Not To Do

Do not invent tools, commands, APIs, folders, automation, components, or implementation status.
