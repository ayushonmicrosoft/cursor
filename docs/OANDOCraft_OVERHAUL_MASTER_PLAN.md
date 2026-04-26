# OandOCraft Overhaul Master Plan

Audit date: 2026-04-26

## Executive Summary

OandOCraft should be treated as a productization and integration program, not a visual reskin. The current app is a mature React 19, TypeScript, Supabase, Konva office-planning SPA with strong unit coverage, a working hosted demo dataset, and a credible RLS/security foundation. The largest gaps are brand consistency, bundle/runtime performance, large component maintainability, production observability, end-to-end coverage, and integration packaging for a non-Vite main site.

The correct target is:

- A polished O&O-branded planning product with no public pricing surface.
- A reusable app module that can run standalone, under a subpath, or inside the main non-Vite site.
- A hardened Supabase-backed workspace system with repeatable seeding, RLS tests, route audits, and deployment checks.
- A maintainable editor architecture where canvas, roster, reporting, and team-management areas can evolve independently.

## External Reference Context

Primary GitHub reference:

- Repository: https://github.com/rcasto123/Floorcraft
- Changelog: https://github.com/rcasto123/Floorcraft/blob/main/CHANGELOG.md
- README: https://github.com/rcasto123/Floorcraft/blob/main/README.md
- Security policy: https://github.com/rcasto123/Floorcraft/blob/main/SECURITY.md

Local O&O theme reference found during audit:

- `E:\oando-suite-oando\oando.co.in\src\app\theme-tokens.css`
- `E:\oando-suite-oando\oando.co.in\src\app\homepage.css`
- `E:\oando-suite-oando\oando.co.in\src\app\planner.tokens.css`

The requested `E:\claude1703` folder was not present. The available O&O reference uses midnight navy, bronze, glass surfaces, soft off-white backgrounds, and disciplined enterprise UI spacing.

## Audit Findings

### Current Strengths

- Core app passes production build.
- Full test suite passes: 234 test files and 1,539 tests.
- Strong feature surface: multi-floor editor, wall/door/window tools, employee management, CSV import/export, reports, insights, presentation mode, permissions, share links, and Supabase sync.
- Route tree is already lazy-loaded with React Router.
- Supabase migrations include RLS policies, security fixes, audit events, share tokens, invite preview, account export/deletion, and conflict overwrite history.
- Netlify config already includes SPA fallback and basic security headers.
- Existing README and changelog describe a credible v1.0.0 baseline.
- Local dev server is running on `http://127.0.0.1:5173`.

### Current Weaknesses

- Branding is inconsistent. Public landing has started moving to OandOCraft, but many auth, help, editor, document title, export, invite, share, and test surfaces still say Floorcraft.
- Pricing removal is incomplete. Landing nav no longer has Pricing, but Help content still contains pricing copy.
- Page title still says Floorcraft in `index.html` and many protected routes.
- The app is Vite-first, but the main site is not. Integration needs a planned packaging boundary.
- Several components are too large to maintain safely:
  - `RosterPage.tsx` is about 140 KB.
  - `HelpPage.tsx` is about 92 KB.
  - `CanvasStage.tsx` is about 63 KB.
  - `PropertiesPanel.tsx`, `ElementLibrary.tsx`, and `RosterDetailDrawer.tsx` are each over 40 KB.
- Build output still has a large `ProjectShell` chunk, approximately 555 KB minified and 170 KB gzip.
- Lint passes with warnings only, but the warnings are cleanup debt from unused eslint-disable comments.
- The app has broad unit/component coverage but lacks a committed end-to-end route audit workflow until this pass added `npm run audit:pages`.
- Supabase payload strategy stores large office state in JSONB. This works now, but long-term scaling needs derived thumbnails, version history discipline, and payload-size budgets.
- Share-token policy allows anonymous select of live token rows. This is intentional, but should be periodically threat-modeled because bearer links are a public access surface.
- Main-site integration headers need explicit planning. `/share/*` is intentionally embeddable, but the full app should not be broadly framed unless required.

## Definition Of World-Standard

OandOCraft should meet these standards before launch:

- Brand: every visible surface uses OandOCraft and O&O tokens consistently.
- Security: no accidental secret exposure, tested RLS, hardened CSP/referrer/frame policies, documented incident process.
- Performance: initial non-editor routes stay lean; editor chunking is deliberate; route-level budgets are enforced.
- Reliability: build, lint, unit tests, Supabase tests, and page audit are part of CI.
- Accessibility: keyboard paths, modal focus, color contrast, and reduced-motion behavior are audited.
- Data integrity: conflict handling, seed data, import/export, role permissions, and share links are covered by tests.
- Integration: the app can be mounted in the main non-Vite environment without leaking global CSS or breaking routing.

## Phase 0: Stabilize The Current Branch

Goal: make the current partial rebrand safe and measurable.

Tasks:

- Finish replacing visible `Floorcraft` with `OandOCraft` across source, tests, metadata, export watermarks, document titles, help content, invite/share pages, and README.
- Keep historical repository links as `rcasto123/Floorcraft` where they are source references.
- Remove visible pricing copy from public and help surfaces.
- Update package name from `floocraft` to `oandocraft` if this repository is becoming the canonical app package.
- Keep legacy storage keys only if changing them would break existing user data. If renamed, add migration code.
- Run `npm run lint`, `npm run build`, `npm run test`, and `npm run audit:pages`.
- Commit only after all expected gates pass or failures are documented.

Acceptance:

- `rg -n "Floorcraft|Pricing|pricing" src README.md index.html` returns only historical/source-reference exceptions.
- Browser route audit has no page errors and no unexpected console warnings.
- Dev server opens to the OandOCraft-branded landing page.

## Phase 1: O&O Design System

Goal: convert the app from ad-hoc Tailwind color usage to a formal O&O design language.

Tasks:

- Create `src/lib/brand/tokens.ts` or `src/styles/brand.css` with semantic tokens:
  - `brand.navy`
  - `brand.midnight`
  - `brand.bronze`
  - `surface.page`
  - `surface.panel`
  - `surface.glass`
  - `text.heading`
  - `text.body`
  - `border.soft`
  - `focus.ring`
- Replace broad utility overrides like `.bg-blue-600` with component-level semantic classes.
- Update landing, auth, dashboard, team pages, editor shell, modals, and exports to use tokens.
- Define typography rules. Avoid generic default font stacks for public pages; preserve readable app UI fonts for dense editor surfaces.
- Build a small visual inventory page for buttons, cards, forms, modals, badges, data tables, canvas controls, and empty states.
- Add contrast checks for light and dark mode.

Acceptance:

- No user-facing primary action depends on raw blue/indigo Tailwind classes.
- Public pages match O&O navy/bronze/off-white direction.
- Editor remains dense and functional without marketing-page styling overreach.

## Phase 2: Main Site Integration Strategy

Your main site does not use Vite, so do not directly merge the Vite app into it without a boundary. Choose one of these integration models.

### Recommended: Standalone App Under Subdomain Or Subpath

Use this when the main site is a marketing/corporate site and OandOCraft is a full authenticated product.

Options:

- Subdomain: `planner.oando.co.in` or `craft.oando.co.in`
- Subpath reverse proxy: `oando.co.in/craft/*`

Implementation:

- Keep OandOCraft built independently.
- Deploy static `dist/` to Netlify, Vercel static hosting, S3/CloudFront, Nginx, or your existing host.
- Configure SPA fallback to `index.html`.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build time.
- Set Supabase Auth redirect URLs for the final domain.
- Set Edge Function `APP_URL` to the final public URL.
- If hosted under a subpath, set Vite `base: "/craft/"` and React Router basename to `/craft`.

Pros:

- Lowest risk.
- Keeps build systems independent.
- Easier auth redirects and cache control.
- Does not contaminate main-site CSS or routing.

Cons:

- Needs routing/proxy setup.
- Shared header/footer must be duplicated or loaded as a shared shell.

### Good Alternative: Micro-Frontend Module

Use this when the main site must render the planner inside its own application shell.

Implementation:

- Refactor `src/main.tsx` into:
  - `src/bootstrap.tsx` for standalone startup.
  - `src/OandOCraftApp.tsx` exporting a mountable React component.
- Build a library output or module-federated remote.
- Let the main site load OandOCraft as a remote bundle and mount it into a dedicated DOM node.
- Namespace all global CSS under an app root like `.oandocraft-app`.
- Use memory routing or a controlled basename to avoid conflicting with the host router.

Pros:

- Strong main-site integration.
- Shared top navigation and account chrome are possible.

Cons:

- Higher complexity.
- Host React version compatibility matters.
- Tailwind/global CSS collision risk must be managed.

### Avoid Initially: Rebuild Directly Inside The Main Site

Only do this if the main site is already React-compatible and you are willing to migrate the planner build stack.

Risks:

- Tailwind v4 setup must be replicated.
- Vite-specific environment variable names and build assumptions must change.
- React Router and host routing can conflict.
- Canvas/editor bundle can hurt main-site performance if not isolated.

## Phase 3: Routing And Deployment Hardening

Tasks:

- Add `APP_BASENAME` support for subpath deployment.
- Add route metadata management so titles no longer rely on scattered `document.title` calls.
- Create deployment profiles:
  - `standalone`
  - `subpath`
  - `embedded`
- Document required redirects:
  - `/* -> /index.html` for standalone SPA.
  - `/craft/* -> /craft/index.html` for subpath SPA.
- Document headers:
  - strict referrer policy for invite/auth links.
  - frame restrictions for the full app.
  - explicit frame allowance only for intended embed/share paths.
- Validate Supabase Auth redirect URLs for login, signup, invite, reset, and verify flows.

Acceptance:

- App works at root and at `/craft/`.
- Auth callbacks work in both configurations.
- Share/embed routes preserve intended framing behavior.

## Phase 4: Performance And Bundle Architecture

Tasks:

- Split `ProjectShell` responsibilities:
  - loader/data boundary
  - editor layout
  - route outlet chrome
  - autosave/conflict orchestration
  - keyboard/presentation bindings
- Split `CanvasStage` into pointer tools, layer composition, viewport controls, and render layers.
- Split `RosterPage` into filter bar, virtual table, import/export, bulk actions, drawers, and stats.
- Move large help content into structured data files and lazy-render sections.
- Dynamically import heavy export dependencies only when export is opened.
- Add bundle budget reporting.
- Add Playwright route timings and console-error checks.
- Consider canvas virtualization/culling for very large floor plans.

Acceptance:

- No route chunk exceeds agreed size without explicit exception.
- Landing/auth pages do not load Konva.
- Editor interaction remains smooth on large demo offices.

## Phase 5: Data And Supabase Maturity

Tasks:

- Add typed Supabase database schema generation.
- Replace `any` casts around Supabase joins with generated types or narrow mappers.
- Add migrations/tests for:
  - invite role handling
  - share token revocation
  - public/private office visibility
  - owner/editor/viewer permissions
  - audit-event insertion and visibility
- Add seed modes:
  - `minimal`
  - `demo`
  - `full`
  - `oando`
- Add a repeatable remote seed script that uses safe upserts and can be rerun.
- Track office payload size and add warnings when a payload crosses defined thresholds.
- Consider normalized tables for high-churn subdomains if JSONB payloads become too large:
  - employees
  - seats
  - reservations
  - annotations
  - audit events already normalized

Acceptance:

- Local reset recreates the same demo workspace every time.
- Remote seed can be rerun without duplicating rows.
- RLS tests cover every public and role-gated route assumption.

## Phase 6: Security Program

Tasks:

- Update `SECURITY.md` for OandOCraft/O&O reporting process.
- Add dependency audit policy and triage owner.
- Confirm no service role key is ever bundled.
- Add CSP tailored to final deployment.
- Threat-model share links and invite links.
- Make token expiry/revocation explicit in UI.
- Add server-side rate limits for invite and any public token preview paths.
- Add audit events for security-sensitive actions:
  - role changes
  - invite create/revoke
  - share token create/revoke
  - office privacy changes
  - force overwrite
  - exports

Acceptance:

- Security policy matches final brand and domain.
- CI runs dependency checks.
- Public token behavior is documented and tested.

## Phase 7: Product UX Overhaul

Tasks:

- Landing:
  - remove all pricing language.
  - position product as internal O&O planning infrastructure.
  - add demo/workflow proof instead of generic SaaS claims.
- Auth:
  - O&O-branded shell.
  - clear demo/admin login affordance only in non-production.
  - improved invalid-login feedback.
- Dashboard:
  - better office cards with live thumbnails.
  - stronger empty states and next actions.
- Editor:
  - simplify toolbar hierarchy.
  - use O&O tokens for selected state, focus, danger, success, warning.
  - reduce layer count and canvas console warnings.
  - improve mobile/narrow-screen fallbacks.
- Roster:
  - table density controls.
  - saved views.
  - import wizard clarity.
- Reports:
  - executive-ready summaries.
  - exportable report snapshots.
- Help:
  - replace giant inline content with a maintainable knowledge base structure.
  - remove pricing content.
  - add OandOCraft-specific integration and admin docs.

Acceptance:

- Every primary workflow can be completed without console errors.
- First-time user can create/open office, seed demo, edit plan, assign people, share view, and export.
- Visual language matches O&O reference.

## Phase 8: Quality Gates And CI

Tasks:

- CI jobs:
  - install
  - lint
  - typecheck/build
  - unit/component tests
  - Supabase SQL tests
  - page audit
  - dependency audit
- Add screenshots for key routes:
  - landing
  - login
  - team home
  - map
  - roster
  - reports
  - share
  - invite
- Add regression checks:
  - no public Pricing label.
  - no visible Floorcraft label except historical links.
  - no Konva layer warnings.
  - no route-level error text.
- Add PR checklist and release checklist.

Acceptance:

- A failed route, brand regression, or security header regression blocks merge.
- Release artifacts include changelog and deployment notes.

## Phase 9: Rollout Plan

Sequence:

1. Finish rebrand and pricing removal.
2. Add integration mode support for root and `/craft/`.
3. Deploy staging app connected to staging Supabase.
4. Run full seed and route audit in staging.
5. Integrate with main site using subdomain or reverse-proxied subpath.
6. Validate auth callback URLs and invite links.
7. Run accessibility and security pass.
8. Cut `v1.1.0-oandocraft` or equivalent release.
9. Monitor errors, auth failures, invite failures, and save conflicts.

Rollback:

- Keep existing Floorcraft deployment untouched until OandOCraft staging is signed off.
- Use DNS or reverse-proxy rollback for subdomain/subpath.
- Keep Supabase migrations additive where possible.
- Backup hosted DB before any destructive seed or migration.

## Immediate Next Actions

1. Complete all visible branding and pricing cleanup.
2. Decide integration model: standalone subdomain, subpath reverse proxy, or micro-frontend.
3. Add basename/build-profile support if subpath or embedded mode is chosen.
4. Refactor the largest files in priority order: `ProjectShell`, `RosterPage`, `CanvasStage`, `HelpPage`.
5. Promote `npm run audit:pages` into CI after staging credentials are configured.
6. Update README, SECURITY, CHANGELOG, and deployment documentation for OandOCraft.

