# OandOcraft Overhaul Master Plan (Single Source of Truth)

Last updated: 2026-04-27
Owner mode: single-agent execution
Primary target: `https://oando.co.in/OandOcraft/`

## Why there were many plans

The repo accumulated multiple planning docs because requests were delivered incrementally (UI polish, security, seeding, integration, admin ops) and each thread produced a standalone plan. That made traceability worse.

From now on:
- This file is the only authoritative overhaul plan.
- `docs/OandOcraft_PHASE_CHECKLIST.md` remains the execution checklist.
- Other plan docs are supporting references, not independent roadmaps.

## Executive goals

1. Remove interaction friction: no broken selection, no accidental scrolling chrome, no hidden controls.
2. Give admin full operational authority: all canvas toolbars, arrangement tools, and reset controls.
3. Raise editor quality to SmartDraw/Tldraw-class usability while preserving your current data model.
4. Add precise numeric drafting and measurement entry everywhere it is expected.
5. Deliver reliable compass behavior and ship a 2.5D visualization mode.

## Current pain points (P0)

1. Top toolbar overflows and scrolls horizontally.
2. Admin role does not feel "all-powerful" in canvas operations.
3. Toolbar docking/toggling is not discoverable enough.
4. Measurement entry is not obvious/complete for all workflows.
5. Compass interaction is unreliable.
6. 2.5D mode is absent.

## Architecture direction

- Keep React + Zustand + Konva as the base for 2D editing (lowest regression risk).
- Improve panel/workspace behavior with stronger dock model and explicit toolbar controls.
- Add 2.5D as a separate render mode (do not replace 2D editor engine).
- Preserve Supabase schema and office payload compatibility.

## Delivery plan (phased)

### Phase 1 - P0 Interaction Stabilization (Week 1)

Scope:
- Fix non-selectable item flows in canvas event pipeline.
- Remove top-bar horizontal scrolling behavior and enforce responsive overflow menus.
- Ensure all critical controls have visible labels and keyboard discoverability.

Tasks:
1. Selection reliability
   - Verify click/tap/multi-select/marquee handlers across tools.
   - Remove overlay pointer-event interference.
2. Top bar overflow
   - Replace free horizontal scroll with deterministic breakpoints + "More" menu.
3. Discoverability
   - Add explicit `Toolbars` button and visible `Dock`, `Float`, `Reset` actions.

Acceptance criteria:
- Items are selectable in all supported editor states.
- No horizontal scrolling on top bar at supported breakpoints.
- Toolbar controls are visible without relying on icon-only literacy.

### Phase 2 - Admin Command Surface (Week 2)

Scope:
- Make admin the highest-authority operator for canvas operations.
- Enable all toolbars (including arrangement/alignment/distribution) for admin.
- Add top-toolbar global reset for workspace layout and canvas view.

Tasks:
1. Role capabilities
   - Admin can access all canvas toolbars and arrangement controls.
2. Global reset
   - Add `Reset workspace` in top bar:
     - reset floating/docked toolbar layout,
     - reset zoom/pan,
     - optionally clear transient overlays.
3. Admin HUD
   - Keep real-time metrics in a dockable admin panel with quick actions.

Acceptance criteria:
- Admin can enable/use every editing toolbar.
- One-click reset restores known-good workspace layout.
- Admin HUD shows live operational stats and recovery shortcuts.

### Phase 3 - SmartDraw/Tldraw Quality Pass (Week 3-4)

Scope:
- Upgrade visual language and tool ergonomics to professional drafting quality.

Tasks:
1. Visual system
   - Define sharp-corner token set and stroke hierarchy.
   - Improve contrast, label legibility, and hover/selection states.
2. Tooling
   - Introduce drawing presets inspired by SmartDraw/Tldraw patterns.
   - Improve quick actions and contextual affordances.
3. Color system
   - Add a structured palette (neutral drafting + semantic highlights) and style presets.

Acceptance criteria:
- Consistent premium look across top bar, sidebars, canvas controls, and properties.
- Faster first-use workflows with lower action count for core editing tasks.

### Phase 4 - Measurement & Numeric Precision (Week 4-5)

Scope:
- Add explicit measurement entry and precision controls wherever geometry is edited.

Tasks:
1. Numeric entry
   - Width/height/length/angle inputs for relevant shapes and walls.
   - Unit-aware input parsing and validation.
2. Dimension tooling
   - Add quick "enter exact value" interactions during draw/edit.
   - Improve scale calibration discoverability.
3. UX polish
   - Keep numeric edits in one predictable place (properties + inline affordance).

Acceptance criteria:
- Users can enter exact measurements without workaround dragging.
- Dimension labels and calibration are clear and reliable.

### Phase 5 - Compass Reliability (Week 5)

Scope:
- Rebuild compass interactions so orientation always reflects project state.

Tasks:
1. State coherence
   - Ensure north angle and visibility toggles are consistent across reloads/floor switches.
2. Interaction
   - Add robust drag/rotate handling and snap-to-angle options.
3. Regression tests
   - Add tests for compass render, interaction, and persistence.

Acceptance criteria:
- Compass responds consistently and persists expected orientation.
- No known regressions in pan/zoom or minimap interactions.

### Phase 6 - 2.5D Mode (Week 6-8)

Scope:
- Deliver a dedicated 2.5D visualization mode for presentation/review.

Tasks:
1. Rendering strategy
   - Implement separate 2.5D view layer (Three.js preview recommended) using existing floor data.
2. Geometry mapping
   - Convert walls/rooms/furniture to extruded preview meshes.
3. Controls
   - Add mode toggle, camera orbit presets, and lightweight material themes.
4. Performance + fallback
   - Keep 2D editor as source of truth; 2.5D degrades gracefully on low-performance devices.

Acceptance criteria:
- Users can toggle 2D <-> 2.5D without data loss.
- 2.5D is useful for communication and executive review, not just a visual gimmick.

## Dependencies and additions

Planned dependencies (subject to implementation decision review):
- `dockview-react` for stronger workspace docking model.
- `@floating-ui/react` for precise floating controls and collision handling.
- `three` for 2.5D render mode.

No schema-breaking backend dependency required for phases 1-5.

## Risk controls

1. Keep each phase behind feature flags where interaction plumbing changes deeply.
2. Add Playwright smoke flows for selection, toolbar reset, measurement entry, compass, and admin operations.
3. Ship in small increments with rollback checkpoints.

## Success metrics

1. Selection failure rate: 0 reproducible failures in smoke suite.
2. Top bar overflow: 0 horizontal-scroll occurrences at target breakpoints.
3. Admin productivity: all required canvas actions reachable in <=2 clicks.
4. Measurement workflows: exact numeric entry available for all core geometry.
5. Compass reliability: stable orientation + interaction across sessions.
6. 2.5D adoption: used in review/export workflows without blocking 2D editing.

## Immediate next execution order

1. Phase 1 (P0 stabilization).
2. Phase 2 (admin command surface + reset).
3. Phase 4 (measurement precision).
4. Phase 5 (compass).
5. Phase 3 (premium visual/system polish).
6. Phase 6 (2.5D mode).
