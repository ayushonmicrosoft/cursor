# OandOcraft Supabase Recovery Runbook

This runbook covers database-side recovery for the O&O Supabase project. Use it
only from trusted server-side tools such as the Supabase SQL editor, `psql`, or
a controlled CI/release machine. Never paste service-role credentials into the
browser app.

## Required Access

- Supabase project owner or database owner.
- Production Postgres connection string, stored in a secret manager.
- Supabase dashboard access for Auth redirect and Edge Function secrets.
- A verified backup or release artifact if data restoration is required.

## Service-Role Policy

The service-role key is server-only.

- Allowed: Supabase Edge Functions, controlled maintenance scripts, trusted CI.
- Not allowed: Vite client code, browser console, `.env.local` committed files,
  screenshots, tickets, or chat messages.
- Rotate the key if it is copied into any browser-visible location.
- Treat `VITE_SUPABASE_ANON_KEY` as public and safe to bundle. It is protected
  by RLS and database policies, not secrecy.

## Lost Admin Access

Use this when the workspace has no working admin user.

1. Identify the O&O team:

```sql
select id, name, created_at
from public.teams
order by created_at;
```

2. Identify the target user profile:

```sql
select id, email, name
from public.profiles
where lower(email) = lower('admin@example.com');
```

3. Promote or restore the user as team admin:

```sql
insert into public.team_members (team_id, user_id, role)
values ('TEAM_UUID', 'USER_UUID', 'admin')
on conflict (team_id, user_id)
do update set role = 'admin';
```

4. If the user also needs owner access to a specific office:

```sql
insert into public.office_permissions (office_id, user_id, role)
values ('OFFICE_UUID', 'USER_UUID', 'owner')
on conflict (office_id, user_id)
do update set role = 'owner';
```

5. Verify:

```sql
select tm.team_id, tm.user_id, p.email, tm.role
from public.team_members tm
join public.profiles p on p.id = tm.user_id
where tm.team_id = 'TEAM_UUID'
order by p.email;
```

6. Sign in as the recovered admin and verify dashboard, editor, audit log, and
   admin HUD access.

## Recover A Deleted Or Damaged Office Payload

1. Locate the office:

```sql
select id, team_id, slug, name, updated_at
from public.offices
where slug = 'office-slug';
```

2. Inspect history:

```sql
select id, office_id, saved_by, saved_at
from public.offices_history
where office_id = 'OFFICE_UUID'
order by saved_at desc
limit 20;
```

3. Export the current payload before changing anything:

```sql
select payload
from public.offices
where id = 'OFFICE_UUID';
```

4. Restore only after review:

```sql
update public.offices o
set payload = h.payload,
    updated_at = now()
from public.offices_history h
where o.id = h.office_id
  and o.id = 'OFFICE_UUID'
  and h.id = 'HISTORY_UUID';
```

5. Verify the office in the app and record the recovery in incident notes.

## Revoke Public Share Tokens

Revoke all live tokens for an office:

```sql
update public.share_tokens
set revoked_at = now()
where office_id = 'OFFICE_UUID'
  and revoked_at is null;
```

List currently live tokens:

```sql
select st.id, st.office_id, o.slug, st.created_by, st.created_at
from public.share_tokens st
join public.offices o on o.id = st.office_id
where st.revoked_at is null
order by st.created_at desc;
```

## Hosted Seed And Reset Safety

- `supabase/seed.sql` is suitable for local reset and controlled hosted demo
  seeding.
- Do not run `supabase/seed.sql` against production unless the owner approves
  truncation and demo data replacement.
- Before any hosted seed work, run table counts and export a backup.
- After seed work, rerun table counts and verify floor-plan objects, people,
  seats, and assignments.

## Auth Redirect Recovery

For production, Supabase Auth must allow these URLs:

- `https://oando.co.in/OandOcraft/auth/verify`
- `https://oando.co.in/OandOcraft/auth/reset`
- `https://oando.co.in/OandOcraft/invite/*`

The Edge Function `APP_URL` secret must be:

```txt
https://oando.co.in/OandOcraft
```

If invite links route to the wrong host, fix `APP_URL`, redeploy the function,
then resend the invite.

