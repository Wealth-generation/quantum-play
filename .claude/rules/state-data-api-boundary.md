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
- `src/app/api/**` is the accepted future BFF route handler location.
- Endpoint mapping is deferred.

## State Ownership

- TanStack Query owns server state.
- Zustand owns local UI/game/playback state.
- React Hook Form owns form draft state.
- Zod validates external or unstable boundaries.
- Big.js is for decimal-safe UI calculations only.
- Backend responses are authoritative for game result, wallet/balance, and game config.

## Not Created Yet

Do not create BFF route handlers, DTOs, API clients, query hooks, API folders, backend fetch helpers, or server auth helpers in this baseline.
