# AI Development Flow

This repository uses a lean, source-backed AI workflow. The foundation source of truth is `docs/architecture/foundation-decisions.md`.

## Task-Size Lanes

Classify work by risk before choosing gates. Agents should classify the lane themselves. For non-micro work, briefly report the proposed lane, reason, required workflow, required checks, whether an active artifact is required, and whether confirmation is needed. For micro work, do not add noisy lane reporting unless ambiguity or risk exists.

| Lane | Active artifact | Branch | Audit | Review | Pre-commit | Validation | Expected output |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Micro task | Not required unless docs/API/workflow/security-sensitive | Not required unless the change is an implementation task needing PR-mode | Not required unless ownership or risk is unclear | Not required unless behavior, docs, or boundaries changed | Only before commit readiness | Targeted check or manual inspection | Brief result and any skipped-check reason |
| Small task | Optional when scope needs evidence | Optional; use PR-mode when it is an implementation task or the user requests it | Conditional | Conditional for meaningful behavior/docs changes | Only before commit readiness | Targeted checks by affected area; `pnpm validate` for readiness when applicable | Short scope, changed files, and validation notes |
| Normal task | Required | Required in PR-mode unless explicitly approved otherwise | Conditional before implementation; required when ownership/risk is unclear | Required after implementation | Required before commit readiness | Prefer `pnpm validate` when applicable plus manual checks | Implementation summary with evidence |
| Architecture-sensitive task | Required | Required in PR-mode unless explicitly approved otherwise | Required | Required | Required before commit readiness | `pnpm validate` plus docs/API/manual checks as relevant | Source-backed decision, docs impact, and residual risks |
| Tooling/workflow task | Required | Required in PR-mode unless explicitly approved otherwise | Required when workflow effects are unclear; otherwise source inspection is required | Required | Required before commit readiness | `pnpm validate`, `pnpm check:docs`, and focused behavior notes | Workflow summary, consistency check, and validation evidence |

Micro tasks use no full workflow by default. Small tasks use a shortened workflow when safe. Normal tasks keep the full implementation, review, and pre-commit path. Architecture-sensitive and tooling/workflow tasks keep full evidence and docs impact gates.

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
