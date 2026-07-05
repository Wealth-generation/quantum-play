# Git Lifecycle Rules

- Do not stage unless explicitly requested.
- Do not commit unless explicitly requested.
- Do not push unless explicitly requested.
- Do not create PRs unless explicitly requested.
- Do not merge unless explicitly requested.
- Do not delete branches unless explicitly requested.
- Do not archive lifecycle artifacts unless explicitly requested.

Implementation tasks default to PR-mode. At implementation start, inspect current branch/status, confirm the base branch, usually `develop`, and propose a task branch name.

Task branch creation is a user-confirmed setup action, not permission for uncontrolled git lifecycle work. After explicit user confirmation in Codex/Claude, an agent may create and switch to the task branch with commands such as:

```txt
git checkout develop
git pull
git checkout -b <type>/<short-task-name>
```

The active task artifact must record branch mode, base branch, task branch, current branch at task start, and branch creation command/evidence.

Pre-commit reports readiness only.

Lifecycle-close runs only after an explicit request and completion evidence.

Implementation tasks must record branch mode: PR-mode, local/no-PR, or an explicit not-applicable rationale.
