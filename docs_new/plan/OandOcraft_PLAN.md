# OandOcraft Canonical Plan

_Last updated: 2026-05-01_

## Scope and Canonical Rule
- This folder (`docs_new/plan`) is the only canonical location for plan docs.
- Maximum canonical set is intentionally small and currently contains:
  - `OandOcraft_PLAN.md`
  - `OandOcraft_PLAN.html`

## Repo Truth Snapshot

### Routing and surfaces (`src/App.tsx`)
- Public:
  - `/`
  - `/login`
  - `/signup`
  - `/forgot`
  - `/auth/verify`
  - `/auth/reset`
  - `/help`
  - `/docs`
- Auth-only:
  - `/onboarding/team`
  - `/account`
- Auth + team:
  - `/dashboard` (redirect flow)
  - `/t/:teamSlug`
  - `/t/:teamSlug/settings`
- Office shell:
  - `/t/:teamSlug/o/:officeSlug` -> redirects to `engine`
  - `/t/:teamSlug/o/:officeSlug/engine`
  - `/t/:teamSlug/o/:officeSlug/map`
  - `/t/:teamSlug/o/:officeSlug/pixi`
  - `/t/:teamSlug/o/:officeSlug/roster`
  - `/t/:teamSlug/o/:officeSlug/reports`
  - `/t/:teamSlug/o/:officeSlug/reports/scenarios`
  - `/t/:teamSlug/o/:officeSlug/org-chart`

### Engine model (current)
- Engine selection is route-level, not a single toggle state:
  - `engine` route uses `EngineChooserPage`.
  - `map` route is the production editor surface.
  - `pixi` route is an isolated experimental rendering surface (`PixiPreviewPage`).
- Inside `map`, `viewMode` controls `2d` vs `2.5d` presentation only.
- Do not document Pixi as a `viewMode` value.

### Save and sync contract (`src/lib/offices/useOfficeSync.ts`, `officeRepository.ts`)
- Debounced autosave runs at 2000 ms.
- Save uses optimistic locking:
  - `saveOffice(id, payload, loadedVersion)` updates with `updated_at` predicate.
  - Conflict result sets `projectStore.conflict` and opens conflict resolution UX.
- Conflict overwrite path:
  - `saveOfficeForce(id, payload)` via RPC (`save_office_force`).
- Retry backoff for transient errors:
  - 2s, 5s, 15s, 30s.
- Persisted payload fields:
  - `version`, `elements`, `employees`, `departmentColors`, `floors`, `activeFloorId`, `settings`, `seatHistory`, `neighborhoods`, `annotations`.

### Guards and access model
- Route guards:
  - `RequireAuth`: redirects unauthenticated users to login with `next` query.
  - `RequireTeam`: redirects authenticated users with zero teams to `/onboarding/team`.
- Action guards:
  - `useCan(action)` resolves against `impersonatedRole ?? currentOfficeRole` and `lib/permissions.ts` matrix.
  - Supported canonical actions include `editMap`, `editRoster`, `viewReports`, `viewPII`, `manageWorkspace`, `viewSeatHistory`, `viewAuditLog`.
- Current office role loading truth:
  - `ProjectShell` currently seeds `currentOfficeRole: 'edit'` after office load.
  - `currentUserOfficeRole()` returns `'edit'` for team members in the simplified model.

## Delivery Workflow
1. Reconfirm route, engine, sync, and guard truth from source files before planning changes.
2. Design each change against concrete files and unchanged contracts.
3. Implement minimal deltas and preserve route-level engine separation.
4. Verify with `npm run lint`, `npm run test`, `npm run build`.
5. Keep this canonical doc and HTML in sync; remove stale split docs.

## Planning Constraints
- Do not plan around legacy invite/share paths unless reintroduced in `App.tsx`.
- Do not collapse Pixi into map `viewMode` semantics.
- Keep save payload compatibility unless migration is explicitly scoped.
- Keep permission checks explicit through `useCan` and store role state.
