import { supabase } from '../supabase'
import type { OfficeRole } from './permissionsRepository'

/**
 * Resolve the current viewer's effective role.
 * In the simplified model, any team member is granted `edit`.
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

  return membership ? 'edit' : null
}
