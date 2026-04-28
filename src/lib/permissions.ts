/**
 * Simplified permissions system: Single-role architecture.
 * Every authorized user is an 'admin' with full access to all features.
 */

export type Role = 'admin'

export type Action =
  | 'editRoster'
  | 'editMap'
  | 'manageTeam'
  | 'viewReports'
  | 'viewSeatHistory'
  | 'manageWorkspace'
  | 'viewMap'
  | 'viewPII'

const ALL_ACTIONS: Action[] = [
  'editRoster',
  'editMap',
  'manageTeam',
  'viewReports',
  'viewSeatHistory',
  'manageWorkspace',
  'viewMap',
  'viewPII',
]

const MATRIX: Record<Role, Action[]> = {
  admin: ALL_ACTIONS,
}

export function can(role: Role | null, action: Action): boolean {
  // In the single-role model, if you have a role at all, you can do everything.
  return role !== null
}
