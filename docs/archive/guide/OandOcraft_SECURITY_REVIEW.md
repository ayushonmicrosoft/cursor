# OandOcraft Security Review

Scope: repo-local review of RLS, auth redirects, service-role usage, invite
flows, share-token policy, and public routes for the O&O single-client
deployment.

## Current Security Model

- Supabase Auth is the identity provider.
- RLS is enabled on core app tables.
- Team membership controls workspace visibility.
- Team admin is owner-equivalent for internal O&O operations.
- Office permissions control non-admin office access.
- Public share links are explicit bearer-token read-only surfaces.
- Invite email sending uses a Supabase Edge Function and server-only
  service-role key.

## RLS Review

### Confirmed Controls

- Core tables have RLS enabled in `0003_rls_policies.sql`.
- Helper functions centralize team membership, team admin, and office role
  checks.
- Team admins can update and read all offices after
  `0012_internal_admin_office_control.sql`.
- Invite acceptance runs through `accept_invite`, which validates caller,
  email, expiry, and accepted state.
- Invite email rate limiting is stored in Postgres so Edge Function cold starts
  do not reset the sender limit.

### Follow-Up Tests Still Needed

- RLS test: team admin can update an office without direct office permission.
- RLS test: viewer can read but cannot update office payloads.
- RLS test: unauthenticated users cannot read private offices without a live
  share token.
- RLS test: revoked share tokens no longer expose shared offices.

## Service-Role Review

The service-role key appears only in the Supabase Edge Function path reviewed
for invite sending. The browser app must never receive this key.

Rules:

- Keep `SUPABASE_SERVICE_ROLE_KEY` in Supabase secrets or trusted CI only.
- Do not prefix service-role variables with `VITE_`.
- Do not add service-role access to React components, Zustand stores, or
  browser repositories.
- If a maintenance script requires service role, place it under `scripts/`,
  require an explicit connection string/key argument, and document that it is
  server-only.

## Public Routes Review

Public routes are intentional and must stay narrow:

- `/` landing page.
- `/login`, `/signup`, `/forgot`, `/auth/verify`, `/auth/reset`.
- `/invite/:token`, which previews and accepts invite tokens.
- `/shared/:projectId/:token` and `/share/:officeSlug`, which depend on
  share-token checks and are not the primary workflow.

Production host rewrites must route nested client paths to
`/OandOcraft/index.html` without exposing source maps or environment files.

## Share-Token Policy

Share tokens are bearer credentials.

- Live tokens allow anonymous read access to the linked office.
- Revocation is represented by `revoked_at`.
- Current policy has no automatic TTL in the database.
- Operational policy is named-user access first, share links only for explicit
  demos or external reviews, and revoke after use.

Recommended hardening:

- Add database TTL for share tokens if external sharing becomes routine.
- Add audit events for create, copy, view, and revoke if production use depends
  on public links.
- Add a UI warning when a private office has a live share token.

## Invite Flow Review

Confirmed controls:

- Invite token is path-based rather than query-string based in the modern flow.
- Legacy `?invite=` handling removes the token from the URL and stores it in
  session storage.
- `preview_invite` exposes only team and inviter display names.
- `accept_invite` validates token, expiry, accepted state, and caller email.
- Invite emails are rate-limited and HTML-escaped.

Follow-up tests:

- Expired invite rejects.
- Accepted invite is idempotent for the intended user.
- Email mismatch rejects.
- Non-admin cannot send invite email.
- Rate limit rejects after the configured threshold.

## Auth Redirect Review

Production settings must include:

- Site URL: `https://oando.co.in/OandOcraft`
- Verify redirect: `https://oando.co.in/OandOcraft/auth/verify`
- Reset redirect: `https://oando.co.in/OandOcraft/auth/reset`
- Invite route: `https://oando.co.in/OandOcraft/invite/*`
- Edge Function `APP_URL`: `https://oando.co.in/OandOcraft`

These are host-only until production Supabase settings are available.

## Launch Security Gate

Before production sign-off:

1. Run `npm run lint`.
2. Run `npm run test`.
3. Run `npm run build:oando`.
4. Run `npm run audit:pages`.
5. Verify Supabase redirect allow-list.
6. Verify Edge Function secrets.
7. Revoke stale share tokens.
8. Confirm at least two admin accounts exist.
9. Confirm demo accounts and production accounts are separated.
10. Confirm the release artifact and rollback artifact are retained.

