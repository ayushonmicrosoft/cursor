import { can, type Action } from '../lib/permissions'
import { useProjectStore } from '../stores/projectStore'

/**
 * Returns whether the current viewer can perform `action`.
 */
export function useCan(action: Action): boolean {
  const currentOfficeRole = useProjectStore((s) => s.currentOfficeRole)
  const impersonatedRole = useProjectStore((s) => s.impersonatedRole)
  return can(impersonatedRole ?? currentOfficeRole, action)
}
