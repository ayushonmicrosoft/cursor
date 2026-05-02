# Phase 2 — Generated catalog, workflow validation, and internal deployment

_Last updated: 2026-05-02_

## Goal
Build the first usable generated catalog, validate real workflows, and deploy internally before any external rollout.

## Outcome
Internal operators can use the product on real work, exposing workflow gaps and catalog issues before external release.

## Dependencies
- Phase 1 complete
- Stable object schema decisions
- Archive boundaries set
- Route truth stable
- Agent workflow active

## Owner type
Product, design, frontend, content/system owner, and reviewer.

## Exit gate
Internal users can run the product on real work with minimal hand-holding.

## Focus areas
- Catalog definition and object taxonomy
- Generated asset preparation
- Editor workflow validation
- Internal deployment design and execution

## 1. Catalog definition and object taxonomy
- [ ] Define the initial object families that the catalog must support.
- [ ] Separate core objects from temporary placeholders.
- [ ] Define which objects must exist on day one for a usable workspace.
- [ ] Define naming rules for generated assets so future additions stay coherent.
- [ ] Define dimension, category, and display-rule requirements.
- [ ] Define what metadata every catalog object must carry.
- [ ] Define which objects can later become photo-backed without changing the schema.
- [ ] Define which objects are intentionally temporary and why.

## 2. Generated asset preparation
- [ ] Produce the initial generated 2D assets needed for the first usable catalog.
- [ ] Define how 2.5D assets are derived from the same object metadata.
- [ ] Decide which elements are visual tokens versus semantic objects.
- [ ] Validate that generated assets do not depend on hardcoded per-shape logic.
- [ ] Ensure the generated set covers common layouts, common furniture, and common annotations.
- [ ] Ensure the generated set is sufficient for a real internal workflow, not just a demo.

## 3. Editor workflow validation
- [ ] Validate object placement, drag, drop, snap, align, resize, select, and inspect.
- [ ] Validate duplication, deletion, multi-select, and group operations if supported.
- [ ] Validate undo, redo, autosave, and conflict recovery.
- [ ] Validate search, filter, and library browsing inside the catalog.
- [ ] Validate that selection and state feedback are obvious.
- [ ] Validate that keyboard workflows remain usable for power users.
- [ ] Capture where the editor is slow, confusing, or brittle.

## 4. Internal deployment design
- [ ] Decide which internal user groups receive the first deployment.
- [ ] Define the internal deployment environment and its expectations.
- [ ] Define what production-like behavior must be preserved.
- [ ] Define what telemetry or feedback should be collected.
- [ ] Define how internal users will report workflow failures.
- [ ] Define what counts as a blocker versus a cosmetic issue.

## 5. Internal deployment execution
- [ ] Deploy the generated catalog to internal users only.
- [ ] Verify routes, permissions, and access boundaries in the deployment.
- [ ] Observe real usage patterns.
- [ ] Record where users hesitate, make mistakes, or need help.
- [ ] Record which objects or workflows are missing from the catalog.
- [ ] Keep the environment close to production behavior.

## 6. Validation and acceptance criteria
- [ ] The first generated catalog is usable in real workflows.
- [ ] The internal deployment exposes the real interaction gaps.
- [ ] Users can perform daily tasks without hand-holding.
- [ ] The catalog model is stable enough to continue growing.
- [ ] The data model can later support photo-backed and 3D phases.
- [ ] The plan can describe what the next rollout needs to fix.

## 7. Risks
- [ ] The catalog is too small to expose real workflow problems.
- [ ] Generated assets are too generic to test meaningful usage.
- [ ] The internal deployment still feels like a demo.
- [ ] The object model is too unstable to carry into later phases.
- [ ] Workflow validation is delayed because the catalog is overdesigned.
