# OandOcraft Enterprise Overhaul Master Plan

Audit date: 2026-04-26
Reference repo: https://github.com/rcasto123/Floorcraft
Primary deployment target: `https://oando.co.in/OandOcraft/`
Operating model: one O&O workspace, one controlling client context, internal users plus approved external users, direct named access instead of sharing-first behavior.

## 1. Executive Mandate

OandOcraft should stop behaving like a renamed open-source floor-plan demo and start behaving like a controlled O&O workplace planning product. The bar is not "functional enough." The bar is a clean, professional, SmartDraw-class planning environment with credible admin control, polished object editing, reliable data, and a bounded deployment model under the main O&O site.

The overhaul has to deliver across six layers at the same time:

- Product: planning, seating, move management, and reporting must feel intentional and efficient.
- UX: the app must look premium, restrained, and reliable rather than generic or hobby-grade.
- Platform: the React/Konva editor, routing, state, and build outputs must be stable and maintainable.
- Security: named access, RLS, auditability, recovery, and production-safe environment handling must be explicit.
- Integration: OandOcraft must work under `oando.co.in/OandOcraft/` without fighting the main site's non-Vite stack.
- Operations: seeding, release discipline, rollback, monitoring, and admin recovery must exist before launch.

## 2. Current-State Audit

### 2.1 What Already Exists

- React 19 + TypeScript + React Router application with route-level lazy loading.
- Konva editor with walls, curved walls, doors, windows, desks, rooms, furniture, annotations, neighborhoods, exports, and multi-floor planning.
- Supabase model with Auth, RLS, teams, offices, invites, audit events, share tokens, history recovery, and account export/deletion flows.
- Repeatable `/OandOcraft/` build path through `npm run build:oando`.
- Main-site integration doc and rewrite guidance for subpath deployment.
- A large automated test base and working build/test/lint gates.

### 2.2 What Has Been Improved Recently

- The editor shell has started moving toward a cleaner SmartDraw-like structure instead of a noisy app-chrome layout.
- Toolbars can now be docked or moved rather than being treated as permanently fixed chrome.
- Admins now have stronger operational controls, including access-management and recovery-oriented actions.
- A live admin stats toolbar concept now exists and should be expanded into a proper operations HUD.
- Object rendering has improved from crude generic blocks toward more professional top-view symbols.
- Wall-drawing flow now returns to pan after completion, which is closer to professional drafting behavior.
- Manufacturer-led block sourcing has been defined: MillerKnoll first, Steelcase second, BIMobject only for gaps.

### 2.3 What Still Falls Short

- The visual system is still inconsistent across routes. Some surfaces feel more premium while others still feel like a default web app.
- The app chrome is improved but not yet elegant enough. Layout rhythm, typography hierarchy, and panel density still need a full pass.
- SmartDraw-like editor ergonomics are only partially there. Cursor feedback, context actions, drafting flow, and visual calm need more work.
- Main-site integration is documented but not yet proven in the real host environment.
- The object library is better than before but still not yet professional enough for a design/planning tool.
- Several large files still reduce maintainability and increase regression risk:
  - `ProjectShell.tsx`
  - `CanvasStage.tsx`
  - `PropertiesPanel.tsx`
  - `HelpPage.tsx`
  - `RosterPage.tsx`
- Observability is still thin. There is no complete client error pipeline, no performance budget dashboard, and no mature release runbook set.

### 2.4 Upstream Change Context

The upstream commit `8b7d3d078632bd16a76c34190a518426fbd8e907` remains a planning input, especially around the Properties panel and related tests.

Planning implications:

- Preserve the intent of the upstream panel work: clearer structure, type-aware controls, safer editing affordances, and regression coverage.
- Do not re-implement upstream ideas blindly. Assimilate what helps the OandOcraft editor model.
- Treat panel coverage as a release requirement for core element types.

## 3. Product Vision

OandOcraft should become the O&O workplace planning command center.

Core outcomes:

- Draw and edit floor plans quickly.
- Place rooms, walls, desks, booths, tables, reception, storage, and facilities with professional-looking blocks.
- Assign people, departments, neighborhoods, and seats without brittle data flow.
- Give named internal or approved external users direct access with clear roles.
- Let admins override, repair, inspect, and recover without engineering intervention.
- Produce presentable exports and operational reports.

This is not a many-tenant SaaS product. It is a controlled planning environment for a narrow ownership model. That means the system should bias toward clarity, admin power, data integrity, and speed of operations rather than community-style sharing features.

## 4. UX And Design Direction

### 4.1 Visual Standard

The target is closer to SmartDraw, Lucidchart, and professional CAD-adjacent planning tools than to a generic React dashboard. The interface should feel clean, deliberate, and calm.

Design requirements:

- Light mode is the default.
- Dark mode remains available but secondary.
- Chrome should be restrained, with the canvas as the primary visual focus.
- Typography should feel professional and hierarchical rather than flat.
- Panels should feel precise and dense without becoming cramped.
- Hover, focus, lock, selection, dirty, error, and saving states must be obvious and consistent.

### 4.2 Editor Interaction Standard

Required interaction behavior:

- Drawing a wall or room should complete cleanly and return the user to navigation when appropriate.
- Toolbars should be movable, dockable, and dismissible where that improves workflow.
- Admins should have a real operations overlay or toolbar for live health and workspace metrics.
- Contextual actions should appear where the user needs them instead of being hidden in distant panels.
- Cursor states must tell the truth for pan, draw, drag, rotate, resize, invalid-drop, and locked interactions.
- The editor should feel calm. No noisy hover spam, excessive shadows, or unstable layout shifts.

### 4.3 Block Library Standard

The object library should be rebuilt as an OandOcraft-owned top-view planning language.

Source strategy:

- MillerKnoll for core office planning references
- Steelcase for core office planning references
- BIMobject only to fill missing categories

Conversion rules:

- Use manufacturer assets as references, not direct pasted raw imports.
- Normalize everything into one SVG/Konva top-view language.
- Preserve believable dimensions and circulation.
- Prefer readability over decorative detail.

## 5. Product Pillars

### 5.1 Planning Canvas

- Multi-floor planning with clear floor hierarchy.
- Walls, doors, windows, rooms, desks, booths, tables, decor, facilities, and custom shapes.
- Snapping, alignment, measurement, scaling, and better cursor/state feedback.
- Performance that remains usable for large offices.
- Export-safe rendering for PDF/PNG and presentation snapshots.

### 5.2 People And Space Data

- Employee roster with department, title, manager, status, accommodations, and equipment context.
- Seat assignment that stays in sync with the plan model.
- Bulk import/export with validation.
- History and recovery for planner mistakes.

### 5.3 Governance And Access

- One O&O workspace with direct named-user access.
- Roles centered on owner, admin/editor, and viewer behavior.
- Invite-based access for approved external users.
- Anonymous/public sharing not treated as the normal workflow.
- Strong admin override powers, with audit logging.

### 5.4 Admin Operations

- Live stats for office count, object count, assignment coverage, and save status.
- Recovery actions for bad saves or stale history states.
- Access-control management without backend manual intervention.
- Basic operational dashboards for planner health and data quality.

### 5.5 Reporting And Exports

- Occupancy and capacity reporting.
- Department and neighborhood summaries.
- Move-readiness and equipment-readiness reporting.
- Executive export views that look presentable without manual cleanup.

## 6. Main-Site Integration Strategy

The main site does not use Vite. OandOcraft should therefore be treated as a bounded SPA deployed inside the main domain, not as code folded into the host's own frontend stack.

### 6.1 Integration Principle

Primary model: subpath deployment at `https://oando.co.in/OandOcraft/`.

This means:

- OandOcraft keeps its own Vite build.
- The host serves the built app as a self-contained route boundary.
- The host does not import OandOcraft components into its own page templates.
- React Router owns navigation inside `/OandOcraft/`.
- The main site and the planner should interact by URL boundary and shared auth/domain setup, not by bundle fusion.

### 6.2 Why Not Fold Vite Into The Main Site

Directly porting the editor into the non-Vite stack is the wrong first move because it creates unnecessary risk:

- Router collisions
- CSS leakage in both directions
- Asset-path bugs
- Harder auth callback handling
- Slower releases because the planner and main site become tightly coupled

If the business later needs a micro-frontend shell, that should happen after the app surface is stable and after the subpath model is proven in production.

### 6.3 Host/App Contract

The host is responsible for:

- serving `/OandOcraft/assets/*` as static files
- rewriting `/OandOcraft/*` app routes to `/OandOcraft/index.html`
- not applying global CSS resets or script transforms to OandOcraft assets
- allowing the needed auth callback routes to resolve under `/OandOcraft/`

OandOcraft is responsible for:

- building assets with the `/OandOcraft/` base path
- keeping app CSS internally bounded
- ensuring auth/invite/reset routes work under the subpath
- keeping deep-link refresh stable for nested office routes

### 6.4 Future Integration Tracks

After the subpath model is stable, only then evaluate:

- subdomain isolation such as `craft.oando.co.in`
- a host-shell micro-frontend mount
- SSO bridge or shared host session model

## 7. Technical Architecture Plan

### 7.1 Frontend Modules

Refactor toward bounded modules:

- `app/` for shell, router, providers, and route metadata
- `features/canvas/` for editor tools and rendering
- `features/roster/` for people and seat management
- `features/reports/` for analytics and exports
- `features/auth/` for login, invite, verify, reset
- `features/admin/` for operations and access power tools
- `lib/brand/` for tokens and theme helpers
- `lib/supabase/` for typed backend access

### 7.2 State Architecture

- Keep Zustand but separate domain state from UI state more rigorously.
- Preserve persisted UI behavior for dockable toolbars and layout preferences.
- Add schema versioning and migration tests for office payloads.
- Reduce broad selectors that cause unnecessary editor rerenders.

### 7.3 Canvas Architecture

- Break `CanvasStage` into viewport, tools, layers, events, overlays, and selection systems.
- Expand interaction-state coverage for drafting and object manipulation.
- Add stress testing for large office plans.
- Track object counts, render timings, and save payload size.

### 7.4 Data Architecture

Short term:

- Keep JSONB office payload storage for velocity.
- Keep history recovery tooling.
- Add payload size warnings and migration contracts.

Medium term:

- Normalize high-churn reporting entities only where real product pressure appears.
- Keep the plan model optimized for editor speed, not theoretical purity.

## 8. Security And Supabase Plan

### 8.1 Access Model

- Maintain direct named-user access as the primary model.
- Keep admin roles able to modify and recover any office within the workspace.
- Limit anonymous/public share behavior to tightly controlled legacy or exceptional use.

### 8.2 Database And RLS

- Add SQL coverage for critical RLS paths.
- Ensure admin power is intentional and tested.
- Keep seeds idempotent and safe to rerun.
- Document rollback assumptions for each migration.

### 8.3 Auth And Email

- Confirm all auth redirects under `/OandOcraft/`.
- Ensure invite/reset/verify messaging uses OandOcraft naming consistently.
- Keep demo credentials out of production behavior.

### 8.4 Governance

- Update security documentation for the O&O operating model.
- Document recovery, access review, and accidental-overwrite handling.
- Maintain audit visibility for access and recovery actions.

## 9. Performance Plan

### 9.1 Route Budgets

- Landing and auth routes should avoid pulling editor-heavy dependencies.
- Dashboard should keep thumbnails and summaries bounded.
- Editor route can be heavy, but the chunk strategy must be measured and improved.
- Reports and help content should remain lazy-load friendly.

### 9.2 Runtime Priorities

- Reduce unnecessary rerenders from broad store subscriptions.
- Continue splitting heavyweight editor and shell code.
- Expand browser-level checks for overflow, resize behavior, and toolbar persistence.

## 10. Accessibility Plan

- Audit keyboard paths across auth, dashboard, editor, modals, and drawers.
- Ensure dockable or floating toolbars remain keyboard accessible.
- Verify focus return and Escape behavior for overlays.
- Maintain readable contrast in both light and dark modes.
- Provide non-pointer alternatives for critical planner operations where practical.

## 11. QA And Release Strategy

Current gates:

- `npm run lint`
- `npm run build`
- `npm run build:oando`
- `npm run test`
- `npm run audit:pages`

Required additions:

- browser smoke checks for key `/OandOcraft/` routes
- RLS and auth regression tests
- overflow and layout regression checks
- brand-regression checks for visible `Floorcraft` remnants
- object-editing coverage for major element types

## 12. Delivery Roadmap

### Phase 0 - Rename And Deployment Grounding

- Finish OandOcraft naming and package identity.
- Keep light mode as default.
- Preserve intentional legacy storage compatibility where required.
- Lock the `/OandOcraft/` build and routing baseline.

### Phase 1 - Access And Admin Control

- Finish direct-access language and flows.
- Strengthen admin power and recovery controls.
- Expand audit coverage for sensitive admin actions.

### Phase 2 - Data Completeness

- Finish full Supabase payload seeding verification.
- Remove duplicate/demo pollution where needed.
- Confirm that hosted data includes real objects, not headings-only payloads.

### Phase 3 - Premium UI/UX Pass

- Complete the SmartDraw-like shell redesign.
- Make the editor chrome feel premium and calm.
- Standardize hover, selection, and interaction language.
- Finish the cursor and drafting-behavior pass.

### Phase 4 - Editor Power And Professional Blocks

- Expand properties coverage for every key object type.
- Improve multi-select and numeric editing behavior.
- Rebuild more of the library around manufacturer-referenced block families.
- Add stronger planner templates for O&O use cases.

### Phase 5 - Main-Site Production Integration

- Deploy the bounded app under `/OandOcraft/`.
- Validate host rewrites, auth redirects, asset paths, and CSS isolation.
- Prove refresh behavior on all deep links.

### Phase 6 - Launch Hardening

- Add monitoring, rollback docs, and release checklist discipline.
- Run final browser, accessibility, security, and data checks.
- Launch behind controlled access and observe real usage.

## 13. Launch Acceptance Criteria

Product:

- The planner looks and feels intentionally premium, not generic.
- First-run editing workflows are understandable without heavy help dependence.
- Blocks, toolbars, and properties feel professional and predictable.

Integration:

- `https://oando.co.in/OandOcraft/` works as a bounded app.
- Nested routes refresh correctly.
- Auth, invite, and reset flows return to the right subpath.
- The main site and the planner do not break each other's styling.

Security and data:

- Named access and admin powers behave as designed.
- RLS-critical paths are covered.
- Seeded data is complete and verifiable.

Operations:

- Release, rollback, and recovery instructions exist.
- Monitoring covers the main failure paths.
- The worktree, CI, and deployment outputs are clean at release time.

## 14. Immediate Next Actions

1. Finish the premium UI shell pass so the editor looks decisively more professional.
2. Expand dockable-toolbar coverage and polish admin stats into a fuller operations HUD.
3. Complete the manufacturer-referenced block rebuild, starting with workstations, offices, meeting tables, booths, lounge, and storage.
4. Close the remaining full-seed verification gaps in hosted Supabase.
5. Prove the real `/OandOcraft/` deployment on the main host with auth callback verification.
6. Add final regression coverage for properties editing, route refresh, overflow, and major planner interactions.
