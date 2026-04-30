import {
  ArrowLeft,
  BookOpenText,
  Building2,
  Database,
  GitBranch,
  History,
  Layers,
  ShieldCheck,
  Sparkles,
  Trash2,
  Workflow,
} from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

type Section =
  | 'overview'
  | 'workflow'
  | 'architecture'
  | 'admin'
  | 'engines'
  | 'stores'
  | 'removed'
  | 'changelog'

interface NavItem {
  id: Section
  label: string
  summary: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    summary: 'What this project is and how it is built.',
    icon: BookOpenText,
  },
  {
    id: 'workflow',
    label: 'Workflow',
    summary: 'End-to-end flow from onboarding to reports.',
    icon: Workflow,
  },
  {
    id: 'architecture',
    label: 'Architecture',
    summary: 'Directory structure, data flow, and render pipeline.',
    icon: Building2,
  },
  {
    id: 'admin',
    label: 'Admin System',
    summary: 'Permissions, tools, and control center.',
    icon: ShieldCheck,
  },
  {
    id: 'engines',
    label: 'Render Engines',
    summary: 'Konva and PixiJS capabilities and tradeoffs.',
    icon: Layers,
  },
  {
    id: 'stores',
    label: 'State Stores',
    summary: 'Zustand stores and key state ownership.',
    icon: Database,
  },
  {
    id: 'removed',
    label: 'Removed Features',
    summary: 'Archived capabilities from the simplification phase.',
    icon: Trash2,
  },
  {
    id: 'changelog',
    label: 'Changelog',
    summary: 'Recent changes across architecture and UX.',
    icon: History,
  },
]

const CODE_BADGE =
  'rounded-md border border-slate-700/80 bg-slate-900/70 px-2 py-0.5 font-mono text-[11px] text-slate-200'

type Tone = 'blue' | 'green' | 'red' | 'amber'

const TONE_CLASS: Record<Tone, string> = {
  blue: 'border-sky-400/40 bg-sky-400/15 text-sky-200',
  green: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200',
  red: 'border-rose-400/40 bg-rose-400/15 text-rose-200',
  amber: 'border-amber-400/40 bg-amber-400/15 text-amber-200',
}

interface Step {
  title: string
  desc: string
}

interface TableProps {
  headers: string[]
  rows: string[][]
}

interface CardProps {
  title: string
  children: ReactNode
  tone?: Tone
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-3xl leading-tight font-semibold text-transparent sm:text-4xl">
      {children}
    </h2>
  )
}

function SubTitle({ children }: { children: string }) {
  return (
    <h3 className="mt-8 border-b border-slate-700/80 pb-3 text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
      {children}
    </h3>
  )
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-7 text-slate-300 sm:text-[15px]">
      {children}
    </p>
  )
}

function Badge({ children, tone = 'blue' }: { children: string; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  )
}

function Card({ title, children, tone = 'blue' }: CardProps) {
  return (
    <section
      className={`rounded-2xl border bg-slate-900/55 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.85)] sm:p-5 ${TONE_CLASS[tone]}`}
    >
      <h4 className="mb-2 text-sm font-semibold text-slate-100 sm:text-base">
        {title}
      </h4>
      <div className="space-y-3 text-sm leading-7 text-slate-300">
        {children}
      </div>
    </section>
  )
}

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.title} className="grid grid-cols-[auto_1fr] gap-3">
          <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-300/35 bg-sky-300/15 text-xs font-semibold text-sky-200">
            {index + 1}
          </span>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-100 sm:text-[15px]">
              {step.title}
            </h4>
            <p className="text-sm leading-6 text-slate-300">{step.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Table({ headers, rows }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-950/55">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead className="bg-slate-900/70">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-xs font-semibold tracking-[0.08em] text-slate-200 uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')} className="border-t border-slate-800/90">
              {row.map((cell) => (
                <td
                  key={cell}
                  className="px-4 py-3 align-top text-sm leading-6 text-slate-300"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/90 bg-slate-900/75 shadow-[0_30px_60px_-36px_rgba(8,47,73,0.95)]">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,239,232,0.2),transparent_45%)]"
        aria-hidden="true"
      />
      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-8">
        <div className="min-w-0 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/35 bg-sky-300/15 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-100 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Project Documentation Surface
          </div>
          <h1 className="text-2xl leading-tight font-semibold text-slate-50 sm:text-[2rem]">
            Floorcraft internal docs, rebuilt for fast scanning and deeper
            context.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
            This page is now optimized for operational usage: stronger
            information hierarchy, clearer section landmarks, and visuals
            aligned to the planning domain.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-200">
            <Badge tone="blue">Responsive</Badge>
            <Badge tone="green">Production-ready Tailwind</Badge>
            <Badge tone="amber">No overflow regressions</Badge>
          </div>
        </div>
        <div className="min-w-0">
          <img
            src="/assets/docs/project-docs-hero-v1.png"
            alt="Abstract office floorplan blueprint illustration"
            className="w-full rounded-2xl border border-slate-600/60 object-cover shadow-[0_24px_54px_-34px_rgba(15,23,42,1)]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

export function ProjectDocsPage() {
  const [active, setActive] = useState<Section>('overview')

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#1e2a44_0%,#0a1020_38%,#050812_100%)] text-slate-100">
      <div className="mx-auto w-full max-w-[1420px] px-4 pt-5 pb-10 sm:px-6 lg:px-8 lg:pt-6 lg:pb-12">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-600/90 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-slate-100 uppercase hover:border-sky-300/60 hover:text-sky-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to app
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#9d876c]/45 bg-[#9d876c]/15 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#f4efe8] uppercase">
            <GitBranch className="h-3.5 w-3.5" />
            Internal Project Reference
          </div>
        </header>

        <Hero />

        <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="min-w-0 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
            <nav className="h-full overflow-x-hidden overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900/60 p-3">
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {NAV.map((item) => {
                  const Icon = item.icon
                  const isActive = active === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setActive(item.id)}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
                          isActive
                            ? 'border-sky-300/45 bg-sky-300/15'
                            : 'border-slate-700/80 bg-slate-950/45 hover:border-slate-500/70 hover:bg-slate-900/80'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                          <Icon className="h-4 w-4 text-sky-200" />
                          {item.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-300">
                          {item.summary}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          <main className="min-w-0 rounded-3xl border border-slate-700/80 bg-slate-900/60 p-4 sm:p-6 lg:p-7">
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/40">
              <img
                src="/assets/docs/project-docs-strip-v1.png"
                alt="Layered floorplan linework strip"
                className="h-20 w-full object-cover object-center sm:h-24"
                loading="lazy"
              />
            </div>
            <section className="space-y-4" aria-live="polite">
              {active === 'overview' && <OverviewSection />}
              {active === 'workflow' && <WorkflowSection />}
              {active === 'architecture' && <ArchitectureSection />}
              {active === 'admin' && <AdminSection />}
              {active === 'engines' && <EnginesSection />}
              {active === 'stores' && <StoresSection />}
              {active === 'removed' && <RemovedSection />}
              {active === 'changelog' && <ChangelogSection />}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

function OverviewSection() {
  return (
    <>
      <SectionTitle>Floorcraft project overview</SectionTitle>
      <P>
        Floorcraft (OandOcraft) is a browser-based office floor plan editor
        built with React, TypeScript, Zustand, and dual canvas rendering engines
        (Konva + PixiJS). It lets administrators design plans, assign employees
        to seats, manage neighborhoods, and generate reports.
      </P>

      <SubTitle>Tech stack</SubTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Frontend" tone="blue">
          <p>
            <strong>React 18</strong> with TypeScript, Vite 8, and React Router.
          </p>
        </Card>
        <Card title="State" tone="blue">
          <p>
            <strong>Zustand</strong> with selectors and{' '}
            <code className={CODE_BADGE}>useShallow</code>.
          </p>
        </Card>
        <Card title="Rendering" tone="green">
          <p>
            <strong>Konva</strong> for stable 2D rendering and{' '}
            <strong>PixiJS</strong> as the experimental WebGL path.
          </p>
        </Card>
        <Card title="Backend" tone="blue">
          <p>
            <strong>Supabase</strong> for auth, Postgres, and row-level
            security.
          </p>
        </Card>
        <Card title="Styling" tone="amber">
          <p>
            <strong>Tailwind CSS</strong> utility classes and dark mode support.
          </p>
        </Card>
        <Card title="Testing" tone="green">
          <p>
            <strong>Vitest</strong> and React Testing Library across 236 test
            files.
          </p>
        </Card>
      </div>

      <SubTitle>Key routes</SubTitle>
      <Table
        headers={['Path', 'Component', 'Purpose']}
        rows={[
          ['/', 'LandingPage', 'Public marketing page'],
          [
            '/t/:team',
            'TeamHomePage',
            'Dashboard with office list, stats, and management actions',
          ],
          [
            '/t/:team/o/:office/engine',
            'EngineChooserPage',
            'Choose Konva or PixiJS before editing',
          ],
          [
            '/t/:team/o/:office/map',
            'MapView',
            'Primary floor plan editor canvas',
          ],
          [
            '/t/:team/o/:office/roster',
            'RosterPage',
            'Employee roster, assignment, and CSV import',
          ],
          [
            '/t/:team/o/:office/reports',
            'ReportsPage',
            'Occupancy, utilization, and heatmap analytics',
          ],
          [
            '/t/:team/settings',
            'TeamSettingsPage',
            'Team members, configuration, and billing',
          ],
          ['/docs', 'ProjectDocsPage', 'This project documentation experience'],
        ]}
      />
    </>
  )
}

function WorkflowSection() {
  return (
    <>
      <SectionTitle>User workflow</SectionTitle>
      <P>
        The full path from account creation through design operations and
        reporting.
      </P>

      <SubTitle>1. Onboarding</SubTitle>
      <StepList
        steps={[
          {
            title: 'Sign up or login',
            desc: 'Email and password via Supabase Auth with verification required.',
          },
          {
            title: 'Create or join team',
            desc: 'Name your workspace or join from an invite link.',
          },
          {
            title: 'Open dashboard',
            desc: 'TeamHomePage exposes offices, stats, and create/delete actions.',
          },
        ]}
      />

      <SubTitle>2. Office creation</SubTitle>
      <StepList
        steps={[
          {
            title: 'Create office',
            desc: 'Use New office and name the space from the prompt flow.',
          },
          {
            title: 'Pick render engine',
            desc: 'Choose Konva (stable) or PixiJS (experimental). Selection persists in uiStore.',
          },
          {
            title: 'Open empty canvas',
            desc: 'MapView loads with guidance for pan, zoom, and wall drawing.',
          },
        ]}
      />

      <SubTitle>3. Floor plan design</SubTitle>
      <StepList
        steps={[
          {
            title: 'Draw walls',
            desc: 'Click to place points with support for curves, doors, and windows.',
          },
          {
            title: 'Place elements',
            desc: 'Drag desks, rooms, and furniture from the left library.',
          },
          {
            title: 'Create neighborhoods',
            desc: 'Define team zones and color-code areas for department-level planning.',
          },
          {
            title: 'Assign employees',
            desc: 'Drag roster members to desks or use bulk assignment tools.',
          },
        ]}
      />

      <SubTitle>4. Reports and analytics</SubTitle>
      <StepList
        steps={[
          {
            title: 'Occupancy metrics',
            desc: 'Track utilization, unassigned employees, and open seats.',
          },
          {
            title: 'Department breakdown',
            desc: 'Review seat distribution by team and neighborhood alignment.',
          },
          {
            title: 'Org chart overlays',
            desc: 'Map manager chains directly onto seat layout context.',
          },
          {
            title: 'Scenarios',
            desc: 'Clone and compare alternate layout decisions.',
          },
        ]}
      />
    </>
  )
}

function ArchitectureSection() {
  return (
    <>
      <SectionTitle>Architecture</SectionTitle>
      <P>
        The app separates React UI composition, Zustand state, and lib-level
        persistence/business logic. This keeps the editor path maintainable
        while supporting both rendering engines.
      </P>

      <SubTitle>Directory structure</SubTitle>
      <Card title="src/ layout" tone="blue">
        <pre className="overflow-x-auto text-xs leading-6 whitespace-pre text-slate-200">{`src/
+-- components/
¦   +-- auth/
¦   +-- editor/
¦   ¦   +-- Canvas/
¦   ¦   +-- RightSidebar/
¦   ¦   +-- reports/
¦   +-- team/
¦   +-- reports/
¦   +-- help/
¦   +-- landing/
¦   +-- ui/
+-- stores/
+-- hooks/
+-- lib/
+-- types/
+-- __tests__/`}</pre>
      </Card>

      <SubTitle>Data flow</SubTitle>
      <Card title="Load -> Edit -> Save cycle" tone="green">
        <p>
          <strong>1. Load:</strong> ProjectShell fetches office payload and
          hydrates floor, employee, element, and neighborhood stores.
        </p>
        <p>
          <strong>2. Edit:</strong> User interactions mutate Zustand state, then
          canvas rendering updates through React subscriptions.
        </p>
        <p>
          <strong>3. Save:</strong> Office sync debounces changes and writes
          serialized data to Supabase with version checks.
        </p>
      </Card>

      <SubTitle>Canvas rendering pipeline</SubTitle>
      <Card title="Dual-engine model" tone="amber">
        <p>
          <strong>Konva (default):</strong> Canvas 2D with full feature parity
          and production stability.
        </p>
        <p>
          <strong>PixiJS (experimental):</strong> WebGL path optimized for high
          object counts with partial overlay support.
        </p>
      </Card>
    </>
  )
}

function AdminSection() {
  return (
    <>
      <SectionTitle>Admin system</SectionTitle>
      <P>
        Floorcraft currently runs an admin-first single-role architecture where
        all authenticated users receive full write access.
      </P>

      <SubTitle>Permission model</SubTitle>
      <Card title="Simplified permissions" tone="blue">
        <p>
          The <code className={CODE_BADGE}>useCan(action)</code> hook returns{' '}
          <code className={CODE_BADGE}>true</code> for all actions during this
          phase.
        </p>
        <p>
          Available action groups include roster editing, map editing, team
          management, report visibility, and workspace controls.
        </p>
      </Card>

      <SubTitle>Admin control center</SubTitle>
      <Card title="AdminStatsToolbar" tone="green">
        <p>
          Dockable toolbar for live health statistics and maintenance
          operations, including conflict handling and force overwrite actions.
        </p>
      </Card>

      <SubTitle>Canvas tools</SubTitle>
      <Table
        headers={['Tool', 'Shortcut', 'Description']}
        rows={[
          ['Select', 'V', 'Select individual or multiple elements'],
          ['Pan', 'Space', 'Move viewport while maintaining context'],
          ['Wall', 'W', 'Create wall segments point by point'],
          ['Door', 'Shift + D', 'Attach door objects to walls'],
          ['Window', 'Shift + N', 'Attach windows to walls'],
          ['Rectangle', 'Shift + R', 'Draw rectangular zones and rooms'],
          ['Ellipse', 'E', 'Draw elliptical shapes'],
          ['Line', 'L', 'Create freeform lines'],
          ['Arrow', 'A', 'Add directional annotations'],
          ['Text', 'T', 'Place labels directly on canvas'],
          ['Measure', 'Shift + M', 'Measure distance overlay'],
          ['Neighborhood', 'Shift + G', 'Define department boundaries'],
        ]}
      />
    </>
  )
}

function EnginesSection() {
  return (
    <>
      <SectionTitle>Rendering engines</SectionTitle>
      <P>
        Floorcraft supports both Canvas 2D and WebGL workflows through an
        explicit engine selection step.
      </P>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Konva" tone="green">
          <Badge tone="green">Stable</Badge>
          <p>
            Based on <code className={CODE_BADGE}>react-konva</code>, with full
            parity for selection, overlays, alignment guides, and minimap
            behavior.
          </p>
        </Card>
        <Card title="PixiJS" tone="amber">
          <Badge tone="amber">Experimental</Badge>
          <p>
            Powered by <code className={CODE_BADGE}>@pixi/react</code> for GPU
            acceleration and high object-count rendering.
          </p>
          <p>
            Overlay coverage is partial and several tools remain in progress.
          </p>
        </Card>
      </div>

      <SubTitle>Engine selection flow</SubTitle>
      <StepList
        steps={[
          {
            title: 'Navigate to chooser',
            desc: 'Office index redirects to the engine chooser screen.',
          },
          {
            title: 'Select engine',
            desc: 'Choice persists in uiStore viewMode as 2d or pixi.',
          },
          {
            title: 'Load editor',
            desc: 'MapView initializes the matching render backend.',
          },
          {
            title: 'Switch later',
            desc: 'Engine can be toggled from the status controls when needed.',
          },
        ]}
      />
    </>
  )
}

function StoresSection() {
  return (
    <>
      <SectionTitle>State management</SectionTitle>
      <P>
        Zustand owns all runtime state. Selective subscriptions and shallow
        selectors are used to prevent unnecessary rerenders during heavy canvas
        interaction.
      </P>

      <Table
        headers={['Store', 'Purpose', 'Key state']}
        rows={[
          [
            'elementsStore',
            'Canvas elements and geometry',
            'elements: Record<id, CanvasElement>',
          ],
          [
            'employeeStore',
            'Employee roster and metadata',
            'employees: Record<id, Employee>',
          ],
          [
            'floorStore',
            'Single floor editing context',
            'floor model and identifiers',
          ],
          [
            'canvasStore',
            'Tooling and viewport',
            'tool, zoom, pan, selection, grid',
          ],
          [
            'uiStore',
            'UI preferences and panel state',
            'viewMode, overlays, sidebar',
          ],
          [
            'projectStore',
            'Save lifecycle',
            'saveState, lastSavedAt, conflict',
          ],
          ['neighborhoodStore', 'Zone boundaries', 'neighborhood maps'],
          ['insightsStore', 'Plan health insights', 'issues list and severity'],
          [
            'scenariosStore',
            'What-if planning',
            'scenario lists and active diff',
          ],
          ['seatHistoryStore', 'Seat assignment timeline', 'history entries'],
          ['layerVisibilityStore', 'Layer toggles', 'visibility bitmask'],
          ['overlaysStore', 'Heatmap and overlay mode', 'active overlay type'],
          ['toastStore', 'Notification queue', 'transient message queue'],
          ['cursorStore', 'Pointer readout', 'x and y coordinates'],
          ['annotationsStore', 'Map notes and pins', 'annotation collection'],
          [
            'calibrateScaleStore',
            'Real-world calibration',
            'scale factor and calibration state',
          ],
          [
            'canvasFinderStore',
            'Find on map workflow',
            'search and highlight state',
          ],
          [
            'seatDragStore',
            'Drag-to-assign state',
            'active employee and seat target',
          ],
        ]}
      />
    </>
  )
}

function RemovedSection() {
  return (
    <>
      <SectionTitle>Removed features</SectionTitle>
      <P>
        The following capabilities were decommissioned during admin-first
        simplification. Archived source is stored in
        <code className={CODE_BADGE}>c:\Floorcraft\deleted\</code>.
      </P>

      <SubTitle>Major removals</SubTitle>
      <div className="space-y-3">
        <Card title="Multi-floor system" tone="red">
          <Badge tone="red">Removed</Badge>
          <p>
            Floor switching, floor comparison views, and cross-floor analytics
            were retired.
          </p>
        </Card>
        <Card title="Room bookings" tone="red">
          <Badge tone="red">Removed</Badge>
          <p>
            Reservation dialogs, booking badges, and room booking stores were
            removed.
          </p>
        </Card>
        <Card title="Seat swap requests" tone="red">
          <Badge tone="red">Removed</Badge>
          <p>
            Employee-initiated seat swap flow with manager approval was removed.
          </p>
        </Card>
        <Card title="Share links and audit logging" tone="red">
          <Badge tone="red">Removed</Badge>
          <p>
            Public/private share links and full audit trail pages were retired
            from active routes.
          </p>
        </Card>
      </div>

      <SubTitle>Other removed items</SubTitle>
      <Table
        headers={['Component', 'Category', 'Reason']}
        rows={[
          [
            'ImpersonationBanner',
            'Auth',
            'View-as-user mode removed for admin-first architecture',
          ],
          ['ViewAsMenu', 'Auth', 'Role switching UI removed'],
          [
            'SharedProjectView',
            'Share',
            'Public embed removed with share links',
          ],
          [
            'collaborationStore',
            'Collaboration',
            'Prototype collaboration state retired',
          ],
          [
            'floorSparklineSeries',
            'Analytics',
            'Multi-floor comparison removed',
          ],
        ]}
      />
    </>
  )
}

function ChangelogSection() {
  return (
    <>
      <SectionTitle>Changelog</SectionTitle>
      <P>Recent updates to Floorcraft architecture and product behavior.</P>

      <div className="space-y-3">
        <Card title="April 2026 - Admin-first simplification" tone="amber">
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-300">
            <li>
              Permission model moved to full admin access with useCan() always
              true.
            </li>
            <li>
              Single-floor architecture replaced prior multi-floor workflows.
            </li>
            <li>
              Room bookings, seat swaps, reservations, share links, and audit
              log were removed.
            </li>
            <li>
              Dozens of dead files were archived and orphaned imports cleaned.
            </li>
          </ul>
        </Card>

        <Card title="April 2026 - Dual engine system" tone="green">
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-300">
            <li>
              Added EngineChooserPage and office route redirection to the engine
              selector.
            </li>
            <li>Engine preferences now persist in uiStore viewMode.</li>
            <li>
              Konva path remains stable while PixiJS remains experimental.
            </li>
          </ul>
        </Card>

        <Card title="April 2026 - UI polish" tone="blue">
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-300">
            <li>Dockable toolbar and status indicators were introduced.</li>
            <li>
              First run onboarding tour and keyboard shortcut overlay were
              improved.
            </li>
            <li>
              Plan health and navigation overlays were made more actionable.
            </li>
          </ul>
        </Card>
      </div>
    </>
  )
}
