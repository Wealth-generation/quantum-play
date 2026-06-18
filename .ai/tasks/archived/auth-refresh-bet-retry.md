# Task Lifecycle Record

## Identity

- Task title: Auth Refresh Bet Retry
- Status: active
- Mode: PR-mode implementation
- Task lane: architecture-sensitive
- Branch mode: PR-mode
- Base branch: develop
- Task branch: codex/auth-refresh-bet-retry
- Current branch at task start: develop
- Branch creation command/evidence:
  - Pre-flight `git status --short --branch` -> `## develop...origin/develop` with only `.ai/tasks/active/auth-refresh-bet-retry.md` untracked from the readiness audit.
  - User request explicitly set PR-mode implementation and instructed creating/switching to a task branch from `develop`, example `codex/auth-refresh-bet-retry`.
  - `git checkout -b codex/auth-refresh-bet-retry` first failed in sandbox because Git could not create `.git/refs/heads/codex/auth-refresh-bet-retry`.
  - Approved escalated rerun of `git checkout -b codex/auth-refresh-bet-retry` succeeded and switched to the task branch.
  - Post-branch `git status --short --branch` -> `## codex/auth-refresh-bet-retry` with the active task artifact untracked.

## Current State Summary

Implementation is in progress on `codex/auth-refresh-bet-retry`. The readiness audit found an existing server-side `/api/auth/refresh` BFF route, but no browser-safe refresh client, no single-flight refresh manager, and no shared local game-bet retry helper. Dice and Plinko currently post bets through local BFF routes only. Both BFF bet routes preserve backend status codes for non-OK backend responses, so local clients can detect `401 Unauthorized` without exposing backend URL or tokens.

## Scope

- Goal: Prepare a source-backed implementation map for automatic one-time game bet retry after auth refresh.
- Approved product contract:
  - Retry only game bet requests after local `401 Unauthorized`.
  - Call local `/api/auth/refresh` once.
  - Retry the exact same local `/api/games/<game>/bet` payload once.
  - Keep retry state in memory only.
  - Browser must continue calling only local `/api/*` routes.
  - Backend URL, access token, refresh token, and cookie normalization remain server-side/BFF-only.
  - The implementation should be universal for game bet flows, not duplicated in Dice and Plinko unless a temporary adapter is forced by current structure.
- Non-goals:
  - No implementation in this audit.
  - No product source changes in this audit.
  - No dependency changes.
  - No storage, retry queue, persisted request replay, broad shared API refactor, or server auth-helper redesign.
  - No retry for 5xx, timeout, network error, validation error, insufficient balance, malformed response, unknown errors, or failed refresh.
  - No direct browser access to backend URL, access token, refresh token, or backend cookies.
- Allowed editable files in this audit:
  - Superseded by implementation scope below.
- Approved editable files for implementation:
  - `.ai/tasks/active/auth-refresh-bet-retry.md`
  - `src/features/auth/api/**`
  - `src/features/auth/index.ts` if export wiring is needed.
  - `src/features/game-bet/**`
  - `src/games/dice/model/dice-client.ts`
  - `src/games/plinko/model/plinko-client.ts`
  - Narrow durable docs only if implementation changes documented architecture.
- Context-only files inspected:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/architecture/foundation-decisions.md`
  - `docs/architecture/auth.md`
  - `docs/workflow/task-lifecycle.md`
  - `docs/workflow/ai-development-flow.md`
  - `docs/workflow/validation-workflow.md`
  - `.claude/rules/state-data-api-boundary.md`
  - `.claude/rules/game-frontend-architecture.md`
  - `.claude/rules/git-lifecycle.md`
  - `.claude/skills/audit/SKILL.md`
  - `.ai/tasks/TEMPLATE.md`
  - `.ai/tasks/active/game-action-shell-foundation.md`
  - `.ai/tasks/active/landing-page-redesign.md`
  - `.ai/tasks/archived/local-auth-integration.md`
  - `.ai/tasks/archived/games-pages-live-bets-bff.md`
  - `.ai/tasks/archived/dice-mvp.md` via targeted search
  - `.ai/tasks/archived/plinko-mvp.md` via targeted search
  - `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - `src/app/api/auth/session/route.ts`
  - `src/app/api/auth/refresh/route.ts`
  - `src/app/api/_lib/auth-backend.ts`
  - `src/app/api/_lib/auth-cookies.ts`
  - `src/features/auth/api/auth-client.ts`
  - `src/features/auth/model/auth-session.ts`
  - `src/app/api/games/dice/bet/route.ts`
  - `src/app/api/games/plinko/bet/route.ts`
  - `src/games/dice/model/dice-client.ts`
  - `src/games/dice/model/dice-query.ts`
  - `src/games/dice/model/use-dice-game-controller.ts`
  - `src/games/dice/model/use-dice-auto-bet.ts`
  - `src/games/plinko/model/plinko-client.ts`
  - `src/games/plinko/model/plinko-query.ts`
  - `src/games/plinko/model/plinko-types.ts`
  - `src/games/plinko/model/use-plinko-manual-betting.ts`
  - `src/games/plinko/ui/plinko-game.tsx`
  - `src/games/plinko/ui/plinko-pixi-stage.tsx`
  - `src/features/auto-bet/model/useAutoBetRunner.ts`
  - `src/features/balance/api/balance-client.ts`
  - `src/features/balance/model/balance-query.ts`
  - `src/app/providers.tsx`
  - `package.json`

## Backend Contract And Reference Evidence

- Mentor backend safety confirmation, transliterated from the supplied Ukrainian statement: "Tak na bud-yaku pomylku backend nichoho ne stvoriuie."
- Operational interpretation for this task: on backend error, no bet, round, balance change, transaction, or result is created.
- Reference-site evidence supplied by user:
  - Dice and Plinko can receive an initial `/bet` response of `401 Unauthorized`.
  - The site then calls `/auth/refresh`.
  - Refresh succeeds.
  - The same `/bet` payload is automatically sent once again.
  - Successful bet response includes result and `betId`.
  - Unauthorized bet response has no `betId`.
- Local implementation policy must still limit retry to auth recovery only despite the backend safety contract.

## Audit Findings

### Auth Flow

- `src/app/api/auth/session/route.ts` reads only `access_token` server-side and calls backend `/user/query/me`. Missing, invalid, unavailable, or malformed backend session data returns `{ authenticated: false, user: null }`.
- `src/app/api/auth/refresh/route.ts` reads only `refresh_token` server-side, calls backend `/auth/refresh` with method `GET`, normalizes backend auth cookies onto the app response, and returns `{ success: true }` only on backend success.
- `src/app/api/_lib/auth-cookies.ts` owns normalized `access_token` and `refresh_token` cookies. `refresh_token` is path-scoped to `/api/auth`.
- `src/features/auth/api/auth-client.ts` has a local `requestJson()` helper for auth endpoints, but it does not expose a `refreshAuth()` client function.
- `src/features/auth/model/auth-session.ts` owns TanStack Query session state through `useAuthSession()` and `useLogoutMutation()`. There is no auth refresh mutation/hook yet.
- No existing single-flight refresh manager, request retry helper, or storage-backed auth recovery layer was found.

### Dice Bet Flow

- `src/app/api/games/dice/bet/route.ts` reads `access_token` server-side and returns local `401` if missing.
- The Dice BFF forwards valid requests to backend `/games/house/dice/bet`; backend non-OK responses are returned with the backend status through `backendBetError(status)`.
- `src/games/dice/model/dice-client.ts` posts browser requests only to local `/api/games/dice/bet`.
- `src/games/dice/model/dice-query.ts` wraps `placeDiceBet()` in a TanStack mutation and invalidates `balanceQueryKey` only on success.
- Manual Dice submits through `betMutation.mutateAsync()` in `src/games/dice/model/use-dice-game-controller.ts`.
- Auto Dice passes the same mutation path into `useDiceAutoBet()`, and `useDiceAutoBet()` calls the generic auto runner with one sequential `placeBet()` per round.
- Dice integration point is therefore `placeDiceBet()`: if it uses a universal one-time auth retry helper, manual and auto Dice both inherit the behavior.

### Plinko Bet Flow

- `src/app/api/games/plinko/bet/route.ts` reads `access_token` server-side and returns local `401` if missing.
- The Plinko BFF forwards valid requests to backend `/games/house/plinko/bet`; backend non-OK responses are returned with the backend status through `backendBetError(status)`.
- `src/games/plinko/model/plinko-client.ts` posts browser requests only to local `/api/games/plinko/bet`.
- `src/games/plinko/model/use-plinko-manual-betting.ts` has a game-local `placePlinkoRound()` orchestrator used by both manual Plinko and Plinko AutoBet.
- Plinko currently creates a local round with status `requesting` and updates display balance projection before awaiting `placePlinkoBet()`.
- On successful `placePlinkoBet()`, Plinko records the backend result, schedules visual settlement fallback, adds the round to `roundsToVisualize`, and moves status to `animating`.
- On failure from `placePlinkoBet()`, Plinko marks the local round `failed`, deletes stored result state, clears settlement fallback, and throws to the manual/auto caller.
- Plinko integration point is still `placePlinkoBet()`, but implementation must preserve exactly one local round per user/auto attempt. Do not put retry around `placePlinkoRound()` or the local projection/round creation will be duplicated.

### AutoBet

- `src/features/auto-bet/model/useAutoBetRunner.ts` is generic and sequential. It awaits one `placeBet()`, runs `onRoundComplete()` only after success, then delays before the next round.
- Any thrown error moves runner state to `error` and stops the loop.
- Dice AutoBet uses the Dice mutation path, so a retry inside `placeDiceBet()` happens within a single auto round.
- Plinko AutoBet uses `placePlinkoRound()`, which in turn awaits `placePlinkoBet()`. A retry inside `placePlinkoBet()` happens within a single local Plinko round.
- AutoBet should not gain queue semantics or special retry behavior. It should simply see the final result if auth recovery succeeds, or the original failure if refresh/retry fails.

## Implementation Decisions

- Added `refreshAuth()` to `src/features/auth/api/auth-client.ts`. It calls only local `POST /api/auth/refresh` and returns the existing browser-safe success shape.
- Added `AuthRequestError` with an HTTP status so refresh recovery code can distinguish auth failure from refresh service unavailability without exposing token details.
- Added `src/features/auth/api/auth-refresh-manager.ts` as the in-memory single-flight refresh manager.
  - Multiple simultaneous bet `401` recoveries share one `refreshAuth()` request.
  - Refresh state is a module-local promise only.
  - No React state, Zustand, localStorage, sessionStorage, cookie access, backend URL, or token handling was added to browser code.
- Added `src/features/game-bet/**` as the narrow universal game-bet helper.
  - It accepts only local `/api/games/*/bet` routes.
  - It serializes the payload once and reuses that exact JSON string for the retry.
  - It retries only after the first response has status `401`.
  - It calls the single-flight refresh manager once.
  - It retries the bet once only when refresh succeeds.
  - It does not retry non-401 responses, refresh failures, retry failures, network errors, malformed success JSON, validation errors, or unknown thrown errors.
- Wired Dice by changing only `placeDiceBet()` in `src/games/dice/model/dice-client.ts`.
  - Dice config fetch remains unchanged.
  - Manual Dice and Auto Dice both inherit the helper because both use the existing `placeDiceBet()` mutation path.
- Wired Plinko by changing only `placePlinkoBet()` in `src/games/plinko/model/plinko-client.ts`.
  - Plinko config fetch remains unchanged.
  - Retry is inside the network client, not around `placePlinkoRound()`, so one user/auto attempt still creates only one local requesting/projection round.
- The generic `src/features/auto-bet/**` runner was not changed.

## Follow-Up Patch Decisions

- Added session bootstrap refresh recovery in `src/app/api/auth/session/route.ts`.
  - The route first keeps the existing access-cookie session lookup behavior when it succeeds.
  - If the access cookie is missing or the lookup does not authenticate, the route checks for `refresh_token`.
  - When a refresh cookie exists, the route performs one server-side backend `/auth/refresh` request.
  - On successful refresh, it extracts the refreshed `access_token` from backend `Set-Cookie` headers, retries `/user/query/me` once with that refreshed access cookie, and normalizes refreshed auth cookies onto the session response.
  - Missing refresh, failed refresh, missing refreshed access cookie, failed retry lookup, or malformed backend user data returns the existing unauthenticated session shape.
- Added `backendAuthCookieHeaderFromHeaders()` in `src/app/api/_lib/auth-cookies.ts`.
  - This is server-only and reuses the existing backend `Set-Cookie` parsing path.
  - It exists so the session route can retry the backend current-user lookup inside the same request after refresh.
- Added refresh-invalid redirect behavior in `src/features/game-bet/api/game-bet-client.ts`.
  - Redirect triggers only after a game-bet request returns `401` and the single-flight refresh result is `auth-failed`.
  - The fallback behavior is `window.location.assign("/")` because no existing session-expired redirect convention was found.
  - Refresh backend `502`, refresh 5xx/unknown, network errors, timeout, and unknown refresh failures do not trigger the redirect.
- Verified the existing same-payload retry behavior remains in place.
  - `postLocalGameBetWithAuthRetry()` computes `const body = JSON.stringify(payload)` once before the first request.
  - The first request and retry both pass the same `body` string to `postLocalGameBet()`.
  - The helper does not mutate, normalize, or re-stringify the payload between attempts.
- Verified the existing route guard remains narrow.
  - `LOCAL_GAME_BET_ROUTE_PATTERN = /^\/api\/games\/[^/]+\/bet$/`
  - The helper rejects arbitrary `/api/*`, nested paths, query-string variants, and external URLs.

## Targeted Review Blocker Patch

- Review blocker found: `src/app/api/auth/refresh/route.ts` collapsed every backend refresh non-OK response into local `401`, which could make backend refresh `500/503` look like auth failure to the browser refresh manager and incorrectly trigger redirect to `/`.
- Patch decision:
  - Backend refresh `200` still returns local `200`.
  - Backend refresh `401` or `403` returns local `401` auth failure.
  - Backend refresh `5xx` and other non-OK backend refresh responses return local `502`, preserving non-auth failure semantics.
  - Network exceptions/backend unavailable still return local `502`.
  - `src/features/auth/api/auth-refresh-manager.ts` now classifies any local refresh status `>= 500` as `unavailable`, not `auth-failed`.
- Redirect behavior after patch:
  - Game bet `401` plus refresh local `401` still redirects to `/`.
  - Game bet `401` plus refresh local `502`/`5xx`/network/unknown does not redirect and does not retry the bet.

## Manual QA Evidence Supplied By User

- Session bootstrap passed after deleting only `access_token`.
- Dice passed `bet 401 -> refresh 200 -> same bet 200/result`.
- Plinko passed `bet 401 -> refresh 200 -> same bet 200/result`.
- Plinko did not duplicate round, ball, or history.
- Invalid refresh during bet recovery redirected to `/`.
- No second bet retry occurred after refresh `401`.
- Browser used only local `/api/*` requests.
- Non-401 bet error manual test was skipped because client-side validation prevents invalid payload submission.

## Proposed Implementation Plan For Next Session

1. Start implementation in PR-mode per repo lifecycle:
   - Inspect status.
   - Confirm base branch `develop`.
   - Propose a task branch such as `codex/auth-refresh-bet-retry`.
   - Create/switch only after explicit user confirmation.
2. Add a browser-safe refresh client:
   - Extend `src/features/auth/api/auth-client.ts` with `refreshAuth(): Promise<{ success: true }>` that posts to local `/api/auth/refresh`.
   - It must not expose tokens or backend URL.
3. Add an in-memory single-flight refresh manager:
   - Preferred location: `src/features/auth/api/auth-refresh-manager.ts`.
   - Keep module-local `let inFlightRefresh: Promise<boolean> | null = null`.
   - `refreshAuthOnce()` should reuse an in-flight refresh, resolve `true` only for local refresh success, resolve `false` for non-OK/throw, and clear the in-flight promise in `finally`.
   - No React state, no Zustand, no localStorage, no sessionStorage.
4. Add a local `/api/*` auth retry helper:
   - Preferred location: `src/shared/api/local-api-fetch.ts` if the helper is generic browser infrastructure.
   - Alternative acceptable location: `src/features/auth/api/local-auth-retry-fetch.ts` if reviewers prefer keeping auth-recovery behavior inside the auth feature.
   - It should accept a pre-built `RequestInfo`/URL plus `RequestInit`, call `fetch()`, and only on response status `401` call `refreshAuthOnce()` and retry once with a cloned/recreated request.
   - For JSON POST helpers, prefer a small `fetchLocalJsonWithAuthRetry(url, init)` that receives an already-stringified body so the retry sends the exact same payload bytes.
   - It must retry only local paths beginning with `/api/`.
   - It must not retry refresh itself.
   - It must not retry network errors, timeouts, 5xx, 4xx other than 401, malformed responses, or app-level validation errors.
5. Add a universal game bet executor/policy:
   - Preferred minimal shape: `src/features/game-bet/api/game-bet-client.ts` with `postGameBetWithAuthRetry<Result>(url, payload, fallbackMessage, parseResult?)`.
   - It should be game-agnostic, local-route-only, JSON-only, and documented as bet-specific because retrying mutation requests is intentionally narrow.
   - It can throw a typed/local `Error` message using the existing safe-error parsing strategy.
   - Do not create a broad endpoint mapping or game engine.
   - If the repo owner rejects new `features/game-bet/**`, keep the helper under `src/shared/api/**` and wire only the two current game bet clients.
6. Wire Dice:
   - Change `src/games/dice/model/dice-client.ts` so `placeDiceBet()` uses the bet retry executor for `/api/games/dice/bet`.
   - Keep `getDiceConfig()` unchanged; config GETs are not part of this product contract.
   - Preserve `DiceBetResult` parsing shape and existing fallback messages.
7. Wire Plinko:
   - Change `src/games/plinko/model/plinko-client.ts` so `placePlinkoBet()` uses the same bet retry executor for `/api/games/plinko/bet`.
   - Keep `getPlinkoConfig()` unchanged.
   - Preserve Plinko config validation and `PlinkoBetResult` response validation.
   - Do not wrap `placePlinkoRound()` or alter projection/round/settlement logic.
8. Consider auth-session cache after refresh:
   - After a successful refresh, the next implementation may invalidate `authSessionQueryKey` from caller hooks if available, but the retry helper itself should stay non-React.
   - Avoid importing TanStack Query into the low-level fetch helper.
   - If session UI remains stale after a successful recovered bet, defer broader app auth bootstrap/session sync unless explicitly approved.

## Expected Files To Change In Implementation Session

- Likely create:
  - `src/features/auth/api/auth-refresh-manager.ts`
  - `src/features/game-bet/api/game-bet-client.ts`
  - `src/features/game-bet/index.ts`
- Likely modify:
  - `src/features/auth/api/auth-client.ts`
  - `src/features/auth/index.ts` only if exported refresh helpers are needed outside auth internals.
  - `src/games/dice/model/dice-client.ts`
  - `src/games/plinko/model/plinko-client.ts`
  - `.ai/tasks/active/auth-refresh-bet-retry.md`
- Possible modify after review:
  - `docs/architecture/auth.md` if durable auth architecture should record browser-safe refresh recovery.
  - `docs/architecture/foundation-decisions.md` if durable game bet retry ownership is implemented as a new feature slice.
- Expected context-only:
  - BFF routes under `src/app/api/auth/**` and `src/app/api/games/**` unless current behavior changes during implementation.
  - `src/features/auto-bet/**` unless source inspection in the implementation session finds a genuine runner bug.
  - Plinko local round/projection/settlement code unless duplicate-round behavior is observed.

## Files Changed During Implementation

- Created:
  - `src/features/auth/api/auth-refresh-manager.ts`
  - `src/features/game-bet/api/game-bet-client.ts`
  - `src/features/game-bet/index.ts`
- Modified:
  - `src/app/api/_lib/auth-cookies.ts`
  - `src/app/api/auth/session/route.ts`
  - `src/features/auth/api/auth-client.ts`
  - `src/games/dice/model/dice-client.ts`
  - `src/games/plinko/model/plinko-client.ts`
  - `docs/architecture/auth.md`
  - `docs/architecture/foundation-decisions.md`
  - `.ai/tasks/active/auth-refresh-bet-retry.md`
- Left unchanged by design:
  - `src/app/api/games/**`
  - `src/features/auto-bet/**`
  - `src/games/plinko/model/use-plinko-manual-betting.ts`

## Risks And Stop Conditions

- Stop if a new or existing refresh manager/retry helper appears before implementation and changes the shape.
- Stop if Dice or Plinko bet flow is refactored away from the inspected client paths.
- Stop if local BFF bet routes stop preserving `401` status to the browser.
- Stop if implementation would require exposing tokens, refresh token, cookie internals, or backend URL to browser code.
- Stop if safe implementation requires a broad shared API client refactor beyond the approved scope.
- Stop if AutoBet behavior cannot be kept as one sequential attempt whose internal network call may refresh/retry once.
- Stop if Plinko retry placement would create duplicate local rounds, duplicate display-balance reservations, duplicate visual balls, or duplicate settled history.
- Stop if refresh succeeds but retrying the same local bet request cannot be guaranteed to send the exact same JSON payload.

## Validation Plan

- Mechanical commands after implementation:
  - `git diff --check`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm check:docs`
  - `pnpm validate` for readiness if applicable.
- Manual/source checks:
  - Search for direct browser backend calls and token exposure.
  - Confirm browser bet clients call only local `/api/games/dice/bet` and `/api/games/plinko/bet`.
  - Confirm no localStorage/sessionStorage usage.
  - Confirm refresh helper posts only to `/api/auth/refresh`.
  - Confirm retry fires only on response status `401`.
  - Confirm no retry on refresh failure, 400, 403, 422, 500, 503, network error, malformed JSON, or validation errors.
  - Confirm Dice manual and AutoBet both inherit retry through `placeDiceBet()`.
  - Confirm Plinko manual and AutoBet both inherit retry through `placePlinkoBet()` without duplicating local round/projection/visualization.
  - With DevTools/network when backend/auth state allows: observe first bet `401`, one refresh, one same-payload retry, final result with `betId`.

## Audit Output

Audit:
  Relevant files:
    Auth BFF, auth browser client/session, Dice and Plinko BFF bet routes, Dice and Plinko browser bet clients, Dice controller/auto hook, Plinko manual betting hook, generic auto-bet runner, balance query/projection helpers, architecture/workflow docs, task artifacts.
  Ownership:
    Server auth/cookies/backend URL remain under `src/app/api/**` and `src/app/api/_lib/**`; browser-safe auth client remains under `src/features/auth/**`; universal game bet retry should live in a small feature/shared browser helper; game-specific wiring belongs only in Dice and Plinko client files.
  Editable scope proposal:
    Next session should be limited to `src/features/auth/api/**`, one small universal game bet retry helper, `src/games/dice/model/dice-client.ts`, `src/games/plinko/model/plinko-client.ts`, this task artifact, and narrow durable docs only if implementation creates durable ownership changes.
  Context-only files:
    BFF route handlers, auto-bet runner, Dice controller, Plinko round orchestration, balance projection, and architecture docs unless implementation inspection finds drift.
  Risks:
    Duplicate Plinko local rounds if retry wraps the wrong layer; accidental broad mutation retry helper; stale auth session UI after refresh; over-broad docs/API refactor.
  Missing information:
    No local automated test harness exists for the 401-refresh-retry sequence. Live backend/manual QA will be needed.
  Docs impact:
    This audit artifact is required now. Durable docs likely need a narrow update after implementation because auth refresh recovery becomes implemented behavior.
  API boundary impact:
    High. The safe shape preserves browser-to-local `/api/*` only and keeps backend/token/cookie logic server-side.
  UI QA impact:
    No visible UI change expected. Manual game-flow QA is still needed for Dice/Plinko manual and AutoBet behavior.
  Validation plan:
    Use repo-approved Git/package commands plus manual API-boundary and game-flow checks listed above.
  Stop conditions:
    Use the stop conditions in this artifact and the user prompt before implementing.

## Evidence

- Commands run:
  - `git status --short --branch` -> `## develop...origin/develop`
  - Source inspection with `Get-Content`, `rg --files`, `rg -n`, and `Select-String`.
  - Local Next.js docs inspection under `node_modules/next/dist/docs/**`.
  - Implementation pre-flight `git status --short --branch` -> `## develop...origin/develop` with only the active artifact untracked.
  - `git checkout -b codex/auth-refresh-bet-retry` -> failed in sandbox because Git could not create the branch ref.
  - Approved escalated `git checkout -b codex/auth-refresh-bet-retry` -> succeeded.
  - Post-branch `git status --short --branch` -> `## codex/auth-refresh-bet-retry`.
  - First `pnpm lint` attempt timed out after 120s without diagnostics.
  - `pnpm lint` with longer timeout -> exit 0 with one unrelated warning in `src/widgets/main-nav/main-nav.tsx` for unused `onExpandRequest`.
  - `git diff --check` -> passed.
  - `pnpm check:docs` -> passed; mapped durable docs changed for `src/features/auth/**`, `src/games/**`, and `src/features/**`.
  - Sandboxed `pnpm build` -> failed only because Next/font could not fetch Google Outfit from `fonts.googleapis.com`.
  - Approved escalated `pnpm build` -> passed.
  - Approved escalated `pnpm validate` -> passed; includes `git diff --check`, `pnpm lint`, `pnpm build`, and `pnpm check:docs`.
  - Manual API-boundary searches with `rg` checked changed auth/game-bet/game client files for backend URL/token/storage exposure and fetch targets.
  - Follow-up `git status --short --branch --untracked-files=all` -> confirmed still on `codex/auth-refresh-bet-retry`.
  - Follow-up `pnpm lint` -> exit 0 with the same unrelated warning in `src/widgets/main-nav/main-nav.tsx` for unused `onExpandRequest`.
  - Follow-up `git diff --check` -> passed.
  - Follow-up `pnpm check:docs` -> passed; mapped durable docs changed for `src/app/api/auth/**`, `src/app/api/_lib/**`, `src/features/auth/**`, `src/games/**`, and `src/features/**`.
  - Follow-up sandboxed `pnpm build` -> failed only because Next/font could not fetch Google Outfit from `fonts.googleapis.com`.
  - Follow-up approved escalated `pnpm build` -> passed.
  - Follow-up approved escalated `pnpm validate` -> passed; includes `git diff --check`, `pnpm lint`, `pnpm build`, and `pnpm check:docs`.
  - Follow-up `pnpm validate` reported the existing unrelated lint warning in `src/widgets/main-nav/main-nav.tsx` for unused `onExpandRequest`; no errors.
  - Targeted review found one blocking issue: local `/api/auth/refresh` collapsed backend refresh HTTP `5xx` responses into local `401`.
  - Targeted blocker patch changed `/api/auth/refresh` to return local `401` only for backend refresh `401`/`403`, and local `502` for backend refresh non-auth failures.
- Repo status before artifact creation:
  - Clean working tree on `develop`.
- Repo status after artifact creation:
  - `git diff --check` passed.
- Implementation continuation:
  - Branch setup completed on `codex/auth-refresh-bet-retry`.

## Documentation Evidence

- Ownership mapping checked:
  - `src/features/auth/**` -> `docs/architecture/auth.md`
  - `src/features/**` excluding auth -> `docs/architecture/foundation-decisions.md`
  - `src/games/**` -> `docs/architecture/foundation-decisions.md`
- Durable docs changed:
  - `docs/architecture/auth.md` records the browser-safe in-memory refresh manager for game bet recovery.
  - `docs/architecture/auth.md` records server-side session bootstrap refresh recovery and refresh-invalid game-bet redirect-to-main behavior.
  - `docs/architecture/foundation-decisions.md` records `src/features/game-bet/**` as a narrow game-bet-only auth-retry helper and limits its policy.
- Status labels used:
  - Implemented behavior only; no deferred or planned behavior was promoted beyond the current source changes.

## API Boundary Evidence

- Browser code still calls only local `/api/*` routes.
- New refresh client calls only `/api/auth/refresh`.
- New game-bet helper accepts only local `/api/games/*/bet` routes.
- Session bootstrap refresh runs only server-side in `/api/auth/session` and uses server-only backend helpers.
- `rg` found no `BACKEND_BASE_URL`, direct external URL, `Authorization`, bearer token, `document.cookie`, `localStorage`, or `sessionStorage` usage in changed browser code.
- Backend URL, access token, refresh token, and cookie normalization remain server-side/BFF-only.
- No new BFF route handlers were added. The existing `/api/auth/session` BFF route was changed narrowly for session bootstrap refresh recovery.

## Review Evidence

- Repo-local review skill was used after the initial implementation.
- Initial implementation review findings at that checkpoint: no blocking findings.
- Scope check: changed files are inside approved implementation scope plus narrow durable docs required by ownership mapping.
- Correctness check:
  - `postLocalGameBetWithAuthRetry()` limits URLs to local `/api/games/*/bet`.
  - Bet payload is `JSON.stringify()`-serialized once and reused for retry.
  - Refresh is attempted only for first response status `401`.
  - A successful refresh permits exactly one retry.
  - Refresh failure falls through to the original bet failure path without clearing auth/session state or assuming logout.
  - Retry failure is returned as the final failure without another refresh.
  - Network errors and non-401 responses are not retried.
- Plinko safety check: retry is in `placePlinkoBet()`, below `placePlinkoRound()`, so local projected/requesting round creation is not duplicated by the retry helper.
- AutoBet safety check: generic runner remains unchanged; Dice and Plinko AutoBet inherit helper-level recovery through existing per-game `placeBet` callbacks.
- Targeted review follow-up found the refresh-status blocker described above; the blocker was patched locally and awaits validation evidence below.
- Targeted refresh-status blocker review after patch found no blocking findings.
- Refresh status classification blocker is fixed:
  - Backend refresh `401`/`403` returns local `401`.
  - Backend refresh `5xx` returns local `502` / non-auth failure.
  - Network/backend exception returns local `502`.
  - Only local refresh `401` becomes `auth-failed`.
- Game-bet redirect remains narrow:
  - Redirect to `/` only after original game bet `401` plus refresh result `auth-failed`.
  - No redirect for refresh `502`, refresh `5xx`, network failure, timeout, or unknown refresh failure.
- Latest targeted review / post-patch validation:
  - `git status --short --branch` confirmed branch/status on `codex/auth-refresh-bet-retry`.
  - `git diff --check` passed.
  - `pnpm check:docs` passed.
  - `pnpm validate` passed with approved network access for Next/font.
  - Existing unrelated warning remains in `src/widgets/main-nav/main-nav.tsx`: unused `onExpandRequest`.

## TDD / Test Harness Note

- The repo has no test script in `package.json`, and the project validation baseline forbids inventing validation scripts. No automated red/green TDD cycle was possible without introducing unapproved tooling. Behavior was validated through lint, production build, docs freshness, aggregate validation, source inspection, and manual QA instructions.

## Handoff

Implementation is ready for review on `codex/auth-refresh-bet-retry`. No staging, commit, push, PR creation, merge, branch deletion, or lifecycle close was performed.

## Lifecycle Closure

- Closure requested explicitly on 2026-06-18 for merged task `auth-refresh-bet-retry`.
- Merge evidence:
  - `git fetch origin develop` updated `origin/develop` to `00e7980`.
  - `git merge-base --is-ancestor f9fe7c2 origin/develop` confirmed the task commit is contained in `origin/develop`.
  - `origin/develop` shows merge commit `00e7980 Merge pull request #15 from Wealth-generation/codex/auth-refresh-bet-retry`.
  - Local `develop` was fast-forwarded from `ff4d160` to `00e7980` before archiving.
- Archive action:
  - Moved `.ai/tasks/active/auth-refresh-bet-retry.md` to `.ai/tasks/archived/auth-refresh-bet-retry.md`.
- Scope:
  - Lifecycle close only.
  - No product source changes were made during lifecycle closure.
  - No staging, commit, push, PR creation, merge commit, branch deletion, or feature work was performed.
