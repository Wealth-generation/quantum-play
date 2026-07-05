# Local Auth Integration

## Goal

Implement the first local auth integration slice for `quantum-play`.

## Branch Mode

- Mode: PR-mode
- Base branch: `develop`
- Task branch: `feat/local-auth-integration`
- Current branch at continuation start: `feat/local-auth-integration`
- Branch creation: already completed after user confirmation in Codex chat
- Branch creation command: `git checkout -b feat/local-auth-integration`
- Current status evidence: `git status --short --branch` returned `## feat/local-auth-integration`

## Approved Scope

- Local auth BFF route handlers under `src/app/api/auth/**`
- Minimal server-side auth helpers for backend fetch, cookie normalization, and auth error normalization
- Register with reCAPTCHA through local `/api/auth/register`
- Login with reCAPTCHA through local `/api/auth/login`
- Email verification UI step and local `/api/auth/verify-email`
- Session check/refetch through local `/api/auth/session`
- Refresh through local `/api/auth/refresh`
- Logout through local `/api/auth/logout`
- Cookie normalization for `access_token` and `refresh_token`
- Client-only reCAPTCHA integration using `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Login/register form wiring in the existing auth modal
- Minimal authenticated top-bar update and logout action

## Explicit Non-Goals

- No social OAuth implementation
- No unrelated API/BFF routes
- No social connect/init-connect flows
- No Discord verify flow
- No Kick test endpoint
- No forgot-password/reset-password
- No user stats/settings integration
- No daily claimer/status integration
- No socket integration
- No game/wallet/profile/progression APIs
- No broad state architecture refactor
- No global Zustand auth store for server session state
- No localStorage token storage
- No client-readable auth cookies
- No backend URL exposure to browser code
- No staging, commits, pushes, PRs, merges, branch deletion, or artifact archival

## Implementation Skill Conflict

The repo-local implementation skill includes a baseline-era stop condition that says implementation must not create route handlers, query hooks, or related product source. The current user prompt explicitly approves the first real local auth BFF slice, including local auth route handlers, session/refetch behavior, and auth UI wiring.

Resolution: proceed only within the explicitly approved Local Auth Integration scope above. Do not create unrelated route handlers, broad API clients, unrelated query hooks, stores, scripts, CI, Playwright, observability, or lifecycle artifacts.

## Environment

Required runtime variables:

```txt
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
BACKEND_BASE_URL
```

Approved values for local development:

```txt
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeTN-YsAAAAANf4xqrDgJNryim24BvilptSOWqh
BACKEND_BASE_URL=https://api.thedoctor-dev.com
```

`BACKEND_BASE_URL` must remain server-only.

## Validation Plan

- `git diff --check`
- `pnpm lint`
- `pnpm build`
- Manual API boundary check
- Manual UI behavior check for auth modal, verification step, session top bar, and logout

## Files Changed

```txt
package.json
pnpm-lock.yaml
src/app/layout.tsx
src/app/providers.tsx
src/app/api/_lib/auth-backend.ts
src/app/api/_lib/auth-cookies.ts
src/app/api/_lib/auth-errors.ts
src/app/api/auth/register/route.ts
src/app/api/auth/verify-email/route.ts
src/app/api/auth/login/route.ts
src/app/api/auth/session/route.ts
src/app/api/auth/refresh/route.ts
src/app/api/auth/logout/route.ts
src/features/auth/api/auth-client.ts
src/features/auth/model/auth-session.ts
src/features/auth/types/auth-types.ts
src/features/auth/index.ts
src/widgets/auth-modal/auth-modal.tsx
src/widgets/auth-modal/auth-recaptcha.tsx
src/widgets/auth-modal/verify-email-step.tsx
src/widgets/top-bar/top-bar.tsx
```

Local ignored runtime file:

```txt
.env.local
```

## Validation Evidence

- `git diff --check`: pass
- `pnpm lint`: pass
- `pnpm build`: pass after rerun with network access; first sandboxed build failed because `next/font` could not fetch the configured Google Outfit font.
- Manual API boundary check: pass. Browser auth client calls only local `/api/auth/*`; `BACKEND_BASE_URL` appears only in server-side BFF helper code.
- Manual rendered UI smoke test: pass. Production server started on `http://127.0.0.1:3000`; page loaded with no console errors; auth modal opened; register form fields, required confirmations, disabled social placeholders, and missing-captcha error path rendered correctly.
- Manual QA passed:
  - register -> verify-email -> authenticated state
  - logout
  - login after logout
  - invalid login shows `Invalid email or password.`
  - duplicate/social-account backend message is surfaced
  - wrong verification code shows `Invalid verification code.`
  - session persists after reload
- Expiry auto-logout was not tested.
- Accepted follow-up: brief auth-state flicker after reload is accepted for now and will be handled later by an app-level bootstrap loader.

## Dependency Changes

- Added `react-google-recaptcha`.
- Added `@types/react-google-recaptcha` as a dev dependency.

## Notes

- Social OAuth remains disabled/deferred. Visible placeholder providers are Google, Steam, Discord, and Kick.
- `socket_token` remains ignored/deferred. Only `access_token` and `refresh_token` are normalized.
- No staging, commit, push, PR, merge, branch deletion, or artifact archival performed.

## Targeted QA Fix Pass

Issue investigated: reCAPTCHA v2 image challenge appears visually but cannot be clicked/selected in the auth modal.

Root cause hypothesis: Radix Dialog default modal behavior uses focus trapping/dismissable-layer outside interaction handling. The Google reCAPTCHA challenge iframe is mounted outside the dialog content, so it can be treated as an outside interaction even when it is visually above the app.

Fix:

- Changed only the auth modal dialog usage to `modal={false}`.
- Added `onFocusOutside` and `onInteractOutside` guards that prevent default behavior for Google reCAPTCHA iframes.
- Kept `AuthRecaptcha` inside the auth modal ownership area.
- Did not disable reCAPTCHA.
- Did not implement social auth.

BFF follow-up:

- Retested `POST /api/auth/login` with a fake captcha token against rebuilt local server.
- Before fix, external backend fetch failure surfaced as a Next 500.
- Added safe backend-fetch exception handling to auth BFF routes.
- After fix, fake-token login returns `502` with `{"error":"Authentication service is unavailable. Please try again."}` in this restricted environment.
- Missing captcha still returns `400` with `{"error":"Missing reCAPTCHA token"}`.

Validation:

- `pnpm lint`: pass
- `git diff --check`: pass
- `pnpm build`: pass with network access for Google font fetch
- Manual reCAPTCHA image challenge clickability retest passed.

Environment restart confirmation:

- `.env.local` existed before the final build/server runs.
- `pnpm build` reported `Environments: .env.local`.
- Production QA server was restarted after the modal/BFF fixes.

## Review Cleanup

- Removed raw backend auth error response preview logging from the BFF error helper. Remaining backend auth error logging is limited to sanitized context, mapped message, and HTTP status.
- Updated task artifact file paths for the current `features/auth` ownership structure.
- Updated manual QA evidence to reflect the completed local auth flow verification and accepted reload flicker follow-up.
