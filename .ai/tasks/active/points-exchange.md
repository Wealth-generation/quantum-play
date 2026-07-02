# Task

- Title: Points Exchange
- Task lane: normal / architecture-sensitive
- Status: implementation, human manual UI/API QA, review cleanup, and pre-commit readiness passed
- Mode: implementation
- Branch mode: PR-mode
- Base branch: develop
- Task branch: codex/points-exchange
- Current branch at task start: develop
- Branch creation command/evidence: `git checkout -b codex/points-exchange` -> `Switched to a new branch 'codex/points-exchange'`

## Scope

- Goal: Add a working WATCH_POINTS to GAME_POINTS exchange flow through a local BFF route, feature-local UI/model/api slice, top-bar balance popover entrypoint, immediate TanStack Query balance cache update, and durable architecture documentation.
- Non-goals: No staging, commits, pushes, PRs, merges, branch deletion, archive actions, browser automation, Playwright, dev-server smoke checks, local browser UI checks, dependency changes, toast UX, new balance state-management pattern, auth/session behavior changes, or backend browser calls.
- Approved files:
  - `src/app/api/balance/watch-to-game/route.ts`
  - `src/features/points-exchange/**`
  - `src/widgets/top-bar/**`
  - `docs/architecture/foundation-decisions.md`
  - `.ai/tasks/active/points-exchange.md`
  - `public/images/two-coins.webp`
- Forbidden scope: unrelated product/API/BFF/auth work, dependency additions, shared primitive changes unless unavoidable, scripts, CI, Playwright, active hooks, worktrees, MCP, subagents, release automation, observability.
- Editable files:
  - `src/app/api/balance/watch-to-game/route.ts`
  - `src/features/points-exchange/api/points-exchange-client.ts`
  - `src/features/points-exchange/model/points-exchange-query.ts`
  - `src/features/points-exchange/types/points-exchange-types.ts`
  - `src/features/points-exchange/ui/points-exchange-modal.tsx`
  - `src/features/points-exchange/index.ts`
  - `src/widgets/top-bar/top-bar.tsx`
  - `docs/architecture/foundation-decisions.md`
  - `.ai/tasks/active/points-exchange.md`
- Context-only files:
  - `CLAUDE.md`
  - `docs/architecture/auth.md`
  - `.claude/rules/**`
  - `.claude/skills/**`
  - `.agents/skills/ui-markup/SKILL.md`
  - `.agents/skills/responsive-layout/SKILL.md`
  - `docs/workflow/ownership-to-docs.md`
  - `scripts/docs-ownership-map.json`
  - `src/features/balance/**`
  - `src/features/auth/**`
  - `src/app/api/_lib/**`
  - `src/app/api/user/balance/route.ts`
  - `src/features/daily-claim/**`
  - `src/games/*/model/*query.ts`
  - `src/shared/ui/primitives/**`
  - `.ai/context/points-exchange/**`

## Current State

- Summary: Existing top bar shows balance pills directly; no balance popover exists in source. Balance server state is owned by `balanceQueryKey` in `src/features/balance`. Authenticated BFF routes use `backendFetch()` and `backendCookieHeader(["access_token"])`.
- Last completed step: Human local validation confirmed `pnpm build` and `pnpm validate` passed after Codex sandbox validation was blocked only by Google Fonts network/approval limits.
- Next step: Human-controlled commit if desired.
- Open risks/blockers: No known blocker after human manual UI/API QA.

## Source Of Truth

- Files inspected: `CLAUDE.md`, `docs/architecture/foundation-decisions.md`, `docs/architecture/auth.md`, `.claude/rules/**`, `.claude/skills/implementation/SKILL.md`, `.claude/skills/api-boundary-check/SKILL.md`, `.claude/skills/documentation/SKILL.md`, `.agents/skills/ui-markup/SKILL.md`, `.agents/skills/responsive-layout/SKILL.md`, `.ai/context/points-exchange/**`, existing BFF/query/top-bar/shared primitive files.
- Architecture decisions: Browser code calls only local `/api/*`; backend URL/cookies stay server-side; TanStack Query owns server state; Zustand is not used for balances; new feature ownership belongs in `src/features/points-exchange`.
- Relevant rules/skills: implementation, documentation, API boundary check, UI QA, ui-markup, responsive-layout, validation workflow, git lifecycle.

## Impact

- Docs impact: `docs/architecture/foundation-decisions.md` updated for the new route, feature ownership, and balance mutation/cache behavior. `docs/architecture/auth.md` docs-not-needed rationale: auth/session/cookie behavior was reused unchanged through existing BFF helpers and local refresh retry; no auth route, cookie strategy, or session contract changed.
- API boundary impact: Applicable. Browser client calls only `/api/balance/watch-to-game` with a positive integer number; BFF proxies `/balance/watch-to-game` server-side with auth cookie and adapts the validated amount to the backend-required Decimal string payload.
- UI QA requirement: Required, manual owner only. No browser automation or local browser checks by Codex. Required manual QA routes/screens: authenticated top bar on `/rewards` and general app shell, balance popover, Points Exchange modal. Viewports: desktop around 1440x900, mobile around 375x812 and/or 390x844. Interactions/states: open/close balance popover, open modal with Watch Points `0`, invalid/empty/decimal/negative amount, amount exceeding Watch Points, loading confirm, successful exchange close/cache update, backend failure, expired session, close button, mobile stacked exchange-rate layout, no overlap with mobile navigation.
- Human manual UI/API QA evidence: Runtime overlay blocker was fixed earlier and the app opens successfully. Direct backend verification confirmed the backend expects Decimal as JSON string `{ "amount": "25" }`; direct backend request with numeric `{ "amount": 25 }` failed with `amount must be Decimal` and `amount must be positive`; Swagger's numeric example was misleading/incomplete. After the BFF converts the browser numeric amount to a backend Decimal string, submitting amount `25` through the app succeeds, local `POST /api/balance/watch-to-game` succeeds, the Points Exchange modal closes after success, and displayed balances update from backend final balances. API boundary remains correct: browser calls only local `/api/balance/watch-to-game`, the browser/client contract remains integer-only number, the BFF adapts the payload to backend string Decimal server-side, and no browser token/header handling was added.
- Stack primitive checklist: Use shared `Dialog`, `Popover`, `Button`, `Input`; use `next/image`; keep product logic in feature slice; top bar only anchors/wires; use Tailwind token classes and mobile-first responsive layout.

## Validation

- Validation plan: `git diff --check`, `pnpm lint`, `pnpm build`, `pnpm check:docs`, `pnpm validate`; manual API boundary, docs, and UI QA gates.
- Commands run:
  - `git checkout -b codex/points-exchange` -> passed after sandbox escalation for Git ref write.
  - `pnpm lint` -> passed.
  - `pnpm build` -> first sandbox run failed on Google Fonts network fetch; escalated run exposed a BigInt target type error, fixed; final escalated run passed.
  - `git diff --check` -> passed.
  - `pnpm check:docs` -> passed.
  - `pnpm validate` -> passed with escalation for build network access.
  - API boundary source check with `rg` -> browser feature client uses local `fetch`; backend helpers appear only in `src/app/api/balance/watch-to-game/route.ts`.
  - Toast source check with `rg` -> no toast/Sonner usage added.
  - Runtime-loop source check with `rg` -> no `useEffect` remains in `src/features/points-exchange/ui/points-exchange-modal.tsx`; reset calls remain only in explicit close handling.
  - Fix validation `git diff --check` -> passed.
  - Fix validation `pnpm lint` -> passed.
  - Fix validation `pnpm build` -> sandbox run failed on Google Fonts network fetch; escalated run passed.
  - Fix validation `pnpm check:docs` -> passed.
  - Fix validation `pnpm validate` -> passed with escalation for build network access.
- Review evidence: read-only review completed after human QA; result passed with two non-blocking truthfulness cleanup findings for durable docs and one stale artifact line. Cleanup applied in `docs/architecture/foundation-decisions.md` and `.ai/tasks/active/points-exchange.md`.
- Pre-commit evidence: Previous Codex pre-commit readiness was blocked only because sandboxed `pnpm build`/nested `pnpm validate` could not fetch Google Fonts and the required escalation was rejected by the approval system usage limit, not because of source errors. Human local validation then confirmed `pnpm build` passed and `pnpm validate` passed.

## Risks And Handoff

- Risks: Backend response shape may differ from screenshot; mobile modal needs human visual QA; `public/images/two-coins.webp` is expected and remains untracked until human-controlled staging; no source-level toast pattern exists or was added.
- Runtime blocker finding: Human manual UI QA found a Next.js runtime overlay on app open: `Maximum update depth exceeded`.
- Root cause: `src/features/points-exchange/ui/points-exchange-modal.tsx` kept the modal mounted under `TopBar` while closed and ran a `useEffect` whenever `open` was `false`. That effect called `form.reset()` and `exchangeMutation.reset()` and depended on the whole mutation object, so mutation reset could change render state/object identity and retrigger the effect while still closed.
- Fix evidence: Removed the close-reset `useEffect`; reset now happens only from explicit Dialog close handling and successful submit close handling. No dependency suppressions were added.
- API blocker finding: Human manual QA submitted browser payload `{ "amount": 1 }` to local `POST /api/balance/watch-to-game` and received `400 Bad Request` while the UI showed sufficient Watch Points. The UI displayed generic `Exchange failed. Please try again.`
- API root cause: The local BFF passed local validation and reached the backend non-OK branch, but that branch did not request JSON explicitly from the backend and collapsed all non-auth backend 400 responses into the generic exchange failure message. This lost the backend's safe amount/balance error semantics and prevented the UI from showing the required insufficient-balance copy for backend 400 amount/balance errors.
  - API fix evidence: `src/app/api/balance/watch-to-game/route.ts` now forwards `{ amount: <number> }` with `Accept: application/json`, `Content-Type: application/json`, and the server-side `Cookie` header. The BFF reads backend error JSON/text safely, maps backend 400 amount/balance meanings to `Insufficient Watch Points balance.`, keeps local invalid amount mapped to `Enter a valid amount.`, keeps auth failures mapped to `Your session expired. Please log in again.`, and keeps unknown/backend/network failures mapped to `Exchange failed. Please try again.`
  - API fix validation `git diff --check` -> passed.
  - API fix validation `pnpm lint` -> passed.
  - API fix validation `pnpm build` -> sandbox run failed on Google Fonts network fetch; escalated run passed.
  - API fix validation `pnpm check:docs` -> passed.
  - API fix validation `pnpm validate` -> passed with escalation for build network access.
- Second API blocker finding: Human manual QA confirmed local `POST /api/balance/watch-to-game` still returned `400 Bad Request` for valid browser payload `{ "amount": 1 }` after JSON headers and error mapping were added. UI showed sufficient Watch Points.
- Existing working route pattern inspected: `src/app/api/games/dice/bet/route.ts`, `src/app/api/games/plinko/bet/route.ts`, `src/app/api/fairness/seed/route.ts`, and `src/app/api/user/profile/username/route.ts` all keep token handling server-side and forward the normalized local `access_token` as a backend `Cookie` header from `backendCookieHeader(["access_token"])`. No browser token handling is used.
- Auth/header finding: Points Exchange now matches the established repo cookie-forwarding pattern. The earlier `Authorization: Bearer <access_token>` attempt was not source-backed by existing working BFF routes and did not resolve the backend `400 Bad Request`, so it was removed.
- Second API attempted fix evidence: `src/app/api/balance/watch-to-game/route.ts` temporarily forwarded `Authorization: Bearer <access_token>` server-side for comparison with the documented JWT-style backend failure mode, but human manual QA confirmed this did not resolve the backend `400 Bad Request`.
  - Second API follow-up source check with `rg` -> confirmed the speculative `Authorization` forwarding was later removed. Superseded payload note: at that point the route still sent numeric `JSON.stringify({ amount: requestBody.amount })`; final direct backend verification later required the current Decimal string body `JSON.stringify({ amount: String(requestBody.amount) })`.
  - Second API fix validation `git diff --check` -> passed.
  - Second API fix validation `pnpm lint` -> passed.
  - Second API fix validation `pnpm build` -> sandbox run failed on Google Fonts network fetch; escalated run passed.
  - Second API fix validation `pnpm check:docs` -> passed.
  - Second API fix validation `pnpm validate` -> passed with escalation for build network access.
- Third API blocker finding: Human manual QA confirmed local `POST /api/balance/watch-to-game` still returned `400 Bad Request` after adding server-side `Authorization: Bearer <access_token>`. The browser response did not expose enough backend-specific reason to distinguish amount limit, insufficient backend balance, or backend exchange config issue.
- Diagnostic fields added: backend failures can now include safe `backendStatus`, optional `backendCode`, optional `backendMessage`, and optional `backendDetails`. Diagnostics are derived only from backend JSON/text error fields, truncated, and filtered for sensitive terms such as token, authorization, cookie, bearer, JWT, secret, password, stack, trace, hash, or backend URL.
- Diagnostic behavior: local invalid amount still returns `Enter a valid amount.`; backend non-OK responses now use the safe backend message as the main local `error` value and include safe diagnostics when available; unknown failures without a safe backend message still keep `Exchange failed. Please try again.`
  - Diagnostic patch source check with `rg` -> confirmed `backendStatus`, `backendCode`, `backendMessage`, `backendDetails`, and sensitive-message filtering in the BFF route.
  - Diagnostic patch validation `git diff --check` -> passed.
  - Diagnostic patch validation `pnpm lint` -> passed.
  - Diagnostic patch validation `pnpm build` -> sandbox run failed on Google Fonts network fetch; first escalated run found a nullable optional field typing issue, fixed; final escalated run passed.
  - Diagnostic patch validation `pnpm check:docs` -> passed.
  - Diagnostic patch validation `pnpm validate` -> passed with escalation for build network access.
  - Diagnostic transparency validation `git diff --check` -> passed.
  - Diagnostic transparency validation `pnpm lint` -> passed.
  - Diagnostic transparency validation `pnpm build` -> sandbox run failed on Google Fonts network fetch; escalated run passed.
  - Diagnostic transparency validation `pnpm check:docs` -> passed.
  - Diagnostic transparency validation `pnpm validate` -> sandbox run failed on nested Google Fonts fetch; escalated run passed.
- Fourth API blocker finding: Human manual QA confirmed both amount `1` and amount `25` return the same backend `400 Bad Request`; Swagger documents backend 400 as `Invalid amount or insufficient WATCH_POINTS balance`, but the backend currently returns only `Bad Request`.
- Diagnostic transparency decision: For backend non-OK responses, the local API now returns the safe backend message as the main `error` value instead of collapsing it into generic/mapped UI copy. If backend returns plain text `Bad Request`, local JSON should include `error: "Bad Request"`, `backendStatus: 400`, and `backendMessage: "Bad Request"`. JSON fields `message`, `error`, `code`, and `details` are preserved only after sanitization/truncation.
- Authorization header decision: Reverted the speculative server-side `Authorization: Bearer <access_token>` forwarding. Existing working BFF routes inspected (`games/dice/bet`, `games/plinko/bet`, `fairness/seed`, `user/profile/username`) use the established server-side `Cookie: access_token=...` pattern, and the Authorization header did not resolve the backend 400. The Points Exchange route now follows the established repo pattern again.
- Fifth API blocker finding: Direct backend verification showed backend `POST /balance/watch-to-game` rejects JSON number `{ "amount": 25 }` with validation messages `amount must be Decimal` and `amount must be positive`, while JSON string `{ "amount": "25" }` returns `201 Created`. Backend success response example includes string balances and string spent/received values: `watchPointsSpent`, `gamePointsReceived`, `watchPointsBalance`, and `gamePointsBalance`; `exchangeRate` may be numeric.
- Swagger mismatch: Swagger's numeric amount example is misleading/incomplete for this endpoint because the backend validates the amount as Decimal and accepts the Decimal string payload.
- Final payload-format decision: Keep the browser/client public contract as integer-only `{ amount: number }` so UI validation stays strict and unchanged. In the BFF route only, after positive safe integer validation, adapt the backend payload to `JSON.stringify({ amount: String(requestBody.amount) })`.
- Response normalization note: Existing success normalization already accepts string or finite numeric decimal-like backend values and returns browser-safe strings compatible with the shared balance cache conventions.
- Payload-format validation `git diff --check` -> passed.
- Payload-format validation `pnpm lint` -> passed.
- Payload-format validation `pnpm build` -> sandbox run failed on Google Fonts network fetch; escalated run passed.
- Payload-format validation `pnpm check:docs` -> passed.
- Payload-format validation `pnpm validate` -> sandbox run failed on nested Google Fonts fetch; escalated run passed.
- Final human QA evidence: Runtime overlay blocker remains fixed and the app opens successfully. Direct backend verification confirmed backend accepts Decimal string payload `{ "amount": "25" }` and rejects numeric `{ "amount": 25 }` with `amount must be Decimal` and `amount must be positive`, making the Swagger numeric example misleading/incomplete. The app flow now works after the BFF converts browser numeric amount to backend Decimal string: submitting amount `25` through the app succeeds, local `POST /api/balance/watch-to-game` succeeds, the Points Exchange modal closes after success, and displayed balances update from backend final balances. Browser/client contract remains integer-only number; API boundary remains correct with browser calls only to local `/api/balance/watch-to-game`; no browser token/header handling was added.
- Review cleanup evidence: Durable architecture docs now explicitly record that browser code sends integer-only `{ amount: number }` to the local BFF, the BFF validates a positive safe integer, and the BFF adapts the backend payload to Decimal string form with `{ amount: String(amount) }`. The stale historical artifact wording about numeric forwarding is marked superseded and no longer describes the current route.
- Review cleanup validation `git diff --check` -> passed.
- Review cleanup validation `pnpm check:docs` -> passed.
- Human local pre-commit validation `pnpm build` -> passed.
- Human local pre-commit validation `pnpm validate` -> passed.
- Handoff: Points Exchange is ready for a human-controlled commit. Suggested commit message: `feat: add points exchange flow`.
- Lifecycle close notes: Do not archive unless explicitly requested.
