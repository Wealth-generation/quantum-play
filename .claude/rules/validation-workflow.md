# Validation Workflow Rules

Use only existing validation commands:

```txt
git diff --check
pnpm lint
pnpm build
```

Manual checks:

- documentation impact check;
- API boundary check via skill when relevant;
- UI QA evidence via skill when UI changes;
- scope check against approved files.

Do not create or claim:

- CI;
- Playwright;
- active hooks;
- scripts directory;
- `scripts/validate.sh`;
- docs freshness script;
- scripted API boundary check.

Validation failures must be reported exactly. Skipped checks need a reason.
