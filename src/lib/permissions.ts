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

const MATRIX: Record<
  'owner' | 'admin' | 'editor' | 'hr-editor' | 'space-planner' | 'viewer',
  Action[]
> = {
  owner: ALL_ACTIONS,
  admin: ALL_ACTIONS,
  editor: [
    'editRoster',
    'editMap',
    'viewReports',
    'viewSeatHistory',
    'viewMap',
    'viewPII',
    'generateShareLink',
  ],
  'hr-editor': [
    'editRoster',
    'viewSeatHistory',
    'viewMap',
    'viewPII',
    'viewAuditLog',
  ],
  'space-planner': [
    'editMap',
    'viewReports',
    'viewSeatHistory',
    'viewMap',
  ],
  viewer: ['viewMap'],
}

function normalizeRole(
  role: Role | null,
): 'owner' | 'admin' | 'editor' | 'hr-editor' | 'space-planner' | 'viewer' | null {
  if (role === null) return null
  if (role === 'owner') return 'owner'
  if (role === 'admin') return 'admin'
  if (role === 'hr-editor') return 'hr-editor'
  if (role === 'space-planner') return 'space-planner'
  if (role === 'view' || role === 'viewer' || role === 'shareViewer') {
    return 'viewer'
  }
  // Legacy roles (`edit`, `editor`, `member`) map to a regular editor profile.
  return 'editor'
}

export function can(role: Role | null, action: Action): boolean {
  const normalized = normalizeRole(role)
  if (!normalized) return false
  return MATRIX[normalized].includes(action)
}
