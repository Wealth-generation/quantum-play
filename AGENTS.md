# quantum-play Agent Contract

`quantum-play` is a Next.js App Router frontend for an iGaming platform. Local Auth Integration is implemented as the first real auth/BFF slice.

## Required Context

- Treat [docs/architecture/foundation-decisions.md](docs/architecture/foundation-decisions.md) as the project foundation source of truth.
- Treat [docs/architecture/auth.md](docs/architecture/auth.md) as the durable source of truth for implemented local auth architecture.
- Use [CLAUDE.md](CLAUDE.md) as the primary AI entrypoint.
- Follow `.claude/rules/**`, `.claude/skills/**`, `.ai/tasks/**`, and `docs/workflow/**`.
- For Next.js work, read the relevant guide in `node_modules/next/dist/docs/` first. This version may differ from older Next.js conventions.
- For library, framework, SDK, API, CLI, or cloud-service questions, use `npx ctx7@latest library <name> "<question>"` before `npx ctx7@latest docs <id> "<question>"`.

## Non-Negotiable Boundaries

- Browser code calls only local `/api/*`.
- External backend URL, auth, session, refresh, and token logic are server-side/BFF only.
- Non-auth endpoint mapping is deferred.
- Do not create unapproved or premature product/API/BFF/auth work.
- Do not create unapproved route handlers, DTOs, API clients, query hooks, stores, renderers, scripts, CI, Playwright, active hooks, worktrees, MCP, subagents, release automation, or observability.

## Validation Baseline

Use only commands that exist in `package.json` or Git:

- `git diff --check`
- `pnpm lint`
- `pnpm build`
- `pnpm check:docs`
- `pnpm validate`
- Manual documentation, API-boundary, and UI checks through local skills.

Quick iteration may use targeted checks by task lane. Readiness and pre-commit checks should prefer `pnpm validate` when applicable. Scripts provide mechanical evidence only; semantic docs, API-boundary, UI, and scope review remain skill-owned/manual.

Do not invent validation scripts or claim unavailable tools exist.

## Git Lifecycle

Agents must not stage, commit, push, create PRs, merge, delete branches, or archive lifecycle artifacts unless the user explicitly asks for that specific action.

For implementation tasks, PR-mode is the default branch mode. At implementation start, agents must inspect current branch/status, confirm the base branch, propose a task branch name, and create/switch to that task branch only after explicit user confirmation in Codex/Claude. This setup does not permit later lifecycle actions: commit, push, PR creation, merge, branch deletion, and artifact archival remain forbidden unless explicitly requested later.
