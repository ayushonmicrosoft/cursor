# OandOcraft Project Workflow

Purpose: keep OandOcraft execution disciplined while the app is being overhauled from a Floorcraft-derived planner into a controlled O&O workplace planning product.

Primary target: `https://oando.co.in/OandOcraft/`

## 1. Operating Rules

- Work on `main` unless the repository process changes.
- Keep the worktree clean after each completed task.
- Commit every finished change.
- Do not commit secrets, service-role keys, production database URLs, or personal tokens.
- Treat the app as one O&O workspace with named internal or approved external users.
- Treat anonymous sharing as legacy or exceptional behavior, not the default product workflow.
- Keep light mode as the default and dark mode as an explicit option.
- Keep `/OandOcraft/` as the production base path until a different deployment model is approved.

## 2. Daily Start Workflow

1. Check current branch and worktree:

```bash
git status --short
git branch --show-current
```

2. Review the active planning docs:

```bash
docs/plans/OandOcraft_PHASE_CHECKLIST.md
docs/plans/OandOcraft_OVERHAUL_MASTER_PLAN.md
docs/guide/OandOcraft_MAIN_SITE_INTEGRATION.md
docs/plans/OandOcraft_BLOCK_LIBRARY_SOURCES.md
```

3. Pick one phase or one small cross-phase slice.

4. Confirm which checks are needed before editing:

- docs only: at least review changed files and run a lightweight status check
- UI behavior: lint, tests for touched behavior, build
- routing or deployment: build:oando and route smoke checks
- Supabase or security: seed verification, SQL/RLS checks, and manual review

## 3. Implementation Workflow

### Step 1 - Understand

- Read the files already responsible for the behavior.
- Search for existing helpers before adding new ones.
- Preserve established app patterns unless there is a clear reason to change them.
- For UI work, inspect both the component and the store/state path that feeds it.

### Step 2 - Change

- Keep edits close to the affected module.
- Avoid broad refactors unless the task is explicitly architectural.
- Update tests when behavior changes.
- Update docs when workflow, deployment, or operational behavior changes.

### Step 3 - Verify

Use the smallest useful verification set:

```bash
npm run lint
npm run test
npm run build
npm run build:oando
```

Use these when relevant:

```bash
npm run audit:pages
npm run seed:verify
npm run seed:counts
```

### Step 4 - Commit

```bash
git status --short
git add <changed-files>
git commit -m "<concise change summary>"
git status --short
```

The final `git status --short` should be clean.

## 4. UI/UX Workflow

The product target is a premium, restrained SmartDraw-like planning tool.

Current UI priorities:

- Fix the broken compass/minimap control shown over the canvas.
- Move the app away from overly rounded, soft shapes toward sharper professional corners.
- Keep cards at 8px radius or less unless a local component requires otherwise.
- Reduce noisy chrome so the canvas is visually primary.
- Keep dockable toolbars useful, keyboard accessible, and visually stable.
- Make hover, active, selected, disabled, locked, dirty, saving, and error states obvious.
- Add truthful cursor feedback for pan, select, draw, drag, resize, rotate, and invalid actions.
- Avoid explanatory feature text inside the app; controls should be self-evident through layout, icons, and tooltips.

UI verification:

- desktop and mobile layout does not overflow horizontally
- toolbars do not cover critical canvas controls
- the compass/minimap control renders in the correct position and responds as expected
- selection and hover states remain readable in light and dark modes
- sharp-corner styling does not break modals, drawers, or dense controls

## 5. Block Library Workflow

Source order:

1. MillerKnoll
2. Steelcase
3. BIMobject for gaps only

Implementation rules:

- Use manufacturer assets as reference material, not as raw pasted imports.
- Normalize every object into the OandOcraft SVG/Konva style.
- Keep one stroke system and one top-view geometry language.
- Prioritize readable plan symbols over decorative detail.
- Preserve realistic proportions for circulation and capacity planning.

First block families:

- workstations and benching
- private offices
- meeting tables
- phone booths and focus pods
- lounge and reception
- storage, lockers, printer bays, and facilities

## 6. Supabase Workflow

Before changing data behavior:

- Identify the table, RLS policy, repository helper, and UI path involved.
- Confirm whether the behavior uses Auth user identity, team membership, office permission, or admin override.
- Avoid service-role usage in client-facing code.

Data commands:

```bash
npm run seed:counts
npm run seed:verify
```

Seed expectations:

- floor payloads include actual walls, rooms, doors, windows, desks, furniture, employees, annotations, neighborhoods, and assignments
- data is not headings-only
- demo-only duplicates are removed when real hosted data exists
- demo accounts remain clearly non-production

## 7. Main-Site Integration Workflow

Production model:

- build OandOcraft with `npm run build:oando`
- deploy `dist/` under `/OandOcraft/`
- serve assets directly
- rewrite client routes to `/OandOcraft/index.html`
- configure Supabase redirects under `/OandOcraft/`

Do not inline the app inside a main-site page while the product is still stabilizing.

Smoke test after deployment:

- `/OandOcraft/`
- `/OandOcraft/login`
- `/OandOcraft/dashboard`
- `/OandOcraft/t/<team>/o/<office>/map`
- `/OandOcraft/auth/verify`
- `/OandOcraft/auth/reset`
- `/OandOcraft/invite/<token>`

## 8. Release Workflow

Release candidate requirements:

- clean worktree
- committed changes
- lint passes or known warnings are documented
- tests pass
- `build:oando` passes
- route refresh works under `/OandOcraft/`
- Supabase redirect URLs are configured
- rollback artifact exists

Release notes should include:

- user-visible UI changes
- data or permission changes
- deployment steps
- known risks
- rollback instructions

## 9. Emergency Workflow

Broken production route:

1. Restore previous `dist/` artifact.
2. Confirm `/OandOcraft/`, `/login`, `/dashboard`, and one office route.
3. Check host rewrite changes.
4. Check asset path changes.

Broken auth:

1. Confirm Supabase Site URL.
2. Confirm redirect allow-list.
3. Confirm Edge Function `APP_URL`.
4. Confirm browser URL remains under `/OandOcraft/`.

Bad data or failed seed:

1. Stop further writes if hosted data is affected.
2. Capture table counts.
3. Identify the migration or seed step.
4. Restore from backup only after confirming the scope of corruption.

Broken editor save:

1. Check client console and Supabase response.
2. Use office history recovery if needed.
3. Confirm RLS role and office permission.
4. Confirm payload size and schema version.

