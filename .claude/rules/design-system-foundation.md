# Design System Foundation Rules

Accepted foundation:

```txt
Tailwind CSS + CSS variables + cn() + CVA + Radix wrappers + Motion + single dark theme first
```

## Rules

- Tailwind CSS is the styling foundation.
- CSS variables define stable design tokens.
- `cn()` means `clsx` plus `tailwind-merge`.
- CVA owns reusable primitive variants.
- Radix wrappers belong through future shared primitives.
- Motion is for UI transitions, reveal, feedback, tabs, and lightweight interaction animation.
- Game renderer animation belongs in `src/games/<game>/renderer`, not global UI utilities.
- Start with one dark theme.
- Shared primitives must be business-agnostic.
- Product UI belongs in widgets, entities, features, or games.

## Non-Goals

Do not implement components in this baseline.

Do not add Storybook, a full component inventory, or a theme switcher yet.
