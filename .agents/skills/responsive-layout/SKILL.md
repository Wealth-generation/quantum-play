---
name: responsive-layout
description: Use when creating or editing any section, page layout, container, or multi-breakpoint UI in this Next.js + Tailwind project. Triggers on section wrappers, typography sizing, responsive spacing, asset placement, decorative absolute positioning, z-index assignment, or Motion animations.
---

# Responsive Layout

## Overview

Mobile-first. Breakpoints: **375 → 768 → 1024 → 1440 → 1920px**.  
Max content width: **1175px**. Background sections stretch full-width, but their
**content** (banners, card rows, text — everything) is always capped at 1175px via
`max-w-[1175px] mx-auto`. No section content goes edge-to-edge on wide screens.

---

## Section Container Pattern

Every section follows this structure — no exceptions:

```tsx
<section className="w-full bg-[color]">
  <div className="max-w-[1175px] mx-auto px-[Figma value]">
    {/* content */}
  </div>
</section>
```

- Background color/image on `<section>` (full-width).
- Padding on inner `<div>` — **always read from Figma inspector** for each section individually. Do not invent padding values.
- `max-w-[1175px] mx-auto` is non-negotiable.

---

## Breakpoints

| Name | px  | Tailwind prefix |
|------|-----|-----------------|
| mobile | 375 | *(base)* |
| tablet | 768 | `md:` |
| laptop | 1024 | `lg:` |
| desktop | 1440 | `xl:` |
| wide | 1920 | `2xl:` |

Use responsive Tailwind classes for discrete jumps, `clamp()` for smooth scaling.

---

## Typography — always use clamp()

```tsx
// h1
className="text-[clamp(26px,3vw,48px)] font-black"

// h2
className="text-[clamp(24px,2.5vw,40px)] font-bold"

// h3
className="text-[clamp(18px,1.8vw,20px)] font-semibold"

// body
className="text-[clamp(14px,1.2vw,18px)]"

// labels / captions
className="text-[clamp(12px,1vw,16px)]"
```

❌ Never use fixed `text-xl`, `text-3xl`, etc. for headings and body across breakpoints — they don't scale smoothly.

---

## Asset Structure

```
src/shared/assets/
  [section_name]/
    icons/    ← SVG icons
    images/   ← WebP images
```

**Images** — always `next/image`, always include `sizes`:

```tsx
<Image
  src="/assets/[section]/images/name.webp"
  alt="descriptive alt or empty string for decorative"
  width={x}
  height={y}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Icons** — also via `next/image` from the section's `icons/` folder.  
One source file at maximum resolution; display size controlled by Tailwind classes only.

---

## Absolute Positioning

Only for **decorative elements** (blurs, glows, background patterns, decorative coins/chips).  
**Never** for content (text, buttons, cards, inputs).

```tsx
// ✅ decorative glow — percentage-based, not pixel
<div className="absolute left-[5%] bottom-0 z-10 ..." aria-hidden="true" />

// ❌ never
<div className="absolute left-[264px] top-[138px]" /> // pixel positions for layout
```

Use **percentages**, not pixels, for decorative positioning across breakpoints.

---

## Z-Index Scale

| Value | Use |
|-------|-----|
| `z-10` | decorative elements (blurs, glows, backgrounds) |
| `z-20` | sticky elements |
| `z-30` | dropdown, tooltip |
| `z-40` | drawer, sidebar |
| `z-50` | modal |
| `z-60` | toast, notification |
| `z-[100]` | critical overlays |

❌ Never use arbitrary z-index values outside this scale (e.g. `z-[999]`, `z-[3]`).

---

## Animations (Motion)

Always respect `prefers-reduced-motion`:

```tsx
import { useReducedMotion } from "motion/react";

const prefersReduced = useReducedMotion();
const animation = prefersReduced ? {} : { opacity: [0, 1], y: [20, 0] };
```

Apply to Motion components: `<motion.div animate={animation} />`.

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Fixed `px` for absolute decorative positions | Use `left-[5%]`, `bottom-0`, percentage-based |
| Hardcoded `text-3xl` for headings | Use `text-[clamp(26px,3vw,48px)]` |
| `max-w-[1175px]` on `<section>` instead of inner div | Background on section, constraint on inner div |
| Inventing padding values | Read from Figma inspector per section |
| Arbitrary z-index (`z-[15]`) | Use defined scale only |
| Animation without `prefers-reduced-motion` check | Always wrap with `useReducedMotion()` |
| Fixed-width art blocks that don't stretch | Use `right-0` + `left-0` / `w-full` instead of `w-[Xpx]` |
| Full-width banner/card content (no `max-w` cap) | Wrap content in `max-w-[1175px] mx-auto` even when the section background is full-width |

---

## Non-Goals

- No CSS modules or styled-components.
- No layout built around absolute-positioned content elements.
- No custom breakpoints outside the five defined above.
