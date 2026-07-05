# AI Workflow Rules

## Workflow

- Task-size lanes: classify work as micro, small, normal, architecture-sensitive, or tooling/workflow before choosing gates.
- Audit: read-only discovery before unclear implementation.
- Implementation: execute only explicit approved scope.
- Review: read-only semantic check after implementation.
- Pre-commit: readiness report only.
- Documentation: source-backed docs updates and docs-not-needed rationale using the ownership-to-docs mapping.
- UI QA: qualitative/manual evidence when UI changes.
- API boundary check: manual enforcement of the accepted BFF boundary.
- Lifecycle close: explicit request only.

## Priority

Use local repository skills before generic workflows. If an applicable skill is missing or unclear, stop and report the issue.

## Limits

- No implementation without explicit scope.
- No broad refactor without approval.
- No advanced tooling unless approved.
- Micro tasks do not require the full workflow by default; small tasks may use shortened checks when safe; normal, architecture-sensitive, and tooling/workflow implementation tasks keep full evidence gates.
- Use `pnpm validate` and `pnpm check:docs` only as mechanical evidence; do not replace semantic review with scripts.
- Do not stage, commit, push, create PRs, merge, delete branches, or archive lifecycle artifacts unless explicitly asked.
