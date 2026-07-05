# Documentation Policy

Documentation must be source-backed and truthful.

## Required Practices

- Treat `docs/architecture/foundation-decisions.md` as the project foundation source of truth.
- Inspect relevant repository files before making docs claims.
- Distinguish implemented, planned, partial, deferred, out of scope, and unverified states.
- Consider docs impact for every implementation task.
- Use `docs/workflow/ownership-to-docs.md` and `scripts/docs-ownership-map.json` to identify mapped durable docs for significant source areas.
- Update docs only when the change is in approved scope.
- Record docs-not-needed rationale when relevant. The relevant active task artifact must name the changed mapped file path or matched source area so an unrelated task rationale cannot satisfy docs freshness.
- Treat task artifacts as lifecycle evidence, not durable project architecture documentation.
- When a task introduces the first real implementation of an architectural pattern, update durable project docs or record an explicit source-backed docs-not-needed rationale.
- Run `pnpm check:docs` when mapped/significant files change after the docs freshness baseline is present.

## Prohibited Claims

Do not claim non-existent scripts, tools, folders, commands, API routes, components, CI, Playwright, hooks, automation, or validation layers exist.

Do not document endpoint mapping, BFF routes, DTOs, API clients, query hooks, stores, renderers, or product modules as implemented until they are actually present.

Do not use `.ai/tasks/**` artifacts as a substitute for updating long-term architecture, workflow, or rule documentation when implemented behavior changes.

Examples of architectural patterns that require durable-docs consideration include first BFF slice, auth/session/cookie pattern, external API boundary, global provider, game module, socket/realtime, wallet/payment, and validation/tooling flow.

The docs freshness script checks for evidence only. Documentation, review, and pre-commit skills remain responsible for judging whether docs and rationales are source-backed and sufficient.
