import { supabase } from '../supabase'
import type { OfficeRole } from './permissionsRepository'

const OFFICE_ROLES: ReadonlySet<string> = new Set([
  'owner',
  'editor',
  'hr-editor',
  'space-planner',
  'viewer',
])

/**
 * Resolve the current viewer's effective role for a given office.
 *
 * Team admins are owner-equivalent for the single O&O workspace model.
 * Non-admins use explicit office_permissions overrides, then fall back to
 * editor for team members with office access.
 */
export async function currentUserOfficeRole(
  officeId: string,
  userId: string,
): Promise<OfficeRole | null> {
  const { data: office, error: officeError } = await supabase
    .from('offices')
    .select('team_id')
    .eq('id', officeId)
    .maybeSingle()
  if (officeError) return null

  const teamId = (office as { team_id?: string } | null)?.team_id
  if (!teamId) return null

  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .maybeSingle()
  if (membershipError) return null

  if ((membership as { role?: string } | null)?.role === 'admin') {
    return 'owner'
  }

  const { data, error } = await supabase
    .from('office_permissions')
    .select('role')
    .eq('office_id', officeId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return null

  const explicit = (data as { role?: string } | null)?.role
  if (explicit && OFFICE_ROLES.has(explicit)) {
    return explicit as OfficeRole
  }
  return 'editor'
}
