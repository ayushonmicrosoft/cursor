import { useEffect, useMemo, useState } from 'react'
import { fetchBlockLibraryRecords, upsertBlockLibraryRecord, type BlockLibraryRecord } from '../../../lib/blockLibrary'

export function BlockLibraryTable() {
  const [records, setRecords] = useState<BlockLibraryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchBlockLibraryRecords()
        if (active) setRecords(Array.isArray(data) ? data : [])
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load block library records')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const counts = useMemo(() => {
    return {
      total: records.length,
      canonical: records.filter((record) => record.canonical).length,
      verified: records.filter((record) => record.status === 'verified').length,
    }
  }, [records])

  async function markImported(record: BlockLibraryRecord) {
    try {
      setSaving(record.slug)
      const updated = await upsertBlockLibraryRecord({
        ...record,
        status: 'imported',
      })
      setRecords((current) => current.map((item) => (item.slug === updated.slug ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save block record')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Block sources</h3>
          <p className="text-xs text-slate-500">Canonical and imported source links</p>
        </div>
        <span className="text-xs text-slate-500">{counts.total} items</span>
      </div>

      <div className="mb-3 flex gap-3 text-xs text-slate-600">
        <span>Canonical: {counts.canonical}</span>
        <span>Verified: {counts.verified}</span>
      </div>

      {loading && <p className="text-xs text-slate-500">Loading block records…</p>}
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 pr-3">Model Name</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Source</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.slug} className="border-t border-slate-100 align-top">
                <td className="py-2 pr-3 font-medium text-slate-900">{item.name}</td>
                <td className="py-2 pr-3 text-slate-600">{item.category}</td>
                <td className="py-2 pr-3 text-slate-600">{item.asset_type}</td>
                <td className="py-2 pr-3 text-slate-600">
                  <a className="text-blue-600 underline" href={item.source_url ?? '#'} target="_blank" rel="noreferrer">
                    Open link
                  </a>
                </td>
                <td className="py-2 pr-3 text-slate-600">{item.status}</td>
                <td className="py-2 pr-3 text-slate-600">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
                    onClick={() => void markImported(item)}
                    disabled={saving === item.slug}
                  >
                    {saving === item.slug ? 'Saving…' : 'Mark imported'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
