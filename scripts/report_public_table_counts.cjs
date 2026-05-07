const { Client } = require('pg')

const conn = process.env.SEED_DB_URL || process.env.DATABASE_URL || process.argv[2]
if (!conn) {
  throw new Error('Provide SEED_DB_URL, DATABASE_URL, or a Postgres URL argument.')
}

function normalizeConnectionString(value) {
  const url = new URL(value)
  url.searchParams.delete('sslmode')
  return url.toString()
}

function qIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`
}

async function main() {
  const client = new Client({
    connectionString: normalizeConnectionString(conn),
    ssl: { rejectUnauthorized: process.env.SEED_DB_SSL_REJECT_UNAUTHORIZED === '1' },
  })

  await client.connect()
  try {
    const tablesRes = await client.query(`
      select tablename
      from pg_tables
      where schemaname = 'public'
      order by tablename
    `)

    const rows = []
    for (const { tablename } of tablesRes.rows) {
      const res = await client.query(`select count(*)::bigint as row_count from public.${qIdent(tablename)}`)
      rows.push({ table: tablename, rows: Number(res.rows[0].row_count) })
    }

    console.log(JSON.stringify(rows, null, 2))
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
