# Project Structure Rules

## Ownership

- `src/app`: thin Next.js routing/composition layer and future route handlers.
- `src/widgets`: large product/page composition blocks.
- `src/games`: concrete game vertical modules such as Plinko, Keno, Dice, and Roulette.
- `src/features`: reusable user actions and use-cases.
- `src/entities`: domain nouns.
- `src/shared`: design primitives, generic libraries, config, and assets.
- `docs`: architecture, workflow, and decision documentation.
- `.claude`: AI rules, skills, prompts, templates, and hook policy.
- `.ai/tasks`: neutral AI task lifecycle records only.

## Folder Creation

Ownership concepts are not permission to create empty folders.

Create target folders only when:

- part of the approved AI infrastructure baseline;
- a first real file is approved;
- a later implementation task explicitly approves the folder.

Do not create empty `src/widgets`, `src/games`, `src/features`, `src/entities`, or `src/shared` folders just to match planned architecture.
