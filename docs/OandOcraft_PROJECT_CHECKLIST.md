# OandOcraft Project Checklist

This checklist is the working execution board. It is more detailed than the phase checklist and should be used during active implementation.

Status key:

- Repo-local: can be completed in this repository without production host access.
- Host-only: requires GitHub, production hosting, Supabase dashboard, DNS, or owner/admin credentials outside this repository.
- Blocked-by-host: repo-local work is ready to verify, but final completion depends on host-only access.

## 0. Repo And Delivery Control

- [x] Product name is `OandOcraft`.
- [x] Package name is `oandocraft`.
- [x] Remote repo exists for OandOcraft work.
- [x] `/OandOcraft/` build command exists.
- [ ] Host-only: Branch protection and required checks are configured in GitHub.
- [x] Repo-local: Release artifact naming, storage path, retention window, and restore owner are documented for production rollback.
- [x] Repo-local: Changelog process is defined, including release-note owner, source commits/PRs, and user-visible/ops sections.
- [x] Repo-local: Release artifact checklist covers `npm run build:oando`, generated `dist/` contents, checksum/version label, upload location, rollback artifact, and retention verification.
- [x] Repo-local: Release runbook checklist covers preflight checks, build, smoke test, deploy, Supabase redirect verification, rollback trigger, and owner sign-off.

## 1. Main-Site Integration

- [x] Main-site integration plan exists.
- [x] Subpath deployment is the selected first production model.
- [x] `npm run build:oando` emits `/OandOcraft/` assets.
- [ ] Host-only: Real host serves `dist/` under `/OandOcraft/`.
- [ ] Host-only: Real host rewrites nested routes to `/OandOcraft/index.html`.
- [ ] Host-only: Real host keeps planner assets separate from main-site assets.
- [ ] Host-only: Supabase production Site URL is set to `https://oando.co.in/OandOcraft`.
- [ ] Host-only: Supabase production redirect allow-list includes verify, reset, and invite routes.
- [ ] Host-only: Edge Function `APP_URL` is set to `https://oando.co.in/OandOcraft`.
- [ ] Blocked-by-host: Production smoke test passes after host and Supabase production settings are available.

## 2. UI Quality And SmartDraw Standard

- [x] Canvas compass/minimap control works and does not visually glitch.
- [ ] UI corners are sharpened across buttons, cards, panels, menus, modals, drawers, and toolbars.
- [x] Repo-local: Key editor overlay corners are sharpened for compass, minimap, dockable toolbars, action dock, and admin stats.
- [ ] Cards use 8px radius or less unless a component has a specific reason.
- [ ] Editor shell feels clean and professional against SmartDraw/Lucidchart expectations.
- [ ] Canvas remains the visual focus.
- [ ] Left and right sidebars do not cause horizontal overflow.
- [x] Docked and floating toolbars do not cover core canvas controls.
- [ ] Hover states are consistent across toolbars, library cards, rows, tabs, and panel controls.
- [ ] Focus states are keyboard-visible.
- [ ] Cursor states exist for pan, select, draw, drag, resize, rotate, and invalid interactions.
- [ ] Light mode is the first-visit default.
- [ ] Dark mode remains available and persisted.

## 3. Dockable Toolbars And Admin HUD

- [x] Dockable toolbar foundation exists.
- [x] Canvas action dock uses the dockable toolbar system.
- [x] Align/distribute toolbar uses the dockable toolbar system.
- [x] Admin stats toolbar exists.
- [x] All remaining editor toolbars are movable or intentionally fixed with documented reason.
- [x] Toolbar positions persist reliably.
- [x] Toolbars can be reset to default positions.
- [x] Toolbars are keyboard accessible.
- [x] Admin stats show live office health, object counts, assignments, save state, warnings, and payload size.
- [x] Admin stats expose explicit conflict/recovery shortcuts and audit drilldowns.
- [x] Admin HUD is hidden from non-admin users.

## 4. Floor-Plan Blocks

- [x] Block-source strategy exists.
- [x] Current crude blocks have been improved once.
- [x] Workstation and benching blocks are rebuilt from MillerKnoll/Steelcase references.
- [x] Private office blocks are rebuilt.
- [x] Meeting and boardroom blocks are rebuilt.
- [x] Phone booth and focus pod blocks are rebuilt.
- [x] Lounge and reception blocks are rebuilt.
- [ ] Storage, lockers, printer bays, and facility blocks are rebuilt.
- [x] SVG preview language matches canvas Konva symbols.
- [x] Blocks keep believable dimensions.
- [x] Blocks remain readable at zoomed-out planning scale.

## 5. Editor Behavior

- [x] Wall completion returns to pan.
- [x] Properties panel supports broad object modification.
- [x] Multi-select editing exists.
- [x] Align, distribute, duplicate, lock, and ordering affordances exist.
- [ ] Wall/room drawing completion is browser-smoke tested.
- [ ] Properties panel has regression coverage for every supported object type.
- [ ] Context actions appear near selected objects where appropriate.
- [ ] Keyboard shortcuts are audited for conflicts.
- [ ] Invalid edits show clear warnings.

## 6. Data And Supabase

- [x] Seed payload verification script exists.
- [x] Seed data includes non-empty floor-plan objects.
- [x] Seed demo emails use `oandocraft.local`.
- [ ] Host-only: Hosted table counts are captured before and after full seed work.
- [ ] Host-only: Duplicate demo offices are reviewed and removed where needed if the hosted dump already contains real offices.
- [ ] Local reset is verified to load people, seats, assignments, and floor-plan objects.
- [ ] RLS tests cover admin override behavior.
- [ ] RLS tests cover viewer denial behavior.
- [ ] Service-role usage is documented and server-only.

## 7. Access And Security

- [x] Direct named-user access is the primary model.
- [x] Anonymous sharing is not presented as the primary workflow.
- [x] Admins can recover history and force-save.
- [x] Access changes are audited.
- [ ] Repo-local: Invite resend, revoke, accept, and expiry events are fully audited in code/tests where possible.
- [ ] Public token policy is reviewed and documented.
- [ ] Blocked-by-host: CSP is finalized for production domains and verified against the live host.
- [ ] Host-only: Security headers are configured on the main host.
- [ ] Lost-admin-access recovery is documented.

## 8. Testing And Quality Gates

- [x] `npm run lint` exists.
- [x] `npm run test` exists.
- [x] `npm run build` exists.
- [x] `npm run build:oando` exists.
- [x] `npm run audit:pages` exists.
- [ ] Repo-local: Browser smoke tests cover local `/OandOcraft/`, login, dashboard, office map, and auth routes.
- [ ] Layout overflow regression test exists.
- [x] Compass/minimap regression test exists.
- [x] Toolbar persistence regression test exists.
- [ ] Sharp-corner visual audit is completed.
- [ ] Accessibility audit is completed for core routes.

## 9. Documentation

- [x] Overhaul master plan exists.
- [x] Main-site integration plan exists.
- [x] Block-library source plan exists.
- [x] Project workflow exists.
- [x] Project checklist exists.
- [x] Interactive project map exists.
- [x] Repo-local: Release checklist is promoted into the README or deployment docs.
- [x] Repo-local: Changelog template exists with summary, user-visible changes, operational steps, known issues, rollback artifact, and verification results.
- [ ] Repo-local: Admin runbook exists.
- [ ] Repo-local: Supabase recovery runbook exists.
- [ ] Blocked-by-host: Production smoke-test record is added after first host deployment.

## 10. Launch Gate

- [ ] Repo-local: Production build is generated from clean `main`.
- [ ] Host-only: Production host serves `/OandOcraft/`.
- [ ] Host-only: Supabase Auth redirects work in production.
- [ ] Demo and production accounts are clearly separated.
- [ ] Blocked-by-host: No blocking console errors exist on production core routes.
- [ ] Blocked-by-host: Admin can recover a test office history entry in production or approved staging.
- [ ] Blocked-by-host: One end-to-end production flow works: login, open office, draw room, add desk, assign person, export.
- [x] Repo-local: Rollback artifact is generated and documented before release handoff.
- [ ] Host-only: Owner sign-off is recorded.

## Current Host-Only Blockers

- GitHub branch protection and required checks need repository admin access.
- Production host must serve `dist/` under `/OandOcraft/`, rewrite nested routes, isolate planner assets, and set security headers.
- Supabase production settings must be updated for Site URL, redirect allow-list, and Edge Function `APP_URL`.
- Hosted database row-count capture and duplicate-office cleanup need hosted database credentials/access.
- Production smoke tests, auth redirect verification, admin recovery verification, end-to-end production flow, and owner sign-off require the live host or approved staging environment.
