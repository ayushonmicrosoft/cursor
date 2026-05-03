# OandOcraft Master Plan

_Last updated: 2026-05-03_

This is the canonical planning hub for OandOcraft. It defines the documentation mini site, the execution model, and the five sub-plans that split the work into focused, non-overlapping tracks.

## Why this exists

The old planning set was too scattered and too shallow to serve as a serious product reference. This plan replaces that approach with a coherent planning system that can support real implementation, real operations, and real release work.

## What the docs mini site must do

The docs site must answer the following without requiring source-code archaeology:

- what the product does
- what the app stack is
- how the app is structured
- how the team works
- how the live system is deployed and recovered
- how UI errors should be presented
- how block sources are selected and governed

## Canonical Doc Set

### Core navigation
- `INDEX.md`
- `MASTER_PLAN.md`
- `CHECKLIST.md`
- `WALKTHROUGH.md`

### Five sub-plans
1. `STACK_AND_SURFACES.md`
2. `WORKFLOW_AND_OPERATIONS.md`
3. `INTEGRATION_AND_DEPLOYMENT.md`
4. `UI_SYSTEM_AND_FEEDBACK.md`
5. `BLOCK_LIBRARY_STRATEGY.md`

### Expanded reference plans
- `UI_ERROR_DISPLAY_CONVENTIONS.md`
- `BLOCK_LIBRARY_SOURCES.md`

### HTML mirrors
- `assets/PROJECT_MAP.html`
- `assets/PLAYBOOK_ATLAS.html`

## Master Objectives

1. Create a docs mini site that feels like a real product reference rather than a note dump.
2. Make the site usable as the first stop for a contributor, operator, or reviewer.
3. Consolidate the old plan fragments into one master plan plus five focused sub-plans.
4. Keep the checklist and walkthrough separate from the narrative docs.
5. Expand the two special-topic docs into durable references that can be maintained over time.
6. Keep the HTML mirrors and markdown docs in sync.
7. Remove stale references to the old plan system.

## Product reference chapters

### 1. Functions
Explain the product as a planning and operations platform. The docs should make the app's capabilities obvious: editing, roster management, reports, exports, team navigation, and operational safeguards.

### 2. Stack
Explain the runtime stack, the canvas engine, state management, persistence model, route structure, and build/test toolchain.

### 3. Workflow
Explain how work moves from problem definition to implementation, review, validation, release, and rollback readiness.

### 4. Current operations
Explain deployment rules, environment boundaries, auth redirects, smoke checks, recovery, and support posture.

### 5. Integration / deployment
Explain how the app is hosted under `/OandOcraft/`, how client routes behave, and how host responsibilities are constrained.

### 6. Planning system
Explain the new plan architecture, the purpose of each file, and how the docs should remain coherent over time.

## Execution model

1. Reconfirm repo truth before making structural changes.
2. Keep the docs folder canonical and remove duplicate or stale references.
3. Refactor plan content into the master plan plus five sub-plans.
4. Keep the checklist and walkthrough separate from the narrative docs.
5. Expand the two special-topic plans into dedicated reference docs and HTML views.
6. Validate all references and update any stale links.
7. Begin implementation work only after the docs are coherent.

## Acceptance criteria

- The docs mini site reads like a single coherent source of truth.
- Each sub-plan has a distinct scope and enough detail to be useful.
- The checklist and walkthrough are clearly separate from the master narrative.
- The special-topic docs fully explain their domains instead of lightly naming them.
- The HTML mirrors open directly and point to the current docs.
- The docs landing page gives a clear reading path.

## Guardrails

- Do not reintroduce old scattered plan files as canonical sources.
- Do not merge UI conventions into the integration plan.
- Do not mix implementation tasks into the docs mini site narrative.
- Do not let the HTML mirrors drift from the markdown docs.
- Do not keep stale doc names around just because they are familiar.
