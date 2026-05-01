# OandOcraft Admin Runbook

This runbook is for the single-client O&O deployment at
`https://oando.co.in/OandOcraft/`. The app supports internal and approved
external users, but the operational model is one controlled workspace owned by
the O&O admin team.

## Admin Model

- Team admin is the highest in-app role.
- Team admins can read and update all offices in the team.
- Team admins can create or revoke public share tokens.
- Office-level roles still apply to non-admin users.
- The admin HUD is visible only to admins and exposes recovery, audit, and
conflict triage shortcuts.

## Daily Checks

1. Open `/OandOcraft/` and sign in with a production admin account.
2. Confirm the dashboard lists the expected O&O team and offices.
3. Open the primary office map and verify that canvas, toolbars, roster, and
   admin HUD render without layout overflow.
4. Open the audit log and check for unusual access changes, force saves, or
   share-token events.
5. Confirm no demo-only users or demo-only offices are mixed into production
   unless explicitly approved for training.

## Access Operations

### Add A User

1. Open team settings.
2. Add or invite the person using their real O&O or approved external email.
3. Assign the minimum role needed for the work.
4. Avoid public share links when named-user access is practical.
5. Record why the user was added if this is an external user.

### Remove A User

1. Revoke or downgrade the user in team settings.
2. Remove office-level permissions if they were granted directly.
3. Revoke any public share links that were issued for that user's workflow.
4. Check the audit log for the removal event.

### Restore Admin Access

Use the Supabase recovery runbook, not browser-side edits. The recovery path
must be executed from Supabase SQL editor, psql, or another trusted server-side
channel by someone with database-owner permissions.

## Office Recovery

Use this when an editor reports missing objects, stale saves, or a conflict.

1. Open the affected office.
2. Use the admin HUD `Conflicts` shortcut to check unresolved save conflicts.
3. Use the admin HUD `Recover` shortcut to open recovery/share controls.
4. Use the admin HUD `Audit` shortcut to inspect recent changes.
5. If a prior payload must be restored, compare the current state and the
   `offices_history` entry before applying recovery.
6. Export the current state before overwriting it.
7. Restore only the minimum required office payload.
8. Record the office slug, recovery time, operator, reason, and verification
   result in the release or incident notes.

## Public Share Links

Public share links are not the primary collaboration model.

- Use named-user access first.
- Share links are bearer tokens. Anyone with the link can view the shared
  office while the token is active.
- Revoke share links after demos, external reviews, or vendor walkthroughs.
- Do not send share links in public channels.
- Do not use share links for private HR, finance, or sensitive seating work.

## Production Release Admin Steps

1. Confirm the release artifact was created with `npm run build:oando` and
   `npm run release:manifest`.
2. Confirm `dist/OandOcraft-release-manifest.json` was generated from the
   final commit being deployed.
3. Confirm Supabase Auth redirect URLs include `/OandOcraft/auth/verify`,
   `/OandOcraft/auth/reset`, and `/OandOcraft/invite/*`.
4. Confirm the Edge Function secret `APP_URL` is set to
   `https://oando.co.in/OandOcraft`.
5. Run the production smoke test after deployment:
   sign in, open office, draw room, add desk, assign person, export.
6. Keep the current and previous three release artifacts for rollback.

## Incident Record Template

```md
## Incident

- Date/time:
- Operator:
- Environment:
- Office/team:
- User impact:
- Action taken:
- Data restored or changed:
- Share links revoked:
- Verification:
- Follow-up:
```

