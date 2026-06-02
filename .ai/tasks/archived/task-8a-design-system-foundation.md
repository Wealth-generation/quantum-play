# Task Artifact

## Task

- Title: Phase 2 Task 8a — Design System Foundation
- Status: Complete
- Mode: PR-mode
- Branch mode: PR-mode
- Base branch: develop
- Task branch: feat/design-system-foundation
- Current branch at task start: develop (clean, ahead of origin/develop by 1)
- Branch creation command/evidence: `git checkout develop && git pull --ff-only && git checkout -b feat/design-system-foundation` (user-confirmed); now on `feat/design-system-foundation`.

## Scope

- Goal: Establish the design-system foundation — §1 confirmed tokens as CSS vars wired through Tailwind v4 `@theme`, register Outfit as `--font-sans`, add `cn()`, and create the first shell/auth-demanded primitives (Button, Card/Surface, Radix wrappers: Dialog, Tabs, Popover, Collapsible) with CVA variants for Button and Card only.
- Non-goals: App Shell/widgets/lobby/auth-modal/page content (8b); Badge, Input, Checkbox, Tooltip, Avatar, Table (created in 8b when demanded); §1.2 domain/game colors in global tokens; Storybook, theme switcher, full inventory, Slider, Toast; dependency installs; BFF/API/route handlers; game modules; empty folders.
- Approved files: see Editable files.
- Forbidden scope: tailwind.config.js (Tailwind v4 is CSS-first); layout.tsx metadata changes; any file outside the editable list.
- Editable files:
  - src/app/globals.css
  - src/app/layout.tsx (Outfit registration via next/font/google ONLY)
  - src/shared/lib/cn.ts (new) + src/shared/lib/index.ts (new barrel)
  - src/shared/ui/primitives/** (new): Button, Card/Surface, Dialog, Tabs, Popover, Collapsible + barrel
- Context-only files: docs/design/design-source-audit.md, docs/architecture/foundation-decisions.md, .claude/rules/**, package.json, postcss.config.mjs, tsconfig.json, src/app/page.tsx

## Source Of Truth

- Files inspected: docs/design/design-source-audit.md (§1, §2, §5, §8a, §10), docs/architecture/foundation-decisions.md, .claude/rules/{design-system-foundation,project-structure,state-data-api-boundary,git-lifecycle,quality-gates,validation-workflow,index}.md, package.json, postcss.config.mjs, tsconfig.json, src/app/{globals.css,layout.tsx,page.tsx}
- Architecture decisions: Tailwind v4 CSS-first tokens via @theme; cn() = clsx + tailwind-merge; CVA for primitive variants; Radix wrapped through src/shared/ui/primitives; single dark theme first; shared primitives business-agnostic.
- Relevant rules/skills: design-system-foundation, project-structure (no empty folders), git-lifecycle (PR-mode), quality-gates (dependency, scope, architecture ownership), validation-workflow.

## Impact

- Docs impact: None beyond this artifact. design-source-audit.md + foundation-decisions.md already document the intended foundation; implementation follows them. Docs-not-needed rationale recorded.
- API boundary impact: None. Pure presentation layer; no /api/*, backend URL, auth/session/token logic.
- UI QA requirement: Limited/N/A for 8a — no rendered routes (page.tsx untouched), primitives not composed into a shell yet. Qualitative gate = `pnpm build` success. Full UI QA deferred to 8b.
- Stack primitive checklist:
  - Entrypoint thinness: layout.tsx stays thin (only font wiring added).
  - Orchestration: none (no widgets/pages this task).
  - Component split: primitives co-located under src/shared/ui/primitives, one folder per primitive.
  - Data/state/form ownership: N/A — presentational primitives only.
  - Project primitives: cn(), CVA, Radix wrappers per accepted foundation (no generic substitutes).

## Validation

- Validation plan: git diff --check; pnpm lint; pnpm build; manual scope check against editable list; manual docs-impact note.
- Commands run:
  - `git diff --check` → clean (exit 0).
  - `corepack pnpm exec eslint` → exit 0, no findings. (pnpm not on PATH; used corepack. node_modules was not present, so pnpm's deps-before-run check materialized it from the existing lockfile — package.json and pnpm-lock.yaml unchanged; no dependencies added.)
  - `corepack pnpm exec next build` → exit 0. Compiled OK, TypeScript OK, static pages generated (`/`, `/_not-found`). Confirms Outfit font fetch, `@theme` token compilation, and primitive type-safety.
- Scope check: final `git status` = M src/app/globals.css, M src/app/layout.tsx, ?? .ai/tasks/active/task-8a-design-system-foundation.md, ?? src/shared/. No out-of-scope files. pnpm injected an `allowBuilds` block into pnpm-workspace.yaml during install; reverted with `git checkout -- pnpm-workspace.yaml` to stay within scope.
- Known pre-existing (not from this task): Next.js workspace-root warning from a stray `C:\Users\Admin\package-lock.json`; `ERR_PNPM_IGNORED_BUILDS` for sharp/unrs-resolver (build-script approval, unrelated).
- Review evidence: Review skill ran; Result: Pass (no blocking findings). One non-blocking medium finding — Button `icon` variant was a byte-identical duplicate of `ghost` — approved and resolved before pre-commit. Outfit full-axis load: consciously accepted, recorded.
- Pre-commit evidence: Pre-commit skill ran; Result: Ready. All four checks green (git diff --check, pnpm lint exit 0, pnpm build exit 0 — Compiled + TypeScript OK, static pages generated). Scope exactly matched approved files; lockfile/pnpm-workspace.yaml clean.
- Commit: 5e347d7 feat(design-system): add token layer, cn(), and first primitives — merged to develop; develop in sync with origin/develop.
- Branch: feat/design-system-foundation merged and remote-deleted. Local branch still present (not yet deleted locally — see Risks).

## Risks And Handoff

- Risks: scope creep into 8b primitives/widgets; accidental domain-color promotion; Tailwind v4 @theme syntax correctness; Outfit weight set (300/400/500/600/700/900) load cost (full variable axis loaded — superset of needed weights; bundle/CLS revisit deferred, consciously accepted).
- Resolved (post-review): Button `icon` variant was a byte-identical duplicate of `ghost`. Removed the `icon` VARIANT; kept the `icon` SIZE. Icon buttons are now `<Button variant="..." size="icon">` (shadcn convention). No call sites existed (primitives not yet composed). Re-validated green.
- Handoff: Complete. Commit landed on develop; 8b (App Shell + main page scaffold) is the next task and may consume tokens + primitives from this task.
- Lifecycle close notes: Lifecycle-close explicitly requested. Archive pending user approval (skill step 4).
