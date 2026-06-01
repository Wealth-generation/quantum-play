# AI Workflow Rules

## Workflow

- Audit: read-only discovery before unclear implementation.
- Implementation: execute only explicit approved scope.
- Review: read-only semantic check after implementation.
- Pre-commit: readiness report only.
- Documentation: source-backed docs updates and docs-not-needed rationale.
- UI QA: qualitative/manual evidence when UI changes.
- API boundary check: manual enforcement of the accepted BFF boundary.
- Lifecycle close: explicit request only.

## Priority

Use local repository skills before generic workflows. If an applicable skill is missing or unclear, stop and report the issue.

## Limits

- No implementation without explicit scope.
- No broad refactor without approval.
- No advanced tooling unless approved.
- Do not stage, commit, push, create PRs, merge, delete branches, or archive lifecycle artifacts unless explicitly asked.
