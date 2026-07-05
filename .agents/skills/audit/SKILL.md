---
name: audit
description: Use when scope, ownership, risks, docs impact, API boundary impact, UI QA needs, or validation are unclear.
---

# Audit Skill

## Purpose

Perform read-only discovery before implementation.

## When To Use

Use when scope, ownership, risks, docs impact, API boundary impact, UI QA needs, or validation are unclear.

## Inputs To Inspect

- User request.
- `AGENTS.md`.
- `docs/architecture/foundation-decisions.md`.
- Relevant `.Codex/rules/**`.
- Existing source, docs, package metadata, and task artifacts.

## Procedure

1. Inspect source-of-truth files.
2. Identify relevant files and ownership layer.
3. Separate proposed editable files from context-only files.
4. Identify risks, missing information, stop conditions, docs impact, API boundary impact, UI QA impact, and validation plan.
5. Recommend the next skill or implementation scope.

## Stop Conditions

- Required source file is missing.
- Project-specific rules conflict.
- Scope cannot be made safe without user input.

## Required Output Format

```txt
Audit:
  Relevant files:
  Ownership:
  Editable scope proposal:
  Context-only files:
  Risks:
  Missing information:
  Docs impact:
  API boundary impact:
  UI QA impact:
  Validation plan:
  Stop conditions:
```

## What Not To Do

Do not edit files, stage, commit, push, create PRs, archive tasks, or implement product code.
