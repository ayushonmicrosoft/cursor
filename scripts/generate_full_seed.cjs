const fs = require('fs');
const { Client } = require('pg');

const conn = process.env.SEED_DB_URL;
if (!conn) throw new Error('SEED_DB_URL missing');

function normalizeConnectionString(value) {
  const url = new URL(value);
  // node-postgres' URL sslmode parser can override the explicit ssl object
  // below. Keep TLS config in one place so hosted Supabase pulls work on
  // Windows environments with custom/root certificate chains.
  url.searchParams.delete('sslmode');
  return url.toString();
}

const EXPANDED_DEMO_SQL = `
-- Expanded demo set: add multiple users, offices, memberships, and
-- share/invite rows so local+hosted reset environments mirror a fuller
-- team workspace without requiring manual setup.
insert into auth.users (id, email, encrypted_password, email_confirmed_at) values
  ('9f0b6f3d-2b74-4a8c-92d8-8f6f0d2a1e11', 'ops.admin@oandocraft.local', 'seed-password-not-used', now()),
  ('4c77a3a2-9b3c-4db1-9ac6-6e921fec3e22', 'design.lead@oandocraft.local', 'seed-password-not-used', now()),
  ('5decb5fe-0e8c-4b39-b7b7-8a53b74e7a33', 'viewer@oandocraft.local', 'seed-password-not-used', now())
on conflict (id) do update set email = excluded.email;

insert into public."profiles" ("id", "email", "name", "avatar_url", "active_team_id", "created_at") values
  ('9f0b6f3d-2b74-4a8c-92d8-8f6f0d2a1e11', 'ops.admin@oandocraft.local', 'Ops Admin', NULL, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-04-25T20:00:01.000Z'),
  ('4c77a3a2-9b3c-4db1-9ac6-6e921fec3e22', 'design.lead@oandocraft.local', 'Design Lead', NULL, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-04-25T20:00:01.000Z'),
  ('5decb5fe-0e8c-4b39-b7b7-8a53b74e7a33', 'viewer@oandocraft.local', 'Team Viewer', NULL, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-04-25T20:00:01.000Z')
on conflict do nothing;

insert into public."team_members" ("team_id", "user_id", "role", "joined_at") values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9f0b6f3d-2b74-4a8c-92d8-8f6f0d2a1e11', 'admin', '2026-04-25T20:00:01.000Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4c77a3a2-9b3c-4db1-9ac6-6e921fec3e22', 'member', '2026-04-25T20:00:01.000Z'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '5decb5fe-0e8c-4b39-b7b7-8a53b74e7a33', 'member', '2026-04-25T20:00:01.000Z')
on conflict do nothing;

with base as (
  select team_id, payload
  from public.offices
  where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  limit 1
)
insert into public.offices ("id", "team_id", "slug", "name", "created_by", "is_private", "payload", "created_at", "updated_at")
select
  v.id::uuid,
  b.team_id,
  v.slug,
  v.name,
  v.created_by::uuid,
  v.is_private,
  b.payload,
  '2026-04-25T20:00:02.000Z'::timestamptz,
  '2026-04-25T20:00:02.000Z'::timestamptz
from base b
cross join (
  values
    ('f0c7b7dd-3f44-43cb-b8ab-1d4791ca0101', 'engineering-hub', 'Engineering Hub', '9f0b6f3d-2b74-4a8c-92d8-8f6f0d2a1e11', false),
    ('9099431e-7f95-47db-8b96-97e6ad507202', 'design-studio', 'Design Studio', '4c77a3a2-9b3c-4db1-9ac6-6e921fec3e22', true),
    ('8870947d-e96a-4f84-a415-59ec8cfe0303', 'ops-command', 'Ops Command', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', false)
) as v(id, slug, name, created_by, is_private)
on conflict do nothing;

insert into public.office_permissions (office_id, user_id, role, created_at) values
  ('f0c7b7dd-3f44-43cb-b8ab-1d4791ca0101', '9f0b6f3d-2b74-4a8c-92d8-8f6f0d2a1e11', 'owner', '2026-04-25T20:00:02.000Z'),
  ('9099431e-7f95-47db-8b96-97e6ad507202', '4c77a3a2-9b3c-4db1-9ac6-6e921fec3e22', 'owner', '2026-04-25T20:00:02.000Z'),
  ('8870947d-e96a-4f84-a415-59ec8cfe0303', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner', '2026-04-25T20:00:02.000Z'),
  ('9099431e-7f95-47db-8b96-97e6ad507202', '5decb5fe-0e8c-4b39-b7b7-8a53b74e7a33', 'viewer', '2026-04-25T20:00:03.000Z')
on conflict do nothing;

insert into public.share_tokens (id, office_id, token, created_by, created_at, revoked_at) values
  ('1aa8d9d2-6275-4de8-93a4-d63668d0a404', 'f0c7b7dd-3f44-43cb-b8ab-1d4791ca0101', 'demo-share-engineering-hub', '9f0b6f3d-2b74-4a8c-92d8-8f6f0d2a1e11', '2026-04-25T20:00:04.000Z', null)
on conflict do nothing;

insert into public.invites (id, team_id, email, token, invited_by, created_at, expires_at, accepted_at, role) values
  ('6f875995-4f18-4829-8bc3-1f22c5a6f505', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'new.member@oandocraft.local', 'f8fa5ee7-48b0-4b11-b4c2-2f9e2cbf6606', '9f0b6f3d-2b74-4a8c-92d8-8f6f0d2a1e11', '2026-04-25T20:00:05.000Z', '2026-05-02T20:00:05.000Z', null, 'member')
on conflict do nothing;
`;

function qIdent(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}
function qLit(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
  if (typeof v === 'bigint') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (v instanceof Date) return `'${v.toISOString().replace(/'/g, "''")}'`;
  if (Buffer.isBuffer(v)) return `'\\x${v.toString('hex')}'::bytea`;
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

(async () => {
  const client = new Client({
    connectionString: normalizeConnectionString(conn),
    ssl: { rejectUnauthorized: process.env.SEED_DB_SSL_REJECT_UNAUTHORIZED === '1' },
  });
  await client.connect();

  const tablesRes = await client.query(`
    select tablename
    from pg_tables
    where schemaname='public'
    order by tablename
  `);
  const tables = tablesRes.rows.map(r => r.tablename).filter(t => t !== 'schema_migrations');

  const colMap = new Map();
  for (const t of tables) {
    const colsRes = await client.query(`
      select column_name
      from information_schema.columns
      where table_schema='public' and table_name=$1
      order by ordinal_position
    `, [t]);
    colMap.set(t, colsRes.rows.map(r => r.column_name));
  }

  const profileRows = await client.query(`select id, lower(email) as email from public.profiles order by id`);

  let out = '';
  out += '-- supabase/seed.sql\n';
  out += '-- Auto-generated full-data seed from hosted database (public schema).\n';
  out += '-- Includes auth.users stubs for profile IDs referenced by public.profiles.\n\n';
  out += 'begin;\n';
  out += 'set check_function_bodies = off;\n';
  out += 'set session_replication_role = replica;\n\n';

  if (profileRows.rows.length) {
    out += '-- Ensure auth.users rows exist for profile foreign keys.\n';
    out += 'insert into auth.users (id, email, encrypted_password, email_confirmed_at) values\n';
    out += profileRows.rows.map((r) => `  (${qLit(r.id)}, ${qLit(r.email)}, ${qLit('seed-password-not-used')}, now())`).join(',\n');
    out += '\non conflict (id) do update set email = excluded.email;\n\n';
  }

  if (tables.length) {
    const trunc = tables.map(t => `public.${qIdent(t)}`).join(', ');
    out += `truncate table ${trunc} restart identity cascade;\n\n`;
  }

  for (const t of tables) {
    const cols = colMap.get(t);
    const qTable = `public.${qIdent(t)}`;
    const rowsRes = await client.query(`select * from ${qTable}`);
    const rows = rowsRes.rows;
    out += `-- ${t} (${rows.length} rows)\n`;
    if (!rows.length) {
      out += '\n';
      continue;
    }

    const colList = cols.map(qIdent).join(', ');
    out += `insert into ${qTable} (${colList}) values\n`;

    const valuesSql = rows.map((r) => {
      const vals = cols.map((c) => qLit(r[c]));
      return `  (${vals.join(', ')})`;
    }).join(',\n');

    out += valuesSql + '\n';
    out += 'on conflict do nothing;\n\n';
  }

  out += EXPANDED_DEMO_SQL + '\n';
  out += 'set session_replication_role = origin;\n';
  out += 'commit;\n';

  out = out.replaceAll('floorcraft.local', 'oandocraft.local');

  fs.writeFileSync('supabase/seed.sql', out, { encoding: 'utf8' });
  await client.end();
  console.log(`Wrote supabase/seed.sql for ${tables.length} public tables.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
