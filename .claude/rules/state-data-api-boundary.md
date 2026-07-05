# State, Data, API, And BFF Boundary Rules

Accepted boundary:

```txt
Browser UI -> local /api/* -> src/app/api/** route handlers -> external backend API
```

## API Boundary

- Browser UI calls only local `/api/*`.
- Browser UI must not call the external backend directly.
- Browser UI must not know the backend base URL.
- Backend base URL is server-side/BFF only.
- Auth headers, cookies/session/refresh/token logic are server-side/BFF only.
- `src/app/api/**` is the accepted BFF route handler location.
- Local auth BFF is implemented under `src/app/api/auth/**`.
- Server-only auth backend, cookie, and error helpers are implemented under `src/app/api/_lib/**`.
- Auth browser helpers and TanStack Query session hooks are implemented under `src/features/auth/**`.
- Non-auth endpoint mapping is deferred.

## State Ownership

- TanStack Query owns server state.
- Zustand owns local UI/game/playback state.
- React Hook Form owns form draft state.
- Zod validates external or unstable boundaries.
- Big.js is for decimal-safe UI calculations only.
- Backend responses are authoritative for game result, wallet/balance, and game config.

## Expansion Limits

Do not create unapproved or premature BFF route handlers, DTOs, API clients, query hooks, API folders, backend fetch helpers, server auth helpers, auth/session expansion, or non-auth endpoint mapping.

The implemented auth slice does not authorize social OAuth, socket integration, game/wallet/profile/progression APIs, browser-readable auth cookies, localStorage token storage, or browser exposure of the backend base URL.
