# Auth Architecture

## Purpose

This document records the durable architecture for the implemented Local Auth Integration.
Task artifacts under `.ai/tasks/**` remain lifecycle evidence; this file is the long-term
project reference for the auth/BFF pattern.

## Current Status

Implemented:

- Local auth BFF route handlers live under `src/app/api/auth/**`.
- Server-only backend/auth helpers live under `src/app/api/_lib/**`.
- Browser-safe auth request helpers and TanStack Query session hooks live under `src/features/auth/**`.
- The auth modal owns login, register, email verification, and related form state.
- The top bar consumes the auth session hook and exposes logout when authenticated.
- Local auth is the first implemented BFF slice in the project.

Deferred:

- Social OAuth.
- `socket_token` handling and socket integration.
- Forgot-password and reset-password flows.
- Non-auth endpoint mapping.
- Full API/BFF mapping for games, wallet, profile, progression, and other product areas.

## Route Inventory

Implemented local auth routes:

```txt
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/login
GET  /api/auth/session
POST /api/auth/refresh
POST /api/auth/logout
```

These are local BFF routes. Browser code calls these routes, not the external backend.

## Boundary Flow

The accepted auth boundary is:

```txt
Browser UI -> local /api/auth/* -> src/app/api/auth/** route handlers -> external backend API
```

Rules:

- Browser code calls only local `/api/*`.
- Browser code must not call the external backend directly.
- Browser code must not know `BACKEND_BASE_URL`.
- Backend URL construction, backend cookies, auth headers, refresh/session logic, and token forwarding stay server-side/BFF.
- Future non-auth endpoint mapping remains deferred until an approved task defines it.

## Environment Boundary

Implemented environment variables:

```txt
BACKEND_BASE_URL
```

`BACKEND_BASE_URL` is server-only. It is read by `src/app/api/_lib/auth-backend.ts` and must not
be exposed to browser code.

## Auth Request Shape

Implemented local auth request flow:

1. The browser submits login and register forms only to the local auth BFF routes.
2. The BFF forwards login to the backend with `email` and `password`.
3. The BFF forwards register to the backend with `username`, `email`, `password`, and optional `affiliateCode`.
4. Backend URL construction, auth cookies, and token handling remain server-side.

This preserves the local API boundary while keeping browser code independent of backend URL and auth-token details.

## Cookie Strategy

Implemented normalized auth cookies:

```txt
access_token
refresh_token
```

Rules:

- Auth cookies are normalized onto the current application domain by the BFF.
- Cookies are set as `HttpOnly`.
- Cookies use `sameSite: "strict"`.
- Cookies use `secure: true` in production.
- `access_token` is scoped to `/`.
- `refresh_token` is scoped to `/api/auth`.
- Legacy `accessToken` and `refreshToken` cookies are cleared during logout.

Deferred:

- `socket_token` is not normalized or consumed yet.

## Feature Ownership

`src/features/auth/**` owns browser-safe auth use-cases:

```txt
src/features/auth/api/     Local /api/auth request helpers.
src/features/auth/model/   TanStack Query session and logout hooks.
src/features/auth/types/   Browser-safe auth payload and session types.
```

TanStack Query owns auth server state. Auth session state must not move into a global Zustand
store unless a future approved task changes the state ownership model.

## Auth Modal Ownership

`src/widgets/auth-modal/**` owns the auth modal UI and interaction flow:

- login form;
- register form;
- email verification step;
- modal-local form state and errors;
- disabled social auth placeholders.

The auth modal calls `src/features/auth/**`, which calls only local `/api/auth/*`.

## Session, Refresh, And Logout

Session:

- `GET /api/auth/session` reads `access_token` server-side and queries the backend current-user endpoint.
- When the access cookie is missing or no longer authenticates but a refresh cookie exists, the session route attempts one server-side backend refresh, normalizes refreshed auth cookies onto the local response, retries the current-user lookup once with the refreshed access cookie, and returns an authenticated local session when that retry succeeds.
- Missing refresh, failed refresh, unavailable backend auth/session data, or malformed backend session data returns an unauthenticated local session shape without exposing backend token details.
- Browser code consumes the session through `useAuthSession()`.

Refresh:

- `POST /api/auth/refresh` reads `refresh_token` server-side and asks the backend to refresh auth cookies.
- Successful refresh normalizes backend auth cookies onto the current domain.
- Failed or missing refresh returns a non-success response without exposing backend token details.
- Browser-safe auth recovery for game bets is implemented through `src/features/auth/api/auth-refresh-manager.ts`.
  Multiple simultaneous bet `401` recoveries share one in-memory refresh request. The browser still calls
  only local `/api/auth/refresh`, never sees backend URL or tokens, and no refresh state is persisted.
- If a game bet receives `401` and the refresh attempt also fails with auth failure, the browser follows the
  reference behavior and redirects to `/`. Refresh backend unavailability and unknown refresh failures do not
  trigger that redirect.

Logout:

- `POST /api/auth/logout` forwards current auth cookies to the backend when available.
- Local auth cookies are cleared even if backend logout is unavailable.
- `useLogoutMutation()` updates the auth session query cache to unauthenticated on success.

Known limitation:

- A brief auth-state flicker after reload is accepted for now. A future app-level bootstrap
  loader should address it when approved.

## Social Auth Deferral

Social OAuth providers may appear as disabled placeholders in the auth modal. They are deferred
because the project has not approved the social connect/init-connect flow, provider callback
handling, Discord verification, Kick test endpoint, or related backend endpoint mapping.

## Out Of Scope

The implemented auth architecture does not authorize:

- social OAuth;
- socket integration;
- forgot-password or reset-password;
- non-auth endpoint mapping;
- full API/BFF mapping;
- game, wallet, profile, progression, or realtime API docs as implemented;
- browser-readable auth cookies;
- localStorage token storage;
- browser-side backend URL exposure;
- unapproved API clients, query hooks, BFF routes, backend helpers, or auth/session expansion.
