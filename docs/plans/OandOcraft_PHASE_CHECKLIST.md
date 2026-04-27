# OandOcraft Phase Checklist

Last updated: 2026-04-27
Checklist role: execution tracker only (the roadmap lives in `OandOcraft_OVERHAUL_MASTER_PLAN.md`).

Execution status snapshot:
- Current engine path: Option 2 (Hybrid Konva + Three.js).
- Active delivery window: Phase 0, Phase 1, and Phase 2.

## Engine decision checkpoint (must be explicit)

- [ ] Choose one engine path for this cycle:
  - [ ] Option 1: Konva Continuity
  - [x] Option 2: Hybrid Konva + Three.js
  - [ ] Option 3: tldraw Replatform
- [x] Record decision owner and date in commit notes.

## Phase 0 - Baseline

- [x] Capture reproducible bugs for selection, overflow, compass.
- [x] Record baseline screenshots and behavior notes.

## Phase 1 - P0 interaction stabilization

- [x] Fix non-selectable item paths.
- [x] Remove top bar horizontal overflow/scroll.
- [x] Add explicit toolbar visibility and dock/float/reset labels.
- [x] Add/refresh interaction smoke tests.

## Phase 2 - Admin command surface

- [x] Enable all toolbars and arrangement controls for admin.
- [x] Add top-toolbar `Reset workspace` (layout + zoom/pan reset).
- [x] Deliver dockable admin HUD with real-time stats and quick actions.

## Phase 3 - Toolbar/workspace architecture

- [ ] Standardize docking behavior across all toolbars.
- [ ] Add workspace presets (Design/Admin/Review).
- [ ] Validate persistence and reset behavior.

## Phase 4 - Precision drafting and measurement entry

- [ ] Add exact numeric inputs for width/height/length/angle.
- [ ] Add inline exact-value entry during draw/edit.
- [ ] Add unit parsing and validation safeguards.

## Phase 5 - Visual and shape overhaul

- [ ] Apply sharp, professional visual token system.
- [ ] Replace weak generic symbols with normalized block families.
- [ ] Pass readability QA at common zoom levels.

## Phase 6 - Compass and navigation reliability

- [ ] Fix compass persistence and interaction behavior.
- [ ] Add regression coverage for compass + minimap interactions.

## Phase 7 - 2.5D mode

- [ ] Deliver 2D <-> 2.5D toggle.
- [ ] Add extruded geometry mapping for core floor entities.
- [ ] Add camera presets and performance fallback behavior.

## Phase 8 - Hardening and release

- [ ] Run `npm run lint`.
- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Complete release + rollback runbook checks.

## Archive policy

- Completed/legacy checklists go to `docs/archive/completed-plans/`.
- Legacy superpowers docs stay in `docs/archive/superpowers/`.
