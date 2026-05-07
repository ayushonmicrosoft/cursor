import { supabase } from '../supabase'
import { saveOfficeForce } from './officeRepository'

export interface OfficeHistoryEntry {
  id: number
  office_id: string
  prior_payload: Record<string, unknown>
  prior_updated_at: string
  overwritten_by: string | null
  overwritten_at: string
}

export async function listOfficeHistory(
  officeId: string,
  limit = 8,
): Promise<OfficeHistoryEntry[]> {
  const { data, error } = await supabase
    .from('offices_history')
    .select('*')
    .eq('office_id', officeId)
    .order('overwritten_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as OfficeHistoryEntry[]
}

export async function restoreOfficeHistoryEntry(
  officeId: string,
  entryId: number,
): Promise<string> {
  const { data, error } = await supabase
    .from('offices_history')
    .select('prior_payload')
    .eq('office_id', officeId)
    .eq('id', entryId)
    .single()
  if (error) throw error

  const priorPayload = (data as { prior_payload: Record<string, unknown> }).prior_payload
  const res = await saveOfficeForce(officeId, priorPayload)
  if (!res.ok) throw new Error(res.message)
  return res.updated_at
}
