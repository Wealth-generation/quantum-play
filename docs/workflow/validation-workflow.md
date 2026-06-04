# Validation Workflow

The current lightweight validation baseline uses repo-local package scripts, Git whitespace checks, and manual skill checks.

## Commands

Run when applicable:

```txt
git diff --check
pnpm lint
pnpm build
pnpm check:docs
pnpm validate
```

`package.json` currently defines `dev`, `build`, `start`, `lint`, `check:docs`, and `validate`.

`pnpm check:docs` runs the docs freshness checker. It verifies that mapped/significant changed files have either mapped durable docs changes or an explicit docs-not-needed rationale in an active task artifact.

`pnpm validate` runs:

```txt
git diff --check
pnpm lint
pnpm build
pnpm check:docs
```

It stops on the first failure and does not hide build, lint, or docs freshness errors.

## Manual Checks

Use local skills for:

- scope check;
- documentation impact check and semantic docs truthfulness;
- API boundary check;
- UI QA evidence when UI changes.

Scripts provide evidence. Skills and review remain responsible for semantic judgment, including whether documentation content is accurate and whether a docs-not-needed rationale is truthful.

## Not Present

Do not claim or create these in this baseline:

- CI;
- Playwright;
- active hooks;
- scripted API boundary check.

Skipped validation must be reported with a clear reason. Failed validation must be reported exactly.
