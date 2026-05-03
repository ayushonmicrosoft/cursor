import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Sparkles,
  X,
  MousePointer,
  Users,
  MapPin,
  Menu,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Check,
  Hand,
  MousePointerClick,
  Type,
  Search,
  FileText,
  Zap,
} from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { useElementsStore } from '../../stores/elementsStore'
import { useEmployeeStore } from '../../stores/employeeStore'
import { useFloorStore } from '../../stores/floorStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { useProjectStore } from '../../stores/projectStore'
import { useNeighborhoodStore } from '../../stores/neighborhoodStore'
import { useAnnotationsStore } from '../../stores/annotationsStore'
import { useToastStore } from '../../stores/toastStore'
import { buildDemoOfficePayload } from '../../lib/demo/createDemoOffice'
import { saveOffice } from '../../lib/offices/officeRepository'
import { prefersReducedMotion } from '../../lib/prefersReducedMotion'

const STORAGE_KEY = 'floorcraft.onboardingCompleted'
const LEGACY_STORAGE_KEY = 'firstRunWelcomeSeen'
const DEMO_DISMISSED_KEY = 'floocraft.firstRunDemoDismissed'
const ONBOARDING_COMPLETED_KEY = 'floocraft.onboardingCompleted'
const LEGACY_ONBOARDING_COMPLETED_KEY = 'firstRunOnboardingCompleted'
const ONBOARDING_STEP_KEY = 'floocraft.onboardingStep'

function readInitialSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1' || localStorage.getItem(LEGACY_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Private mode / quota — the card still unmounts via component state.
  }
}

function readDemoDismissed(): boolean {
  try {
    return localStorage.getItem(DEMO_DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeDemoDismissed(): void {
  try {
    localStorage.setItem(DEMO_DISMISSED_KEY, '1')
  } catch {
    // Ignore — state still flips locally.
  }
}

function readOnboardingCompleted(): boolean {
  try {
    return (
      localStorage.getItem(ONBOARDING_COMPLETED_KEY) === '1' ||
      localStorage.getItem(LEGACY_ONBOARDING_COMPLETED_KEY) === '1'
    )
  } catch {
    return false
  }
}

function writeOnboardingCompleted(): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, '1')
    localStorage.removeItem(ONBOARDING_STEP_KEY)
  } catch {
    // Ignore
  }
}

function readOnboardingStep(): number {
  try {
    const step = localStorage.getItem(ONBOARDING_STEP_KEY)
    return step ? parseInt(step, 10) : 0
  } catch {
    return 0
  }
}

function writeOnboardingStep(step: number): void {
  try {
    localStorage.setItem(ONBOARDING_STEP_KEY, String(step))
  } catch {
    // Ignore
  }
}

interface CoachStep {
  id: string
  title: string
  body: React.ReactNode
  icon: React.ReactNode
  highlight?: 'tools' | 'canvas' | 'roster' | 'reports' | 'context-menu'
  action?: string
}

/**
 * First-run coach composite. Three surfaces live here:
 *
 *   1. `FirstRunDemoSeeder` — a small inline card shown ONLY when the
 *      active office is empty. Offers a one-click "Load sample content" CTA.
 *      Persists dismiss under `floocraft.firstRunDemoDismissed`.
 *
 *   2. `FirstRunCoachTour` — a comprehensive step-by-step onboarding
 *      teaching new users: choosing tools, placing elements, assigning
 *      employees, using context menus, and accessing reports.
 *      Persists progress and completion in localStorage.
 *
 *   3. `QuickStartHints` — subtle contextual hints that appear during
 *      first use (e.g., "Press V for select tool").
 *
 * All three are opt-in to dismissal independently.
 */
interface FirstRunCoachProps {
  forceTourOpen?: boolean
  onTourClosed?: () => void
}

export function FirstRunCoach({
  forceTourOpen = false,
  onTourClosed,
}: FirstRunCoachProps = {}) {
  return (
    <>
      <FirstRunDemoSeeder />
      <FirstRunCoachTour forceOpen={forceTourOpen} onDismissed={onTourClosed} />
    </>
  )
}

/**
 * Inline "Load sample content" card. Parked top-right above the existing
 * coach popover so both can coexist on an empty office.
 */
function FirstRunDemoSeeder() {
  const [dismissed, setDismissed] = useState<boolean>(() => readDemoDismissed())
  const [loading, setLoading] = useState(false)
  const reducedMotion = useRef(prefersReducedMotion()).current

  const elementCount = useElementsStore((s) => Object.keys(s.elements).length)
  const employeeCount = useEmployeeStore((s) => Object.keys(s.employees).length)
  const isEmpty = elementCount === 0 && employeeCount === 0

  const officeId = useProjectStore((s) => s.officeId)
  const loadedVersion = useProjectStore((s) => s.loadedVersion)

  const handleDismiss = useCallback(() => {
    writeDemoDismissed()
    setDismissed(true)
  }, [])

  const handleLoad = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      const payload = buildDemoOfficePayload()

      if (officeId && loadedVersion) {
        try {
          const res = await saveOffice(
            officeId,
            payload as unknown as Record<string, unknown>,
            loadedVersion,
          )
          if (res.ok) {
            useProjectStore.setState({
              loadedVersion: res.updated_at,
              lastSavedAt: res.updated_at,
              saveState: 'saved',
            })
          }
        } catch (err) {
          console.warn(
            '[FirstRunDemoSeeder] saveOffice threw; seeding stores anyway',
            err,
          )
        }
      }

      useElementsStore.setState({ elements: payload.elements })
      useEmployeeStore.setState({
        employees: payload.employees,
        departmentColors: payload.departmentColors,
      })
      useFloorStore.setState({
        floors: payload.floors,
        activeFloorId: payload.activeFloorId,
      })
      useCanvasStore.setState({ settings: payload.settings })
      useNeighborhoodStore.setState({ neighborhoods: payload.neighborhoods })
      useAnnotationsStore.setState({ annotations: payload.annotations })

      useToastStore.getState().push({
        tone: 'success',
        title: 'Sample office loaded — welcome to OandOcraft',
        body: 'Three floors, 45 people, neighborhoods, and annotations are ready to explore.',
      })

      writeDemoDismissed()
      setDismissed(true)
    } finally {
      setLoading(false)
    }
  }, [loading, officeId, loadedVersion])

  if (dismissed || !isEmpty) return null

  return (
    <div
      role="region"
      aria-labelledby="first-run-demo-title"
      className={`absolute top-4 right-4 z-40 w-[340px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 ${
        reducedMotion
          ? ''
          : 'animate-in fade-in slide-in-from-top-2 duration-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        >
          <Sparkles size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div
            id="first-run-demo-title"
            className="text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            New to OandOcraft?
          </div>
          <p className="mt-1 text-sm leading-snug text-gray-600 dark:text-gray-300">
            Load a sample office with{' '}
            <span className="font-medium tabular-nums">45 people</span>, three
            floors, and neighborhoods to see how it all fits together.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="-mt-1 -mr-1 flex-shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Dismiss sample-content card"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleLoad}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:opacity-50"
        >
          <Sparkles size={14} aria-hidden="true" />
          {loading ? 'Loading…' : 'Load sample content'}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Start from scratch
        </button>
      </div>
    </div>
  )
}

/**
 * Comprehensive step-by-step onboarding tour.
 * Wave 12D: Expanded to cover core workflows with progress persistence.
 */
function FirstRunCoachTour({
  forceOpen,
  onDismissed,
}: {
  forceOpen: boolean
  onDismissed?: () => void
}) {
  const wasCompleted = useRef(readOnboardingCompleted())
  const savedStep = useRef(readOnboardingStep())
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (forceOpen) return false
    return wasCompleted.current || readInitialSeen()
  })
  const [stepIdx, setStepIdx] = useState(() => {
    if (forceOpen) return 0
    if (wasCompleted.current) return 0
    return savedStep.current
  })
  const cardRef = useRef<HTMLDivElement | null>(null)
  const primaryBtnRef = useRef<HTMLButtonElement | null>(null)
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)

  useEffect(() => {
    if (!forceOpen) return
    setDismissed(false)
    setStepIdx(0)
  }, [forceOpen])

  const steps: CoachStep[] = useMemo(
    () => [
      {
        id: 'welcome',
        title: 'Welcome to OandOcraft',
        icon: <Sparkles size={20} />,
        action: 'Use Next or the step dots to move through the tour',
        body: (
          <>
            Let's walk through the basics of creating and managing your office
            space. This tour takes about 2 minutes.
          </>
        ),
      },
      {
        id: 'tools',
        title: 'Choose Your Tool',
        icon: <MousePointer size={20} />,
        highlight: 'tools',
        body: (
          <>
            The left sidebar contains all your drawing tools. Click any tool to
            activate it, <strong>or use hotkeys</strong>:{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              V
            </kbd>{' '}
            for select,{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              W
            </kbd>{' '}
            for walls,{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              T
            </kbd>{' '}
            for text.
          </>
        ),
      },
      {
        id: 'place-element',
        title: 'Place Your First Element',
        icon: <MousePointerClick size={20} />,
        highlight: 'canvas',
        action: 'Try selecting a tool and clicking on the canvas',
        body: (
          <>
            With a tool selected, click and drag on the canvas to create
            elements. Walls: click to start, click to end. Shapes: drag to size.
          </>
        ),
      },
      {
        id: 'pan-zoom',
        title: 'Navigate the Canvas',
        icon: <Hand size={20} />,
        highlight: 'canvas',
        body: (
          <>
            <strong>Pan:</strong> drag empty space (or hold Space).{' '}
            <strong>Zoom:</strong> scroll or pinch. <strong>Fit view:</strong>{' '}
            press{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              Cmd+0
            </kbd>
            . Use the minimap in the corner for quick navigation.
          </>
        ),
      },
      {
        id: 'select-move',
        title: 'Select and Move',
        icon: <MousePointer size={20} />,
        highlight: 'canvas',
        body: (
          <>
            Press{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              V
            </kbd>{' '}
            for the select tool. Click elements to select, drag to move.{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              Shift+drag
            </kbd>{' '}
            for multi-select. Arrow keys nudge by 1px.
          </>
        ),
      },
      {
        id: 'context-menu',
        title: 'Right-Click / Long-Press Menu',
        icon: <Menu size={20} />,
        highlight: 'context-menu',
        body: (
          <>
            Right-click (or long-press on touch) any element for quick actions:
            duplicate, delete, lock, assign employee, or edit properties. Try it
            on any desk or shape!
          </>
        ),
      },
      {
        id: 'employees',
        title: 'Add Your Team',
        icon: <Users size={20} />,
        highlight: 'roster',
        body: (
          <>
            Click the <strong>ROSTER</strong> tab or press{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              R
            </kbd>{' '}
            to manage employees. Import from CSV or add one by one. Then drag
            them onto desks in the MAP view.
          </>
        ),
      },
      {
        id: 'assign-seats',
        title: 'Assign Seats',
        icon: <MapPin size={20} />,
        highlight: 'canvas',
        body: (
          <>
            Drag employees from the roster directly onto desks, or use the
            right-click menu on any seat. The assignment is instant and visible.
          </>
        ),
      },
      {
        id: 'neighborhoods',
        title: 'Create Neighborhoods',
        icon: <MapPin size={20} />,
        body: (
          <>
            Press{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              Shift+G
            </kbd>{' '}
            to draw neighborhoods — zones for teams or departments. Name them
            and assign colors for easy visual organization.
          </>
        ),
      },
      {
        id: 'search',
        title: 'Find Anything',
        icon: <Search size={20} />,
        body: (
          <>
            Press{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              Cmd+K
            </kbd>{' '}
            for the command palette — every action at your fingertips.{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              Cmd+F
            </kbd>{' '}
            finds elements on the canvas by name or label.
          </>
        ),
      },
      {
        id: 'shortcuts',
        title: 'Keyboard Shortcuts',
        icon: <Type size={20} />,
        body: (
          <>
            Press{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              ?
            </kbd>{' '}
            or{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              Cmd+/
            </kbd>{' '}
            anytime to see all shortcuts. We support everything from undo{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              Cmd+Z
            </kbd>{' '}
            to presentation mode{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              P
            </kbd>
            .
          </>
        ),
      },
      {
        id: 'reports',
        title: 'Reports & Insights',
        icon: <BarChart3 size={20} />,
        highlight: 'reports',
        body: (
          <>
            Open the right sidebar to access reports: seating utilization,
            department distribution, equipment needs, and org chart overlays.
            Data updates in real-time as you edit.
          </>
        ),
      },
      {
        id: 'export',
        title: 'Export & Share',
        icon: <FileText size={20} />,
        body: (
          <>
            Export your floor plan as PDF (print-ready), PNG (image), CSV
            (employee roster), or JSON (full project backup). Use the File menu
            or{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              Cmd+Shift+E
            </kbd>
            .
          </>
        ),
      },
      {
        id: 'done',
        title: "You're Ready!",
        icon: <Zap size={20} />,
        body: (
          <>
            You now know the essentials. The sample office is loaded — explore,
            experiment, and make it your own. Press{' '}
            <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
              ?
            </kbd>{' '}
            anytime for help.
          </>
        ),
      },
      {
        id: 'fr-step-restart',
        title: 'Restart this tour anytime',
        body: (
          <>
            Open the canvas Settings menu and choose <strong>Restart onboarding tour</strong>
            whenever you want to replay these tips.
          </>
        ),
      },
    ],
    [],
  )

  const totalSteps = steps.length
  const isLastStep = stepIdx >= totalSteps - 1
  const activeStep = steps[stepIdx] ?? steps[0]

  const handleDismiss = useCallback(() => {
    writeSeen()
    writeOnboardingCompleted()
    setDismissed(true)
    onDismissed?.()
  }, [onDismissed])

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleDismiss()
      return
    }
    const nextStep = stepIdx + 1
    setStepIdx(nextStep)
    writeOnboardingStep(nextStep)
  }, [isLastStep, stepIdx, handleDismiss])

  const handleBack = useCallback(() => {
    const prevStep = Math.max(0, stepIdx - 1)
    setStepIdx(prevStep)
    writeOnboardingStep(prevStep)
  }, [stepIdx])

  const handleSkip = useCallback(() => {
    writeSeen()
    writeOnboardingCompleted()
    setDismissed(true)
    onDismissed?.()
  }, [onDismissed])

  const handleOpenPalette = () => {
    setCommandPaletteOpen(true)
    handleDismiss()
  }

  useEffect(() => {
    if (dismissed) return
    const id = window.setTimeout(() => primaryBtnRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [dismissed, stepIdx])

  useEffect(() => {
    if (dismissed) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        handleDismiss()
        return
      }
      if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleNext()
        return
      }
      if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleBack()
        return
      }
      if (e.key !== 'Tab') return
      const card = cardRef.current
      if (!card) return
      const focusables = card.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handler, { capture: true })
    return () => {
      window.removeEventListener('keydown', handler, { capture: true })
    }
  }, [dismissed, handleDismiss, handleNext, handleBack])

  if (dismissed) return null

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="first-run-coach-title"
      className="absolute right-4 bottom-12 z-40 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          handleDismiss()
        }
      }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 right-0 left-0 h-1 overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
          style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <div className="mt-1 flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        >
          {activeStep.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div
            id="first-run-coach-title"
            className="font-semibold text-gray-900 dark:text-gray-100"
          >
            {activeStep.title}
          </div>
          <div className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
            Step {stepIdx + 1} of {totalSteps}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="-mt-1 -mr-1 flex-shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Dismiss welcome card"
          title="Skip tour"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4">
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
          {activeStep.body}
        </p>
        {activeStep.action && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            <Sparkles size={14} />
            <span className="font-medium">{activeStep.action}</span>
          </div>
        )}
      </div>

      {/* Step dots */}
      <div
        className="mt-5 flex items-center gap-1.5"
        aria-label={`Step ${stepIdx + 1} of ${totalSteps}`}
      >
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStepIdx(i)}
            aria-label={`Go to step ${i + 1}: ${s.title}`}
            aria-current={i === stepIdx ? 'step' : undefined}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIdx
                ? 'w-5 bg-blue-600 dark:bg-blue-400'
                : i < stepIdx
                  ? 'w-1.5 bg-blue-300 dark:bg-blue-700'
                  : 'w-1.5 bg-gray-300 dark:bg-gray-700'
            }`}
          />
        ))}
        <span className="ml-auto text-xs text-gray-500 tabular-nums dark:text-gray-400">
          {stepIdx + 1} / {totalSteps}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-center">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Skip tour
        </button>
        <div className="flex flex-wrap items-center justify-end gap-2 min-[480px]:ml-auto">
          {stepIdx > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800/50"
              title="Previous step (←)"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          )}
          {isLastStep ? (
            <>
              <button
                type="button"
                onClick={handleOpenPalette}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800/50"
              >
                Open palette
              </button>
              <button
                ref={primaryBtnRef}
                type="button"
                onClick={handleDismiss}
                aria-label="Done"
                className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              >
                <Check size={14} />
                Done
              </button>
            </>
          ) : (
            <button
              ref={primaryBtnRef}
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              title="Next step (→)"
            >
              Next
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-[10px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
        <span>Use ← → arrow keys to navigate</span>
        <span>ESC to close</span>
      </div>
    </div>
  )
}

export default FirstRunCoach
