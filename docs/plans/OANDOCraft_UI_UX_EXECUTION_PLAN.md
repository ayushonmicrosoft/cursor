# OandOcraft UI/UX Plan

Date: 2026-04-27

## Purpose

This plan is only for UI and UX. It does not cover backend security, auth bypasses, database policy, or implementation internals unless they directly affect what the user sees or how the product feels.

The target is a product experience that feels clear, polished, credible, and easy to evaluate:

- A visitor understands the product quickly.
- A logged-in user can reach a useful sample office without confusion.
- The map editor feels powerful but not overwhelming.
- The blocks, floor plan, and 2.5D view look intentional rather than rough.
- The roster and map work together as one workflow.
- Every first-run screen has an obvious next action.

## Current Completion Snapshot

- Complete: phases 1-4, 7, 9, and 10.
- Still open: phases 5, 6, 8, and 11-20.
- Phase checkboxes below remain the source of truth for item-level status.

## Current UI/UX Problems

1. The product says "See a demo" but sends users to help content instead of a real demo.
2. Route loading uses a generic full-screen spinner, which makes the app feel stuck.
3. The empty dashboard has the right actions, but the sample-office path needs stronger presentation.
4. The first map-editor viewport is too busy: top bar, floor tabs, tools, layers, library, canvas controls, admin HUD, right sidebar, welcome card, and notification all compete.
5. The blocks/floor-plan visuals need refinement. They currently read as rough UI objects rather than a polished spatial planning surface.
6. 2.5D needs product-quality presentation and cross-window verification. The user reports it works in the active browser window, so the plan is to polish and verify it, not assume it is broken.
7. Roster is feature-rich but dense.
8. Visual language is inconsistent between landing, dashboard, roster, and editor.
9. Mobile/tablet behavior needs explicit QA instead of being assumed.
10. Auth and onboarding screens need to feel like part of the same product, not detached forms.
11. Help content is useful, but it currently carries too much of the demo burden.
12. Reports, audit, settings, account, and share surfaces need the same level of hierarchy and finish as the map editor.
13. Keyboard shortcuts, command palette, tooltips, and first-run guidance need one coherent discovery model.
14. Accessibility and responsive behavior need explicit UI acceptance criteria.

## Full UI/UX Scope Map

This plan includes the following surfaces:

- Public landing page.
- Help and guide pages.
- Login, signup, forgot password, reset password, and verification states.
- Team onboarding.
- Empty dashboard and populated dashboard.
- Sample-office entry and sample-office reset expectations.
- Office shell/top navigation.
- Map editor.
- Floor tabs and floor management.
- Blocks, seats, rooms, walls, furniture, labels, neighborhoods, and overlays.
- 2.5D review mode.
- Roster list and card views.
- Reports and insights.
- Audit log.
- Reservations and scenarios where visible.
- Team settings and member management UI.
- Account/profile UI.
- Share modal, public share page, and embed experience.
- Command palette, shortcuts, tooltips, toasts, modals, and error/empty/loading states.
- Responsive behavior across mobile, tablet, laptop, and desktop.
- Light and dark themes.

## Design Principles

1. Show the product before explaining it.
2. Reduce first-load noise.
3. Keep expert controls available, but collapsed until needed.
4. Make the canvas the visual center of the editor.
5. Use familiar tool patterns: icons for tools, segmented controls for modes, tabs for views, menus for secondary options.
6. Make every empty state move the user forward.
7. Treat 2.5D as a presentation/review mode, not a half-finished duplicate editor.
8. Make blocks visually meaningful: seats, rooms, walls, neighborhoods, and furniture should be distinguishable at a glance.

## Phase 1: Landing Page And Demo Entry

### Goal

Make the public website honest, visual, and product-led.

### Work

- Replace the "See a demo" destination with a real demo or rename it if it remains help content.
- Put a real product preview higher on the page.
- Reduce generic marketing language.
- Remove, replace, or clearly qualify fake customer logos.
- Make authenticated landing behavior direct users back into the workspace.
- Ensure the hero has a clear next action and a visible hint of the product.

### Checklist

- [x] Audit all landing CTAs.
- [x] Make "See a demo" open an actual demo path or rename it.
- [x] Add a stronger above-the-fold product visual.
- [x] Replace fake-logo trust strip or mark it as illustrative.
- [x] Tighten hero copy.
- [x] Check landing in light theme.
- [x] Check landing in dark theme.
- [x] Check landing at mobile width.

## Phase 2: Loading And First Impressions

### Goal

Remove the feeling that the app is stuck or blank during navigation.

### Work

- Replace the generic full-screen spinner with route-specific skeletons.
- Use different loading states for auth, dashboard, roster, map, and help.
- Add a clear fallback state if team or office loading takes too long.
- Keep layout shape stable while loading.

### Checklist

- [x] Create auth loading skeleton.
- [x] Create dashboard loading skeleton.
- [x] Create roster loading skeleton.
- [x] Create editor loading skeleton.
- [x] Add slow-load recovery copy.
- [x] Test direct dashboard load.
- [x] Test direct map load.
- [x] Test reload from map.

## Phase 3: Dashboard And Sample Office

### Goal

Make the empty team dashboard a strong onboarding moment.

### Work

- Present three clean actions:
  - Create office.
  - Try sample office.
  - Import data.
- Show what the sample office includes before the user opens it.
- After sample creation, route the user to the best first experience.
- Add a clear success message after the sample office opens.
- Make reset/delete expectations clear if sample data is created.

### Checklist

- [x] Redesign empty dashboard hierarchy.
- [x] Add sample-office preview metadata.
- [x] Make "Try sample office" visually clear.
- [x] Confirm sample office landing page is intentional.
- [x] Add success message after sample creation.
- [x] Check empty dashboard on desktop.
- [x] Check empty dashboard on mobile.

## Phase 4: Editor First-Load UX

### Goal

Make the first editor screen calm, legible, and canvas-focused.

### Work

- Collapse admin operations by default.
- Collapse secondary library categories by default.
- Keep layers available but visually quieter.
- Do not show welcome tour, restore toast, admin HUD, and right sidebar all as competing first-load elements.
- Hide or minimize right sidebar when nothing is selected.
- Make floor tabs visually distinct from global navigation.
- Keep the first visible task obvious: inspect the plan, select an object, or pan/zoom.

### Checklist

- [x] Define default panel states.
- [x] Collapse admin HUD on first load.
- [x] Collapse nonessential library sections.
- [x] Reduce welcome tour prominence.
- [x] Move notifications away from primary canvas focus.
- [x] Hide empty properties panel where appropriate.
- [x] Check first editor viewport at 1280px.
- [x] Check first editor viewport at 1440px.
- [x] Check first editor viewport on tablet/mobile.

## Phase 5: Blocks And Floor-Plan Visual Quality

### Goal

Make the blocks and floor-plan objects look professional, readable, and spatially meaningful.

### Work

- Review visual treatment for:
  - walls
  - rooms
  - desks
  - hot desks
  - private offices
  - conference rooms
  - furniture
  - neighborhoods
  - labels
- Improve contrast between structural elements and movable furniture.
- Make selected, hovered, locked, assigned, unassigned, and warning states visually distinct.
- Reduce visual clutter from labels at lower zoom levels.
- Add zoom-aware label behavior.
- Improve block shadows, borders, fills, and spacing so objects do not look flat or accidental.
- Ensure color is meaningful, not decorative noise.

### Checklist

- [ ] Audit every block/object type on the sample office.
- [ ] Define visual hierarchy for structure vs furniture vs people data.
- [ ] Improve desk/seat block styling.
- [ ] Improve room block styling.
- [ ] Improve neighborhood styling.
- [ ] Improve selected and hover states.
- [ ] Improve assigned/unassigned states.
- [ ] Add zoom-aware label rules.
- [ ] Verify readability at 50%, 100%, and 150% zoom.
- [ ] Verify light theme canvas.
- [ ] Verify dark theme canvas.

## Phase 6: 2.5D UX And Presentation Quality

### Goal

Make 2.5D feel like a polished review mode.

### Work

- Treat 2.5D as a visual review/presentation mode, not a full editing replacement.
- Make the switch between 2D and 2.5D obvious and reversible.
- Improve 2.5D object proportions so blocks do not look arbitrary.
- Improve materials, lighting, shadows, camera presets, and floor grounding.
- Add clear empty/loading/unavailable states for 2.5D.
- Verify it in the user's active browser window and in a fresh session.
- Make 2.5D useful for inspecting layout, density, neighborhoods, and room structure.

### Checklist

- [ ] Verify 2.5D opens from the active browser window.
- [ ] Verify 2.5D opens from a fresh browser/session.
- [ ] Verify return to 2D works.
- [ ] Verify floor switching in 2.5D.
- [ ] Improve 3D block proportions.
- [ ] Improve 3D colors/materials.
- [ ] Improve lighting and shadows.
- [ ] Improve camera presets.
- [ ] Add polished loading state.
- [ ] Add polished unavailable state.
- [ ] Confirm 2.5D does not feel like broken or unfinished UI.

## Phase 7: Top Bar And Navigation

### Goal

Make navigation and editor controls understandable.

### Work

- Separate page navigation from editing controls.
- Make Map, Roster, Audit, and Reports clear primary views.
- Move role preview and admin/testing controls away from normal navigation.
- Make grid size, scale, and view options secondary controls.
- Use icon buttons with tooltips for common editor actions.
- Use segmented controls for 2D/2.5D.

### Checklist

- [x] Group top-bar controls by intent.
- [x] Redesign primary view navigation.
- [x] Move role preview out of the main control cluster.
- [x] Make 2D/2.5D a clear segmented control.
- [x] Add missing tooltips.
- [x] Check top bar at 1280px.
- [x] Check top bar at 1440px.
- [x] Check top bar on mobile/tablet.

## Phase 8: Roster UX

### Goal

Make roster scanning and map handoff fast.

### Work

- Simplify roster header.
- Keep key metrics visible:
  - total
  - active
  - unassigned
  - occupancy
  - filtered count
- Collapse advanced filters.
- Make "show on map" the dominant row action.
- Clarify redacted mode with better wording.
- Improve empty filtered results.
- Keep table density high but readable.

### Checklist

- [ ] Simplify roster stats area.
- [ ] Collapse advanced filters.
- [ ] Improve quick filters.
- [ ] Promote show-on-map action.
- [ ] Improve redacted-mode copy.
- [ ] Add empty search/filter state.
- [ ] Check list view.
- [ ] Check card view.
- [ ] Check roster-to-map handoff.

## Phase 9: Right Sidebar And Properties

### Goal

Make the sidebar contextual instead of permanently noisy.

### Work

- Show useful empty state only when no element is selected.
- Consider collapsing the sidebar on first load.
- Make properties sections scannable.
- Group edit fields by user intent.
- Keep People, Reports, and Insights tabs visually secondary until needed.
- Avoid showing inactive panels as equal-weight UI.

### Checklist

- [x] Redesign empty properties state.
- [x] Define when sidebar should open automatically.
- [x] Improve selected-object property grouping.
- [x] Reduce tab visual weight.
- [x] Check sidebar with no selection.
- [x] Check sidebar with desk selected.
- [x] Check sidebar with room selected.
- [x] Check sidebar with wall/door/window selected.

## Phase 10: Visual System

### Goal

Make the whole product feel cohesive.

### Work

- Standardize spacing.
- Standardize panel headers.
- Standardize button variants.
- Standardize icon sizing.
- Standardize focus states.
- Reduce heavy gradients on operational screens.
- Make cards and panels consistent.
- Ensure text does not overflow in buttons, tabs, cards, or panels.
- Make light and dark themes equally polished.

### Checklist

- [x] Inventory button variants.
- [x] Inventory panel styles.
- [x] Inventory card styles.
- [x] Standardize spacing scale.
- [x] Standardize icon size.
- [x] Standardize hover/active/pressed states.
- [x] Audit color contrast.
- [x] Audit text overflow.
- [x] Check light theme.
- [x] Check dark theme.

## Phase 11: Responsive UX

### Goal

Make the app usable across desktop, laptop, tablet, and mobile widths.

### Work

- Define minimum supported editor layout width.
- Add responsive behavior for sidebars and tool panels.
- Prevent top-bar wrapping/overlap.
- Ensure mobile users can still inspect sample offices even if full editing is desktop-first.
- Make roster mobile behavior practical.

### Checklist

- [ ] Test 375px width.
- [ ] Test 768px width.
- [ ] Test 1024px width.
- [ ] Test 1280px width.
- [ ] Test 1440px width.
- [ ] Confirm no toolbar overlap.
- [ ] Confirm no text overflow.
- [ ] Confirm canvas controls remain reachable.
- [ ] Confirm roster remains readable.

## Phase 12: Auth, Account, And Onboarding UX

### Goal

Make auth and onboarding feel calm, trustworthy, and connected to the product.

### Work

- Align login, signup, forgot password, reset password, and verification pages with the product's visual system.
- Replace generic auth loading with form-shaped skeletons.
- Make error states specific and human-readable.
- Make password requirements visible without clutter.
- Preserve the user's intended destination after login.
- Make first team creation feel like the start of workspace setup, not an isolated form.
- Add clear post-signup next steps.
- Make account/profile settings visually consistent with team settings.

### Checklist

- [ ] Review login page layout.
- [ ] Review signup page layout.
- [ ] Review forgot/reset password states.
- [ ] Review verification state.
- [ ] Check auth error messages.
- [ ] Check auth loading state.
- [ ] Check post-login redirect.
- [ ] Check team onboarding copy.
- [ ] Check account/profile page hierarchy.
- [ ] Check auth pages on mobile.

## Phase 13: Help, Guide, And Education UX

### Goal

Make help useful without letting it replace the product demo.

### Work

- Separate "learn how it works" from "try the product".
- Add guide navigation that is easy to scan.
- Make help pages consistent with the product's visual style.
- Add links from help topics into the relevant app surfaces when the user is logged in.
- Avoid long walls of instructional text on first-run screens.
- Use contextual education inside the editor only when it helps the current task.

### Checklist

- [ ] Audit help page structure.
- [ ] Rename demo/help CTAs where needed.
- [ ] Add product-surface links from relevant help sections.
- [ ] Improve help sidebar scanability.
- [ ] Check help page mobile layout.
- [ ] Confirm help does not block demo discovery.

## Phase 14: Share, Embed, And External Viewer UX

### Goal

Make shared views feel polished, intentional, and clearly read-only.

### Work

- Improve the share modal hierarchy.
- Clearly distinguish direct access from public/share links.
- Make copied-link success states obvious.
- Make external viewer pages look like a finished product surface, not stripped-down internal UI.
- Add a clear read-only badge.
- Make expiry and access state understandable.
- Polish embed mode with simple chrome, watermark, and stable sizing.
- Ensure public viewer states handle invalid, expired, and missing links gracefully.

### Checklist

- [ ] Review share modal first impression.
- [ ] Review copy-link success feedback.
- [ ] Review read-only public share page.
- [ ] Review invalid link state.
- [ ] Review expired link state.
- [ ] Review embed mode.
- [ ] Check external viewer on mobile.
- [ ] Confirm edit controls are not visually suggested in read-only views.

## Phase 15: Reports, Audit, Reservations, And Secondary Pages

### Goal

Bring secondary office pages up to the same UX standard as map and roster.

### Work

- Make Reports, Audit, Reservations, Scenarios, and related pages use consistent page headers.
- Clarify what each page is for.
- Use empty states that explain what data is needed.
- Use consistent filter/search controls.
- Keep tables dense but readable.
- Make export/download actions visually secondary unless they are the main task.
- Ensure secondary pages preserve office context and navigation.

### Checklist

- [ ] Review reports page hierarchy.
- [ ] Review insights/report cards.
- [ ] Review audit log filters.
- [ ] Review audit empty state.
- [ ] Review reservations page.
- [ ] Review scenarios page.
- [ ] Check table density.
- [ ] Check secondary page mobile behavior.

## Phase 16: Team Settings And Admin UX

### Goal

Make administrative screens clear, restrained, and safe-feeling.

### Work

- Improve team settings navigation.
- Make member role/status information easy to scan.
- Use clear empty states for no members/invites.
- Separate destructive or high-impact actions visually.
- Make invite/member flows predictable.
- Use consistent success and error messaging.

### Checklist

- [ ] Review team settings general page.
- [ ] Review members page.
- [ ] Review invite states.
- [ ] Review role labels.
- [ ] Review empty member/invite states.
- [ ] Review destructive action styling.
- [ ] Check settings on mobile.

## Phase 17: Interaction Model, Shortcuts, And Discovery

### Goal

Make the app learnable without overwhelming the user.

### Work

- Define one pattern for discovery:
  - tooltip
  - shortcut hint
  - command palette
  - welcome tour
  - help link
- Remove duplicate or competing guidance.
- Make keyboard shortcut overlay readable.
- Make command palette actions grouped by task.
- Ensure tooltips name icon-only controls.
- Make first-run coach optional and non-blocking.
- Avoid visible instructional text where icons/tooltips are enough.

### Checklist

- [ ] Inventory all tooltips.
- [ ] Inventory all shortcut hints.
- [ ] Review keyboard shortcuts overlay.
- [ ] Review command palette groupings.
- [ ] Review welcome tour steps.
- [ ] Remove duplicate guidance.
- [ ] Verify icon-only buttons have accessible names.
- [ ] Verify first-run guidance does not block core work.

## Phase 18: Accessibility UX

### Goal

Make the interface usable with keyboard, screen reader semantics, and visible focus.

### Work

- Check focus order for landing, auth, dashboard, roster, editor, modals, and share pages.
- Ensure dialogs trap focus and restore it when closed.
- Ensure icon buttons have accessible labels.
- Ensure selected/pressed/current states are conveyed beyond color.
- Ensure contrast is acceptable in light and dark themes.
- Ensure tables, tabs, menus, and segmented controls use appropriate semantics.
- Make error, success, loading, and notification states announced correctly.

### Checklist

- [ ] Keyboard-test landing.
- [ ] Keyboard-test auth.
- [ ] Keyboard-test dashboard.
- [ ] Keyboard-test roster.
- [ ] Keyboard-test editor top bar.
- [ ] Keyboard-test modals.
- [ ] Keyboard-test share page.
- [ ] Check visible focus states.
- [ ] Check icon accessible names.
- [ ] Check color contrast.
- [ ] Check status/toast announcements.

## Phase 19: Error, Empty, And Recovery States

### Goal

Make non-happy paths feel designed.

### Work

- Design consistent empty states for dashboard, roster filters, reports, audit, settings, and share.
- Design consistent error states for route failures and editor failures.
- Make recovery actions specific:
  - reload
  - back to dashboard
  - return to 2D
  - clear filters
  - retry
- Make technical details secondary and readable.
- Avoid alarming users when autosave/recovery is available.

### Checklist

- [ ] Empty dashboard state.
- [ ] Empty roster filter state.
- [ ] Empty reports state.
- [ ] Empty audit state.
- [ ] Empty settings/member state.
- [ ] Invalid share state.
- [ ] Route error state.
- [ ] Editor error state.
- [ ] 2.5D unavailable state.
- [ ] Recovery action wording.

## Phase 20: QA Checklist

### Landing

- [ ] Hero communicates the product clearly.
- [ ] Demo CTA is honest.
- [ ] Product visual is visible early.
- [ ] No fake trust signal is presented as real.
- [ ] Mobile layout works.

### Dashboard

- [ ] Empty state has one primary action.
- [ ] Sample office action is visible.
- [ ] Sample preview explains what will open.
- [ ] Success state is clear.

### Map Editor

- [ ] First viewport is not overloaded.
- [ ] Canvas is the dominant visual area.
- [ ] Blocks look polished.
- [ ] Selected state is clear.
- [ ] Hover state is clear.
- [ ] Labels are readable.
- [ ] Tool panels are not fighting for attention.
- [ ] Notifications do not cover primary work.

### 2.5D

- [ ] 2.5D opens in active browser window.
- [ ] 2.5D opens in fresh browser/session.
- [ ] 2.5D has polished loading state.
- [ ] 2.5D blocks look intentional.
- [ ] Camera presets are useful.
- [ ] Return to 2D is obvious.

### Roster

- [ ] Stats are understandable.
- [ ] Filters are not overwhelming.
- [ ] Search is easy to find.
- [ ] Show-on-map is obvious.
- [ ] Empty filtered state is helpful.

### Responsive

- [ ] 375px checked.
- [ ] 768px checked.
- [ ] 1024px checked.
- [ ] 1280px checked.
- [ ] 1440px checked.

## Master Execution Checklist

### Discovery And Baseline

- [ ] Open the public landing page.
- [ ] Capture current landing screenshot.
- [ ] Open help page.
- [ ] Capture current help screenshot.
- [ ] Open login page.
- [ ] Capture current login screenshot.
- [ ] Open signup page.
- [ ] Capture current signup screenshot.
- [ ] Open authenticated dashboard.
- [ ] Capture current dashboard screenshot.
- [ ] Open sample office roster.
- [ ] Capture current roster screenshot.
- [ ] Open sample office map.
- [ ] Capture current map screenshot.
- [ ] Switch to 2.5D in the user's active browser window.
- [ ] Capture current 2.5D screenshot.
- [ ] Open team settings.
- [ ] Capture current settings screenshot.
- [ ] Open share modal.
- [ ] Capture current share modal screenshot.

### Landing And Public Site

- [ ] Make the first viewport product-specific.
- [ ] Make the primary CTA clear.
- [ ] Make the secondary CTA honest.
- [ ] Remove or qualify fake trust logos.
- [ ] Improve product preview.
- [ ] Improve landing copy.
- [ ] Improve landing visual hierarchy.
- [ ] Check landing dark mode.
- [ ] Check landing mobile.
- [ ] Check landing keyboard focus order.

### Auth And Onboarding

- [ ] Improve login page layout.
- [ ] Improve signup page layout.
- [ ] Improve forgot password page.
- [ ] Improve reset password page.
- [ ] Improve verification page.
- [ ] Improve auth error states.
- [ ] Improve auth loading states.
- [ ] Preserve next-route messaging after login.
- [ ] Improve team onboarding.
- [ ] Improve post-signup next step.
- [ ] Check auth mobile layout.

### Dashboard And Sample Office

- [ ] Clarify empty dashboard headline.
- [ ] Clarify empty dashboard supporting text.
- [ ] Make create-office action primary.
- [ ] Make sample-office action visible.
- [ ] Add sample-office preview details.
- [ ] Add import-data option without crowding.
- [ ] Improve dashboard stats/cards for populated state.
- [ ] Improve office card hierarchy.
- [ ] Add clear success state after sample opens.
- [ ] Check dashboard empty state mobile.
- [ ] Check dashboard populated state mobile.

### Editor Shell

- [ ] Separate product navigation from editing controls.
- [ ] Make Map/Roster/Audit/Reports clear.
- [ ] Reduce top-bar density.
- [ ] Move admin/testing controls away from normal flow.
- [ ] Make floor tabs clearer.
- [ ] Make office switcher easier to understand.
- [x] Add missing tooltips.
- [ ] Improve save status placement.
- [ ] Improve notification placement.
- [x] Check top bar at 1280px.
- [x] Check top bar at 1440px.

### Map Editor Layout

- [ ] Make canvas the dominant first-load region.
- [ ] Collapse admin operations by default.
- [ ] Collapse secondary library groups by default.
- [ ] Make layers quieter.
- [ ] Reduce welcome-tour prominence.
- [ ] Hide or minimize empty right sidebar.
- [ ] Keep zoom controls reachable.
- [ ] Keep minimap useful but not distracting.
- [ ] Verify no overlays fight for attention.
- [ ] Check editor first-load at 1280px.
- [ ] Check editor first-load at 1440px.
- [ ] Check editor first-load on tablet.

### Blocks And Floor Plan

- [ ] Audit wall styling.
- [ ] Audit room styling.
- [ ] Audit desk styling.
- [ ] Audit hot-desk styling.
- [ ] Audit private-office styling.
- [ ] Audit conference-room styling.
- [ ] Audit furniture styling.
- [ ] Audit neighborhood styling.
- [ ] Audit labels.
- [ ] Improve structure vs furniture contrast.
- [ ] Improve selected state.
- [ ] Improve hover state.
- [ ] Improve locked state.
- [ ] Improve assigned state.
- [ ] Improve unassigned state.
- [ ] Improve warning state.
- [ ] Add zoom-aware label behavior.
- [ ] Verify readability at 50% zoom.
- [ ] Verify readability at 100% zoom.
- [ ] Verify readability at 150% zoom.

### 2.5D

- [ ] Verify 2.5D opens in the user's active browser window.
- [ ] Verify 2.5D opens in a fresh session.
- [ ] Make 2D/2.5D switch visually obvious.
- [ ] Make return-to-2D obvious.
- [ ] Improve 3D block proportions.
- [ ] Improve 3D color mapping.
- [ ] Improve lighting.
- [ ] Improve shadows.
- [ ] Improve camera presets.
- [ ] Improve 2.5D loading state.
- [ ] Improve 2.5D unavailable state.
- [ ] Verify floor switching in 2.5D.
- [ ] Verify 2.5D does not look unfinished.

### Roster

- [ ] Simplify roster header.
- [ ] Improve key metrics.
- [ ] Improve quick filters.
- [ ] Collapse advanced filters.
- [ ] Improve search prominence.
- [ ] Improve list view readability.
- [ ] Improve card view readability.
- [ ] Promote show-on-map action.
- [ ] Improve redacted mode copy.
- [ ] Improve empty filtered state.
- [ ] Check roster mobile.

### Right Sidebar

- [ ] Improve empty properties state.
- [ ] Define sidebar first-load behavior.
- [ ] Improve desk properties layout.
- [ ] Improve room properties layout.
- [ ] Improve wall properties layout.
- [ ] Improve door/window properties layout.
- [x] Reduce tab visual weight.
- [ ] Improve People tab hierarchy.
- [ ] Improve Reports tab hierarchy.
- [ ] Improve Insights tab hierarchy.

### Share And External Viewing

- [ ] Improve share modal hierarchy.
- [ ] Clarify direct access vs public/share links.
- [ ] Improve copy-link success feedback.
- [ ] Improve read-only badge.
- [ ] Improve public share header.
- [ ] Improve invalid share state.
- [ ] Improve expired share state.
- [ ] Improve embed mode chrome.
- [ ] Check share page mobile.

### Reports, Audit, Reservations, Settings

- [ ] Improve reports page header.
- [ ] Improve report cards.
- [ ] Improve insights presentation.
- [ ] Improve audit log layout.
- [ ] Improve audit filters.
- [ ] Improve audit empty state.
- [ ] Improve reservations layout.
- [ ] Improve scenarios layout.
- [ ] Improve team settings layout.
- [ ] Improve member management layout.
- [ ] Improve account page layout.

### Interaction And Accessibility

- [ ] Verify all icon buttons have labels.
- [ ] Verify tooltips exist where needed.
- [ ] Verify keyboard focus is visible.
- [ ] Verify dialogs handle focus correctly.
- [ ] Verify tabs expose selected state.
- [ ] Verify segmented controls expose pressed state.
- [ ] Verify toasts do not block core actions.
- [ ] Verify errors are readable.
- [ ] Verify color is not the only state indicator.
- [ ] Verify contrast in light theme.
- [ ] Verify contrast in dark theme.

### Final Browser QA

- [ ] Test full happy path from landing to sample office.
- [ ] Test landing to help.
- [ ] Test login redirect.
- [ ] Test sample office creation/opening.
- [ ] Test roster to map.
- [ ] Test map to roster.
- [ ] Test 2D to 2.5D.
- [ ] Test 2.5D to 2D.
- [ ] Test share modal.
- [ ] Test public share page.
- [ ] Test settings page.
- [ ] Test mobile landing.
- [ ] Test mobile dashboard.
- [ ] Test mobile roster.
- [ ] Test tablet editor.

## Recommended Implementation Order

1. Fix landing demo honesty.
2. Replace generic loading states.
3. Improve empty dashboard and sample-office presentation.
4. Simplify editor first-load layout.
5. Polish block/floor-plan visuals.
6. Polish 2.5D as a review mode.
7. Rework top-bar hierarchy.
8. Improve roster-to-map UX.
9. Clean right sidebar behavior.
10. Standardize visual system.
11. Complete responsive QA.

## Definition Of Done

- The user can understand the product from the first page.
- The demo/sample path feels intentional.
- The editor first viewport is calm and professional.
- Blocks look like a designed floor-planning system.
- 2.5D feels like a polished review mode.
- Roster and map feel connected.
- No core UI overlaps at tested viewport sizes.
- Light and dark themes both look finished.
- The checklist above has been run in the browser.
