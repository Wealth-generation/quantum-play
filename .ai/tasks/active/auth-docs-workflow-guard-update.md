# Auth Documentation And Workflow Guard Update

## Identity

- Task title: Auth documentation and workflow guard update
- Status: active
- Mode: documentation / workflow implementation
- Branch mode: local/no-PR
- Base branch: develop
- Task branch: not created
- Current branch at task start: develop
- Branch creation command/evidence: not applicable; user explicitly forbade branch creation

## Scope

- Goal: update durable project documentation and minimal workflow guards after completed Local Auth Integration.
- Non-goals: no product source edits; no scripts, validation scripts, package scripts, CI, Playwright, hooks, social OAuth, non-auth endpoint mapping, game/wallet/profile/progression API docs, socket integration docs, staging, commits, pushes, PRs, merges, branch deletion, or artifact archival.
- Approved scope: documentation, workflow docs, selected rules/skills, and this active task artifact.
- Forbidden scope: product source and lifecycle actions.
- Editable files:
  - `docs/architecture/auth.md`
  - `docs/architecture/foundation-decisions.md`
  - `docs/workflow/documentation-policy.md`
  - `docs/workflow/ai-development-flow.md`
  - `docs/design/design-source-audit.md`
  - `CLAUDE.md`
  - `AGENTS.md`
  - `.claude/rules/state-data-api-boundary.md`
  - `.claude/rules/quality-gates.md`
  - `.claude/skills/documentation/SKILL.md`
  - `.claude/skills/review/SKILL.md`
  - `.claude/skills/pre-commit/SKILL.md`
  - `.claude/skills/api-boundary-check/SKILL.md`
  - `.ai/tasks/active/auth-docs-workflow-guard-update.md`
- Context-only files:
  - `.ai/tasks/archived/local-auth-integration.md`
  - `src/app/api/auth/**`
  - `src/app/api/_lib/**`
  - `src/features/auth/**`
  - `src/widgets/auth-modal/**`
  - `src/widgets/top-bar/top-bar.tsx`
  - `src/app/providers.tsx`
  - `src/app/layout.tsx`
  - `package.json`

## Source Of Truth

- Source-of-truth files inspected:
  - `docs/architecture/foundation-decisions.md`
  - `docs/workflow/documentation-policy.md`
  - `docs/workflow/ai-development-flow.md`
  - `CLAUDE.md`
  - `AGENTS.md`
  - `.claude/rules/state-data-api-boundary.md`
  - `.claude/rules/quality-gates.md`
  - `.claude/skills/documentation/SKILL.md`
  - `.claude/skills/review/SKILL.md`
  - `.claude/skills/pre-commit/SKILL.md`
  - `.claude/skills/api-boundary-check/SKILL.md`
  - `.ai/tasks/archived/local-auth-integration.md`
  - implemented auth source under `src/app/api/**`, `src/features/auth/**`, and `src/widgets/auth-modal/**`
- Architecture decisions: Local Auth Integration is now implemented as the first real auth/BFF slice; future non-auth endpoint mapping remains deferred.
- Relevant rules: source-of-truth gate, docs impact gate, API boundary gate, branch mode gate, active task artifact gate, human-controlled git lifecycle gate.
- Relevant skills: documentation first, then implementation workflow; review/pre-commit/api-boundary-check wording updated as part of scope.

## Impact

- Docs impact: required; durable docs must reflect implemented auth/BFF architecture.
- API boundary impact: documentation/rule wording only; no product API behavior changes.
- UI QA requirement: not applicable; docs and workflow text only.
- Stack primitive checklist: not applicable; no JSX/product edits.

## Validation Plan

- Planned commands:
  - `git diff --check`
  - `pnpm lint`
  - `pnpm build`
- Manual checks:
  - Verify changed files stay within approved scope.
  - Verify docs do not document non-auth endpoint mapping as implemented.
  - Verify workflow guards preserve unapproved/premature API/BFF restrictions.
- Skipped checks and reasons: UI QA not required for docs/workflow-only changes.

## Evidence

- Commands run:
  - `git status --short --branch`: `## develop...origin/develop`
- `git diff --check`: pass
- `pnpm lint`: pass
- `pnpm build`: failed in sandbox because `next/font` could not fetch Google Outfit font
- `pnpm build` with network access: pass
- Review evidence: manual diff review completed; changed files stayed within approved scope and no product source was edited.
- Pre-commit evidence: not run; no commit readiness was requested.
- UI QA evidence: not applicable
- API boundary evidence: docs/rules check completed; browser-only local API boundary preserved, implemented auth BFF recognized, non-auth endpoint mapping remains deferred.

## Risks And Handoff

- Risks: over-documenting lifecycle details in durable architecture docs; weakening API/BFF restrictions too broadly.
- Handoff: keep updates architecture-focused and preserve non-auth deferrals.
- Lifecycle close notes: do not archive unless explicitly requested later.
