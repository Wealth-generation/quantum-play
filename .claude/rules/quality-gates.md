# Quality Gates

Each gate is executable by agents, reviewable by humans, and traceable in repository files. `docs/architecture/foundation-decisions.md` is the project-specific source of truth.

## Source-Of-Truth Gate

- Purpose: prevent stale memory, generic assumptions, and false claims.
- Trigger: every repository task.
- Rule: inspect repository files, package metadata, docs, and current source before claims or edits.
- Required evidence: files inspected, existing scripts reported accurately, and final claims limited to present files or accepted plans.
- Enforcement layer: `AGENTS.md`, `CLAUDE.md`, rules, skills, review, pre-commit.
- Failure condition: agent invents scripts, tools, folders, commands, or workflow layers.
- Mode: blocking.

## Local Skill Priority Gate

- Purpose: keep repository workflow above generic agent behavior.
- Trigger: any execution task.
- Rule: use applicable local skills first.
- Required evidence: skill inspected or explicit reason it is not applicable.
- Enforcement layer: rules, skills, task artifacts, review.
- Failure condition: applicable skill is skipped or silently replaced.
- Mode: blocking.

## Audit-Before-Implementation Gate

- Purpose: prevent premature edits and wrong ownership.
- Trigger: before implementation when scope, ownership, docs impact, risks, or validation are unclear.
- Rule: perform read-only discovery first.
- Required evidence: relevant files, ownership, risks, missing info, editable scope, context-only files, docs impact, API impact, UI QA impact, validation plan.
- Enforcement layer: audit skill and implementation skill.
- Failure condition: implementation starts while affected ownership or scope is unclear.
- Mode: blocking when unclear, advisory for trivial tasks.

## Branch Mode Gate

- Purpose: avoid ambiguous non-trivial work on a base branch.
- Trigger: before implementation edits.
- Rule: implementation tasks default to PR-mode. Before edits, inspect current branch/status, confirm the base branch, usually `develop`, propose a task branch name, and create/switch to the task branch only after explicit user confirmation in Codex/Claude.
- Required evidence: branch mode, base branch, task branch, current branch at task start, and branch creation command/evidence in the task artifact, or local/no-PR rationale when explicitly approved.
- Enforcement layer: implementation skill, pre-commit skill, task template.
- Failure condition: missing branch mode for implementation tasks, missing PR-mode branch setup evidence, or task branch created/switched without explicit confirmation.
- Mode: blocking.

## Active Task Artifact Gate

- Purpose: preserve scope, approvals, validation, and handoff evidence.
- Trigger: before implementation edits for product, docs, workflow, or config tasks.
- Rule: maintain one task-scoped artifact under `.ai/tasks/active/` unless the task explicitly creates only lifecycle templates/placeholders.
- Required evidence: goal, scope, non-goals, branch mode, base branch, task branch, current branch at task start, branch creation evidence, editable/context-only files, docs/API/UI impact, commands, review, validation, risks.
- Enforcement layer: `.ai/tasks/**`, implementation, pre-commit, review.
- Failure condition: required artifact is missing, stale, incomplete, or mismatched.
- Mode: blocking for implementation tasks.

## Editable Scope Vs Context-Only Gate

- Purpose: prevent edits to files inspected only for context.
- Trigger: audit, implementation, and pre-commit.
- Rule: separate editable files from context-only files.
- Required evidence: approved editable files, context-only files, and scope expansion notes.
- Enforcement layer: audit, implementation, pre-commit, task template.
- Failure condition: changed files exceed approved scope.
- Mode: blocking.

## Architecture Ownership Gate

- Purpose: prevent misplaced code and broad refactors.
- Trigger: feature, UI, API, state, shared utility, or architecture-sensitive changes.
- Rule: identify owning layer before editing and keep shared areas generic.
- Required evidence: ownership decision and affected files.
- Enforcement layer: architecture docs, project-structure rules, implementation, review.
- Failure condition: code or docs place responsibility in the wrong layer or alter architecture without approval.
- Mode: blocking.

## Stack Primitive Checklist Gate

- Purpose: ensure project primitives are considered before stack-sensitive work.
- Trigger: JSX-heavy UI work or stack-sensitive implementation.
- Rule: record entrypoint thinness, orchestration, component split, data/state/form ownership, and project primitives or not-applicable rationale.
- Required evidence: checklist in task artifact or clear not-applicable note.
- Enforcement layer: implementation, review, pre-commit, task template.
- Failure condition: required checklist is absent or generic primitives bypass accepted project primitives.
- Mode: blocking for JSX-heavy UI and stack-sensitive tasks.

## Suppression/Bypass Approval Gate

- Purpose: prevent hiding lint, type, framework, or security issues.
- Trigger: adding suppression or bypass markers.
- Rule: require explicit approval and rationale for each bypass.
- Required evidence: approval and rationale in task artifact.
- Enforcement layer: implementation, review, pre-commit.
- Failure condition: bypass markers appear without approval.
- Mode: blocking.

## Docs Impact Gate

- Purpose: keep docs aligned with source and workflow.
- Trigger: changes to workflow files, skills, rules, package metadata, architecture-sensitive source, or documented behavior.
- Rule: update relevant docs or record docs-not-needed rationale.
- Required evidence: docs changed or rationale recorded.
- Enforcement layer: documentation skill, review, pre-commit.
- Failure condition: changed behavior or workflow leaves stale docs with no rationale.
- Mode: blocking when docs are affected.

## API Boundary Gate

- Purpose: prevent unsafe backend access or credential exposure.
- Trigger: browser API access, future BFF routes, auth/session state, API docs, or boundary changes.
- Rule: browser code calls only local `/api/*`; external backend URL/auth/session/token logic stays server-side/BFF.
- Required evidence: manual API boundary check when relevant.
- Enforcement layer: state-data-api-boundary rule, API boundary skill, review, pre-commit.
- Failure condition: browser external backend call, public backend base URL, browser bearer/auth construction, or premature API/BFF folder.
- Mode: blocking.

## UI QA Evidence Gate

- Purpose: prevent visible UI regressions without evidence.
- Trigger: visible UI, layout, navigation, responsive, animation, or interaction changes.
- Rule: perform qualitative/manual UI QA.
- Required evidence: routes/screens, viewports, interactions/states, findings, blockers/gaps, residual risk.
- Enforcement layer: UI QA skill, review, pre-commit, task template.
- Failure condition: UI QA required but evidence is missing.
- Mode: blocking evidence gate.

## Semantic Review Gate

- Purpose: catch correctness, architecture, state, docs, and maintainability risks.
- Trigger: meaningful code, UI, architecture, API boundary, or workflow changes.
- Rule: run read-only review after implementation and before pre-commit readiness.
- Required evidence: findings, pass/block result, residual risks, or not-applicable rationale.
- Enforcement layer: review skill, task template, pre-commit.
- Failure condition: unresolved blocking findings or missing required review evidence.
- Mode: blocking when applicable.

## Pre-Commit Readiness Gate

- Purpose: prevent committing with stale artifacts, scope creep, failed validation, or missing evidence.
- Trigger: before manual commit readiness decisions.
- Rule: inspect status/diffs, active artifact, scope, current branch, task branch match, branch mode, PR-mode branch creation evidence, bypasses, review, UI QA, API checks, and validation.
- Required evidence: changed files, artifact status, branch status, branch mode, task branch match, branch creation evidence when PR-mode, commands, validation, skipped checks/reasons, risks, suggested commit message.
- Enforcement layer: pre-commit skill.
- Failure condition: missing/stale artifact, branch mismatch, unexpected files, missing evidence, failed validation, or invented scripts.
- Mode: blocking.

## Validation Evidence Gate

- Purpose: prevent declaring readiness without running available checks.
- Trigger: completion and pre-commit when validation is applicable.
- Rule: run only existing commands: `git diff --check`, `pnpm lint`, `pnpm build`.
- Required evidence: command results and skipped checks with reasons.
- Enforcement layer: validation workflow rule, pre-commit, final response.
- Failure condition: failed required validation, missing evidence, invented scripts, or unexplained skips.
- Mode: blocking when applicable.

## Lifecycle-Close Gate

- Purpose: prevent premature archival and lost evidence.
- Trigger: only when the user asks to close a task.
- Rule: verify completion evidence before moving active artifacts to archived.
- Required evidence: implementation/review/pre-commit/commit/merge or local completion evidence, archive status, remaining steps, risks.
- Enforcement layer: lifecycle-close skill and `.ai/tasks/**`.
- Failure condition: closure not requested or evidence incomplete.
- Mode: blocking.

## Dependency/Security Approval Gate

- Purpose: prevent unreviewed dependency, security, public API, auth, or tooling changes.
- Trigger: dependency, lockfile, script, generated artifact, public API, auth/security, folder structure, automation, or broad refactor changes.
- Rule: ask for explicit approval before sensitive changes.
- Required evidence: user approval, rationale, approved editable files, and stop conditions.
- Enforcement layer: implementation, review, pre-commit, human approval.
- Failure condition: sensitive change without explicit approval.
- Mode: blocking.

## Human-Controlled Git/PR/Merge Gate

- Purpose: keep lifecycle actions under human control.
- Trigger: staging, committing, pushing, PR creation, merge, branch deletion, or lifecycle archival.
- Rule: perform those actions only after explicit user request for that action. User-confirmed task branch setup for PR-mode implementation is allowed only as branch setup and does not authorize commit, push, PR creation, merge, branch deletion, or lifecycle archival.
- Required evidence: explicit request and action result.
- Enforcement layer: `AGENTS.md`, git-lifecycle rule, pre-commit, lifecycle-close.
- Failure condition: agent performs lifecycle action without request.
- Mode: blocking.
