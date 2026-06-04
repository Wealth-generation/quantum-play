# Validation Workflow Rules

Use existing validation commands:

```txt
git diff --check
pnpm lint
pnpm build
pnpm check:docs
pnpm validate
```

Prefer `pnpm validate` when present. It runs `git diff --check`, `pnpm lint`, `pnpm build`, and `pnpm check:docs` in sequence.

Manual checks:

- documentation impact check;
- API boundary check via skill when relevant;
- UI QA evidence via skill when UI changes;
- scope check against approved files.

`pnpm check:docs` is mechanical. It checks mapped docs evidence and docs-not-needed rationale markers only. It does not judge whether docs are semantically correct.

Do not create or claim:

- CI;
- Playwright;
- active hooks;
- scripted API boundary check.

Validation failures must be reported exactly. Skipped checks need a reason.
