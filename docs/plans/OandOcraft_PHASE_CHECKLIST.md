# OandOcraft Phase Checklist

Last updated: 2026-04-27
Checklist role: execution tracker only (the roadmap lives in `OandOcraft_OVERHAUL_MASTER_PLAN.md`).

Execution status snapshot:
- Current engine path: Option 2 (Hybrid Konva + Three.js).
- Active delivery window: Phase 5 readability QA and Phase 8 release runbook checks.
- UI/UX plan reconciliation: Phases 1-4, 7, 9, and 10 are complete in `OANDOCraft_UI_UX_EXECUTION_PLAN.md`.

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

- [x] Standardize docking behavior across all toolbars.
- [x] Add workspace presets (Design/Admin/Review).
- [x] Validate persistence and reset behavior.

## Phase 4 - Precision drafting and measurement entry

- [x] Add exact numeric inputs for width/height/length/angle.
- [x] Add inline exact-value entry during draw/edit.
- [x] Add unit parsing and validation safeguards.

## Phase 5 - Visual and shape overhaul

- [x] Apply sharp, professional visual token system.
- [x] Replace weak generic symbols with normalized block families.
- [ ] Pass readability QA at common zoom levels.

## Phase 6 - Compass and navigation reliability

- [x] Fix compass persistence and interaction behavior.
- [x] Add regression coverage for compass + minimap interactions.

## Phase 7 - 2.5D mode

- [x] Deliver 2D <-> 2.5D toggle.
- [x] Add extruded geometry mapping for core floor entities.
- [x] Add camera presets and performance fallback behavior.

## Phase 8 - Hardening and release

- [x] Run `npm run lint`.
- [x] Run `npm run test`.
- [x] Run `npm run build`.
- [ ] Complete release + rollback runbook checks.

## UI/UX phase reconciliation

- [x] Phase 1 - Landing Page And Demo Entry.
- [x] Phase 2 - Loading And First Impressions.
- [x] Phase 3 - Dashboard And Sample Office.
- [x] Phase 4 - Editor First-Load UX.
- [x] Phase 7 - Top Bar And Navigation.
- [x] Phase 9 - Right Sidebar And Properties.
- [x] Phase 10 - Visual System.
- [ ] Keep phases 5, 6, 8, and 11-20 open until their remaining checklist items are complete.

## Archive policy

- Completed/legacy checklists go to `docs/archive/completed-plans/`.
- Legacy superpowers docs stay in `docs/archive/superpowers/`.
