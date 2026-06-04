# Docs Freshness Baseline

## Identity

- Task title: Docs Freshness Baseline
- Status: active
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: chore/docs-freshness-baseline
- Current branch at task start: develop
- Branch creation command/evidence: `git checkout -b chore/docs-freshness-baseline` after user confirmation; sandbox rerun with approval succeeded and switched to `chore/docs-freshness-baseline`.

## Scope

- Goal: implement a lean documentation freshness and validation baseline with ownership-to-docs mapping, docs evidence check, validation aggregator, package scripts, and related workflow integration.
- Non-goals: CI, git hooks, Playwright, active hooks, release automation, observability, scripted API boundary scanner, endpoint mapping, broad backend/API mapping, semantic documentation analyzer, enforcement for every code change, product source edits, lifecycle actions.
- Approved scope:
  - `docs/workflow/ownership-to-docs.md`
  - `docs/workflow/validation-workflow.md`
  - `docs/workflow/documentation-policy.md`
  - `docs/workflow/ai-development-flow.md`
  - `docs/architecture/foundation-decisions.md`
  - `scripts/docs-ownership-map.json`
  - `scripts/check-docs-freshness.mjs`
  - `scripts/validate.mjs`
  - `package.json`
  - `.claude/skills/documentation/SKILL.md`
  - `.claude/skills/review/SKILL.md`
  - `.claude/skills/pre-commit/SKILL.md`
  - `.claude/rules/quality-gates.md`
  - `.claude/rules/validation-workflow.md`
  - `.claude/rules/ai-workflow.md`
  - `.ai/tasks/active/docs-freshness-baseline.md`
- Forbidden scope: product source, auth implementation, BFF routes, UI, game code, app shell code, unrelated docs, dependencies, CI, hooks, Playwright, lifecycle actions.
- Editable files: approved scope above only.
- Context-only files:
  - `CLAUDE.md`
  - `AGENTS.md`
  - `.claude/rules/index.md`
  - `.claude/rules/git-lifecycle.md`
  - existing docs/workflow files
  - existing source tree for ownership mapping context

## Source Of Truth

- Source-of-truth files inspected:
  - `CLAUDE.md`
  - `AGENTS.md`
  - `docs/architecture/foundation-decisions.md`
  - `docs/architecture/auth.md`
  - `docs/workflow/documentation-policy.md`
  - `docs/workflow/validation-workflow.md`
  - `docs/workflow/ai-development-flow.md`
  - `.claude/rules/index.md`
  - `.claude/rules/git-lifecycle.md`
  - `.claude/rules/quality-gates.md`
  - `.claude/rules/validation-workflow.md`
  - `.claude/rules/ai-workflow.md`
  - `.claude/skills/implementation/SKILL.md`
  - `.claude/skills/documentation/SKILL.md`
  - `.claude/skills/review/SKILL.md`
  - `.claude/skills/pre-commit/SKILL.md`
  - `.ai/tasks/TEMPLATE.md`
  - `.ai/tasks/archived/auth-docs-workflow-guard-update.md`
- Architecture decisions: task artifacts are lifecycle evidence, not durable project documentation; scripts should enforce evidence only and leave semantic judgment to skills/review.
- Relevant rules: branch mode gate, active task artifact gate, docs impact gate, validation evidence gate, human-controlled git lifecycle gate.
- Relevant skills: implementation, documentation, review, pre-commit.

## Impact

- Docs impact: required. This task implements durable workflow/tooling behavior and must update foundation/workflow docs.
- API boundary impact: not applicable; no product source, API routes, backend access, auth/session/token behavior, or endpoint mapping.
- UI QA requirement: not applicable; no visible UI changes.
- Stack primitive checklist: not applicable; no JSX/product edits.

## Validation Plan

- Planned commands:
  - `pnpm check:docs`
  - `pnpm validate`
- Manual checks:
  - Verify changed files stay within approved scope.
  - Verify scripts enforce evidence only, not semantic truth.
  - Verify `.ai/tasks/archived/**` is not durable-doc evidence.
  - Verify no CI/hooks/Playwright/API scanner/product source were added.
- Skipped checks and reasons: UI QA and API boundary checks are not required for docs/tooling-only changes, aside from manual no-product-source review.

## Evidence

- Commands run:
  - `git status --short --branch`: `## develop...origin/develop`
  - `git checkout -b chore/docs-freshness-baseline`: failed in sandbox because `.git` writes required approval.
  - `git checkout -b chore/docs-freshness-baseline`: succeeded with approval.
  - `pnpm check:docs`: failed before implementation because the script did not exist.
  - `pnpm check:docs`: pass after implementation. Mapped rule, skill, workflow docs, and package script changes had mapped durable docs evidence.
  - `pnpm validate`: failed in sandbox at `pnpm build` because Next/font could not fetch Google Outfit from `fonts.googleapis.com`.
  - `pnpm validate` with network approval: pass. Ran `git diff --check`, `pnpm lint`, `pnpm build`, and `pnpm check:docs`.
  - `git status --short --branch`: changed files stayed within approved scope; no product source changed.
- Review evidence: self-review completed for approved scope, non-goals, script responsibilities, docs freshness behavior, and validation output.
- Pre-commit evidence: not requested; readiness not staged or committed.
- UI QA evidence: not applicable.
- API boundary evidence: not applicable; no product/API source in approved scope.

## Risks And Handoff

- Risks: false positives if mapping globs are too broad; false negatives if future ownership areas are not added to the map; scripts can verify evidence presence but not documentation correctness.
- Handoff: keep the checker small and explicit; skills remain responsible for semantic review.
- Lifecycle close notes: do not archive unless explicitly requested later.
