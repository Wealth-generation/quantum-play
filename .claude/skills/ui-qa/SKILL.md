# UI QA Skill

## Purpose

Collect qualitative/manual evidence for visible UI changes.

## When To Use

Use when changes affect visible UI, layout, navigation, responsive behavior, animation, high-frequency interactions, or user-facing states.

## Inputs To Inspect

- Changed UI files.
- Affected routes or screens.
- Design system and project-structure rules.
- Active task artifact when required.

## Procedure

1. Identify affected routes/screens.
2. Check relevant desktop and mobile viewports.
3. Check interactions, loading/empty/error/disabled states when applicable.
4. Check text fit, overlap, navigation, focus, and visual regressions.
5. Record blockers, gaps, residual risk, and evidence.

## Stop Conditions

- Affected route cannot be reached.
- Required UI state cannot be exercised.
- Visual blocker remains.

## Required Output Format

```txt
UI QA:
  Required: yes/no
  Routes/screens:
  Viewports:
  Interactions/states:
  Findings:
  Blockers/gaps:
  Residual risk:
```

## What Not To Do

Do not require Playwright, hard render counts, profiler automation, or browser automation in this baseline.
