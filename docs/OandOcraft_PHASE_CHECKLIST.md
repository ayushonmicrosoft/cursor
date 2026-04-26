# OandOcraft Phase Checklist

Owner model: single-agent execution only. Do not split work across multiple agents unless this document is explicitly changed.

Target deployment: `https://oando.co.in/OandOcraft/`.

Product scope: one O&O workspace, internal and approved external people, direct person-level access, no anonymous sharing-first workflow.

Status key:

- Repo-local: can be completed in this repository without production host access.
- Host-only: requires GitHub, production hosting, Supabase dashboard, DNS, or owner/admin credentials outside this repository.
- Blocked-by-host: repo-local work is ready to verify, but final completion depends on host-only access.

Working docs:

- `docs/OandOcraft_OVERHAUL_MASTER_PLAN.md`
- `docs/OandOcraft_WORKFLOW.md`
- `docs/OandOcraft_PROJECT_CHECKLIST.md`
- `docs/OandOcraft_PROJECT_MAP.html`
- `docs/OandOcraft_MAIN_SITE_INTEGRATION.md`
- `docs/OandOcraft_BLOCK_LIBRARY_SOURCES.md`
- `docs/OandOcraft_TOOLBAR_DOCKING_AUDIT.md`

## Phase 0 - Repo, Deployment, And Ground Rules

- [x] Create remote repo named `OandOcraft`.
- [x] Push current `main` to the new remote.
- [x] Preserve the old `rcasto123/Floorcraft` remote as historical upstream context.
- [x] Rename visible product/package identity to `OandOcraft` / `oandocraft`.
- [x] Make light mode the default while keeping dark mode available.
- [x] Add a repeatable `/OandOcraft/` subpath build path.
- [x] Document main-site rewrite rules for `oando.co.in/OandOcraft/* -> /OandOcraft/index.html`.
- [x] Repo-local: Document Supabase redirect URLs for `/OandOcraft/auth/verify`, `/OandOcraft/auth/reset`, and invite acceptance.
- [ ] Host-only: Add Supabase production redirect URLs for `/OandOcraft/auth/verify`, `/OandOcraft/auth/reset`, and invite acceptance.
- [ ] Host-only: Confirm production env vars for the O&O host.
- [x] Add workflow, detailed checklist, and interactive project-map documentation.
- [ ] Repo-local: Add release artifact, changelog, and release runbook checklist details to deployment docs.

Exit criteria:

- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] `npm run build:oando` passes and emits assets for `/OandOcraft/`.
- [x] `npm run test` passes.
- [ ] Host-only: Git worktree is clean and pushed to `OandOcraft`.

## Phase 1 - Access Model And Admin Powers

- [x] Replace sharing-first language with direct person access in UI copy.
- [x] Keep invite flow for named internal/external users.
- [x] Stop presenting anonymous share links as a primary workflow.
- [x] Make team admins owner-equivalent for all offices in RLS.
- [x] Make team admins resolve as `owner` in client permission checks.
- [x] Add admin controls for office visibility, person role, revoke access, recover history, and force-save.
- [x] Add audit events for admin changes.
- [x] Add RLS tests for admin read/update on private offices.

Exit criteria:

- [x] Named internal/external users can be invited and permissioned.
- [x] Admins can modify any office without manual office-owner rows.
- [x] Viewers cannot edit offices.
- [x] Anonymous sharing is disabled or clearly relegated to a controlled legacy path.

## Phase 2 - Full Supabase Data Load

- [x] Decide source of truth: hosted Supabase dump, local seed, or curated MIT dataset import.
- [x] Run the full-data seed generator against the hosted database using `SEED_DB_URL`.
- [ ] Host-only: Verify every public table row count before and after seed generation.
- [x] Confirm office payloads include all floors, elements, employees, neighborhoods, annotations, and assignments.
- [ ] Host-only: Remove demo-only duplicate office clones if the hosted dump already contains real offices.
- [x] Rename seed demo emails/domains from `floorcraft.local` to `oandocraft.local`.
- [x] Add a seed verification script that fails when payload headings exist but floor objects are missing.

Exit criteria:

- [x] `supabase/seed.sql` includes full office payload JSON, not headings-only data.
- [ ] Local reset loads floor-plan components, people, seats, and assignments.
- [x] Seed verification reports non-zero objects for walls, desks, rooms, doors, windows, furniture, employees, and annotations.

## Phase 3 - SmartDraw-Level UI/UX Foundation

- [ ] Redesign the editor shell around a clean canvas, restrained chrome, and professional spacing.
- [x] Replace crude floor-plan blocks with cleaner SVG library previews and Konva canvas symbols for desks, rooms, tables, seating, facilities, and generic objects.
- [x] Add better hover states for toolbar buttons, library cards, canvas objects, rows, tabs, and panel controls.
- [x] Add obvious selected, focused, disabled, locked, dirty, saving, and error states.
- [x] Replace noisy panels with collapsible SmartDraw-style sections.
- [x] Improve tooltips so every primary action explains itself.
- [x] Make object insertion more intuitive with search, recent tools, favorites, and drag previews.
- [x] Fix the broken compass/minimap control and add a regression check for it.
- [x] Repo-local: Sharpen key editor overlay corners for compass, minimap, dockable toolbars, action dock, and admin stats.
- [ ] Sharpen remaining UI corners across cards, panels, menus, modals, drawers, buttons, and compact controls.
- [ ] Add consistent cursor feedback for draw, select, pan, resize, rotate, drag, and invalid-drop states.
- [x] Tune animations for panel open, hover reveal, selection, and toast transitions without slowing editing.

Exit criteria:

- [ ] A first-time user can create a room, add desks, assign one person, and export without help text.
- [x] Hover/focus states are visible and consistent across the app.
- [ ] Canvas and panels look professional against SmartDraw/Lucidchart/Visio-class expectations.

## Phase 4 - Editor Depth And Object Modification

- [x] Expand Properties panel controls for every object type.
- [x] Add batch edit for common multi-select properties.
- [x] Add lock/unlock, duplicate, align, distribute, group, ungroup, bring forward/back, and delete affordances.
- [x] Add precise numeric controls for position, size, rotation, wall thickness, room capacity, and labels.
- [x] Add object validation warnings for broken assignments and missing metadata.
- [x] Add templates for common O&O space patterns.
- [x] Expand all remaining toolbars into movable/dockable controls or document why they must stay fixed.
- [x] Expand the admin stats toolbar into a production-useful operations HUD baseline.
- [x] Add explicit admin conflict/recovery shortcuts and audit drilldowns to the HUD.
- [x] Rebuild first professional block families from MillerKnoll and Steelcase references, with BIMobject only for gaps.

Exit criteria:

- [x] Admin/planner can modify all key object attributes without editing JSON.
- [x] Multi-select editing works predictably.
- [ ] Properties panel has regression tests for each supported object type.

## Phase 5 - Main-Site Integration

- [x] Build with `npm run build:oando`.
- [ ] Host-only: Serve `dist/` under the main site's `/OandOcraft/` path.
- [ ] Host-only: Configure the host to return the app `index.html` for nested client routes.
- [x] Scope app CSS so it does not leak into the main site.
- [x] Confirm direct refresh works for `/OandOcraft/login`, `/OandOcraft/dashboard`, and office routes.
- [ ] Host-only: Confirm Supabase auth redirects land back under `/OandOcraft/`.

Exit criteria:

- [ ] Host-only: `https://oando.co.in/OandOcraft/` opens the app.
- [ ] Host-only: Nested routes refresh without 404.
- [ ] Host-only: Main site styling is unaffected.
- [ ] Host-only: App styling is unaffected by the main site.

## Phase 6 - Quality, Security, And Release

- [ ] Repo-local: Run full lint/build/test/page audit.
- [ ] Repo-local: Add browser smoke tests for key local routes.
- [ ] Repo-local: Add security review for RLS, auth redirects, service-role usage, and public routes.
- [ ] Repo-local: Add rollback instructions with artifact name, location, retention, restore command/path, and rollback decision owner.
- [ ] Repo-local: Add release checklist covering release artifact generation, checksum/version label, changelog update, runbook execution, production smoke test, rollback artifact, and post-release record.
- [ ] Repo-local: Add changelog entry/template with summary, user-visible changes, operational steps, known issues, verification, and rollback notes.
- [ ] Host-only: Owner sign-off is recorded.
- [ ] Host-only: Push final phase commit.

Exit criteria:

- [ ] Clean worktree.
- [ ] All checks pass or failures are documented with exact blockers.
- [ ] Release notes explain user-visible changes and operational steps.
- [ ] Host-only: Live production smoke test passes on `https://oando.co.in/OandOcraft/`.

## Repo-Local Completion Track

- Finish remaining UI, block-library, editor, test, documentation, release artifact, changelog, rollback, and runbook items that can be changed and verified in this repository.
- Treat local `/OandOcraft/` build and browser smoke coverage as the repo-local release gate before handoff.
- Record any failed local checks with exact command, failure, and owner before asking for host access.

## Current Host-Only Blockers

- GitHub branch protection, required checks, push/final remote state, and owner sign-off require repository admin or owner access.
- Production host must serve `dist/` at `/OandOcraft/`, rewrite nested routes, isolate app/main-site assets, and verify security headers.
- Supabase production Site URL, redirect allow-list, and Edge Function `APP_URL` must be changed in the hosted project.
- Hosted database row-count capture and duplicate-office cleanup require hosted database credentials/access.
- Live production smoke tests, Supabase auth redirect verification, admin recovery verification, and end-to-end production flow require the production host or approved staging environment.
