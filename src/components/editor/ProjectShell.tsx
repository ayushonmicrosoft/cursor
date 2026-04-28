import { Outlet, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { TopBar } from './TopBar'
import { NarrowScreenBanner } from './NarrowScreenBanner'
import { ContextMenu } from './ContextMenu'
import { KeyboardShortcutsOverlay } from './KeyboardShortcutsOverlay'
import { CommandPalette } from './CommandPalette'
import { CanvasFinder } from './CanvasFinder'
import { CSVImportDialog } from './RightSidebar/CSVImportDialog'
import { CSVImportSummaryModal } from './CSVImportSummaryModal'
import { ExportDialog } from './ExportDialog'
import { NewProjectModal } from '../dashboard/NewProjectModal'
import { CalibrateScaleModal } from './CalibrateScaleModal'
import { EmployeeDirectory } from '../reports/EmployeeDirectory'
import { ConflictModal } from './ConflictModal'
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
  migrateAnnotations,
  migrateEmployees,
} from '../../lib/offices/loadFromLegacyPayload'
import { commitDueStatusChanges } from '../../lib/commitDueStatusChanges'
import { todayIsoDate } from '../../lib/time'
import { useEffectiveDateTick } from '../../hooks/useEffectiveDateTick'
import type { Project } from '../../types/project'
import { DEFAULT_CANVAS_SETTINGS, isSeatLabelStyle } from '../../types/project'

type ShellState = 'loading' | 'not_found' | 'ready'

export function ProjectShell() {
  const { teamSlug, officeSlug } = useParams<{ teamSlug: string; officeSlug: string }>()
  const [shellState, setShellState] = useState<ShellState>('loading')

  const employeeDirectoryOpen = useUIStore((s) => s.employeeDirectoryOpen)
  const currentProject = useProjectStore((s) => s.currentProject)
  const conflict = useProjectStore((s) => s.conflict)
  const session = useSession()

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
    document.title = view ? `${view} · ${name} — OandOcraft` : `${name} — OandOcraft`
    return () => {
      document.title = prev
    }
  }, [currentProject?.name, location.pathname])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!teamSlug || !officeSlug) return
      setShellState('loading')
      const { data: team } = await supabase.from('teams').select('id').eq('slug', teamSlug).single()
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
        elements: (p.elements ?? {}) as ReturnType<typeof useElementsStore.getState>['elements'],
      })
      useEmployeeStore.setState({
        employees: nextEmployees,
        departmentColors: (p.departmentColors ?? {}) as Record<string, string>,
      })

      const floors = (p.floors ?? []) as any[]
      if (floors.length > 0) {
        useFloorStore.setState({ floor: floors[0] })
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

      useSeatHistoryStore.setState({ entries: coerceSeatHistoryEntries(p.seatHistory) })

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
        currentOfficeRole: 'admin',
      })
      useProjectStore.setState({
        currentTeamId: office.team_id,
        currentUserId: session.status === 'authenticated' ? session.user.id : null,
      })
      useInsightsStore.getState().setCurrentProjectId(office.id)

      setShellState('ready')
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [teamSlug, officeSlug])

  if (shellState === 'loading') {
    return <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Loading office…</div>
  }
  if (shellState === 'not_found') {
    return <div className="p-6 text-sm text-red-600 dark:text-red-400">Office not found.</div>
  }

  return (
    <div className="flex min-w-0 flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-800/50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:shadow-lg focus:rounded"
      >
        Skip to main content
      </a>
      <NarrowScreenBanner />
      <TopBar />
      <main id="main-content" tabIndex={-1} className="contents">
        <Outlet />
      </main>
      <ContextMenu />
      <KeyboardShortcutsOverlay />
      <CommandPalette />
      <CanvasFinder />
      <CSVImportDialog />
      <CSVImportSummaryModal />
      <ExportDialog />
      <NewProjectModal />
      <CalibrateScaleModal />
      {employeeDirectoryOpen && <EmployeeDirectory />}
      <Toaster />
      {conflict && (
        <ConflictModal
          onReload={() => window.location.reload()}
          onOverwrite={() => void overwrite()}
          onCancel={() => useProjectStore.setState({ conflict: null })}
        />
      )}
    </div>
  )
}
