# Documentation Policy

Documentation must be source-backed and truthful.

## Required Practices

- Treat `docs/architecture/foundation-decisions.md` as the project foundation source of truth.
- Inspect relevant repository files before making docs claims.
- Distinguish implemented, planned, partial, deferred, out of scope, and unverified states.
- Consider docs impact for every implementation task.
- Update docs only when the change is in approved scope.
- Record docs-not-needed rationale when relevant.
- Treat task artifacts as lifecycle evidence, not durable project architecture documentation.
- When a task introduces the first real implementation of an architectural pattern, update durable project docs or record an explicit source-backed docs-not-needed rationale.

## Prohibited Claims

Do not claim non-existent scripts, tools, folders, commands, API routes, components, CI, Playwright, hooks, automation, or validation layers exist.

Do not document endpoint mapping, BFF routes, DTOs, API clients, query hooks, stores, renderers, or product modules as implemented until they are actually present.

Do not use `.ai/tasks/**` artifacts as a substitute for updating long-term architecture, workflow, or rule documentation when implemented behavior changes.

Examples of architectural patterns that require durable-docs consideration include first BFF slice, auth/session/cookie pattern, external API boundary, global provider, game module, socket/realtime, wallet/payment, and validation/tooling flow.
