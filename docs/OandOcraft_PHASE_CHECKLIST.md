# OandOcraft Phase Checklist

Owner model: single-agent execution only. Do not split work across multiple agents unless this document is explicitly changed.

Target deployment: `https://oando.co.in/OandOcraft/`.

Product scope: one O&O workspace, internal and approved external people, direct person-level access, no anonymous sharing-first workflow.

## Phase 0 - Repo, Deployment, And Ground Rules

- [x] Create remote repo named `OandOcraft`.
- [x] Push current `main` to the new remote.
- [x] Preserve the old `rcasto123/Floorcraft` remote as historical upstream context.
- [x] Rename visible product/package identity to `OandOcraft` / `oandocraft`.
- [x] Make light mode the default while keeping dark mode available.
- [x] Add a repeatable `/OandOcraft/` subpath build path.
- [ ] Document main-site rewrite rules for `oando.co.in/OandOcraft/* -> /OandOcraft/index.html`.
- [ ] Add Supabase redirect URLs for `/OandOcraft/auth/verify`, `/OandOcraft/auth/reset`, and invite acceptance.
- [ ] Confirm production env vars for the O&O host.

Exit criteria:

- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] `npm run build:oando` passes and emits assets for `/OandOcraft/`.
- [x] `npm run test` passes.
- [ ] Git worktree is clean and pushed to `OandOcraft`.

## Phase 1 - Access Model And Admin Powers

- [ ] Replace sharing-first language with direct person access in UI copy.
- [ ] Keep invite flow for named internal/external users.
- [ ] Stop presenting anonymous share links as a primary workflow.
- [ ] Make team admins owner-equivalent for all offices in RLS.
- [ ] Make team admins resolve as `owner` in client permission checks.
- [ ] Add admin controls for office visibility, person role, revoke access, recover history, and force-save.
- [ ] Add audit events for admin changes.
- [ ] Add RLS tests for admin read/update on private offices.

Exit criteria:

- [ ] Named internal/external users can be invited and permissioned.
- [ ] Admins can modify any office without manual office-owner rows.
- [ ] Viewers cannot edit offices.
- [ ] Anonymous sharing is disabled or clearly relegated to a controlled legacy path.

## Phase 2 - Full Supabase Data Load

- [ ] Decide source of truth: hosted Supabase dump, local seed, or curated MIT dataset import.
- [ ] Run the full-data seed generator against the hosted database using `SEED_DB_URL`.
- [ ] Verify every public table row count before and after seed generation.
- [ ] Confirm office payloads include all floors, elements, employees, neighborhoods, annotations, and assignments.
- [ ] Remove demo-only duplicate office clones if the hosted dump already contains real offices.
- [ ] Rename seed demo emails/domains from `floorcraft.local` to `oandocraft.local`.
- [ ] Add a seed verification script that fails when payload headings exist but floor objects are missing.

Exit criteria:

- [ ] `supabase/seed.sql` includes full office payload JSON, not headings-only data.
- [ ] Local reset loads floor-plan components, people, seats, and assignments.
- [ ] Seed verification reports non-zero objects for walls, desks, rooms, doors, windows, furniture, employees, and annotations.

## Phase 3 - SmartDraw-Level UI/UX Foundation

- [ ] Redesign the editor shell around a clean canvas, restrained chrome, and professional spacing.
- [ ] Add better hover states for toolbar buttons, library cards, canvas objects, rows, tabs, and panel controls.
- [ ] Add obvious selected, focused, disabled, locked, dirty, saving, and error states.
- [ ] Replace noisy panels with collapsible SmartDraw-style sections.
- [ ] Improve tooltips so every primary action explains itself.
- [ ] Make object insertion more intuitive with search, recent tools, favorites, and drag previews.
- [ ] Add consistent cursor feedback for draw, select, pan, resize, rotate, drag, and invalid-drop states.
- [ ] Tune animations for panel open, hover reveal, selection, and toast transitions without slowing editing.

Exit criteria:

- [ ] A first-time user can create a room, add desks, assign one person, and export without help text.
- [ ] Hover/focus states are visible and consistent across the app.
- [ ] Canvas and panels look professional against SmartDraw/Lucidchart/Visio-class expectations.

## Phase 4 - Editor Depth And Object Modification

- [ ] Expand Properties panel controls for every object type.
- [ ] Add batch edit for common multi-select properties.
- [ ] Add lock/unlock, duplicate, align, distribute, group, ungroup, bring forward/back, and delete affordances.
- [ ] Add precise numeric controls for position, size, rotation, wall thickness, room capacity, and labels.
- [ ] Add object validation warnings for broken assignments and missing metadata.
- [ ] Add templates for common O&O space patterns.

Exit criteria:

- [ ] Admin/planner can modify all key object attributes without editing JSON.
- [ ] Multi-select editing works predictably.
- [ ] Properties panel has regression tests for each supported object type.

## Phase 5 - Main-Site Integration

- [ ] Build with `npm run build:oando`.
- [ ] Serve `dist/` under the main site's `/OandOcraft/` path.
- [ ] Configure the host to return the app `index.html` for nested client routes.
- [ ] Scope app CSS so it does not leak into the main site.
- [ ] Confirm direct refresh works for `/OandOcraft/login`, `/OandOcraft/dashboard`, and office routes.
- [ ] Confirm Supabase auth redirects land back under `/OandOcraft/`.

Exit criteria:

- [ ] `https://oando.co.in/OandOcraft/` opens the app.
- [ ] Nested routes refresh without 404.
- [ ] Main site styling is unaffected.
- [ ] App styling is unaffected by the main site.

## Phase 6 - Quality, Security, And Release

- [ ] Run full lint/build/test/page audit.
- [ ] Add browser smoke tests for key routes.
- [ ] Add security review for RLS, auth redirects, service-role usage, and public routes.
- [ ] Add rollback instructions.
- [ ] Add release checklist and owner sign-off.
- [ ] Push final phase commit.

Exit criteria:

- [ ] Clean worktree.
- [ ] All checks pass or failures are documented with exact blockers.
- [ ] Release notes explain user-visible changes and operational steps.
