# OandOcraft (Floorcraft) — Repository Deep-Read

## 1. Identity & Live URL

| Field | Value |
|---|---|
| Package name | `oandocraft` |
| Repo root | `c:\Floorcraft\Floorcraft\` |
| Live URL | https://floorcraft.space |
| Version | `0.0.0` (pre-1.0) |
| License | MIT |

---

## 2. What the App Does

**OandOcraft** is a browser-based **office floor planner and seating management tool** for IT/workplace teams.

Core user capabilities:
- Draw multi-floor plans (walls with optional arc/curve segments, doors, windows) on a Konva canvas
- Place 20+ element types: desks, workstations, private offices, conference rooms, phone booths, common areas, tables, decor, etc.
- Drag employees from a People panel onto seats; atomically updates both element and employee state
- Full employee CRUD with CSV import/export (two-pass manager-name resolver)
- AI-style **insights engine** (6 pluggable analyzers) that continuously flags utilization gaps, team proximity issues, onboarding readiness, pending moves, equipment mismatches
- **Reports panel**: Seat Map Color Mode, Org Chart Overlay, Move Planner, Employee Directory
- Export to PNG / PDF (jsPDF) / JSON
- Undo/redo (50-step, Zustand + zundo temporal middleware)
- Team workspaces, per-user RBAC roles (owner/editor/hr editor/space planner/viewer), invite emails via Resend
- Conflict-safe cloud sync (optimistic locking on `updated_at`), ConflictModal for concurrent-write resolution
- Share links (read-only, token-validated), presentation mode, keyboard shortcuts overlay

---

## 3. Tech Stack

### Runtime
| Library | Version | Role |
|---|---|---|
| React | 19.2 | UI framework |
| react-dom | 19.2 | DOM renderer |
| react-router-dom | 7.14 | Client routing |
| konva | 10.2 | 2D canvas engine |
| react-konva | 19.2 | React bindings for Konva |
| zustand | 5.0 | Client state (22 stores) |
| zundo | 2.3 | Temporal undo/redo middleware |
| @supabase/supabase-js | 2.104 | Auth + database |
| tailwindcss | 4.2 | CSS (Vite plugin, no config file) |
| @radix-ui/* | various | Accessible UI primitives (dialog, dropdown, context-menu, popover, tabs, tooltip) |
| @tanstack/react-virtual | 3.13 | Virtualized roster lists |
| jspdf | 4.2 | PDF export |
| papaparse | 5.5 | CSV parse/generate |
| nanoid | 5.1 | ID generation |
| lucide-react | 1.8 | Icons |
| three | 0.184 | 3D view (2.5D mode — wired but not yet default) |

### Build & DX
| Tool | Version | Role |
|---|---|---|
| vite | 8.0 | Dev server + bundler (Rolldown) |
| typescript | 6.0 | Type safety |
| vitest | 4.1 | Unit & component tests |
| @testing-library/react | 16.3 | React test utilities |
| eslint | 9.39 | Linting |
| playwright | 1.59 | E2E (dev dependency, not yet configured) |
| supabase CLI | 2.95 | Migrations, Edge Functions |

**Vite vendor chunking:** `vendor-konva`, `vendor-supabase`, `vendor-state`, `vendor-icons`, `vendor-react` — intentional cache-stable splits so the landing page doesn't ship Konva.

---

## 4. Directory Structure

```
c:\Floorcraft\Floorcraft\
├── src/
│   ├── App.tsx                  # Root — BrowserRouter + AuthProvider + ThemeProvider + lazy routes
│   ├── main.tsx                 # Vite entry
│   ├── index.css                # Tailwind v4 base
│   ├── components/
│   │   ├── auth/                # Login, Signup, ForgotPassword, AuthVerify, AuthReset, RequireAuth, RequireTeam
│   │   ├── admin/               # AuditLogPage
│   │   ├── common/
│   │   ├── dashboard/           # Legacy NewProjectModal
│   │   ├── editor/
│   │   │   ├── Canvas/          # CanvasStage + all renderers (43 files incl. shapes/, primitives/)
│   │   │   ├── LeftSidebar/     # Tool selector + element library
│   │   │   ├── RightSidebar/    # Properties, People, Reports, Insights panels
│   │   │   ├── Share/           # Visibility + access table sub-components
│   │   │   ├── CommandPalette/  # Command palette (cross-office search, recent items)
│   │   │   ├── TopBar/          # Top toolbar
│   │   │   ├── reports/         # ScenariosPage + per-type report views
│   │   │   ├── roster/          # Roster sub-components
│   │   │   ├── view3d/          # Three.js 2.5D view
│   │   │   └── *.tsx            # ProjectShell, MapView, RosterPage (136KB!), ShareModal,
│   │   │                        #   TopBar, FloorSwitcher, Minimap, ConflictModal,
│   │   │                        #   ExportDialog, KeyboardShortcutsOverlay, StatusBar, etc.
│   │   ├── help/                # HelpPage
│   │   ├── landing/             # LandingPage
│   │   ├── reports/             # ReportsPage, FloorComparePage, OccupancyDashboard, etc.
│   │   ├── shared/              # SharedProjectView (public share token path)
│   │   ├── team/                # TeamHomePage, TeamSettings, TeamOnboarding, AccountPage, InvitePage
│   │   └── ui/                  # UI primitives (RouteLoadingFallback, etc.)
│   ├── stores/                  # 22 Zustand stores
│   ├── hooks/                   # 20 custom hooks
│   ├── lib/                     # 70+ utility modules + 9 subdirs
│   ├── types/                   # 16 TypeScript definition files
│   └── data/templates/          # Built-in floor plan templates (blank, open-plan, mixed, executive)
├── supabase/
│   ├── migrations/              # 12 SQL migration files
│   ├── functions/               # Edge Functions (send-invite-email via Resend)
│   ├── seed.sql                 # Full demo workspace (350KB)
│   └── config.toml
├── docs/guide/                  # Admin, security, release, recovery runbooks
├── scripts/                     # audit-pages.cjs, create_release_manifest.cjs, etc.
├── vite.config.ts
├── package.json
├── netlify.toml
└── CHANGELOG.md
```

---

## 5. Routing (React Router v7)

All editor chunks are `React.lazy()` — landing page ships minimum JS.

```
/                         LandingPage (public)
/login                    LoginPage
/signup                   SignupPage
/forgot                   ForgotPasswordPage
/auth/verify              AuthVerifyPage
/auth/reset               AuthResetPage
/invite/:token            InvitePage
/shared/:projectId/:token SharedProjectView (read-only, no auth)
/share/:officeSlug        ShareView (D6 share links)
/help                     HelpPage (public)
/onboarding/team          TeamOnboardingPage (RequireAuth)
/account                  AccountPage (RequireAuth)
/dashboard                DashboardRedirect (RequireAuth + RequireTeam)
/t/:teamSlug              TeamHomePage
/t/:teamSlug/settings     TeamSettingsPage
  index                     → TeamSettingsGeneral
  members                   → TeamSettingsMembers
/t/:teamSlug/o/:officeSlug  ProjectShell (layout route)
  index → map               MapView (Konva canvas)
  roster                    RosterPage
  audit                     AuditLogPage
  reports                   ReportsPage
  reports/scenarios         ScenariosPage
  reports/floor-compare     FloorComparePage
  org-chart                 OrgChartPage
  reservations              ReservationsPage
/project/*                → /dashboard (legacy redirect)
*                         NotFoundPage
```

---

## 6. State Management (Zustand — 22 stores)

| Store | File | Purpose |
|---|---|---|
| `useElementsStore` | elementsStore.ts | Canvas elements keyed by ID; **wrapped in `zundo` temporal** (50-step undo); assignment fields stripped in `partialize` |
| `useCanvasStore` | canvasStore.ts (11KB) | Viewport x/y, scale, active tool, grid settings |
| `useFloorStore` | floorStore.ts | Floor list, active floor, per-floor element snapshots |
| `useProjectStore` | projectStore.ts | Project metadata, save state, Supabase office ID, optimistic-lock version, conflict payload |
| `useEmployeeStore` | employeeStore.ts | Roster, department color palette, search/filter/sort UI state |
| `useInsightsStore` | insightsStore.ts | Insight results, dismissal set (localStorage per project), filter state |
| `useUIStore` | uiStore.ts (22KB) | Selection, hover, modals, sidebars, presentation mode, minimap, alignment guides, dockable toolbar layouts (persisted localStorage), workspace presets (Design/Admin/Review), modal ref count, assignment queue |

| `useAnnotationsStore` | annotationsStore.ts | Canvas annotation pins |
| `useNeighborhoodStore` | neighborhoodStore.ts | Named zones/neighborhoods |
| `useReservationsStore` | reservationsStore.ts | Hot-desk reservations |
| `useRoomBookingsStore` | roomBookingsStore.ts | Conference room bookings |
| `useScenariosStore` | scenariosStore.ts | What-if seating scenarios |
| `useSeatSwapsStore` | seatSwapsStore.ts | Pending seat swap requests |
| `useSeatHistoryStore` | seatHistoryStore.ts | Seat assignment audit trail |
| `useShareLinksStore` | shareLinksStore.ts | Per-office share tokens |
| `useLayerVisibilityStore` | layerVisibilityStore.ts | Per-category layer show/hide |
| `useOverlaysStore` | overlaysStore.ts | Active overlay modes |
| `useCalibrateScaleStore` | calibrateScaleStore.ts | Real-world scale calibration |
| `useCanvasFinderStore` | canvasFinderStore.ts | "Find on map" search state |
| `useCursorStore` | cursorStore.ts | Cursor telemetry |
| `useSeatDragStore` | seatDragStore.ts | Drag-in-progress seat state |
| `useToastStore` | toastStore.ts | Toast notification queue |

**Key design:** `useElementsStore` uses `zundo`'s `temporal` middleware. The `partialize` function strips assignment fields (`assignedEmployeeId`, `assignedEmployeeIds`, seat `assignedGuestId`) from undo snapshots so spatial undo doesn't desync element ↔ employee state.

---

## 7. Canvas Layer (Konva)

**CanvasStage.tsx (63KB)** is the heart of the editor. Key renderers:

| Component | Renders |
|---|---|
| `WallRenderer` | Polyline walls with optional per-segment arc bulges |
| `DoorRenderer` | Wall-attached doors with swing arc |
| `WindowRenderer` | Wall-attached windows |
| `DeskRenderer` (33KB) | Desks, L-desks, cubicles, hot desks |
| `WorkstationRenderer` | Multi-position bench desks |
| `RoomRenderer` | Conference rooms, phone booths, common areas, private offices |
| `TableRenderer` | Rect/conference/round/oval tables with seat positions |
| `FurnitureRenderer` | Counter, chair, divider, planter, text-label, background-image |
| `SofaRenderer` | Sofa |
| `PlantRenderer` | Plant |
| `PrinterRenderer` | Printer |
| `WhiteboardRenderer` | Whiteboard |
| `ElementRenderer` (18KB) | Dispatcher — routes each `CanvasElement` to the right renderer |
| `SelectionOverlay` | Multi-select bounding box with resize handles |
| `AlignmentGuides` | Live magenta snap lines during drag |
| `GridLayer` | Background dot/line grid |
| `WallDrawingOverlay` | Captures pointer events during wall draw sessions |
| `WallEditOverlay` | Node-drag for wall editing |
| `NeighborhoodLayer` / `NeighborhoodOverlay` | Colored zone fills |
| `AnnotationLayer` / `AnnotationPinRenderer` | Annotation pin markers |
| `EquipmentOverlayLayer` | Equipment needs overlay |
| `MarqueeOverlay` | Rubber-band selection rectangle |
| `MeasureOverlay` | Distance measurement tool |
| `Minimap` (13KB) | Always-on mini-map |
| `SeatLabel` (28KB) | Seat label rendering (name, dept color, status badge) |

Custom shapes (L-desk, cubicle, U-office, round/oval tables, all decor) are in `src/components/editor/Canvas/shapes/` as programmatic Konva path functions.

---

## 8. Element Type System

**`src/types/elements.ts`** defines a discriminated union `CanvasElement` with 30+ concrete types:

- **Wall types:** `wall` (with `bulges[]`, `wallType`: solid/glass/half-height/demountable, optional `dashStyle`)
- **Attachments:** `door`, `window` (snap to parent wall)
- **Assignable seats:** `desk`, `hot-desk` (shape: straight/l-shape/cubicle), `workstation` (sparse positional `assignedEmployeeIds[]`), `private-office` (shape: rectangular/u-shape)
- **Rooms:** `conference-room`, `phone-booth`, `common-area`
- **Tables:** `table-rect`, `table-conference`, `table-round`, `table-oval` (with `SeatPosition[]`)
- **Furniture catalog:** `sofa`, `plant`, `printer`, `whiteboard`, `decor` (armchair/couch/reception/kitchen-counter/fridge/whiteboard/column/stairs/elevator)
- **Drawing primitives:** `rect-shape`, `ellipse`, `line-shape`, `arrow`, `free-text`
- **Special:** `background-image`, `custom-svg`, `text-label`, `divider`, `planter`, `counter`, `chair`

Type guards (`isWallElement`, `isDeskElement`, `isAssignableElement`, etc.) are co-located in the types file.

---

## 9. Data Persistence (Supabase)

### Schema (12 migration files)
| Migration | Content |
|---|---|
| 0001_schema.sql | Tables: `offices`, `profiles`, `team_members`, `invites`, `office_permissions` |
| 0002_rls_helpers.sql | RLS helper functions |
| 0003_rls_policies.sql | Row-level security policies |
| 0004_triggers.sql | Auto-create profile on signup |
| 0005_accept_invite_rpc.sql | `accept_invite` RPC |
| 0006_p0_security_fixes.sql | Security hardening |
| 0007_created_by_defaults.sql | Default `created_by` column |
| 0008_launch_readiness.sql | Launch-readiness fixes (13KB) |
| 0009_create_team_rpc.sql | `create_team` RPC |
| 0010_rbac_and_audit.sql | RBAC + audit log table |
| 0011_invite_preview_and_share_tokens.sql | `share_tokens` table + invite preview |
| 0012_internal_admin_office_control.sql | Admin impersonation / office control |

### Repositories (`src/lib/offices/`)
- **`officeRepository.ts`** — CRUD for `offices` (load, save, create, delete)
- **`permissionsRepository.ts`** — Per-user role overrides
- **`useOfficeSync.ts` (12KB)** — Debounced 2-second autosave with optimistic-lock (`WHERE updated_at = ?`); exponential backoff retries (up to 30 s); ConflictModal trigger on stale write
- **`loadFromLegacyPayload.ts` (22KB)** — Migration layer for all schema versions (migrates elements, employees, floors from older payloads)
- **Persistence modules:** `reservationsPersistence`, `roomBookingsPersistence`, `seatHistoryPersistence`

### Edge Functions
- `supabase/functions/send-invite-email/` — Sends team invite emails via [Resend](https://resend.com)

---

## 10. Insights Engine (`src/lib/analyzers/`)

12 modules, run on every canvas + roster change:

| Analyzer | Purpose |
|---|---|
| `utilization.ts` | Over/under-occupied zones |
| `proximity.ts` | Scattered team members |
| `onboarding.ts` | New-hire seat readiness |
| `moves.ts` | Pending relocation flags |
| `equipment.ts` | Unresolved equipment needs |
| `trends.ts` | Occupancy pattern trends |
| `accommodationAnalyzer.ts` | Accommodation/accessibility needs |
| `adjacency.ts` | Team adjacency analysis |
| `neighborhoodUtilization.ts` | Per-neighborhood utilization |
| `neighborhoods.ts` | Neighborhood-level insights |
| `seatChurn.ts` | Seat reassignment frequency |
| `index.ts` | Composite runner — severity ranking (critical/warning/info), filterable, per-project dismissal in localStorage |

---

## 11. Hooks (`src/hooks/` — 20 hooks)

| Hook | Purpose |
|---|---|
| `useActiveFloorElements` | Derived selector: elements on active floor |
| `useKeyboardShortcuts` (17KB) | Global keyboard shortcut registration |
| `useTemporalState` | Exposes zundo undo/redo from elementsStore |
| `useWallDrawing` (13KB) | State machine for interactive wall drawing |
| `useCanvasFinder` (9.8KB) | "Find on map" search logic |
| `useElementSpawnAnimation` (9.4KB) | Spawn/appear animations for new elements |
| `useAllOfficesIndex` | Cross-office search index |
| `useCan` | Permission capability check |
| `useCanEdit` | Edit permission guard |
| `useDropdownMenu` | Accessible dropdown state |
| `useEffectiveDateTick` | Clock tick for date-dependent logic |
| `useCustomShapes` | Custom SVG shape registry |
| `useLibraryCollapse` / `useLibraryFavorites` / `useRecentLibraryItems` | Element library UX state |
| `useFirstUseTooltip` | First-use tooltip display |
| `usePresentationShortcuts` | Presentation mode keyboard shortcuts |
| `useUndoDataLossToast` | Warns user when undo would lose assignments |
| `useVisibleEmployees` | Filtered employee list for current view |

---

## 12. Employee System (`src/types/employee.ts`, `src/stores/employeeStore.ts`, `src/lib/employeeCsv.ts`)

Employee fields include: name, email, department, team, title, manager (org-chart), employment type, status, office days, start/end dates, equipment needs, photo URL, tags, accommodations, lifecycle metadata.

- **CSV export:** manager exported by name (portable); re-import does two-pass resolver to match names back to IDs
- **Redaction:** `src/lib/redactEmployee.ts` — PII redaction for viewer-role users
- **Manager chain:** `src/lib/managerChain.ts` — traverses org hierarchy
- **Bulk edit:** `src/lib/bulkEditEmployees.ts` — batch field mutations
- **Seat history:** `src/lib/seatAssignment.ts` (25KB) — atomic mutations; `seatHistoryPersistence.ts` — persists to Supabase

---

## 13. Export Features

| Export | Module |
|---|---|
| PNG | `src/lib/pngExport.ts` (11KB) — Konva stage capture |
| PDF | `src/lib/pdfExport.ts` (7KB) — jsPDF, A4/A3/Letter, portrait/landscape, 150/300 DPI |
| JSON | `src/lib/exportJson.ts` — full project payload backup |
| Chrome (headless) | `src/lib/exportChrome.ts` (6.8KB) — screenshot via browser API |
| CSV | `src/lib/employeeCsv.ts` (27KB) — roster round-trip |

---

## 14. Testing

**237 test files** in `src/__tests__/` using Vitest + @testing-library/react + jsdom.

Coverage is remarkably comprehensive — tests exist for:
- Every analyzer (unit tests in `analyzers/` subdir)
- Every store
- Every major component (auth flows, roster, canvas interactions, minimap, command palette, export flows, CSV import/export, seat assignment, wall drawing/editing, drag-and-drop, keyboard shortcuts, RBAC/permissions, sharing, reports, floor compare, scenarios, reservations, room bookings, seat history, neighborhoods, annotations, etc.)
- Migration/legacy payload round-trips
- Interaction telemetry

---

## 15. Build & Deployment

### Scripts
| Script | Command |
|---|---|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `build:oando` | `tsc -b && vite build --base=/OandOcraft/` |
| `preview` | `vite preview` |
| `lint` | `eslint .` |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `audit:pages` | `node scripts/audit-pages.cjs` |
| `release:manifest` | SHA-256 checksum manifest |
| `seed:counts` | Row counts for public tables |
| `seed:verify` | Validate seed SQL has actual floor objects |

### Deployment Targets
- **Netlify** (`netlify.toml`) — primary hosting, Node 20
- **Main-site subpath** (`/OandOcraft/`) — via `build:oando`, served from `oando.co.in`
- **Edge Functions** — deployed to Supabase (`send-invite-email`)

### Env Variables
| Variable | Where |
|---|---|
| `VITE_SUPABASE_URL` | Browser bundle |
| `VITE_SUPABASE_ANON_KEY` | Browser bundle |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions only |
| `RESEND_API_KEY` | Edge Functions only |
| `APP_URL` | Edge Functions only |

---

## 16. Noteworthy Patterns & Conventions

1. **Optimistic locking** — `saveOffice()` uses `WHERE updated_at = ?`; null result → ConflictModal (Reload vs. Overwrite)
2. **Temporal undo** — zundo `partialize` deliberately strips assignment fields to prevent desync
3. **Modal ref count** — `uiStore.modalOpenCount` prevents Escape from leaking into global shortcuts when a modal is open
4. **`globalThis` store singleton** — `useUIStore` is stashed on `Symbol.for('floocraft.ui-store')` to survive Vitest's `vi.resetModules()` in test files
5. **Wall attachment math** — `src/lib/wallAttachment.ts` + `wallPath.ts` (9KB arc bulge math)
6. **Legacy migration** — `loadFromLegacyPayload.ts` (22KB) handles all historical schema versions transparently
7. **Drawing primitive tools** — Feature A: rect-shape, ellipse, line-shape, arrow, free-text
8. **Custom SVG upload** — Feature F: sanitized SVG stored inline (capped at 50KB)
9. **2.5D view** — Three.js rendering is wired (`three` in deps, `view3d/` directory) but not the default view mode
10. **Seat assignment queue** — `uiStore.assignmentQueue` allows multi-seat click-to-assign from the roster
11. **Interaction telemetry** — `src/lib/interactionTelemetry.ts` records selection failures and toolbar layout anomalies
12. **Dockable toolbars** — 3 toolbars (canvas-actions, align-distribute, admin-stats) with docked/floating modes, persisted positions, workspace presets (Design/Admin/Review)
13. **Command palette** — Cross-office search, recent items, all actions; `commandPaletteRecents.ts` (6KB)

---

## 17. Files of Particular Size / Complexity

| File | Size | Note |
|---|---|---|
| `RosterPage.tsx` | 136KB | Largest file in the codebase — full roster with CRUD, filters, bulk-edit, CSV, drawer |
| `TopBar.tsx` | 42KB | Editor top toolbar with all actions |
| `RosterDetailDrawer.tsx` | 43KB | Employee detail drawer |
| `CanvasStage.tsx` | 63KB | Core Konva stage |
| `employeeCsv.ts` | 27KB | CSV round-trip |
| `seatAssignment.ts` | 25KB | Atomic assignment mutations |
| `SeatLabel.tsx` | 28KB | Seat label rendering |
| `ElementHoverCard.tsx` | 25KB | Hover card for elements |
| `AnnotationPopover.tsx` | 22KB | Annotation UI |
| `ShareModal.tsx` | 23KB | Share / permissions modal |
| `CommandPalette.tsx` | 24KB | Command palette |
| `FloorSwitcher.tsx` | 22KB | Floor management UI |
| `uiStore.ts` | 22KB | UI Zustand store |
| `loadFromLegacyPayload.ts` | 22KB | Migration layer |
| `useOfficeSync.ts` | 12KB | Autosave + conflict resolution |
| `planHealth.ts` | 15KB | Plan health score computation |
| `pngExport.ts` | 11KB | PNG export |
| `useKeyboardShortcuts.ts` | 17KB | Keyboard shortcut registration |
| `seed.sql` | 350KB | Full demo workspace seed |

---

## 18. Open Items Visible from Codebase


- `three` package in deps + `view3d/` directory — 2.5D view exists but **not the default** (`viewMode: '2d'` in uiStore)
- `playwright` in devDependencies — E2E testing infra added but **no test files visible in scripts/**
- `555/` directory at repo root — purpose unclear (appears empty or temp)
