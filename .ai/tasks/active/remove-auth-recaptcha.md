# Remove Auth reCAPTCHA

Status: active

## Current State

Implementation is complete on `codex/remove-auth-recaptcha`, with validation blocked by an existing build issue outside the approved scope. Scope stayed limited to removing Google reCAPTCHA from the auth login/register frontend and BFF flow, plus dependency and durable documentation cleanup.

## Task Goal

Remove Google reCAPTCHA completely from the auth login/register frontend and local BFF flow because the backend no longer requires it and there is no site key.

## Task Lane

Architecture-sensitive.

## Branch Mode

- Mode: PR-mode.
- Base branch: `develop`.
- Start branch: `develop`.
- Task branch: `codex/remove-auth-recaptcha`.
- Branch creation evidence:
  - `git branch --show-current` returned `develop`.
  - `git status --short` returned clean output.
  - `git checkout -b codex/remove-auth-recaptcha` initially failed in sandbox with Git ref lock permission denied.
  - Same approved command reran with escalation and switched to `codex/remove-auth-recaptcha`.

## Approved Editable Scope

- `src/widgets/auth-modal/auth-modal.tsx`
- `src/widgets/auth-modal/auth-recaptcha.tsx` delete
- `src/features/auth/types/auth-types.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/_lib/auth-errors.ts`
- `package.json`
- `pnpm-lock.yaml`
- `docs/architecture/auth.md`
- `docs/architecture/foundation-decisions.md`
- `docs/workflow/ownership-to-docs.md` only for current captcha/reCAPTCHA auth mapping note
- `scripts/docs-ownership-map.json` only for current captcha/reCAPTCHA auth mapping note

## Context-Only Files

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/rules/**`
- `.claude/skills/**`
- `docs/workflow/task-lifecycle.md`
- `src/app/api/_lib/auth-backend.ts`
- `src/app/api/auth/session/route.ts`
- `src/app/api/auth/refresh/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/features/auth/api/auth-client.ts`
- `src/features/auth/model/auth-session.ts`
- archived `.ai/tasks/**`
- ignored `.env.local`
- ignored `.ai/context/**`

## Non-Goals

- Do not change auth/session/refresh/logout behavior.
- Do not change verify-email behavior.
- Do not redesign login/register UI beyond removing captcha-related UI/logic.
- Do not refactor unrelated auth architecture.
- Do not change unrelated forms or social auth placeholders.
- Do not touch games, bets, wallet, fairness, or balance logic.
- Do not introduce new dependencies.

## Source-Of-Truth Files Inspected

- `CLAUDE.md`
- `docs/architecture/foundation-decisions.md`
- `docs/architecture/auth.md`
- `.claude/skills/implementation/SKILL.md`
- `.claude/rules/index.md`
- `.claude/rules/git-lifecycle.md`
- `.claude/rules/state-data-api-boundary.md`
- `.claude/rules/ai-workflow.md`
- `.claude/rules/quality-gates.md`
- `.claude/rules/validation-workflow.md`
- `docs/workflow/task-lifecycle.md`

## Auth/API Boundary Impact

Browser code must continue to call only local `/api/auth/*`. Login/register payloads should no longer include `captchaToken`, and local BFF routes should no longer validate or forward `Recaptcha-Token`. Backend URL construction, auth cookies, session, refresh, logout, and email verification remain server-side/BFF owned and unchanged.

## Dependency Removal Impact

Remove `react-google-recaptcha` and `@types/react-google-recaptcha` from package metadata and lockfile. Do not add replacement bot-protection dependencies.

## Docs Impact

Update durable auth and foundation docs so they no longer document Google reCAPTCHA as implemented auth behavior. Update workflow mapping notes only where they currently mention reCAPTCHA.

## UI QA Requirement

Required because visible login/register modal UI changes. Check or report remaining manual checks for desktop login/register, mobile around 375px, tablet around 768px, tab switching, close/reset behavior, absence of missing-sitekey console error, absence of missing reCAPTCHA token error, and no reCAPTCHA iframe/widget render.

## Validation Plan

- `git diff --check`
- `pnpm validate`

No test command exists in `package.json`, and adding tests is outside the approved editable scope.

## Commands Run

- `git branch --show-current`
- `git status --short`
- `git checkout -b codex/remove-auth-recaptcha`
- `git checkout -b codex/remove-auth-recaptcha` with escalation after sandbox Git ref lock denial
- `rg -n -i "recaptcha|captcha|Recaptcha-Token|captchaToken|NEXT_PUBLIC_RECAPTCHA_SITE_KEY|react-google-recaptcha|google.com/recaptcha|www.recaptcha.net" src package.json pnpm-lock.yaml docs scripts`
- `rg -n "fetch\(|/api/auth|BACKEND_BASE_URL|backendFetch|Recaptcha-Token|captchaToken" src\widgets\auth-modal src\features\auth src\app\api\auth src\app\api\_lib`
- `git diff --name-status`
- `git status --short --branch`
- `git diff --check`
- `pnpm validate`
- `pnpm validate` with escalation after the first build attempt included a Google Fonts network failure
- `pnpm check:docs`

## Implementation Evidence

- Removed the auth modal widget import, refs, reset calls, missing-token checks, iframe outside-interaction guards, and rendered widget slots.
- Deleted `src/widgets/auth-modal/auth-recaptcha.tsx`.
- Removed `captchaToken` from login/register payload types and callers.
- Removed local BFF `captchaToken` validation and backend `Recaptcha-Token` forwarding from login/register routes.
- Preserved login backend request body as `email` and `password`.
- Preserved register backend request body as `username`, `email`, `password`, and optional trimmed `affiliateCode`.
- Preserved login cookie normalization behavior.
- Preserved register `verificationToken` response handling.
- Removed `react-google-recaptcha`, `@types/react-google-recaptcha`, and their direct lockfile entries.
- Updated durable auth/foundation docs and workflow mapping notes.

## API Boundary Check

- Applicable: yes.
- Files checked: `src/widgets/auth-modal/auth-modal.tsx`, `src/features/auth/**`, `src/app/api/auth/**`, `src/app/api/_lib/**`.
- Browser external calls: none introduced. Browser auth client still calls only local `/api/auth/*`.
- Public backend URL: none introduced. `BACKEND_BASE_URL` remains server-side in `src/app/api/_lib/auth-backend.ts`.
- Browser auth/session/token logic: no new browser token handling introduced.
- Unapproved/premature API/BFF files: none created.
- Result: pass.

## Documentation Evidence

- Source files inspected before docs updates: auth modal, auth payload types, login/register BFF routes, auth errors, package metadata, and lockfile.
- Ownership mapping checked: `docs/workflow/ownership-to-docs.md` and `scripts/docs-ownership-map.json`.
- Docs changed: `docs/architecture/auth.md`, `docs/architecture/foundation-decisions.md`, `docs/workflow/ownership-to-docs.md`, `scripts/docs-ownership-map.json`.
- Durable-docs decision: required and completed because auth/BFF and dependency behavior changed.
- Docs freshness check: `pnpm check:docs` passed.

## UI QA Evidence

- Required: yes.
- Source checked: `src/widgets/auth-modal/auth-modal.tsx`.
- Human orchestrator manually verified the tested login/auth flow after the reCAPTCHA removal.
- Authorization now works without Google reCAPTCHA in the tested auth flow.
- The original missing-sitekey/captcha blocker is resolved for the tested auth flow.
- Viewports/interactions still useful for broader browser QA: desktop auth modal register, mobile around 375px, tablet around 768px, tab switching, close/reset behavior.
- Source-backed checks completed: no widget render remains, no missing-token error path remains, no iframe outside-interaction guard remains, no Google widget/script package reference remains in tracked source/docs/package metadata/lockfile/scripts.
- Full repository validation remains blocked by unrelated Roulette/Pixi module-resolution errors in the current workspace.

## Review Evidence

- Scope check: pass. Changed files are within approved editable scope plus the required active task artifact.
- Architecture ownership: pass. Auth UI changes stayed in `src/widgets/auth-modal`; auth payload types stayed in `src/features/auth`; local BFF changes stayed in `src/app/api/auth`.
- Docs truthfulness: pass. Durable docs no longer describe the removed auth widget/env/header flow.
- Residual risk: login/auth was manually verified by the human orchestrator; broader register and responsive UI QA coverage is not fully recorded.

## Validation Results

- `git diff --check`: passed.
- `pnpm validate`: failed at `pnpm build`.
  - `git diff --check` step passed.
  - `pnpm lint` step completed with one existing warning: `src/widgets/main-nav/main-nav.tsx` has unused `onExpandRequest`.
  - `pnpm build` failed.
- Escalated `pnpm validate`: failed again at `pnpm build`.
  - First sandboxed build also showed a Google Fonts fetch failure.
  - Escalated build removed the font network failure but still failed on unrelated Pixi module-resolution errors from `src/games/roulette/renderer/pixi-roulette-ball-renderer.ts` through the Roulette game route, including missing `@pixi/colord`, `@xmldom/xmldom`, `earcut`, `eventemitter3`, `ismobilejs`, `parse-svg-path`, and `tiny-lru`.
- `pnpm check:docs`: passed.

## Risks And Stop Conditions

- Stop if backend rejects login/register without captcha during validation.
- Stop if removing captcha requires auth/session/refresh/logout changes.
- Stop if implementation requires files outside approved editable scope.
- Stop if dependency removal causes unexpected package or build issues that require broader changes.
- Stop if existing unrelated working tree changes appear.

## Handoff Notes

- Do not broaden this task to fix the Roulette/Pixi build failure without explicit approval.
- Human auth QA evidence is recorded; broader register/responsive UI QA may still be useful before final release.
