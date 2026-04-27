# Phase 0 Interaction Baseline (Selection, Top Bar, Compass)

## Purpose
Establish a reproducible baseline for three editor interaction issues and define the acceptance checks that gate Phase 0 stabilization.

## Environment Baseline
- App: `Floorcraft` editor (`npm run dev`)
- Browser: latest Chrome (desktop)
- Viewport presets:
  - `1280x800` for standard editing
  - `1024x640` for constrained top-bar behavior
- Data setup:
  - Any office with at least one floor and mixed canvas elements (desk/room/wall)
  - At least two zoom levels tested (`50%` and `125%`)

## Issue 1: Selection Failures
### Repro Steps
1. Open an office in edit mode and ensure at least one selectable element is visible.
2. Click an element to select it, then delete that element.
3. Trigger another selection action immediately (click nearby element, shift-select, or marquee drag).
4. Repeat while rapidly zooming/panning between attempts.

### Expected
- Selection state always resolves to existing elements only.
- Selection updates are deterministic after deletes and rapid interactions.
- No stale/non-existent ids remain in selection state.

### Observed Baseline
- Intermittent attempts to select ids no longer present in the current element map.
- Follow-up actions can appear ignored until another click resets selection state.

### Target Acceptance Checks
- Any selection request containing missing ids emits `selection.failure` telemetry.
- Valid selections (all ids present) do not emit failure telemetry.
- Selection remains usable after delete + immediate reselection workflows.

## Issue 2: Top-Bar Overflow
### Repro Steps
1. Open editor at `1024x640`.
2. Enable controls that expand top-bar width (export/share/view options).
3. Resize viewport narrower in steps (for example, down to `900px` then `820px`).
4. Toggle dock/floating states for available toolbars and reload the page.

### Expected
- Toolbar layout data is valid and stable across reloads.
- Layout persistence never stores invalid coordinates/modes that force controls off-screen.
- Overflow conditions are detectable through local diagnostics.

### Observed Baseline
- Layout state can become invalid or extreme after rapid repositioning/resizing.
- Persisted malformed layout values can surface as practical overflow/off-screen controls.

### Target Acceptance Checks
- Invalid toolbar layout writes/reads emit `toolbar.layout.anomaly` telemetry.
- Invalid coordinates are sanitized to safe defaults.
- Layout persistence remains functional after anomaly handling.

## Issue 3: Compass Reliability
### Repro Steps
1. Open a floor with visible compass/north indicator.
2. Rotate map orientation controls and switch between floors.
3. Zoom in/out and pan to map edges.
4. Reload and re-open the same office/floor.

### Expected
- Compass orientation remains consistent for the same floor state.
- Compass rendering does not drift or disappear after navigation changes.

### Observed Baseline
- Compass behavior is not consistently reliable across floor switches + navigation changes.
- Reliability requires explicit regression coverage in follow-up phases.

### Target Acceptance Checks
- Orientation remains stable after floor changes, zoom/pan, and reload cycles.
- Compass regression tests cover floor transitions and orientation persistence.

## Phase 0 Deliverable Checkpoint
- Baseline issues documented with deterministic repro steps.
- Local (non-network) telemetry captures:
  - `selection.failure`
  - `toolbar.layout.anomaly`
- Telemetry helper has automated unit coverage.
