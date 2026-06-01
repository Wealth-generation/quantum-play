# Game Frontend Architecture Rules

Concrete games belong under `src/games/<game>` when product implementation is approved.

Target per-game ownership:

```txt
ui        Game-specific React UI.
model     Local controls, playback state, selectors, view models, and local round lifecycle.
renderer  Visual playback, geometry, and animation boundary.
lib       Pure game-specific helpers and mappers.
config    Frontend-only visual/default constants.
```

## Rules

- Backend result is authoritative.
- Renderer never decides outcome.
- Renderer never calls API.
- Renderer visualizes an already received result.
- Game modules must not import from other game modules.
- Do not create a universal game engine upfront.
- Do not create a shared renderer upfront.
- Do not create a game factory upfront.
- Do not create ownership folders before a real approved file needs them.

Accepted future ownership concepts, not folders to create now:

- `features/place-bet`
- `entities/bet`
- `entities/game`
- `widgets/game-layout`
