import { Outlet, useLocation, useParams } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { TopBar } from './TopBar'
import { NarrowScreenBanner } from './NarrowScreenBanner'
import { Toaster } from '../common/Toaster'
import { useUIStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { useFloorStore } from '../../stores/floorStore'
import { useEmployeeStore } from '../../stores/employeeStore'
import { useInsightsStore } from '../../stores/insightsStore'
import { useSeatHistoryStore } from '../../stores/seatHistoryStore'
import { coerceSeatHistoryEntries } from '../../lib/offices/seatHistoryPersistence'
import { useNeighborhoodStore } from '../../stores/neighborhoodStore'
import { useAnnotationsStore } from '../../stores/annotationsStore'
import type { Neighborhood } from '../../types/neighborhood'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useUndoDataLossToast } from '../../hooks/useUndoDataLossToast'
import { supabase } from '../../lib/supabase'
import { loadOffice } from '../../lib/offices/officeRepository'
import { useOfficeSync } from '../../lib/offices/useOfficeSync'
import { useSession } from '../../lib/auth/session'
import { isEmployeeStatus, type Employee } from '../../types/employee'
import {
  migrateElements,
  migrateAnnotations,
  migrateEmployees,
} from '../../lib/offices/loadFromLegacyPayload'
import { commitDueStatusChanges } from '../../lib/commitDueStatusChanges'
import { todayIsoDate } from '../../lib/time'
import { useEffectiveDateTick } from '../../hooks/useEffectiveDateTick'
import type { Project } from '../../types/project'
import { DEFAULT_CANVAS_SETTINGS, isSeatLabelStyle } from '../../types/project'
import type { Floor } from '../../types/floor'
import { preloadSilhouettes } from '../../lib/silhouettes/loadSilhouettes'

type ShellState = 'loading' | 'not_found' | 'ready'

const ContextMenu = lazy(() =>
  import('./ContextMenu').then((m) => ({ default: m.ContextMenu })),
)
const KeyboardShortcutsOverlay = lazy(() =>
  import('./KeyboardShortcutsOverlay').then((m) => ({
    default: m.KeyboardShortcutsOverlay,
  })),
)
const CommandPalette = lazy(() =>
  import('./CommandPalette').then((m) => ({ default: m.CommandPalette })),
)
const CanvasFinder = lazy(() =>
  import('./CanvasFinder').then((m) => ({ default: m.CanvasFinder })),
)
const CSVImportDialog = lazy(() =>
  import('./RightSidebar/CSVImportDialog').then((m) => ({
    default: m.CSVImportDialog,
  })),
)
const CSVImportSummaryModal = lazy(() =>
  import('./CSVImportSummaryModal').then((m) => ({
    default: m.CSVImportSummaryModal,
  })),
)
const ExportDialog = lazy(() =>
  import('./ExportDialog').then((m) => ({ default: m.ExportDialog })),
)
const AIAssistantDialog = lazy(() =>
  import('../ai/AIAssistantDialog').then((m) => ({
    default: m.AIAssistantDialog,
  })),
)
const NewProjectModal = lazy(() =>
  import('../dashboard/NewProjectModal').then((m) => ({
    default: m.NewProjectModal,
  })),
)
const CalibrateScaleModal = lazy(() =>
  import('./CalibrateScaleModal').then((m) => ({
    default: m.CalibrateScaleModal,
  })),
)
const EmployeeDirectory = lazy(() =>
  import('../reports/EmployeeDirectory').then((m) => ({
    default: m.EmployeeDirectory,
  })),
)
const ConflictModal = lazy(() =>
  import('./ConflictModal').then((m) => ({ default: m.ConflictModal })),
)

export function ProjectShell() {
  const { teamSlug, officeSlug } = useParams<{
    teamSlug: string
    officeSlug: string
  }>()
  const [shellState, setShellState] = useState<ShellState>('loading')

  const employeeDirectoryOpen = useUIStore((s) => s.employeeDirectoryOpen)
  const currentProject = useProjectStore((s) => s.currentProject)
  const conflict = useProjectStore((s) => s.conflict)
  const session = useSession()
  const sessionUserId =
    session.status === 'authenticated' ? session.user.id : null

  useKeyboardShortcuts()
  useUndoDataLossToast()
  useEffectiveDateTick()
  const { overwrite } = useOfficeSync()

  const location = useLocation()
  useEffect(() => {
    const name = currentProject?.name?.trim() || 'Untitled Office Plan'
    const view = location.pathname.includes('/roster')
      ? 'Roster'
      : location.pathname.includes('/map')
        ? 'Map'
        : ''
    const prev = document.title
    document.title = view
      ? `${view} · ${name} — OandOcraft`
      : `${name} — OandOcraft`
    return () => {
      document.title = prev
    }
  }, [currentProject?.name, location.pathname])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!teamSlug || !officeSlug) return
      setShellState('loading')

      // Preload silhouettes at app initialization
      preloadSilhouettes()

      try {
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('id')
          .eq('slug', teamSlug)
          .single()
        if (teamError) throw teamError
        if (!team) {
          if (!cancelled) setShellState('not_found')
          return
        }
        const teamId = (team as { id: string }).id
        const office = await loadOffice(teamId, officeSlug)
        if (!office) {
          if (!cancelled) setShellState('not_found')
          return
        }
        if (cancelled) return

        const p = office.payload as Record<string, unknown>
        const rawEmployees = (p.employees ?? {}) as Record<string, Employee>

      const migratedEmployees = migrateEmployees(
        rawEmployees as unknown as Record<string, unknown>,
      ) as Record<string, Employee>

      const { nextEmployees } = commitDueStatusChanges(
        migratedEmployees,
        todayIsoDate(),
      )

      for (const [id, e] of Object.entries(nextEmployees)) {
        if (!isEmployeeStatus(e.status)) {
          nextEmployees[id] = { ...e, status: 'active' }
        }
      }

      useElementsStore.setState({
        elements: migrateElements((p.elements ?? {}) as Record<string, unknown>),
      })
      useEmployeeStore.setState({
        employees: nextEmployees,
        departmentColors: (p.departmentColors ?? {}) as Record<string, string>,
      })

      const floors = (p.floors ?? []) as Floor[]
      if (floors.length > 0) {
        useFloorStore.getState().setFloor(floors[0])
      }

      if (p.settings) {
        const rawSettings = p.settings as Record<string, unknown>
        const settings = {
          ...DEFAULT_CANVAS_SETTINGS,
          ...rawSettings,
          seatLabelStyle: isSeatLabelStyle(rawSettings.seatLabelStyle)
            ? rawSettings.seatLabelStyle
            : 'pill',
        } as ReturnType<typeof useCanvasStore.getState>['settings']
        useCanvasStore.setState({ settings })
      }

      useSeatHistoryStore.setState({
        entries: coerceSeatHistoryEntries(p.seatHistory),
      })

      useNeighborhoodStore.setState({
        neighborhoods:
          (p.neighborhoods as Record<string, Neighborhood> | undefined) ?? {},
      })

      useAnnotationsStore.setState({
        annotations: migrateAnnotations(p.annotations),
      })

      const projectFacade = {
        id: office.id,
        name: office.name,
        slug: office.slug,
        teamId: office.team_id,
        isPrivate: office.is_private,
      } as unknown as Project
      useProjectStore.setState({
        currentProject: projectFacade,
        officeId: office.id,
        loadedVersion: office.updated_at,
        lastSavedAt: office.updated_at,
        saveState: 'saved',
        conflict: null,
        conflictDismissedVersion: null,
        currentOfficeRole: 'edit',
      })
      useProjectStore.setState({
        currentTeamId: office.team_id,
        currentUserId: sessionUserId,
      })
      useInsightsStore.getState().setCurrentProjectId(office.id)

        setShellState('ready')
      } catch (error) {
        console.error('[ProjectShell] Failed to load office shell', error)
        if (!cancelled) setShellState('not_found')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [teamSlug, officeSlug, sessionUserId])

  if (shellState === 'loading') {
    return (
      <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
        Loading office…
      </div>
    )
  }
  if (shellState === 'not_found') {
    return (
      <div className="p-6 text-sm text-red-600 dark:text-red-400">
        Office not found.
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full max-w-full min-w-0 flex-col overflow-hidden bg-gray-50 dark:bg-gray-800/50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow-lg"
      >
        Skip to main content
      </a>
      <NarrowScreenBanner />
      <TopBar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-0 min-w-0 flex-1"
      >
        <Outlet />
      </main>
      <Suspense fallback={null}>
        <ContextMenu />
        <KeyboardShortcutsOverlay />
        <CommandPalette />
        <CanvasFinder />
        <CSVImportDialog />
        <CSVImportSummaryModal />
        <ExportDialog />
        <AIAssistantDialog />
        <NewProjectModal />
        <CalibrateScaleModal />
        {employeeDirectoryOpen && <EmployeeDirectory />}
        {conflict && (
          <ConflictModal
            onReload={() => window.location.reload()}
            onOverwrite={() => void overwrite()}
            onCancel={() => {
              const version = useProjectStore.getState().loadedVersion
              useProjectStore.getState().dismissConflictForVersion(version)
            }}
          />
        )}
      </Suspense>
      <Toaster />
    </div>
  )
}
