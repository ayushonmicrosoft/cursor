import { supabase } from './supabase'

export interface AuditEventRow {
  id: string | null
  created_at: string | null
  actor_id: string
  action: string
  target_type: string
  target_id: string | null
}

export interface ListAuditEventFilters {
  actorId?: string
  action?: string
}

export async function listEvents(
  teamId: string,
  filters: ListAuditEventFilters = {},
): Promise<AuditEventRow[]> {
  let query = supabase
    .from('audit_events')
    .select('id, created_at, actor_id, action, target_type, target_id')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(500)

  if (filters.actorId) {
    query = query.eq('actor_id', filters.actorId)
  }
  if (filters.action) {
    query = query.ilike('action', `%${filters.action}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as AuditEventRow[]
}
