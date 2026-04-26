import { X as XIcon } from 'lucide-react'
import type { OfficePermEntry, OfficeRole } from '../../../lib/offices/permissionsRepository'
import { upsertPermission, removePermission } from '../../../lib/offices/permissionsRepository'
import { emit } from '../../../lib/audit'

/**
 * Per-row ACL editor. Owners and the current user are rendered as plain
 * text (you can't demote yourself; owners are managed at the team level).
 * `onChange` lets the parent refetch `listPermissions` after a mutation
 * rather than threading state through props.
 */
export function AccessTable({
  officeId,
  entries,
  canEdit,
  onChange,
}: {
  officeId: string
  entries: OfficePermEntry[]
  canEdit: boolean
  onChange: () => void
}) {
  const OFFICE_ROLE_OPTIONS: Array<{ value: OfficeRole; label: string }> = [
    { value: 'viewer', label: 'Viewer' },
    { value: 'space-planner', label: 'Space planner' },
    { value: 'hr-editor', label: 'HR editor' },
    { value: 'editor', label: 'Editor' },
    { value: 'owner', label: 'Owner' },
  ]

  async function setRole(entry: OfficePermEntry, role: OfficeRole) {
    await upsertPermission(officeId, entry.user_id, role)
    void emit('office_access_role_changed', 'office', officeId, {
      target_user_id: entry.user_id,
      next_role: role,
      prior_role: entry.role,
    })
    onChange()
  }
  async function remove(entry: OfficePermEntry) {
    await removePermission(officeId, entry.user_id)
    void emit('office_access_revoked', 'office', officeId, {
      target_user_id: entry.user_id,
      prior_role: entry.role,
    })
    onChange()
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <th className="pb-2">Person</th>
          <th className="pb-2 w-40">Office role</th>
          <th className="pb-2 text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr key={e.user_id} className="border-t border-gray-100 dark:border-gray-800 align-top">
            <td className="py-2.5 pr-3">
              <div className="font-medium">
                {e.name ?? e.email}
                {e.isSelf ? ' (you)' : ''}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{e.email}</div>
            </td>
            <td className="py-2.5 w-40">
              {e.role === 'owner' || !canEdit || e.isSelf ? (
                <span className="capitalize text-gray-600 dark:text-gray-300">{e.role}</span>
              ) : (
                <select
                  aria-label={`${e.email} role`}
                  value={e.role}
                  onChange={(ev) => setRole(e, ev.target.value as OfficeRole)}
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 hover:border-gray-300 focus:border-blue-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  {OFFICE_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </td>
            <td className="py-2.5 text-right">
              {canEdit && e.role !== 'owner' && !e.isSelf && (
                <button
                  onClick={() => remove(e)}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:text-gray-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  title="Revoke direct office access"
                  aria-label={`Revoke ${e.email}`}
                >
                  <XIcon size={14} />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
