# OandOcraft Overhaul Master Plan

Last updated: 2026-04-27
Primary target: `https://oando.co.in/OandOcraft/`
Planning mode: single source of truth

## 1. Non-negotiable outcomes

This overhaul is complete only when all of these are true:

1. No top-bar horizontal overflow/scroll in supported breakpoints.
2. Selection is reliable for click, tap, shift-select, marquee, and drag workflows.
3. Admin can access all canvas tooling, arrangement controls, and a top-level reset.
4. Exact measurement entry exists for walls and shapes (width/height/length/angle).
5. Compass works reliably across reload, floor switch, and interaction states.
6. 2.5D mode exists and can be toggled without impacting 2D editing stability.
7. Visual quality is SmartDraw-grade: sharp, professional, consistent.

## 2. Scope boundaries

In scope:
- Editor UX/UI overhaul.
- Toolbar architecture, admin command surface, precision drafting UX.
- Compass and minimap correctness.
- 2.5D view mode.

Out of scope for this cycle:
- Full backend schema rewrite.
- Multi-tenant enterprise workflows beyond current single-workspace model.
- Breaking payload compatibility.

## 3. Engine options (exactly 3)

### Engine Option 1 - Konva Continuity (2D overhaul on existing engine)

What this means:
- Keep `react-konva` as the authoritative 2D editing engine.
- Rework interaction logic, paneling, toolbar discoverability, and shape quality.

Dependencies:
- `dockview-react` (recommended for professional docking behavior)
- `@floating-ui/react` (recommended for stable floating controls)

Pros:
- Lowest risk to current production behavior.
- Fastest way to fix P0 problems.
- No payload migration required.

Cons:
- Some premium UX behavior must be custom-built.

Timeline:
- 6-8 weeks.

Risk:
- Low to medium.

### Engine Option 2 - Hybrid: Konva for edit + Three.js for 2.5D

What this means:
- Keep Konva for 2D editing.
- Add a separate 2.5D renderer for presentation/review.

Dependencies:
- `three`
- optional `@react-three/fiber`

Pros:
- Delivers 2.5D without destabilizing core editing.
- Clean separation between editing and visualization concerns.

Cons:
- Two render pipelines to maintain.
- Requires geometry mapping between 2D model and 2.5D scene.

Timeline:
- 8-10 weeks.

Risk:
- Medium.

### Engine Option 3 - tldraw Replatform for core 2D interaction

What this means:
- Replace Konva interaction/editing layer with tldraw.
- Build adapters for existing element model, permissions, and persistence.

Dependencies:
- `tldraw`
- adapter/migration layer for current office payloads

Pros:
- Strong editor ergonomics out of the box.
- Modern collaborative-style interaction primitives.

Cons:
- Highest migration risk.
- Broad regression surface across existing map semantics.
- Larger rewrite before visible user gains.

Timeline:
- 12-16 weeks + stabilization.

Risk:
- High.

## 4. Decision matrix

| Criterion | Option 1 | Option 2 | Option 3 |
|---|---:|---:|---:|
| Speed to fix current pain | 5 | 4 | 2 |
| Regression risk | 4 | 3 | 1 |
| 2.5D capability | 2 | 5 | 4 |
| Long-term flexibility | 3 | 4 | 5 |
| Implementation effort | 4 | 3 | 1 |

Scoring scale: 1 (worst) to 5 (best)

## 5. Recommended path

Recommended now:
1. Start with **Option 1** for immediate stabilization and premium UX uplift.
2. Add **Option 2** in the next stage for 2.5D mode.
3. Keep **Option 3** as a deferred strategic branch, not the current delivery path.

This gives fastest recovery and lowest operational risk.

## 6. Full phase plan

### Phase 0 - Baseline and instrumentation (Week 0)

Deliverables:
- Capture current issues with reproducible steps (selection, overflow, compass).
- Add telemetry hooks for selection failures and toolbar state errors.

Acceptance:
- Known issue list and baseline metrics recorded.

### Phase 1 - P0 interaction stabilization (Week 1)

Deliverables:
- Fix non-selectable-item event path.
- Remove top-bar overflow scroll behavior.
- Add explicit toolbar toggle and visible dock/float/reset labels.

Acceptance:
- 0 reproducible selection failures in smoke tests.
- 0 top-bar horizontal scroll in target breakpoints.

### Phase 2 - Admin command surface (Week 2)

Deliverables:
- Admin access to all canvas toolbars and arrangement controls.
- Top-level `Reset workspace` (layout reset + zoom/pan reset).
- Dockable admin HUD with real-time stats and quick recovery actions.

Acceptance:
- Admin can complete full layout operations without hidden controls.

### Phase 3 - Toolbar/workspace architecture (Week 3)

Deliverables:
- Consistent docking model across all toolbars.
- Saved workspace presets (Design, Admin, Review).

Acceptance:
- Toolbar behavior is predictable and recoverable.

### Phase 4 - Precision drafting and measurement entry (Week 4)

Deliverables:
- Numeric fields for width/height/length/angle.
- Inline exact-value entry during draw/edit.
- Unit-safe parsing and validation.

Acceptance:
- Operators can produce exact geometry without drag approximation.

### Phase 5 - Visual/shape overhaul (Week 5)

Deliverables:
- SmartDraw-grade visual system (sharp corners, coherent stroke hierarchy).
- Manufacturer-referenced block families in one normalized symbol style.

Acceptance:
- Mixed-layout canvas looks professional and consistent.

### Phase 6 - Compass and navigation correctness (Week 6)

Deliverables:
- Compass state persistence and reliable interaction behavior.
- Minimap/compass interaction regression coverage.

Acceptance:
- Compass is stable across route/floor/session transitions.

### Phase 7 - 2.5D mode (Week 7-8, Option 2 track)

Deliverables:
- 2D <-> 2.5D toggle.
- Extruded geometry for walls/rooms/furniture.
- Camera presets for review mode.

Acceptance:
- 2.5D is usable for review without breaking 2D edit flow.

### Phase 8 - Hardening and release (Week 9)

Deliverables:
- Full regression pass.
- Performance checks on representative large plans.
- Release and rollback checklist complete.

Acceptance:
- Release gate passed with no P0/P1 issues open.

## 7. Integrated block-library strategy

Priority order:
1. MillerKnoll
2. Steelcase
3. BIMobject for gaps only

Core family sequence:
1. Workstations and benching
2. Private offices and executive desks
3. Meeting and boardroom tables
4. Phone booths and focus pods
5. Lounge and reception families
6. Storage/credenzas/lockers/printer bays

Conversion rules:
- Use manufacturer assets as dimensional references, not raw pasted imports.
- Normalize into one SVG/Konva top-view symbol language.
- Preserve realistic proportions for circulation and density planning.
- Optimize legibility at common planner zoom ranges.

## 8. Technical validation gates

Required checks before phase close:
- `npm run lint`
- `npm run test`
- `npm run build`
- Visual QA pass for edited routes/components

## 9. Change-control rule

- No new standalone planning docs for this overhaul.
- All roadmap changes must be made in this file.
- `docs/plans/OandOcraft_PHASE_CHECKLIST.md` is only a task board, not a second plan.
