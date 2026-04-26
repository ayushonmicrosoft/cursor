# OandOcraft Enterprise Overhaul Master Plan

Audit date: 2026-04-26
Reference repo: https://github.com/rcasto123/Floorcraft

## 1. Executive Mandate

OandOcraft should become a production-grade workplace planning platform, not a renamed floor-plan demo. The standard is an enterprise-ready product that can support O&O-branded deployment, secure multi-tenant workspaces, high-fidelity floor planning, role-based operations, operational reporting, integrations with a non-Vite main site, and a maintainable engineering system.

The overhaul must cover six layers at once:

- Product: clear workflows for planners, admins, facilities, IT, HR, and read-only stakeholders.
- Brand: O&O visual language, copy, naming, exports, emails, and documents.
- Platform: robust React/Konva editor, scalable state, Supabase data model, CI, observability, and deployment.
- Security: RLS, auth, invitations, share links, audit logs, data export/deletion, headers, and incident process.
- Integration: safe deployment into a non-Vite main-site environment without breaking routing, CSS, auth, or performance.
- Operations: seed data, release process, support playbooks, monitoring, rollback, and ownership.

## 2. Current-State Audit

### 2.1 What Works

- React 19 + TypeScript + React Router app with route-level lazy loading.
- Konva canvas supports multi-floor editing, walls, curved walls, doors, windows, desks, rooms, furniture, annotations, neighborhoods, minimap, presentation mode, exports, and keyboard shortcuts.
- Supabase backend includes Auth, RLS, teams, offices, invites, permissions, share tokens, audit events, account export/deletion, and save conflict history.
- Existing hosted/demo data flow works with a full demo payload in `supabase/seed.sql`.
- Build passes.
- Test suite is substantial: 234 files and 1,539 tests passed in the latest local run.
- Page audit script now exists as `npm run audit:pages`.
- The GitHub README and changelog establish a v1.0.0 feature baseline.

### 2.2 What Is Not Yet World-Class

- Brand transition is incomplete across code, docs, emails, exports, seed data, titles, tests, and help content.
- Public pricing references still exist in help/docs surfaces and should be removed or reframed if OandOcraft is internal/enterprise.
- Large files reduce maintainability and review quality:
  - `RosterPage.tsx`
  - `HelpPage.tsx`
  - `CanvasStage.tsx`
  - `PropertiesPanel.tsx`
  - `ElementLibrary.tsx`
  - `RosterDetailDrawer.tsx`
- The production build still reports a large `ProjectShell` chunk.
- App is Vite-first while the main site is not Vite-based.
- Global Tailwind utilities and app CSS can collide if embedded in another shell.
- Supabase payloads are mostly JSONB for office state; this is fast for product iteration but needs scaling budgets and history strategy.
- Observability is minimal: no structured client error reporting, performance tracking, save-failure dashboards, or Supabase health reporting.
- No formal release checklist, staging promotion policy, rollback drill, or incident process beyond basic SECURITY.md.
- Accessibility needs a full product audit, especially dense canvas/editor workflows.

### 2.3 Upstream Change Context To Track

The upstream commit `8b7d3d078632bd16a76c34190a518426fbd8e907` should be treated as a specific planning input, not background noise. The linked diffs introduce a Properties panel expansion and test coverage workstream that belongs in the OandOcraft overhaul.

Reference:

- https://github.com/rcasto123/Floorcraft/commit/8b7d3d078632bd16a76c34190a518426fbd8e907

Planning implications:

- Preserve the intent of the Properties panel overhaul: clearer sectioning, type-specific controls, multi-select behavior, actions, and lock-state affordances.
- Verify whether the local branch already contains the commit's functional changes before re-implementing anything.
- Treat Properties panel coverage as a regression suite requirement for every element type.
- Fold the same structure into the design-system effort so the panel does not stay as a one-off editor surface.
- Add route and component tests for key editing affordances, not just render presence.

## 3. Target Product Vision

OandOcraft should be the O&O workplace planning command center.

Core promise:

- Plan floor layouts visually.
- Assign people, teams, rooms, assets, and neighborhoods accurately.
- Forecast occupancy and capacity.
- Share trusted views with stakeholders.
- Preserve governance, auditability, and data privacy.
- Integrate cleanly with the main O&O digital environment.

Primary users:

- Workplace/facilities planner: creates layouts and manages space capacity.
- IT operations: tracks desks, equipment needs, onboarding readiness, and moves.
- HR/people operations: reviews department placement, employee lifecycle, accessibility accommodations, and reporting.
- Team leads: validate neighborhoods and seating plans.
- Executives: consume summary reports and presentation views.
- External/anonymous stakeholders: receive controlled read-only share links when approved.

## 4. Product Pillars

### 4.1 Planning Canvas

- Multi-floor editing with clear floor hierarchy.
- Wall, door, window, room, desk, workstation, booth, table, decor, and custom-shape support.
- Accurate snapping, alignment, measurement calibration, and scale controls.
- Layer toggles for seats, labels, departments, neighborhoods, equipment, reservations, and annotations.
- Performance budget for large offices and many floors.
- Export-ready rendering for PNG/PDF/report snapshots.

### 4.2 People And Seats

- Employee roster management with department, title, manager, status, office days, equipment, accommodations, and lifecycle fields.
- Bulk import/export with validation, duplicate detection, and review steps.
- Seat assignment rules that prevent employee/element desync.
- Saved roster views and filters.
- Move planning, reservations, hot desks, and seat history.

### 4.3 Governance And Sharing

- Team workspaces.
- Office-level roles: owner, editor, viewer.
- Private/public office visibility.
- Invite flows with preview, expiry, role assignment, rate limiting, and audit logging.
- Share tokens with explicit expiry/revocation and user-visible risk language.
- Audit log UI for critical changes.

### 4.4 Insights And Reports

- Occupancy and utilization reports.
- Department and neighborhood summaries.
- Move and churn reporting.
- Equipment readiness reporting.
- Onboarding seat readiness.
- Executive summary report exports.
- Trend and capacity forecasting.

### 4.5 Enterprise Operations

- Staging and production Supabase projects.
- Deterministic seeding.
- Backup and rollback playbooks.
- Structured release notes.
- Error and performance monitoring.
- Access review process.

## 5. Brand And Design System

### 5.1 Naming Standard

Canonical visible product name: `OandOcraft`.

Rules:

- Use `OandOcraft` in visible UI, emails, exports, browser titles, docs, README, changelog, support copy, and seed/demo author names.
- Use `oandocraft` for package names, internal npm-safe IDs, and lowercase identifiers where appropriate.
- Keep legacy `floocraft.*` localStorage keys unless a migration is intentionally implemented. Renaming storage keys without migration can break existing user preferences and migrated autosave payloads.
- Preserve historical GitHub URLs that still point to `rcasto123/Floorcraft` unless the repository is actually renamed remotely.

### 5.2 Visual System

Adopt the O&O reference direction:

- Navy/midnight as primary authority color.
- Bronze as accent and focus highlight.
- Warm off-white page surfaces.
- Glass/panel surfaces for chrome.
- Strong heading text, restrained muted text, and enterprise-grade spacing.

Required token families:

- `brand.navy`
- `brand.midnight`
- `brand.bronze`
- `surface.page`
- `surface.panel`
- `surface.raised`
- `surface.glass`
- `text.heading`
- `text.body`
- `text.muted`
- `border.soft`
- `border.strong`
- `state.danger`
- `state.warning`
- `state.success`
- `focus.ring`

### 5.3 Design Deliverables

- Brand token file.
- UI primitives inventory page.
- Button, input, modal, drawer, table, badge, tooltip, empty state, toast, and canvas-control standards.
- Light and dark mode contrast audit.
- Export watermark standard.
- Email template standard.
- Loading/error/empty-state copy standard.

### 5.4 Theme Default Requirement

Default theme: light mode.

Requirements:

- First visit resolves to light mode regardless of OS preference.
- Users can explicitly switch to dark mode.
- User choice persists in localStorage.
- Existing users with a stored dark-mode preference keep that preference.
- Theme toggle copy should make the current state obvious.
- Tests must cover:
  - no stored preference -> light
  - stored `dark` -> dark
  - stored `light` -> light
  - toggling persists the new value
  - invalid stored values fall back to light

Implementation direction:

- Change the theme provider default from `system` to `light`.
- Keep dark-mode CSS and UI option available.
- Consider keeping a `system` option only if the product explicitly wants three choices; otherwise simplify to Light/Dark.
- Update screenshots and route audit expectations after the default changes.

## 6. Main-Site Integration Strategy For A Non-Vite Environment

The main site does not use Vite. Treat OandOcraft as a bounded application, not a folder copied into the main site.

### 6.1 Recommended Model: Standalone Product Under Subdomain

Use when the main site is corporate/marketing and OandOcraft is an authenticated app.

Examples:

- `craft.oando.co.in`
- `planner.oando.co.in`

Implementation:

- Keep Vite build for OandOcraft.
- Deploy `dist/` independently.
- Configure Supabase Auth redirect URLs for the app domain.
- Configure Edge Function `APP_URL` to the final app domain.
- Link to OandOcraft from the main site header or portal.

Benefits:

- Lowest risk.
- Clean routing boundary.
- No CSS collision.
- Clear auth redirect behavior.
- Independent release velocity.

### 6.2 Strong Alternative: Subpath Reverse Proxy

Use when the app must live under the main domain.

Example:

- `https://oando.co.in/craft/*`

Implementation:

- Set Vite `base: '/craft/'`.
- Add React Router basename `/craft`.
- Configure host/proxy fallback `/craft/* -> /craft/index.html`.
- Ensure static assets are served from `/craft/assets/*`.
- Add Supabase redirect URLs for `/craft/auth/verify`, `/craft/auth/reset`, and invite flows.

Benefits:

- Same domain as main site.
- Still keeps build systems mostly independent.

Risks:

- Base-path bugs.
- Auth callback mismatch.
- CDN/proxy cache mistakes.

### 6.3 Advanced Model: Micro-Frontend Embed

Use only if the main site must mount OandOcraft inside its own shell.

Required refactor:

- Extract `src/OandOcraftApp.tsx` as a mountable app component.
- Extract `src/bootstrap.tsx` for standalone startup.
- Allow injected router basename or memory router.
- Namespace CSS under `.oandocraft-app`.
- Confirm host React compatibility.
- Decide auth ownership: host-auth bridge or Supabase Auth inside OandOcraft.

Risks:

- CSS bleed.
- Router conflicts.
- Duplicate React/runtime dependencies.
- Harder performance ownership.

### 6.4 Avoid Initially: Full Rebuild Inside Main-Site Stack

Do not port the app directly into a non-Vite stack until the product architecture is stabilized. The editor is too complex to migrate casually.

### 6.5 Remote Repository Strategy

The remote repo should be planned deliberately. Do not create a GitHub repo as a side effect of local renaming without confirming ownership, visibility, and migration path.

Recommended target:

- New repo name: `OandOcraft`
- Package name: `oandocraft`
- Default branch: `main`
- Visibility: private until brand, security, and deployment settings are finalized

Remote setup steps:

- Confirm GitHub owner or organization.
- Create the remote repo.
- Add it as `origin` or `oando` depending on whether the old `Floorcraft` remote remains needed.
- Push `main`.
- Configure branch protection.
- Configure required checks:
  - lint
  - build
  - test
  - route audit
  - Supabase SQL/RLS tests once wired
- Configure Dependabot or equivalent dependency updates.
- Add repository secrets only where needed; never commit Supabase service role keys.
- Update README clone instructions only after the remote actually exists.

If preserving the original repository:

- Keep `rcasto123/Floorcraft` links as historical references.
- Add the new remote as `oando`.
- Push OandOcraft work to the new remote after the first clean commit.

If replacing the original repository:

- Rename remote repository in GitHub.
- Update clone URLs, changelog links, issue links, and security references.
- Confirm deployment integrations still point to the correct repo.

## 7. Technical Architecture Plan

### 7.1 Frontend Architecture

Refactor toward bounded feature modules:

- `app/` root shell, router, providers, route metadata.
- `features/canvas/` Konva editor.
- `features/roster/` employee management.
- `features/reports/` reports and analytics.
- `features/team/` workspace and members.
- `features/auth/` auth flows.
- `features/sharing/` share links and embeds.
- `features/help/` documentation/search.
- `lib/supabase/` typed backend access.
- `lib/brand/` design tokens and UI helpers.

### 7.2 State Architecture

Current Zustand stores are acceptable but need tighter boundaries.

Targets:

- Separate domain stores from UI stores.
- Add store reset/hydration contracts per office load.
- Add schema versioning for office payloads.
- Add migration tests for every payload version.
- Avoid cross-store mutations without a named transaction/helper.
- Preserve undo/redo invariants for seat assignment.

### 7.3 Canvas Architecture

Targets:

- Split `CanvasStage` into composition, tools, viewport, events, and layers.
- Keep Konva layer count under warning thresholds where possible.
- Memoize heavy renderers.
- Add viewport culling for very large plans.
- Add performance counters for element count, layer count, render timing, and payload size.
- Add route audit checks for Konva warnings.

### 7.4 Data Architecture

Short term:

- Keep JSONB office payload for speed.
- Add payload size warnings.
- Add schema version field.
- Add deterministic migration helpers.
- Add history/recovery tooling.

Medium term:

- Normalize high-value/high-churn tables if needed:
  - employees
  - reservations
  - annotations
  - seat swaps
  - share links already table-backed
  - audit events already table-backed

Long term:

- Consider event-sourced office updates or CRDT-like collaborative editing only after single-editor conflict handling is stable.

## 8. Supabase And Security Plan

### 8.1 RLS And Database

- Generate typed Supabase schema and use it in repositories.
- Add SQL tests for every RLS policy.
- Index every RLS predicate path.
- Validate SECURITY DEFINER functions re-check auth and authorization.
- Add migration rollback notes.
- Keep remote seed idempotent.

### 8.2 Auth And Invites

- Confirm redirect URLs for every deployment mode.
- Update all invite emails to OandOcraft.
- Add rate-limit tests.
- Add audit events for invite create, resend, accept, revoke, and expiry.
- Make dummy/demo login available only in non-production.

### 8.3 Share Links

- Add explicit expiry UI.
- Add revocation UI.
- Add audit events for create/revoke/open if feasible.
- Add warning copy for public bearer links.
- Reassess anonymous token select policy.

### 8.4 Security Headers

- Full app: deny framing unless required.
- Share/embed routes: allow only approved ancestors, not `*`, if the final embedding domains are known.
- Add CSP with script/style/connect/img rules matching Supabase and deployment CDN.
- Keep strict referrer policy for invite/auth/token routes.

### 8.5 Compliance And Governance

- Update SECURITY.md for OandOcraft reporting.
- Add data retention notes.
- Document export/delete behavior.
- Add admin access review checklist.
- Add support escalation path for lost access, bad invites, accidental overwrite, and data recovery.

## 9. Performance Plan

### 9.1 Budgets

Set budgets per route:

- Landing: minimal app shell, no Konva.
- Auth: no editor dependencies.
- Dashboard: thumbnails must be bounded.
- Editor map: heavy chunk allowed but measured.
- Roster: virtualized table and lazy drawers.
- Help: searchable content loaded in chunks.

### 9.2 Build Work

- Continue manual vendor chunking.
- Split `ProjectShell` further.
- Lazy-load exports and PDF/PNG dependencies only on demand.
- Lazy-load help content by section.
- Consider route prefetch on hover for authenticated dashboard/editor paths.

### 9.3 Runtime Work

- Add canvas render measurements.
- Reduce rerenders from broad store selectors.
- Add selectors for derived booleans rather than entire state objects.
- Keep global event listeners deduplicated.
- Use passive listeners where safe.
- Add large-office stress scenarios.

## 10. Accessibility Plan

Required audits:

- Keyboard navigation across landing, auth, dashboard, editor, roster, modals, drawers, menus, and share views.
- Focus trap correctness in modals and drawers.
- Skip links and landmark structure.
- Reduced-motion behavior.
- Color contrast for navy/bronze theme.
- Canvas alternatives: selected-element panel, keyboard shortcuts, and text-based roster/report paths.
- Screen-reader copy for icon-only controls.

Acceptance:

- No critical axe violations on core routes.
- Every modal/drawer closes with Escape and restores focus.
- Editor has non-pointer fallback for critical operations where practical.

## 11. QA And Test Strategy

### 11.1 Existing Gates

- `npm run lint`
- `npm run build`
- `npm run test`
- `npm run audit:pages`

### 11.2 Add Gates

- Supabase SQL/RLS tests in CI.
- E2E tests for auth, create team, open demo, edit plan, assign seat, share, export, invite preview.
- Visual screenshots for landing, auth, dashboard, map, roster, reports, help, share, invite.
- Brand regression grep: no visible `Floorcraft` except historical GitHub URLs.
- Pricing regression grep: no public pricing copy if pricing is intentionally removed.
- Bundle budget check.
- Dependency audit check.

### 11.3 Test Data

Seed modes:

- `minimal`: just enough to create first team/office.
- `demo`: current rich demo workspace.
- `full`: stress dataset with large offices and many employees.
- `oando`: branded realistic O&O workspace.

## 12. Observability And Operations

### 12.1 Client Observability

Add reporting for:

- Route errors.
- Unhandled promise rejections.
- Supabase failures by operation.
- Save conflicts.
- Save retry exhaustion.
- Export failures.
- Invite failures.
- Auth failures.
- Canvas performance thresholds.

### 12.2 Backend Observability

Track:

- RLS denied operations by endpoint where possible.
- Edge Function errors and latency.
- Invite send rate-limit hits.
- Share-token access patterns.
- Database size and payload growth.
- Slow queries.

### 12.3 Runbooks

Create runbooks for:

- Deployment rollback.
- Broken auth redirect.
- Supabase outage.
- Bad migration.
- Bad seed.
- Lost admin access.
- Accidental office overwrite.
- Public share-link leak.
- Invite email delivery failure.

## 13. Documentation Plan

User docs:

- Getting started.
- Create/open office.
- Draw floor plan.
- Add people and seats.
- Import roster.
- Share plan.
- Export reports.
- Admin permissions.
- Security and privacy.

Developer docs:

- Architecture overview.
- State/store contracts.
- Supabase schema and RLS model.
- Deployment modes.
- Main-site integration guide.
- Brand token guide.
- Testing guide.
- Release process.

Ops docs:

- Environment variables.
- Supabase migration flow.
- Seed flow.
- Edge Function deployment.
- Monitoring and rollback.

## 14. Delivery Roadmap

### Phase 0: Stabilize Current Rename

- Complete OandOcraft rename.
- Preserve legacy storage keys intentionally.
- Remove stale mixed-case spellings.
- Update package metadata.
- Update tests.
- Run all gates.

### Phase 1: Brand Completion

- Apply O&O tokens across auth, help, dashboard, editor, reports, share, invite, exports, and emails.
- Remove pricing content from public surfaces.
- Update docs and screenshots.

### Phase 2: Integration Foundation

- Pick deployment model: subdomain, subpath, or micro-frontend.
- Add basename support if needed.
- Split standalone bootstrap from app component.
- Document host integration requirements.

### Phase 2B: Remote Repository And Delivery Controls

- Create or rename the remote repository.
- Push the current clean `main`.
- Add branch protection.
- Add CI gates.
- Add repository secrets and environment definitions.
- Add release/changelog discipline before production deployment.

### Phase 3: Architecture Refactor

- Split largest files.
- Introduce feature modules.
- Add route metadata.
- Improve editor chunking.
- Add payload schema versioning.

### Phase 3B: Upstream Properties Panel Assimilation

- Compare local `PropertiesPanel.tsx` and related tests against upstream commit `8b7d3d078632bd16a76c34190a518426fbd8e907`.
- Port missing behavior intentionally, not by blind copy-paste.
- Preserve OandOcraft theme tokens while adopting the panel structure.
- Add or update tests for every element type controlled by the panel.
- Add browser audit coverage for representative element selection/editing paths.

### Phase 4: Security And Data Hardening

- Expand SQL/RLS tests.
- Improve share-token governance.
- Add CSP and final headers.
- Add audit events for sensitive actions.
- Add backup/recovery runbooks.

### Phase 5: Product Depth

- Improve roster saved views.
- Improve reports and executive summaries.
- Add realistic O&O seed workspace.
- Add operational dashboards.

### Phase 6: Reliability And Launch

- Add monitoring.
- Add staging promotion.
- Run full E2E and accessibility audit.
- Complete release checklist.
- Launch behind controlled access.
- Monitor and iterate.

### Phase 7: Theme Default And Accessibility Polish

- Set light mode as default.
- Keep explicit dark-mode option.
- Update theme tests.
- Verify contrast in both modes.
- Capture screenshots in both modes for launch-critical routes.

## 15. Acceptance Criteria For Launch

Product:

- All critical workflows complete without console errors.
- OandOcraft branding is consistent across visible surfaces.
- No unintended public pricing copy.
- Demo and production environments are clearly separated.

Technical:

- Build, lint, test, route audit, and SQL tests pass in CI.
- Bundle budgets are documented and enforced.
- App supports chosen main-site integration mode.
- Auth redirects work in final environment.

Security:

- RLS tests cover all tables and public routes.
- Invite/share risks are documented and controlled.
- Security headers are appropriate for full app and embed/share paths.
- Incident and rollback runbooks exist.

Operations:

- Staging and production configs are documented.
- Seed and migration flows are repeatable.
- Monitoring covers client, Supabase, and Edge Functions.
- Release notes and changelog are updated.

## 16. Immediate Next Actions

1. Finish exact rename to `OandOcraft` across visible code, docs, emails, exports, seed data, and tests.
2. Decide final deployment model for the non-Vite main site.
3. Decide remote repository strategy: new repo, renamed repo, or additional remote.
4. Set light mode as default while preserving dark-mode selection.
5. Remove pricing content from Help and public copy if OandOcraft is not sold as a priced SaaS surface.
6. Add basename support if using `/craft/*` under the main domain.
7. Compare and assimilate upstream Properties panel changes from commit `8b7d3d078632bd16a76c34190a518426fbd8e907`.
8. Split the largest files in this order: `ProjectShell`, `CanvasStage`, `RosterPage`, `HelpPage`.
9. Add CI route audit and brand-regression checks.
10. Create staging Supabase project and O&O seed dataset.
11. Add observability before production launch.
