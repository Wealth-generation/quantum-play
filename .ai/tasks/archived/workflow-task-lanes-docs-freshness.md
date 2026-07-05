# Workflow Task Lanes And Docs Freshness Cleanup

## Identity

- Task title: Workflow Task Lanes And Docs Freshness Cleanup
- Task lane: tooling/workflow task
- Status: archived
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: chore/workflow-task-lanes-docs-freshness
- Current branch at task start: chore/workflow-task-lanes-docs-freshness
- Branch creation command/evidence: branch was already selected by the user; `git status --short --branch` reported `## chore/workflow-task-lanes-docs-freshness`.

## Scope

- Goal: improve workflow proportionality, reconcile validation policy, clarify task artifact rules, clarify implementation skill wording, and make docs freshness rationale matching task-relevant.
- Non-goals: product source changes, Dice MVP implementation changes, route handlers, DTOs, API clients, query hooks, stores, renderers, new dependencies, CI, Playwright, active hooks, worktrees, MCP/tools, subagents, release automation, observability, visual snapshot testing, staging, commits, pushes, PR creation, merges, branch deletion, lifecycle-close, or artifact archival.
- Approved scope:
  - `AGENTS.md`
  - `docs/workflow/ai-development-flow.md`
  - `docs/workflow/task-lifecycle.md`
  - `docs/workflow/validation-workflow.md`
  - `docs/workflow/documentation-policy.md` if needed for consistency
  - `docs/workflow/ownership-to-docs.md` if needed for consistency
  - `.claude/rules/quality-gates.md` if needed for lane applicability
  - `.claude/rules/validation-workflow.md` if needed for validation consistency
  - `.claude/rules/ai-workflow.md` if needed for compact lane guidance
  - `.claude/skills/implementation/SKILL.md`
  - `.claude/skills/documentation/SKILL.md` if needed for docs freshness rationale behavior
  - `.claude/skills/review/SKILL.md` if needed for docs freshness rationale behavior
  - `.claude/skills/pre-commit/SKILL.md` if needed for validation/readiness consistency
  - `.claude/templates/task-artifact.md` if needed for task lane/current-state fields
  - `scripts/check-docs-freshness.mjs`
  - `scripts/docs-ownership-map.json` only if script semantics require map support
  - `.ai/tasks/active/workflow-task-lanes-docs-freshness.md`
- Forbidden scope: product source under `src/**`, `.ai/context/**`, Dice MVP task edits, lifecycle-close or archival actions, artifact moving/deleting, new tools/dependencies/automation, broad workflow rewrites, or product/BFF architecture changes beyond this workflow cleanup.
- Editable files:
  - `AGENTS.md`
  - `docs/workflow/ai-development-flow.md`
  - `docs/workflow/task-lifecycle.md`
  - `docs/workflow/validation-workflow.md`
  - `docs/workflow/documentation-policy.md`
  - `docs/workflow/ownership-to-docs.md`
  - `.claude/rules/quality-gates.md`
  - `.claude/rules/validation-workflow.md`
  - `.claude/rules/ai-workflow.md`
  - `.claude/skills/implementation/SKILL.md`
  - `.claude/skills/documentation/SKILL.md`
  - `.claude/skills/review/SKILL.md`
  - `.claude/skills/pre-commit/SKILL.md`
  - `.claude/templates/task-artifact.md`
  - `scripts/check-docs-freshness.mjs`
  - `.ai/tasks/active/workflow-task-lanes-docs-freshness.md`
- Context-only files:
  - `CLAUDE.md`
  - `package.json`
  - `docs/architecture/foundation-decisions.md`
  - `.claude/rules/index.md`
  - `.claude/rules/git-lifecycle.md`
  - `.claude/skills/audit/SKILL.md`
  - `.claude/skills/api-boundary-check/SKILL.md`
  - `.claude/skills/ui-qa/SKILL.md`
  - `.claude/skills/lifecycle-close/SKILL.md`
  - `scripts/validate.mjs`
  - `scripts/docs-ownership-map.json`
  - `.ai/tasks/TEMPLATE.md`
  - `.ai/tasks/active/docs-freshness-baseline.md`
  - `.ai/tasks/archived/docs-freshness-baseline.md`

## Source Of Truth

- Source-of-truth files inspected:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `package.json`
  - `docs/architecture/foundation-decisions.md`
  - `docs/workflow/ai-development-flow.md`
  - `docs/workflow/validation-workflow.md`
  - `docs/workflow/documentation-policy.md`
  - `docs/workflow/ownership-to-docs.md`
  - `docs/workflow/task-lifecycle.md`
  - `.claude/rules/index.md`
  - `.claude/rules/ai-workflow.md`
  - `.claude/rules/git-lifecycle.md`
  - `.claude/rules/quality-gates.md`
  - `.claude/rules/validation-workflow.md`
  - `.claude/skills/audit/SKILL.md`
  - `.claude/skills/implementation/SKILL.md`
  - `.claude/skills/documentation/SKILL.md`
  - `.claude/skills/review/SKILL.md`
  - `.claude/skills/pre-commit/SKILL.md`
  - `.claude/skills/api-boundary-check/SKILL.md`
  - `.claude/skills/ui-qa/SKILL.md`
  - `.claude/skills/lifecycle-close/SKILL.md`
  - `.claude/templates/task-artifact.md`
  - `scripts/validate.mjs`
  - `scripts/check-docs-freshness.mjs`
  - `scripts/docs-ownership-map.json`
  - `.ai/tasks/TEMPLATE.md`
  - `.ai/tasks/active/docs-freshness-baseline.md`
  - `.ai/tasks/archived/docs-freshness-baseline.md`
- Source-of-truth note: `.ai/tasks/active/dice-mvp.md` was requested for context but is not present on this branch.
- Architecture decisions: this is a workflow/tooling task only; docs and scripts provide workflow evidence while skills/review preserve semantic judgment.
- Relevant rules: source-of-truth gate, local skill priority gate, active task artifact gate, docs impact gate, validation evidence gate, human-controlled git lifecycle gate.
- Repository-local skills used: implementation, documentation, review, pre-commit.
- Auxiliary/global methods used: systematic debugging, test-driven development, verification-before-completion.

## Impact

- Docs impact: required; workflow docs and rules change durable workflow behavior.
- API boundary impact: not applicable; no product source, browser API access, route handlers, auth/session/token behavior, or endpoint mapping.
- UI QA requirement: not applicable; no visible UI changes.
- Stack primitive checklist: not applicable; no JSX/product edits.

## Validation Plan

- Planned commands:
  - `git diff --check`
  - `pnpm check:docs`
  - `pnpm validate`
- Manual checks:
  - Verify changed files stay within approved scope.
  - Verify no product source or lifecycle action occurred.
  - Verify `pnpm validate` remains mechanical evidence, not semantic review.
  - Verify task lanes do not require full workflow for every micro task.
  - Verify task artifacts cannot replace durable docs for architecture-sensitive changes.
  - Verify docs freshness relevance prevents unrelated active artifact rationale from satisfying another mapped change.
- Docs freshness scenarios:
  - mapped source plus mapped durable docs should pass.
  - mapped source plus relevant active task artifact rationale should pass.
  - mapped source plus only unrelated active artifact rationale should fail.
  - mapped source plus no docs and no rationale should fail.
  - unmapped change should pass.
- Skipped checks and reasons: UI QA and API boundary checks are not required for docs/tooling-only changes beyond manual not-applicable review.

## Evidence

- Commands run:
  - `git status --short --branch`: `## chore/workflow-task-lanes-docs-freshness`.
  - Temporary isolated red scenario before script change: expected unrelated active artifact rationale to fail; current script incorrectly passed, reproducing the global-rationale false pass.
  - Temporary isolated docs freshness scenarios after script change:
    - mapped source plus mapped durable docs: pass, exit 0.
    - mapped source plus relevant active task artifact rationale: pass, exit 0.
    - mapped source plus only unrelated active task artifact rationale: pass as expected failure, exit 1.
    - mapped source plus no docs and no rationale: pass as expected failure, exit 1.
    - unmapped change: pass, exit 0.
  - `git diff --check`: pass.
  - `pnpm check:docs`: pass; mapped workflow/rule/skill changes had mapped durable docs evidence.
  - `pnpm validate`: failed in sandbox at `pnpm build` because Next/font could not fetch Google Outfit from `fonts.googleapis.com`.
  - `pnpm validate` with network approval: first rerun passed font fetch but failed because stale generated `.next/dev/types/validator.ts` referenced absent `src/app/api/fairness/seed/route.ts`.
  - Approved cleanup of generated `.next` cache only; no source files removed.
  - `pnpm validate` with network approval after clearing `.next`: pass.
  - Final `pnpm validate` sandbox rerun after a doc consistency edit again failed at the Google Outfit font fetch.
  - Final `pnpm validate` with network approval: pass.
- Review evidence: read-only consistency scan checked `AGENTS.md`, `CLAUDE.md`, workflow docs, rules, skills, `scripts/check-docs-freshness.mjs`, and `scripts/validate.mjs`; no conflicting directives found after the stale validation wording was corrected.
- Follow-up review evidence: Result Pass. The previous `src/app/globals.css` product-source blocker was resolved, `git diff -- src/app/globals.css` was empty, and the local-vs-global skills wording issue was resolved.
- Final changed-files set for pre-commit readiness:
  - `.claude/rules/**`
  - `.claude/skills/**`
  - `.claude/templates/task-artifact.md`
  - `AGENTS.md`
  - `docs/workflow/**`
  - `scripts/check-docs-freshness.mjs`
  - `.ai/tasks/active/workflow-task-lanes-docs-freshness.md`
- Product source status after follow-up fix: no `src/**` files changed; `git diff -- src/app/globals.css` was empty.
- Validation after follow-up fix:
  - `git diff --check`: pass.
  - `pnpm check:docs`: pass.
  - `pnpm validate`: sandbox run failed at Google Fonts fetch; network-approved rerun passed.
- Pre-commit evidence: pre-commit readiness was not requested; no staging or commit performed.
- UI QA evidence: not applicable.
- API boundary evidence: not applicable.

## Risks And Handoff

- Risks: docs freshness relevance can create false negatives if an artifact omits changed file paths or source patterns; task lanes can weaken safety if not tied to risk-sensitive overrides; validation may need network approval if `pnpm build` fetches remote fonts.
- Clarification note: "mechanical" docs freshness validation means `check-docs-freshness.mjs` checks evidence presence and relevance only: mapped/significant changed files, mapped durable docs changed, or relevant active task artifact docs-not-needed rationale. It does not mean humans must manually write every documentation update; Codex/AI agents may update documentation within approved scope. The script does not judge semantic documentation truthfulness. Semantic correctness remains owned by documentation, review, and pre-commit skills plus final human review. Human control remains responsible for approving scope and deciding whether changes are ready to stage, commit, create a PR, or merge.
- Handoff: preserve local skill priority and human-controlled git lifecycle; do not archive duplicate task artifacts without explicit lifecycle-close approval.
- Lifecycle close notes: explicit lifecycle-close requested after PR merge. Source branch `chore/workflow-task-lanes-docs-freshness` was merged into target branch `develop`. Final state: merged. Merge evidence: local `develop` at `e6ddd52` (`Merge pull request #11 from Wealth-generation/chore/workflow-task-lanes-docs-freshness`) includes workflow cleanup commit `f8c6d70` (`chore(workflow): add task lanes and tighten docs freshness evidence`). Product source remained clean; pre-commit result was Ready. Lifecycle-close only moved this task artifact from active to archived and updated closure evidence.
