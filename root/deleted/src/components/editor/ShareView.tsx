import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Clock3,
  ExternalLink,
  Link2Off,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  buildShareUrl,
  isEmbedMode,
  parseShareToken,
} from '../../lib/shareLinkUrl'
import { useShareLinksStore } from '../../stores/shareLinksStore'
import { useProjectStore } from '../../stores/projectStore'
import { useFloorStore } from '../../stores/floorStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useUIStore } from '../../stores/uiStore'
import { CanvasStage } from './Canvas/CanvasStage'
import { Minimap } from './Minimap'
import { StatusBar } from './StatusBar'
import { CanvasFinder } from './CanvasFinder'
import { CanvasActionDock } from './Canvas/CanvasActionDock'
import { FloorSwitcher } from './FloorSwitcher'

type ShareValidity = 'valid' | 'missing' | 'not-found' | 'revoked' | 'expired'

/**
 * Public route `/share/:officeSlug?t=<token>`.
 *
 * This page is intentionally read-only. A valid token installs the
 * synthetic `shareViewer` role so every downstream `useCan` gate denies
 * writes and PII.
 */
export function ShareView() {
  const { officeSlug } = useParams<{ officeSlug: string }>()
  const [searchParams] = useSearchParams()
  const token = parseShareToken(searchParams)
  const isEmbed = isEmbedMode(searchParams)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())

  // Subscribe so concurrent revoke/expiry changes re-render this route.
  const links = useShareLinksStore((s) => s.links)

  const matchedLink = useMemo(() => {
    if (!token) return null
    return Object.values(links).find((link) => link.token === token) ?? null
  }, [links, token])

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 15_000)
    return () => clearInterval(id)
  }, [])

  const validity: ShareValidity = useMemo(() => {
    if (!token) return 'missing'
    if (!matchedLink) return 'not-found'
    if (matchedLink.revokedAt) return 'revoked'
    if (new Date(matchedLink.expiresAt).getTime() <= nowMs) return 'expired'
    return 'valid'
  }, [token, matchedLink, nowMs])

  useEffect(() => {
    if (validity !== 'valid') return
    const prev = useProjectStore.getState().currentOfficeRole
    useProjectStore.setState({
      currentOfficeRole: 'shareViewer',
      impersonatedRole: null,
    })
    return () => {
      if (useProjectStore.getState().currentOfficeRole === 'shareViewer') {
        useProjectStore.setState({ currentOfficeRole: prev })
      }
    }
  }, [validity])

  // Embeds default the minimap off for a cleaner iframe footprint.
  useEffect(() => {
    if (validity !== 'valid' || !isEmbed) return
    const prev = useUIStore.getState().minimapVisible
    useUIStore.getState().setMinimapVisible(false)
    return () => {
      useUIStore.getState().setMinimapVisible(prev)
    }
  }, [validity, isEmbed])

  if (validity !== 'valid') {
    return <InvalidShareState validity={validity} isEmbed={isEmbed} />
  }

  const fullShareHref = buildShareUrl({
    officeSlug: officeSlug ?? '',
    token: token ?? '',
  })

  if (isEmbed) {
    return (
      <div
        className="fixed inset-0 h-dvh w-screen overflow-hidden bg-gray-100 dark:bg-gray-900"
        data-testid="share-view-embed"
      >
        <CanvasStage />
        <CanvasFinder />
        <EmbedStatusBar
          fullShareHref={fullShareHref}
          expiresAt={matchedLink?.expiresAt ?? null}
          nowMs={nowMs}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900/60">
      <ShareHeader
        officeName={officeSlug ?? ''}
        expiresAt={matchedLink?.expiresAt ?? null}
        nowMs={nowMs}
      />
      <FloorSwitcher />
      <div className="relative flex-1 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <CanvasStage />
        <StatusBar />
        <Minimap />
        <CanvasActionDock />
      </div>
      <CanvasFinder />
    </div>
  )
}

function ShareHeader({
  officeName,
  expiresAt,
  nowMs,
}: {
  officeName: string
  expiresAt: string | null
  nowMs: number
}) {
  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-950 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden
          className="inline-flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-xs font-bold text-white"
        >
          F
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          OandOcraft
        </span>
        <span aria-hidden className="text-gray-300 dark:text-gray-700">
          /
        </span>
        <span className="truncate text-sm text-gray-600 dark:text-gray-300">
          {officeName}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <ShieldCheck size={12} aria-hidden="true" />
          Read-only
        </span>
        {expiresAt && (
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
            <Clock3 size={12} aria-hidden="true" />
            Expires {formatRelativeFuture(expiresAt, nowMs)}
          </span>
        )}
      </div>
    </header>
  )
}

function EmbedStatusBar({
  fullShareHref,
  expiresAt,
  nowMs,
}: {
  fullShareHref: string
  expiresAt: string | null
  nowMs: number
}) {
  const elements = useElementsStore((s) => s.elements)
  const floors = useFloorStore((s) => s.floors)
  const activeFloorId = useFloorStore((s) => s.activeFloorId)
  const activeFloor = floors.find((f) => f.id === activeFloorId) ?? floors[0]
  const elementCount = Object.keys(elements).length

  return (
    <div
      role="status"
      aria-label="Embed status"
      data-testid="share-view-embed-status"
      className="absolute bottom-0 left-0 right-0 flex h-8 items-center border-t border-gray-200 bg-white/95 px-3 text-[11px] text-gray-500 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 dark:text-gray-400"
    >
      <span className="font-medium text-gray-700 dark:text-gray-200">
        OandOcraft
      </span>
      <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
      <span className="font-medium">Read-only</span>
      {activeFloor && (
        <>
          <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
          <span>{activeFloor.name}</span>
        </>
      )}
      <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
      <span className="tabular-nums">
        {elementCount} element{elementCount === 1 ? '' : 's'}
      </span>
      {expiresAt && (
        <>
          <span className="mx-2 text-gray-300 dark:text-gray-700">|</span>
          <span>Expires {formatRelativeFuture(expiresAt, nowMs)}</span>
        </>
      )}
      <a
        href={fullShareHref}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline dark:text-blue-300"
      >
        Open full view
        <ExternalLink size={11} aria-hidden="true" />
      </a>
    </div>
  )
}

function formatRelativeFuture(iso: string, nowMs: number): string {
  const ms = new Date(iso).getTime() - nowMs
  if (ms <= 0) return 'soon'
  const s = Math.floor(ms / 1000)
  if (s < 60) return `in ${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `in ${m}m`
  const h = Math.floor(m / 60)
  if (h < 48) return `in ${h}h`
  const d = Math.floor(h / 24)
  return `in ${d}d`
}

function InvalidShareState({
  validity,
  isEmbed,
}: {
  validity: Exclude<ShareValidity, 'valid'>
  isEmbed: boolean
}) {
  const content = (() => {
    if (validity === 'missing') {
      return {
        title: 'Missing link token',
        body: 'This URL is missing its share token. Use the full link from the office owner.',
      }
    }
    if (validity === 'expired') {
      return {
        title: 'This link has expired',
        body: 'Ask the office owner for a fresh read-only share link.',
      }
    }
    if (validity === 'revoked') {
      return {
        title: 'This link has been revoked',
        body: 'The owner has removed access for this public link.',
      }
    }
    return {
      title: 'This link is not valid',
      body: 'Check for a typo or request a fresh share URL from the owner.',
    }
  })()

  return (
    <div
      className={
        isEmbed
          ? 'flex h-dvh w-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900'
          : 'flex h-screen w-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900/60'
      }
      role="alert"
      aria-live="assertive"
    >
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          {validity === 'expired'
            ? <Clock3 size={16} aria-hidden="true" />
            : validity === 'revoked'
              ? <Link2Off size={16} aria-hidden="true" />
              : <AlertTriangle size={16} aria-hidden="true" />}
        </div>
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{content.title}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{content.body}</p>
        {!isEmbed ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reload link
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            >
              Back to dashboard
            </Link>
            <Link
              to="/"
              className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reload link
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
