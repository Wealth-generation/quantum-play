---
name: ui-markup
description: Use when creating or editing any JSX/TSX component, widget, layout, or primitive in this project. Triggers on files in src/widgets, src/features, src/entities, src/shared/ui, or src/games that contain JSX.
---

# UI Markup

## Overview

Accepted foundation: **Tailwind CSS + CSS variables + cn() + CVA + Radix wrappers + Motion + single dark theme.**  
No light/dark switcher. No Storybook. No new global theme tokens without explicit approval.

---

## Ownership — Where Does This Component Belong?

| Component type | Location |
|----------------|----------|
| Business-agnostic primitive (button, input, dialog) | `src/shared/ui/primitives/` |
| Generic icon | `src/shared/ui/icons/` |
| Large page/layout block | `src/widgets/<name>/` |
| Reusable user action | `src/features/<name>/` |
| Domain noun UI | `src/entities/<name>/` |
| Game-specific UI | `src/games/<game>/ui/` |
| Game animation / canvas / physics | `src/games/<game>/renderer/` |

**Shared primitives must be business-agnostic.** If it knows about "bet", "wallet", "game round" — it does not belong in `src/shared`.

---

## Existing Primitives — Use Before Creating

Check `src/shared/ui/primitives/` first:

| Primitive | Variants / notes |
|-----------|-----------------|
| `Button` | `variant`: primary, secondary, ghost · `size`: sm, md, icon · supports `asChild` |
| `Input` | text input wrapper |
| `Checkbox` | Radix-based |
| `Dialog` | DialogContent, DialogTitle, DialogDescription, DialogClose |
| `Tabs` | TabsList, TabsTrigger, TabsContent |
| `Popover` | PopoverTrigger, PopoverContent |
| `Collapsible` | CollapsibleTrigger, CollapsibleContent |
| `Card` | surface card wrapper |

**Do not re-implement these.** Import from `@/shared/ui/primitives/<name>`.

---

## Styling Rules

### Tailwind only
No `styled-components`, no CSS modules, no `style={{}}` for tokenised values.

### CSS variable tokens — use project tokens, not raw Tailwind colors

| Purpose | Token class |
|---------|-------------|
| Main text | `text-text` |
| Muted / secondary text | `text-text-muted` |
| Text on primary button | `text-on-primary` |
| Page background | `bg-bg` |
| Surface (card, dialog) | `bg-surface` |
| Elevated surface | `bg-surface-3` |
| Default border | `border-border` |
| Stronger border | `border-border-2` |
| Primary gradient from | `from-primary-tint` / `from-primary` |
| Primary gradient to | `to-primary` / `to-primary-hover` / `to-primary-press` |
| Focus glow shadow | `shadow-glow` |
| Button shadow | `shadow-btn` |
| Overlay shadow | `shadow-overlay` |

❌ `text-white`, `bg-gray-900`, `bg-zinc-800`, `border-gray-700` — never hardcode Tailwind color palette directly.

### cn()
Always import from `@/shared/lib`:
```ts
import { cn } from "@/shared/lib";
```
Use for conditional or merged class names. Never call `clsx` or `twMerge` directly.

### CVA
Use for primitives with multiple visual states (variants, sizes):
```ts
const variants = cva("base-classes", {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { ... },
});
```
Extend `VariantProps<typeof variants>` in the component props interface.

### inline style — exception only
`style={{}}` is allowed **only** for non-token decorative values that intentionally do not belong in `@theme` (e.g. one-off glow color, Figma pixel offsets).  
**Mandatory comment when used:**
```tsx
style={{
  // Not a token — one-off decorative value scoped here only.
  filter: "blur(157.78px)",
}}
```
If the value is used in more than one place → add it as a CSS variable token instead.

---

## Motion

Use `motion` (from the `motion` package) for:
- UI transitions and reveals
- Tab / panel animations
- Feedback and interaction states
- Lightweight entrance/exit animations

**Never** put game playback or physics animation in a widget or shared component.  
Game renderer animation belongs exclusively in `src/games/<game>/renderer/`.

---

## State in UI Components

| State type | Tool |
|------------|------|
| Server / async data | TanStack Query (`useQuery`, `useMutation`) |
| Local UI / game / playback state | Zustand store |
| Form draft | React Hook Form |
| External boundary validation | Zod |
| Decimal credit values in display | `Big.js` — never `Number()`, `parseFloat()`, or `toFixed()` directly |

---

## Common Mistakes

| Mistake | Correct approach |
|---------|-----------------|
| `text-white` / `bg-black` / `bg-zinc-900` | Use `text-text` / `bg-bg` / `bg-surface` tokens |
| `import { cn } from "clsx"` | `import { cn } from "@/shared/lib"` |
| Custom Dialog built from `<div>` | Wrap `@/shared/ui/primitives/dialog` |
| `useState` for API response data | `useQuery` from TanStack Query |
| Component with variants, no CVA | Define `cva()` variants |
| Business label in `src/shared/ui/` | Move to `src/widgets/` or `src/entities/` |
| Animation logic in `src/widgets/` | If game animation → `src/games/<game>/renderer/` |
| `Number(credits)` / `parseFloat(credits)` | `new Big(credits)` |
| `style={{color: "..."}}` for a reused value | Define CSS variable token in `globals.css` |
| Creating empty ownership folders | Create folder only when a real approved file needs it |

---

## Non-Goals

- No Storybook or component inventory.
- No theme switcher — dark theme only.
- No universal game engine or shared renderer.
- No new `@theme` tokens without explicit approval.
