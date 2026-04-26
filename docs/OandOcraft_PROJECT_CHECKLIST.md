# OandOcraft Project Checklist

This checklist is the working execution board. It is more detailed than the phase checklist and should be used during active implementation.

## 0. Repo And Delivery Control

- [x] Product name is `OandOcraft`.
- [x] Package name is `oandocraft`.
- [x] Remote repo exists for OandOcraft work.
- [x] `/OandOcraft/` build command exists.
- [ ] Branch protection and required checks are configured in GitHub.
- [ ] Release artifact retention is documented for production rollback.
- [ ] Changelog process is defined.

## 1. Main-Site Integration

- [x] Main-site integration plan exists.
- [x] Subpath deployment is the selected first production model.
- [x] `npm run build:oando` emits `/OandOcraft/` assets.
- [ ] Real host serves `dist/` under `/OandOcraft/`.
- [ ] Real host rewrites nested routes to `/OandOcraft/index.html`.
- [ ] Real host keeps planner assets separate from main-site assets.
- [ ] Supabase production Site URL is set to `https://oando.co.in/OandOcraft`.
- [ ] Supabase production redirect allow-list includes verify, reset, and invite routes.
- [ ] Edge Function `APP_URL` is set to `https://oando.co.in/OandOcraft`.
- [ ] Production smoke test passes.

## 2. UI Quality And SmartDraw Standard

- [ ] Canvas compass/minimap control works and does not visually glitch.
- [ ] UI corners are sharpened across buttons, cards, panels, menus, modals, drawers, and toolbars.
- [ ] Cards use 8px radius or less unless a component has a specific reason.
- [ ] Editor shell feels clean and professional against SmartDraw/Lucidchart expectations.
- [ ] Canvas remains the visual focus.
- [ ] Left and right sidebars do not cause horizontal overflow.
- [ ] Docked and floating toolbars do not cover core canvas controls.
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
- [ ] All remaining editor toolbars are movable or intentionally fixed with documented reason.
- [ ] Toolbar positions persist reliably.
- [ ] Toolbars can be reset to default positions.
- [ ] Toolbars are keyboard accessible.
- [ ] Admin stats show live office health, object counts, assignments, save state, and conflict/recovery signals.
- [ ] Admin HUD is hidden from non-admin users.

## 4. Floor-Plan Blocks

- [x] Block-source strategy exists.
- [x] Current crude blocks have been improved once.
- [ ] Workstation and benching blocks are rebuilt from MillerKnoll/Steelcase references.
- [ ] Private office blocks are rebuilt.
- [ ] Meeting and boardroom blocks are rebuilt.
- [ ] Phone booth and focus pod blocks are rebuilt.
- [ ] Lounge and reception blocks are rebuilt.
- [ ] Storage, lockers, printer bays, and facility blocks are rebuilt.
- [ ] SVG preview language matches canvas Konva symbols.
- [ ] Blocks keep believable dimensions.
- [ ] Blocks remain readable at zoomed-out planning scale.

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
- [ ] Hosted table counts are captured before and after full seed work.
- [ ] Duplicate demo offices are reviewed and removed where needed.
- [ ] Local reset is verified to load people, seats, assignments, and floor-plan objects.
- [ ] RLS tests cover admin override behavior.
- [ ] RLS tests cover viewer denial behavior.
- [ ] Service-role usage is documented and server-only.

## 7. Access And Security

- [x] Direct named-user access is the primary model.
- [x] Anonymous sharing is not presented as the primary workflow.
- [x] Admins can recover history and force-save.
- [x] Access changes are audited.
- [ ] Invite resend, revoke, accept, and expiry events are fully audited.
- [ ] Public token policy is reviewed and documented.
- [ ] CSP is finalized for production domains.
- [ ] Security headers are configured on the main host.
- [ ] Lost-admin-access recovery is documented.

## 8. Testing And Quality Gates

- [x] `npm run lint` exists.
- [x] `npm run test` exists.
- [x] `npm run build` exists.
- [x] `npm run build:oando` exists.
- [x] `npm run audit:pages` exists.
- [ ] Browser smoke tests cover `/OandOcraft/`, login, dashboard, office map, and auth routes.
- [ ] Layout overflow regression test exists.
- [ ] Compass/minimap regression test exists.
- [ ] Toolbar persistence regression test exists.
- [ ] Sharp-corner visual audit is completed.
- [ ] Accessibility audit is completed for core routes.

## 9. Documentation

- [x] Overhaul master plan exists.
- [x] Main-site integration plan exists.
- [x] Block-library source plan exists.
- [x] Project workflow exists.
- [x] Project checklist exists.
- [x] Interactive project map exists.
- [ ] Release checklist is promoted into the README or deployment docs.
- [ ] Admin runbook exists.
- [ ] Supabase recovery runbook exists.
- [ ] Production smoke-test record is added after first host deployment.

## 10. Launch Gate

- [ ] Production build is generated from clean `main`.
- [ ] Production host serves `/OandOcraft/`.
- [ ] Supabase Auth redirects work in production.
- [ ] Demo and production accounts are clearly separated.
- [ ] No blocking console errors exist on core routes.
- [ ] Admin can recover a test office history entry.
- [ ] One end-to-end flow works: login, open office, draw room, add desk, assign person, export.
- [ ] Rollback artifact is available.
- [ ] Owner sign-off is recorded.
