import { supabase } from '../supabase'

export type OfficeRole = 'edit' | 'view'

export interface OfficePermEntry {
  user_id: string
  email: string
  name: string | null
  role: OfficeRole
  isSelf: boolean
}

type TeamMemberPermissionProfile = { email: string; name: string | null }

type TeamMemberPermissionRow = {
  user_id: string
  role: string | null
  profiles: TeamMemberPermissionProfile | TeamMemberPermissionProfile[] | null
}

/**
 * Returns one row per team member of the office's team.
 * Roles are normalized to `edit` / `view`.
 */
export async function listPermissions(
  _officeId: string,
  selfId: string,
  teamId: string,
): Promise<OfficePermEntry[]> {
  const { data: members, error } = await supabase
    .from('team_members')
    .select('user_id, role, profiles!inner(email, name)')
    .eq('team_id', teamId)
  
  if (error) throw error

  return ((members ?? []) as TeamMemberPermissionRow[]).map((m) => {
    const prof = (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) ?? { email: '', name: null }
    const memberRole = m.role ?? null
    const normalizedRole: OfficeRole =
      memberRole === 'view' || memberRole === 'viewer'
        ? 'view'
        : 'edit'
    return {
      user_id: m.user_id,
      email: prof.email,
      name: prof.name,
      role: normalizedRole,
      isSelf: m.user_id === selfId,
    }
  })
}

export async function upsertPermission(
  officeId: string,
  userId: string,
  role: OfficeRole,
): Promise<void> {
  const { error } = await supabase
    .from('office_permissions')
    .upsert({ office_id: officeId, user_id: userId, role }, { onConflict: 'office_id,user_id' })
  if (error) throw error
}

export async function removePermission(officeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('office_permissions')
    .delete()
    .eq('office_id', officeId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function setOfficePrivate(officeId: string, isPrivate: boolean): Promise<void> {
  const { error } = await supabase
    .from('offices')
    .update({ is_private: isPrivate })
    .eq('id', officeId)
  if (error) throw error
}
