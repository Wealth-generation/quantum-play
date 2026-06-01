# Task Lifecycle

`.ai/tasks/**` stores neutral AI task evidence. It is not product source and not an automation layer.

## Active Tasks

Create one artifact under `.ai/tasks/active/` for an AI-assisted implementation task when edits are planned and scope needs evidence.

Update the artifact as work progresses:

- goal and non-goals;
- branch mode;
- approved scope;
- editable files;
- context-only files;
- source-of-truth files inspected;
- docs, API boundary, and UI QA impact;
- commands run;
- review and pre-commit evidence;
- risks and handoff notes.

## Archived Tasks

Move an active artifact to `.ai/tasks/archived/` only when lifecycle-close is explicitly requested and closure evidence is complete.

Archival must preserve the record. Do not delete task evidence.

## Evidence Required

Implementation tasks should record:

- source-of-truth files inspected;
- approved editable scope;
- branch mode;
- validation plan and results;
- documentation impact;
- API boundary impact;
- UI QA requirement and evidence when relevant;
- review findings or not-applicable rationale;
- pre-commit readiness result.

## Baseline Note

This baseline creates only `.ai/tasks/TEMPLATE.md` and `.gitkeep` placeholders. It does not create a task-specific active artifact.
