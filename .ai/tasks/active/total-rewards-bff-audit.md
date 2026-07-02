# Task Lifecycle Record

## Identity

- Task title: Total Rewards Counter — BFF + Counter Implementation
- Status: implementation-complete, pending review/pre-commit
- Mode: implementation (continues audit)
- Branch mode: PR-mode
- Base branch: develop
- Task branch: feat/lobby-total-rewards-bff
- Current branch at task start: feat/lobby-total-rewards-bff (pre-created by user)
- Branch creation command/evidence: user pre-created branch before implementation session; confirmed via `git branch --show-current` → feat/lobby-total-rewards-bff

## Scope

- Goal: Read-only discovery for connecting the Lobby "Total Rewards" counter to the backend via BFF — inventory the counter, existing BFF pattern, TanStack Query setup, rendering mode, then produce a proposed data path, FSD placement, rendering approach, value-handling plan, and auth notes.
- Non-goals: No code edits of any kind. No branch creation, staging, committing.
- Approved scope: read-only
- Forbidden scope: all writes
- Editable files: none
- Context-only files: (all files below are context-only)
  - src/app/page.tsx
  - src/widgets/lobby/lobby.tsx
  - src/widgets/lobby/lobby-rewards-banner.tsx
  - src/widgets/lobby/rewards-counter.tsx
  - src/widgets/lobby/flip-digit.tsx
  - src/app/providers.tsx
  - src/app/layout.tsx
  - src/app/api/_lib/auth-backend.ts
  - src/app/api/_lib/auth-cookies.ts
  - src/app/api/user/balance/route.ts
  - src/app/api/daily-claimer/status/route.ts
  - src/app/api/bets/latest/route.ts
  - src/app/api/bets/_lib/live-bets-backend.ts
  - src/features/balance/api/balance-client.ts
  - src/features/balance/model/balance-query.ts
  - src/features/balance/types/balance-types.ts
  - src/features/daily-claim/api/daily-claim-client.ts
  - src/features/daily-claim/model/daily-claim-query.ts
  - src/features/daily-claim/types/daily-claim-types.ts
  - src/features/user-profile/model/user-profile-query.ts
  - next.config.ts

## Source Of Truth

- Source-of-truth files inspected: docs/architecture/foundation-decisions.md (via rules), .claude/rules/state-data-api-boundary.md, .claude/rules/game-frontend-architecture.md, .claude/rules/project-structure.md
- Architecture decisions: BFF boundary is firm — browser calls only /api/*; backend URL stays server-side; TanStack Query owns server state; no big.js (rejected).
- Relevant rules: state-data-api-boundary.md, project-structure.md, quality-gates.md
- Relevant skills: audit, implementation (for next step)

---

## Audit Findings

### 1. The Counter — Exact Render Path and Current State

**Render path** (top-down):

```
src/app/page.tsx              Server Component — no "use client", no dynamic export
  └─ src/widgets/lobby/lobby.tsx            Server Component — no "use client"
       └─ src/widgets/lobby/lobby-rewards-banner.tsx  Server Component — no "use client"
            └─ src/widgets/lobby/rewards-counter.tsx  "use client" island
                 └─ src/widgets/lobby/flip-digit.tsx  "use client" leaf
```

**Counter details** (`src/widgets/lobby/rewards-counter.tsx`):
- `"use client"` at line 1 — it IS a client island.
- Props: `interface RewardsCounterProps { initialValue?: number }`, default `initialValue = 1836855`.
- State: `const [value, setValue] = useState(initialValue)` — initialized from prop.
- Side-effect: `setInterval` every 30 s that adds `Math.floor(Math.random() * 1000)` — this is the fake "live" ticker; it is explicitly labeled `STATIC PLACEHOLDER` in the comment.
- Formatting: `value.toLocaleString("en-US").split("")` → renders each char as a `<FlipDigit>`. Flip-digit animation is via Motion (`AnimatePresence`) — already in place.
- Display value: whole-dollar integer via `toLocaleString("en-US")` — e.g., `$1,836,855`. No decimal places rendered.
- The file comment says: _"STATIC PLACEHOLDER: the start value and the random increments are demo behaviour — the real 'total rewards given back' is backend-authoritative (Track B endpoint)."_

**Banner** (`src/widgets/lobby/lobby-rewards-banner.tsx`):
- Server Component; imports and renders `<RewardsCounter />` at line 70 with no props passed (uses default).
- Banner itself is static copy — only the `<RewardsCounter />` is the live island.

**Summary**: The counter is a `"use client"` island with a hardcoded `initialValue` default and a fake interval. The surrounding `LobbyRewardsBanner`, `Lobby`, and `page.tsx` are all Server Components. No data fetching of any kind touches the rewards value today.

---

### 2. Existing BFF Route Pattern

Two sub-patterns exist. The canonical server-only helper is in `src/app/api/_lib/auth-backend.ts`.

#### Pattern A — Authenticated routes (representative: `src/app/api/user/balance/route.ts`)

| Aspect | Detail |
|---|---|
| File/route naming | `src/app/api/<resource>/route.ts` → `/api/<resource>` |
| Backend base URL | `process.env.BACKEND_BASE_URL` read inside `_lib/auth-backend.ts` via `getBackendBaseUrl()` |
| Backend access | `backendFetch(path, init)` from `_lib/auth-backend.ts` — prepends base URL, defaults `cache: "no-store"` |
| Auth/session | `backendCookieHeader(["access_token"])` from `_lib/auth-cookies.ts` — reads cookie store server-side, returns a `Cookie:` header string; returns 401 if cookie absent |
| Cookie forwarding | Forwards `Cookie: access_token=<value>` in fetch `headers` |
| Response validation | Manual TypeScript type guards (`isBackendUserBalance`, `toBalanceResponse`) — **no Zod** |
| Error helpers | Local named functions: `authRequired()`, `serviceUnavailable()`, `invalidBackendResponse()` → `NextResponse.json({ error: "..." }, { status: N })` |
| Shape returned to browser | Validated, narrowed DTO — **not** the raw backend payload |

#### Pattern B — Public (no-auth) routes (representative: `src/app/api/bets/latest/route.ts` via `src/app/api/bets/_lib/live-bets-backend.ts`)

| Aspect | Detail |
|---|---|
| Backend base URL | Duplicates `process.env.BACKEND_BASE_URL` locally (does NOT import from `_lib/auth-backend.ts`) |
| Cookie forwarding | None — no auth check |
| Response validation | `isLiveBetDto` array type guard |
| Error handling | Same `NextResponse.json({ error: "..." })` pattern |

**Note**: The live-bets backend duplicates base-URL logic rather than importing from `_lib/auth-backend.ts`. The `backendFetch` helper in `_lib/auth-backend.ts` is perfectly usable without passing cookies — the cookie forwarding is caller's choice. The duplication in `live-bets-backend.ts` is an existing inconsistency; do not propagate it.

---

### 3. TanStack Query — Current State

**QueryClient is wired** at app root in `src/app/providers.tsx`:
```tsx
// src/app/providers.tsx
<QueryClientProvider client={queryClient}>   ← line 22
  <AuthModalProvider>{children}</AuthModalProvider>
</QueryClientProvider>
```
`AppProviders` is referenced in `src/app/layout.tsx` (line 5), so `QueryClientProvider` wraps every page.

**FSD convention for query hooks** (consistently observed across all features):

| Layer | File | Role |
|---|---|---|
| `src/features/<f>/api/<f>-client.ts` | `balance-client.ts`, `daily-claim-client.ts` | Browser `fetch` → `/api/*`; throws on error |
| `src/features/<f>/model/<f>-query.ts` | `balance-query.ts`, `daily-claim-query.ts` | `useQuery` hook; exports query key const |
| `src/features/<f>/types/<f>-types.ts` | `balance-types.ts`, `daily-claim-types.ts` | TypeScript interface for the DTO returned to browser |
| `src/features/<f>/index.ts` | `balance/index.ts` | public re-export barrel |

This would be the **first** client-fetched lobby-specific value (non-auth, non-balance). The counter today fetches nothing.

---

### 4. Current Rendering Mode of `/`

`src/app/page.tsx` has:
- No `export const dynamic = ...`
- No `export const revalidate = ...`
- No server-side `fetch` / `await` inside the page or any of its Server Component ancestors in the lobby tree

`next.config.ts` has no `output: "export"` and no blanket `dynamic` override.

**Conclusion**: `/` is statically prerendered at build time today (Next.js App Router default). No server-side data requests occur on render. The flip-digit interval and the hardcoded value are entirely client-side.

---

## Proposed Design (A–E)

### A. Data Path and Local Route Name

```
Browser (RewardsCounter island)
  → fetch("/api/total-rewards")              ← new local BFF route
       → src/app/api/total-rewards/route.ts
            → backendFetch("/total-money-given")  ← server-only; invisible in DevTools
                 → backend response { totalMoneyGiven: "25000.00" }
            ← validate + shape → { totalMoneyGiven: "25000.00" }
  ← TanStack Query receives typed DTO
```

**Proposed local route path**: `/api/total-rewards`  
**Proposed file**: `src/app/api/total-rewards/route.ts`

Rationale: existing routes name themselves after the UI concept, not the backend path (e.g., `/api/user/balance` maps to `/user/query/me`; `/api/daily-claimer/status` maps to `/daily-claimer/status`). "total-rewards" names what the counter displays.

---

### B. FSD Placement

| Artifact | Proposed path | Rationale |
|---|---|---|
| BFF route handler | `src/app/api/total-rewards/route.ts` | All BFF handlers live under `src/app/api/**`. |
| Browser API client | `src/features/total-rewards/api/total-rewards-client.ts` | Mirrors `balance-client.ts` pattern: plain `fetch("/api/total-rewards")`, throws on error. |
| TanStack Query hook | `src/features/total-rewards/model/total-rewards-query.ts` | Mirrors `balance-query.ts`: `useQuery` + exported key const. |
| DTO type | `src/features/total-rewards/types/total-rewards-types.ts` | Mirrors `balance-types.ts`: TypeScript interface only. |
| Manual type guard (validation) | Same `route.ts` or a `_lib/` helper if reused | Codebase uses manual guards, not Zod (see finding 2). |
| Display mapper | `src/features/total-rewards/lib/total-rewards-format.ts` (optional) | A small `parseDecimalString(s: string): number` helper to convert `"25000.00"` → `25000`. Can be inlined in the query hook or component — only extract if needed separately. |
| Feature barrel | `src/features/total-rewards/index.ts` | Standard FSD barrel re-export. |

**Feature vs entity**: `features/` is the right layer. This is a data-fetch-and-display concern — the same as `balance` and `daily-claim`. An entity would be the domain noun (e.g., `entities/bet`). "Total rewards" is a stat read, not a noun owned across multiple features.

**No cross-game imports**: this feature imports from no game module. It is lobby-widget scoped. The `RewardsCounter` widget would import from `src/features/total-rewards`.

---

### C. Rendering Approach

**Recommendation: Client island + TanStack Query (option a).**

| | Client island (option a) | SSR dynamic fetch (option b) |
|---|---|---|
| `/` render mode | Stays static — build-time prerender | Forced dynamic — SSR on every request |
| TTFB | Fast — CDN-served static HTML | Slower — waits for backend round trip |
| Loading state | Counter shows `0` or skeleton until query resolves (~1 request on mount) | No client loading flash; value in initial HTML |
| Counter animation | `RewardsCounter` is already `"use client"` — no structural change needed | Counter is already `"use client"`, value passed as prop from server |
| Staleness | Can refetch on interval (e.g. `refetchInterval: 60_000`) | Would need revalidation strategy |
| Implementation complexity | Small: new `useQuery` hook + wire prop into existing component | More invasive: forces page/banner to be dynamic |

The lobby is currently fully static. Forcing `/` dynamic for a single background stat is a disproportionate tradeoff. The client-island approach is strictly contained, matches the `balance` precedent, and the `RewardsCounter` is already a `"use client"` island that accepts an `initialValue` prop.

**Loading/fallback strategy**: render `initialValue={0}` (shows `$0` in the counter digits) until the query succeeds. The existing `"use client"` island already has an `initialValue` prop — the parent `LobbyRewardsBanner` would pass the queried value once available, or `0` during loading.

**The 30-second random increment** is placeholder behavior and must be removed when the real value is wired in.

---

### D. Boundary Type, Validation, and Display

**Backend response shape**:
```ts
// Raw backend JSON
{ "totalMoneyGiven": "25000.00" }
```

**BFF DTO (returned to browser)**:
```ts
// src/features/total-rewards/types/total-rewards-types.ts
export interface TotalRewards {
  totalMoneyGiven: string;  // decimal string, e.g. "25000.00"
}
```

**Validation in route handler** (manual guard, consistent with codebase — no Zod in existing routes):
```ts
// guard function in route.ts
function isTotalRewardsPayload(v: unknown): v is { totalMoneyGiven: string } {
  return (
    v !== null &&
    typeof v === "object" &&
    "totalMoneyGiven" in (v as object) &&
    typeof (v as Record<string, unknown>).totalMoneyGiven === "string" &&
    (v as Record<string, unknown>).totalMoneyGiven !== ""
  );
}
```

**Decimal → display integer**:
- `parseFloat("25000.00")` → `25000` — safe for this use case (display-only whole-dollar amount)
- `Math.floor(parseFloat(dto.totalMoneyGiven))` if truncation is preferred over rounding
- No big.js (project decision: rejected). `parseFloat` is appropriate here since we're feeding a display-only integer to `toLocaleString`.
- The result feeds `RewardsCounter` as `initialValue` once the query resolves.

**Display format**: `$25,000` (no decimals) — matches the existing `value.toLocaleString("en-US")` in `rewards-counter.tsx`. No change needed to counter formatting logic.

**Currency symbol**: `$` is already rendered as a static `FlipDigit isSymbol` — no change needed.

**Count-up animation**: The `FlipDigit` components already animate per-digit as value changes. A smooth count-up from `0` → real value on mount is a polish concern. It is **out of scope** for the first slice — flag for a later polish pass. Motion is available if needed then.

---

### E. Auth / Session

**Open question — must be confirmed before implementation.**

The endpoint `GET /total-money-given` appears to be a public platform-wide stat (total money ever given back to the community). No session context is implied by the name or response shape.

**If public** (most likely): the BFF route needs no cookie forwarding. Pattern: use `backendFetch("/total-money-given", { method: "GET" })` from `_lib/auth-backend.ts` directly — no `backendCookieHeader` call, no auth check, no `authRequired()` helper. This mirrors the intent of the live-bets routes (which also have no auth), but uses the canonical `backendFetch` helper rather than duplicating the base-URL logic.

**If session-required**: the BFF route adds `backendCookieHeader(["access_token"])` + returns 401 if absent + forwards `Cookie` header. Pattern: mirrors `src/app/api/user/balance/route.ts` exactly.

**Action item for implementation**: confirm with backend whether `GET /total-money-given` requires a session cookie before writing the route handler.

---

## First Safe Implementation Slice

The smallest shippable step that unblocks all subsequent work:

1. **`src/app/api/total-rewards/route.ts`** — BFF GET handler: calls `backendFetch("/total-money-given")`, validates response with `isTotalRewardsPayload`, returns `NextResponse.json({ totalMoneyGiven })` or `serviceUnavailable()`/`invalidBackendResponse()`. Auth choice gated on open question E.
2. **`src/features/total-rewards/types/total-rewards-types.ts`** — `TotalRewards` interface.
3. **`src/features/total-rewards/api/total-rewards-client.ts`** — `getTotalRewards(): Promise<TotalRewards>` — plain `fetch("/api/total-rewards")`.
4. **`src/features/total-rewards/model/total-rewards-query.ts`** — `useTotalRewardsQuery()` — `useQuery` with `queryKey: ["total-rewards"]`, `staleTime: 60_000` (stat is slow-moving), `refetchInterval: 60_000`.
5. **`src/features/total-rewards/index.ts`** — barrel re-export.
6. **`src/widgets/lobby/lobby-rewards-banner.tsx`** — introduce a thin wrapper client island that calls `useTotalRewardsQuery()` and passes the parsed value as `initialValue` to `<RewardsCounter />`. Remove the random-increment `setInterval` from `RewardsCounter` and the hardcoded default (replace with `0` for loading state).

Steps 1–5 are independently testable (BFF can be curled; hook can be unit-tested in isolation). Step 6 is the final wiring.

---

## Impact

- Docs impact: if this is the first non-auth public BFF slice, the pattern is worth documenting in `docs/architecture/` (the existing auth BFF pattern is documented; a public BFF pattern entry may be missing — verify at implementation).
- API boundary impact: YES — introduces a new `/api/total-rewards` BFF route. Manual API boundary check required at implementation.
- UI QA requirement: YES — the counter currently shows a hardcoded value; after wiring it will show the backend value with a loading state. Verify: counter loads, shows `$0` briefly, then updates to real value. Verify no regression to the flip animation.
- Stack primitive checklist: client island + TanStack Query — standard pattern, consistent with balance/daily-claim.

## Validation Plan

- Planned commands: `pnpm validate` (lint + build + docs check) after implementation.
- Manual checks: curl `/api/total-rewards` in browser DevTools — must return `{ totalMoneyGiven: "..." }` and the backend call must NOT appear in DevTools network tab. UI QA on the counter display.
- Skipped checks and reasons: n/a (audit-only phase).

---

## Risks And Open Questions

| # | Risk / Question | Severity | Mitigation |
|---|---|---|---|
| 1 | **Auth unknown**: is `GET /total-money-given` public or session-required? | Blocking | Confirm with backend before writing the route handler. |
| 2 | **`"25000.00"` decimal precision**: does the backend ever return fractional cents (e.g. `"25000.005"`)? `parseFloat` + `Math.floor` truncates. | Low | Confirm backend always returns two-decimal-place strings; add format validation in the guard. |
| 3 | **Static prerender of `/` stays intact**: the client-island approach preserves this, but if `LobbyRewardsBanner` ever becomes a Server Component that awaits data, `/` becomes dynamic. | Low | Ensure only the `RewardsCounter` island (or a thin wrapper) is `"use client"` — `LobbyRewardsBanner` must remain a Server Component. |
| 4 | **`live-bets-backend.ts` duplicates base-URL logic**: a new public BFF route should NOT replicate this pattern. Use `backendFetch` from `_lib/auth-backend.ts`. | Low — existing debt | Do not propagate; document in review. |
| 5 | **Count-up animation on mount**: the existing flip animation handles per-digit changes. A smooth count from 0 → real value on first load is missing today; it creates a flash from `$0` → real value. | Low | Acceptable for first slice. Flag for polish pass. |
| 6 | **No Zod in route handlers**: codebase uses manual type guards. A Zod schema would be cleaner but would introduce an inconsistency. | Low | Keep manual guard for this slice for consistency. Can revisit in a codebase-wide standards decision. |

---

## Evidence

- Commands run:
  - `git status` / `git branch --show-current` — confirmed on feat/lobby-total-rewards-bff, clean tree
  - `pnpm validate` (exit 0): git diff --check ✓ · pnpm lint 0 errors ✓ · pnpm build ✓ (compiled in 2.6 min, TypeScript in 73 s) · pnpm check:docs ✓ (active task artifact rationale found for new src/features/total-rewards/** files)
  - Build route table confirms: `○ /` (static, unchanged) · `ƒ /api/total-rewards` (new dynamic BFF route registered)
- Review evidence: pending
- Pre-commit evidence: pending
- UI QA evidence: pending (counter loads from BFF, shows zeros until query resolves, then count-up animation via Motion animate(); layout fixed from resolved value)
- API boundary evidence: browser calls only /api/total-rewards; BACKEND_BASE_URL and the /total-money-given call remain server-only in src/app/api/total-rewards/route.ts; no cookies forwarded (public endpoint); 401/403 from backend returns 502 with explicit error message

## Risks And Handoff

- Risks: see table above; item 1 (auth) is the only blocking open question before implementation can begin.
- Handoff: ready for implementation. Branch mode = PR-mode; propose branch `feat/total-rewards-bff` off `develop` at implementation start (user confirmation required).
- Lifecycle close notes: n/a — audit artifact only.
