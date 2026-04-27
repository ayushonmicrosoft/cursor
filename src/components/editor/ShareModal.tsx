import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Globe2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useShareLinksStore, SHARE_LINK_TTL_OPTIONS } from '../../stores/shareLinksStore'
import { useSession } from '../../lib/auth/session'
import type { Project } from '../../types/project'
import type { ShareLink } from '../../types/shareLinks'
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
import { buildEmbedSnippet, buildShareUrl } from '../../lib/shareLinkUrl'
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
  const shareLinks = useShareLinksStore((s) => s.links)
  const createShareLink = useShareLinksStore((s) => s.create)
  const revokeShareLink = useShareLinksStore((s) => s.revoke)
  const { teamSlug, officeSlug } = useParams<{ teamSlug: string; officeSlug: string }>()

  const [visibility, setVisibility] = useState<Visibility>(
    project?.isPrivate ? 'private' : 'workspace-edit',
  )
  const [entries, setEntries] = useState<OfficePermEntry[]>([])
  const [history, setHistory] = useState<OfficeHistoryEntry[]>([])
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [publicLinkTtl, setPublicLinkTtl] = useState<number>(SHARE_LINK_TTL_OPTIONS[1].seconds)
  const [publicLinkLabel, setPublicLinkLabel] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())
  const copiedResetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setNowMs(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [open])

  useEffect(() => {
    return () => {
      if (copiedResetRef.current) clearTimeout(copiedResetRef.current)
    }
  }, [])

  const canAdmin = entries.some((e) => e.isSelf && e.role === 'owner')
  const shareSlug = project?.slug ?? officeSlug ?? officeId ?? ''
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const officeLink =
    teamSlug && officeSlug
      ? `${origin}/t/${teamSlug}/o/${officeSlug}/map`
      : origin
        ? `${origin}/t/${teamSlug ?? ''}/o/${officeSlug ?? ''}/map`
        : ''
  const publicLinks = useMemo(
    () =>
      Object.values(shareLinks)
        .filter((link) => link.officeId === officeId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [shareLinks, officeId],
  )

  function setCopiedFeedback(key: string) {
    setCopiedKey(key)
    if (copiedResetRef.current) clearTimeout(copiedResetRef.current)
    copiedResetRef.current = setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current))
    }, 1600)
  }

  async function handleCopy(value: string, key: string) {
    if (!value) return
    void navigator.clipboard?.writeText(value)
    setCopiedFeedback(key)
  }

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

  function handleCreatePublicLink() {
    if (!officeId || !canAdmin) return
    const trimmed = publicLinkLabel.trim()
    const { link } = createShareLink(
      officeId,
      publicLinkTtl,
      trimmed.length > 0 ? trimmed : undefined,
      {
        id: session.status === 'authenticated' ? session.user.id : null,
        name: null,
      },
    )
    setPublicLinkLabel('')
    void emit('share_link_created', 'office', officeId, {
      link_id: link.id,
      ttl_seconds: publicLinkTtl,
    })
    pushToast({
      tone: 'success',
      title: 'Public link created',
      body: 'Copy and share it from the row below.',
    })
  }

  function handleRevokePublicLink(link: ShareLink) {
    if (!officeId || link.revokedAt) return
    revokeShareLink(link.id)
    void emit('share_link_revoked', 'office', officeId, {
      link_id: link.id,
    })
    pushToast({
      tone: 'success',
      title: 'Public link revoked',
      body: 'Anyone opening that URL will now see an invalid-link state.',
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
              onClick={() => {
                void handleCopy(officeLink, 'office-link')
              }}
              leftIcon={
                copiedKey === 'office-link'
                  ? <Check size={14} aria-hidden="true" />
                  : <Copy size={14} aria-hidden="true" />
              }
            >
              {copiedKey === 'office-link' ? 'Copied office URL' : 'Copy office URL'}
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

        <section className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/40">
          <div className="flex items-center gap-2">
            <Globe2 size={16} aria-hidden="true" className="text-indigo-600 dark:text-indigo-300" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Public read-only links
            </h3>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              Legacy
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Direct named-person access above is the default. Use public links only for one-off
            external reviews or embeds.
          </p>

          {canAdmin ? (
            <>
              <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)_auto]">
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Link expiry
                  <select
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                    value={publicLinkTtl}
                    onChange={(event) => setPublicLinkTtl(Number(event.target.value))}
                  >
                    {SHARE_LINK_TTL_OPTIONS.map((option) => (
                      <option key={option.seconds} value={option.seconds}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Label (optional)
                  <input
                    value={publicLinkLabel}
                    onChange={(event) => setPublicLinkLabel(event.target.value)}
                    placeholder="e.g. quarterly board review"
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  />
                </label>
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreatePublicLink}
                    disabled={!officeId}
                  >
                    Create link
                  </Button>
                </div>
              </div>

              {publicLinks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No public links yet.
                </div>
              ) : (
                <ul className="space-y-2">
                  {publicLinks.map((link) => {
                    const status = describeShareLinkStatus(link, nowMs)
                    const shareHref = buildShareUrl({
                      officeSlug: shareSlug,
                      token: link.token,
                    })
                    const shareUrl = new URL(shareHref, origin || 'http://localhost').toString()
                    const embedSnippet = buildEmbedSnippet({
                      origin: origin || 'http://localhost',
                      officeSlug: shareSlug,
                      token: link.token,
                    })
                    const linkCopyKey = `copy-link-${link.id}`
                    const embedCopyKey = `copy-embed-${link.id}`
                    const isActive = status.kind === 'active'
                    return (
                      <li
                        key={link.id}
                        className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950/40"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                            {link.label ?? 'Untitled link'}
                          </span>
                          <span className={statusBadgeClass(status.kind)}>{status.label}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Created {new Date(link.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <code className="mt-2 block truncate rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                          {shareUrl}
                        </code>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={
                              copiedKey === linkCopyKey
                                ? <Check size={13} aria-hidden="true" />
                                : <Copy size={13} aria-hidden="true" />
                            }
                            onClick={() => {
                              void handleCopy(shareUrl, linkCopyKey)
                            }}
                          >
                            {copiedKey === linkCopyKey ? 'Link copied' : 'Copy link'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={
                              copiedKey === embedCopyKey
                                ? <Check size={13} aria-hidden="true" />
                                : <Copy size={13} aria-hidden="true" />
                            }
                            onClick={() => {
                              void handleCopy(embedSnippet, embedCopyKey)
                            }}
                            disabled={!isActive}
                          >
                            {copiedKey === embedCopyKey ? 'Embed copied' : 'Copy embed'}
                          </Button>
                          <a
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            Open
                            <ExternalLink size={12} aria-hidden="true" />
                          </a>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRevokePublicLink(link)}
                            disabled={!isActive}
                          >
                            Revoke
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Only workspace owners can create or revoke public links.
            </div>
          )}
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

type ShareLinkStatus = 'active' | 'expired' | 'revoked'

function describeShareLinkStatus(link: ShareLink, nowMs: number): { kind: ShareLinkStatus; label: string } {
  if (link.revokedAt) return { kind: 'revoked', label: 'Revoked' }
  const remainingMs = new Date(link.expiresAt).getTime() - nowMs
  if (remainingMs <= 0) return { kind: 'expired', label: 'Expired' }
  return { kind: 'active', label: `Expires in ${formatDuration(remainingMs)}` }
}

function statusBadgeClass(status: ShareLinkStatus): string {
  if (status === 'active') {
    return 'inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  }
  if (status === 'expired') {
    return 'inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  }
  return 'inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300'
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}
