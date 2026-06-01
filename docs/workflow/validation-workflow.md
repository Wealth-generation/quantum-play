# Validation Workflow

The current lightweight validation baseline uses only existing commands and manual skill checks.

## Commands

Run when applicable:

```txt
git diff --check
pnpm lint
pnpm build
```

`package.json` currently defines `dev`, `build`, `start`, and `lint`.

## Manual Checks

Use local skills for:

- scope check;
- documentation impact check;
- API boundary check;
- UI QA evidence when UI changes.

## Not Present Yet

Do not claim or create these in this baseline:

- CI;
- Playwright;
- active hooks;
- scripts directory;
- `scripts/validate.sh`;
- docs freshness script;
- scripted API boundary check.

Skipped validation must be reported with a clear reason. Failed validation must be reported exactly.
