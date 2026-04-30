/**
 * Canonical permissions model for the current product surface.
 *
 * We enforce two effective roles:
 * - `edit`: full editor access
 * - `view`: read-only access
 *
 * Legacy roles are still accepted at runtime and normalized so existing
 * payloads/tests do not crash while we complete migration work.
 */

export type Role =
  | 'edit'
  | 'view'
  | 'admin'
  | 'member'
  | 'owner'
  | 'editor'
  | 'viewer'
  | 'shareViewer'
  | 'space-planner'
  | 'hr-editor'

export type Action =
  | 'editRoster'
  | 'editMap'
  | 'manageTeam'
  | 'generateShareLink'
  | 'viewReports'
  | 'viewSeatHistory'
  | 'manageWorkspace'
  | 'viewMap'
  | 'viewPII'
  | 'viewAuditLog'

const ALL_ACTIONS: Action[] = [
  'editRoster',
  'editMap',
  'manageTeam',
  'generateShareLink',
  'viewReports',
  'viewSeatHistory',
  'manageWorkspace',
  'viewMap',
  'viewPII',
  'viewAuditLog',
]

const MATRIX: Record<'edit' | 'view', Action[]> = {
  edit: ALL_ACTIONS,
  view: ['viewReports', 'viewSeatHistory', 'viewMap'],
}

function normalizeRole(role: Role | null): 'edit' | 'view' | null {
  if (role === null) return null
  if (role === 'view' || role === 'viewer' || role === 'shareViewer') {
    return 'view'
  }
  return 'edit'
}

export function can(role: Role | null, action: Action): boolean {
  const normalized = normalizeRole(role)
  if (!normalized) return false
  return MATRIX[normalized].includes(action)
}
