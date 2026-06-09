# AI Development Flow

This repository uses a lean, source-backed AI workflow. The foundation source of truth is `docs/architecture/foundation-decisions.md`.

## 1. Audit

Use `.claude/skills/audit/SKILL.md` when ownership, affected files, risks, validation, docs impact, API boundary impact, or UI QA needs are unclear.

Audit is read-only. It identifies relevant files, editable scope, context-only files, risks, missing information, and a validation plan.

## 2. Implementation

Use `.claude/skills/implementation/SKILL.md` only after explicit scope exists.

Implementation must follow approved files, record branch mode for implementation tasks, separate editable and context-only files, and avoid forbidden product/API/tooling work.

## 3. Review

Use `.claude/skills/review/SKILL.md` after implementation and before pre-commit readiness when changes are meaningful.

Review is read-only and checks correctness, scope, architecture ownership, docs truthfulness, validation evidence, and boundary compliance.

## 4. Pre-Commit

Use `.claude/skills/pre-commit/SKILL.md` before any manual commit readiness decision.

Pre-commit reports Ready or Blocked. It does not stage or commit.

When `pnpm validate` is available, pre-commit should use it as the mechanical validation baseline while still inspecting scope, task artifact evidence, branch mode, docs impact, API boundary impact, UI QA, and residual risks.

## 5. Documentation

Use `.claude/skills/documentation/SKILL.md` whenever docs change or implementation affects documented behavior.

Docs must distinguish implemented, planned, partial, deferred, out of scope, and unverified claims.

Use `docs/workflow/ownership-to-docs.md` and `scripts/docs-ownership-map.json` to identify mapped durable docs. `pnpm check:docs` verifies docs evidence mechanically; the documentation skill still owns source-backed judgment.

## 6. UI QA

Use `.claude/skills/ui-qa/SKILL.md` when visible UI, layout, navigation, animation, responsive behavior, or user interaction changes.

UI QA is qualitative/manual for now. Playwright is not part of this baseline.

## 7. API Boundary Check

Use `.claude/skills/api-boundary-check/SKILL.md` when browser API access, BFF routes, auth/session logic, or API boundary docs change.

Non-auth endpoint mapping is deferred. The current check enforces the accepted BFF boundary model, including the implemented local auth BFF slice.

## 8. Lifecycle Close

Use `.claude/skills/lifecycle-close/SKILL.md` only when explicitly requested.

Lifecycle close verifies completion evidence and may archive task records only with approval. It does not merge, push, or delete branches.
