# Task Lifecycle

`.ai/tasks/**` stores neutral AI task evidence. It is not product source and not an automation layer.

## Active Tasks

Create one artifact under `.ai/tasks/active/` when the selected task lane requires one or when scope needs evidence.

Artifact requirement by lane:

- Micro task: not required unless the task is docs/API/workflow/security-sensitive.
- Small task: optional when scope, approval, or validation evidence needs a durable handoff.
- Normal task: required.
- Architecture-sensitive task: required.
- Tooling/workflow task: required.

Update the artifact as work progresses:

- task lane;
- goal and non-goals;
- branch mode;
- base branch;
- task branch;
- current branch at task start;
- branch creation command/evidence;
- approved scope;
- editable files;
- context-only files;
- source-of-truth files inspected;
- docs, API boundary, and UI QA impact;
- commands run;
- review and pre-commit evidence;
- risks and handoff notes.

Long-running active artifacts must keep a short current-state summary near the top. When old phase history makes the artifact hard to scan, compact it into a concise historical summary while preserving decisions, approvals, validation evidence, unresolved risks, and handoff notes. Do not delete evidence needed for review or lifecycle close.

## Archived Tasks

Move an active artifact to `.ai/tasks/archived/` only when lifecycle-close is explicitly requested and closure evidence is complete.

Archival must preserve the record. Do not delete task evidence.

The same task should not remain as live stale copies in both active and archived locations. Archived artifacts should not keep `Status: active`. Moving, deleting, or correcting lifecycle artifact placement still requires explicit lifecycle approval.

## Evidence Required

Normal, architecture-sensitive, and tooling/workflow implementation tasks should record:

- source-of-truth files inspected;
- approved editable scope;
- task lane;
- branch mode;
- base branch;
- task branch;
- current branch at task start;
- branch creation command/evidence;
- validation plan and results;
- documentation impact;
- API boundary impact;
- UI QA requirement and evidence when relevant;
- review findings or not-applicable rationale;
- pre-commit readiness result.

## Baseline Note

This baseline creates only `.ai/tasks/TEMPLATE.md` and `.gitkeep` placeholders. It does not create a task-specific active artifact.
