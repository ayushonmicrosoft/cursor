import { useEffect, useState } from 'react'
import { Clock3, Copy, RefreshCw, ShieldAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useSession } from '../../lib/auth/session'
import type { Project } from '../../types/project'
import { VisibilityRadio, type Visibility } from './Share/VisibilityRadio'
import { AccessTable } from './Share/AccessTable'
import {
  listPermissions,
  setOfficePrivate,
  type OfficePermEntry,
} from '../../lib/offices/permissionsRepository'
import {
  listOfficeHistory,
  restoreOfficeHistoryEntry,
  type OfficeHistoryEntry,
} from '../../lib/offices/historyRepository'
import { buildCurrentPayload } from '../../lib/offices/useOfficeSync'
import { saveOfficeForce } from '../../lib/offices/officeRepository'
import { emit } from '../../lib/audit'
import { useToastStore } from '../../stores/toastStore'
import { Button, Modal, ModalBody } from '../ui'

/**
 * Workspace-access modal. This replaces the sharing-first language with
 * direct access controls for the internal single-workspace model:
 *
 *   - visibility = workspace edit vs restricted
 *   - per-person office roles + revoke access
 *   - admin-only recover / force-save tools
 *
 * Legacy anonymous share routes still exist for controlled fallback, but
 * they are intentionally not generated from this primary surface.
 */
export function ShareModal() {
  const open = useUIStore((s) => s.shareModalOpen)
  const setOpen = useUIStore((s) => s.setShareModalOpen)
  const officeId = useProjectStore((s) => s.officeId)
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
  const project = useProjectStore((s) => s.currentProject) as
    | (null | { id?: string; slug?: string; isPrivate?: boolean; teamId?: string })
  const session = useSession()
  const pushToast = useToastStore((s) => s.push)
  const { teamSlug, officeSlug } = useParams<{ teamSlug: string; officeSlug: string }>()

  const [visibility, setVisibility] = useState<Visibility>(
    project?.isPrivate ? 'private' : 'workspace-edit',
  )
  const [entries, setEntries] = useState<OfficePermEntry[]>([])
  const [history, setHistory] = useState<OfficeHistoryEntry[]>([])
  const [busyKey, setBusyKey] = useState<string | null>(null)

  async function refreshPermissions() {
    if (!officeId || !project?.teamId || session.status !== 'authenticated') return
    setEntries(await listPermissions(officeId, session.user.id, project.teamId))
  }

  async function refreshHistory() {
    if (!officeId) return
    try {
      setHistory(await listOfficeHistory(officeId, 6))
    } catch {
      setHistory([])
    }
  }

  async function refreshAll() {
    await Promise.all([refreshPermissions(), refreshHistory()])
  }

  useEffect(() => {
    if (open) void refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, officeId])

  async function onVisibilityChange(v: Visibility) {
    setVisibility(v)
    if (!officeId) return
    await setOfficePrivate(officeId, v === 'private')
    if (project) {
      setCurrentProject({ ...project, isPrivate: v === 'private' } as unknown as Project)
    }
    void emit('office_visibility_changed', 'office', officeId, {
      visibility: v,
      is_private: v === 'private',
    })
  }

  async function handleForceSave() {
    if (!officeId) return
    setBusyKey('force-save')
    const payload = buildCurrentPayload()
    const res = await saveOfficeForce(officeId, payload)
    if (res.ok) {
      useProjectStore.setState({
        loadedVersion: res.updated_at,
        lastSavedAt: res.updated_at,
        saveState: 'saved',
        conflict: null,
      })
      void emit('office_force_saved', 'office', officeId, {})
      pushToast({
        tone: 'success',
        title: 'Office force-saved',
        body: 'Current canvas state is now the server version.',
      })
      await refreshHistory()
    } else {
      pushToast({
        tone: 'error',
        title: 'Force-save failed',
        body: res.message,
      })
    }
    setBusyKey(null)
  }

  async function handleRestore(entry: OfficeHistoryEntry) {
    if (!officeId) return
    setBusyKey(`restore-${entry.id}`)
    try {
      const updatedAt = await restoreOfficeHistoryEntry(officeId, entry.id)
      useProjectStore.setState({
        loadedVersion: updatedAt,
        lastSavedAt: updatedAt,
        saveState: 'saved',
        conflict: null,
      })
      void emit('office_history_restored', 'office', officeId, {
        history_entry_id: entry.id,
        prior_updated_at: entry.prior_updated_at,
      })
      pushToast({
        tone: 'success',
        title: 'History restored',
        body: 'Reloading the office so the restored snapshot is visible.',
      })
      window.location.reload()
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Restore failed',
        body: error instanceof Error ? error.message : 'Could not restore that snapshot.',
      })
      setBusyKey(null)
    }
  }

  const canAdmin = entries.some((e) => e.isSelf && e.role === 'owner')
  const officeLink =
    teamSlug && officeSlug
      ? `${window.location.origin}/t/${teamSlug}/o/${officeSlug}/map`
      : window.location.href

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Manage office access"
      size="lg"
    >
      <ModalBody className="max-h-[75vh] space-y-6 overflow-y-auto">
        <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-medium">Direct access is the primary workflow.</p>
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                This office is meant for named internal or approved external people. Anonymous view-only
                links are no longer generated from the main UI.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Visibility</h3>
          <VisibilityRadio value={visibility} onChange={onVisibilityChange} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">People with access</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigator.clipboard?.writeText(officeLink)}
              leftIcon={<Copy size={14} aria-hidden="true" />}
            >
              Copy office URL
            </Button>
          </div>
          {officeId ? (
            <AccessTable
              officeId={officeId}
              entries={entries}
              canEdit={canAdmin}
              onChange={() => {
                void refreshPermissions()
              }}
            />
          ) : null}
        </section>

        {canAdmin && (
          <section className="space-y-3 border-t border-gray-200 pt-5 dark:border-gray-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Admin tools</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Force-save the current office or recover a previous snapshot from overwrite history.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void refreshHistory()
                }}
                leftIcon={<RefreshCw size={14} aria-hidden="true" />}
              >
                Refresh history
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  void handleForceSave()
                }}
                disabled={busyKey !== null}
              >
                {busyKey === 'force-save' ? 'Force-saving...' : 'Force-save current office'}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Clock3 size={13} aria-hidden="true" />
                Overwrite history
              </h4>
              {history.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 px-3 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  No overwrite history yet.
                </div>
              ) : (
                <ul className="space-y-2">
                  {history.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          Snapshot from {new Date(entry.prior_updated_at).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Overwritten {new Date(entry.overwritten_at).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          void handleRestore(entry)
                        }}
                        disabled={busyKey !== null}
                      >
                        {busyKey === `restore-${entry.id}` ? 'Restoring...' : 'Restore'}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </ModalBody>
    </Modal>
  )
}
