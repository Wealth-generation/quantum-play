# quantum-play Agent Contract

`quantum-play` is a fresh Next.js App Router frontend for an iGaming platform. Product implementation has not started in this baseline.

## Required Context

- Treat [docs/architecture/foundation-decisions.md](docs/architecture/foundation-decisions.md) as the project foundation source of truth.
- Use [CLAUDE.md](CLAUDE.md) as the primary AI entrypoint.
- Follow `.claude/rules/**`, `.claude/skills/**`, `.ai/tasks/**`, and `docs/workflow/**`.
- For Next.js work, read the relevant guide in `node_modules/next/dist/docs/` first. This version may differ from older Next.js conventions.
- For library, framework, SDK, API, CLI, or cloud-service questions, use `npx ctx7@latest library <name> "<question>"` before `npx ctx7@latest docs <id> "<question>"`.

## Non-Negotiable Boundaries

- Browser code calls only local `/api/*`.
- External backend URL, auth, session, refresh, and token logic are server-side/BFF only.
- Endpoint mapping is deferred.
- This baseline must not add product code.
- Do not create route handlers, DTOs, API clients, query hooks, stores, renderers, scripts, CI, Playwright, active hooks, worktrees, MCP, subagents, release automation, or observability.

## Validation Baseline

Use only commands that exist in `package.json` or Git:

- `pnpm lint`
- `pnpm build`
- `git diff --check`
- Manual documentation, API-boundary, and UI checks through local skills.

Do not invent validation scripts or claim unavailable tools exist.

## Git Lifecycle

Agents must not stage, commit, push, create PRs, merge, delete branches, or archive lifecycle artifacts unless the user explicitly asks for that specific action.
