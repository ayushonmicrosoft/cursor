const fs = require('fs');
const { Client } = require('pg');

const conn = process.env.SEED_DB_URL;
if (!conn) throw new Error('SEED_DB_URL missing');

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
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
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

  out += 'set session_replication_role = origin;\n';
  out += 'commit;\n';

  fs.writeFileSync('supabase/seed.sql', out, { encoding: 'utf8' });
  await client.end();
  console.log(`Wrote supabase/seed.sql for ${tables.length} public tables.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
