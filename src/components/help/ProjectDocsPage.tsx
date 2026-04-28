import { useState } from 'react'
import { Link } from 'react-router-dom'

type Section = 'overview' | 'workflow' | 'architecture' | 'admin' | 'removed' | 'engines' | 'stores' | 'changelog'

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'workflow', label: 'Workflow', icon: '🔄' },
  { id: 'architecture', label: 'Architecture', icon: '🏗️' },
  { id: 'admin', label: 'Admin System', icon: '🔐' },
  { id: 'engines', label: 'Render Engines', icon: '⚙️' },
  { id: 'stores', label: 'State Stores', icon: '💾' },
  { id: 'removed', label: 'Removed Features', icon: '🗑️' },
  { id: 'changelog', label: 'Changelog', icon: '📝' },
]

export function ProjectDocsPage() {
  const [active, setActive] = useState<Section>('overview')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: '#0f172a', color: '#e2e8f0' }}>
      {/* Sidebar */}
      <nav style={{ width: 240, borderRight: '1px solid #1e293b', padding: '24px 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'auto', background: '#0c1222' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #1e293b' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>← Back to app</Link>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: '12px 0 4px', background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Floorcraft Docs</h1>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Internal Project Reference</p>
        </div>
        <div style={{ padding: '12px 8px' }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setActive(n.id)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '8px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: active === n.id ? 600 : 400, background: active === n.id ? 'rgba(59,130,246,0.15)' : 'transparent', color: active === n.id ? '#60a5fa' : '#94a3b8', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: '40px 60px', maxWidth: 860, overflow: 'auto' }}>
        {active === 'overview' && <OverviewSection />}
        {active === 'workflow' && <WorkflowSection />}
        {active === 'architecture' && <ArchitectureSection />}
        {active === 'admin' && <AdminSection />}
        {active === 'engines' && <EnginesSection />}
        {active === 'stores' && <StoresSection />}
        {active === 'removed' && <RemovedSection />}
        {active === 'changelog' && <ChangelogSection />}
      </main>
    </div>
  )
}

/* ── Reusable UI ─────────────────────────────────────────── */
function SectionTitle({ children }: { children: string }) {
  return <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, background: 'linear-gradient(135deg,#e2e8f0,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{children}</h2>
}
function SubTitle({ children }: { children: string }) {
  return <h3 style={{ fontSize: 18, fontWeight: 600, color: '#cbd5e1', margin: '28px 0 10px', borderBottom: '1px solid #1e293b', paddingBottom: 8 }}>{children}</h3>
}
function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, lineHeight: 1.75, color: '#94a3b8', margin: '8px 0' }}>{children}</p>
}
function Badge({ children, tone = 'blue' }: { children: string; tone?: 'blue' | 'green' | 'red' | 'amber' | 'purple' }) {
  const colors = { blue: '#3b82f6', green: '#22c55e', red: '#ef4444', amber: '#f59e0b', purple: '#a78bfa' }
  const c = colors[tone]
  return <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, background: `${c}22`, color: c, padding: '3px 8px', borderRadius: 6, marginLeft: 8 }}>{children}</span>
}
function Card({ title, children, accent = '#1e293b' }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ background: '#1e293b', border: `1px solid ${accent}44`, borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
      <h4 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 8px' }}>{title}</h4>
      <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>{children}</div>
    </div>
  )
}
function StepList({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 28 }}>
      <div style={{ position: 'absolute', left: 10, top: 8, bottom: 8, width: 2, background: 'linear-gradient(to bottom,#3b82f6,#a78bfa)' }} />
      {steps.map((s, i) => (
        <div key={i} style={{ marginBottom: 20, position: 'relative' }}>
          <div style={{ position: 'absolute', left: -22, top: 4, width: 16, height: 16, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{i + 1}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{s.title}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  )
}
function TableRow({ cells, header }: { cells: string[]; header?: boolean }) {
  const Tag = header ? 'th' : 'td'
  return (
    <tr>
      {cells.map((c, i) => (
        <Tag key={i} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #1e293b', fontSize: 13, fontWeight: header ? 600 : 400, color: header ? '#cbd5e1' : '#94a3b8', background: header ? '#0f172a' : 'transparent' }}>{c}</Tag>
      ))}
    </tr>
  )
}

/* ── Sections ────────────────────────────────────────────── */
function OverviewSection() {
  return (<>
    <SectionTitle>Floorcraft — Project Overview</SectionTitle>
    <P>Floorcraft (OandOcraft) is a browser-based office floor plan editor built with React, TypeScript, Zustand, and dual Canvas rendering engines (Konva + PixiJS). It allows administrators to design floor plans, assign employees to seats, manage departments and neighborhoods, and generate reports.</P>
    <SubTitle>Tech Stack</SubTitle>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <Card title="Frontend"><strong>React 18</strong> + TypeScript, Vite 8, React Router 6</Card>
      <Card title="State"><strong>Zustand</strong> — 18 stores with selectors &amp; useShallow</Card>
      <Card title="Rendering"><strong>Konva</strong> (Canvas 2D, stable) + <strong>PixiJS</strong> (WebGL, experimental)</Card>
      <Card title="Backend"><strong>Supabase</strong> — Auth, Postgres, Row-Level Security</Card>
      <Card title="Styling"><strong>Tailwind CSS</strong> utility classes, dark mode first</Card>
      <Card title="Testing"><strong>Vitest</strong> + React Testing Library, 236 test files</Card>
    </div>
    <SubTitle>Key Routes</SubTitle>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><TableRow cells={['Path', 'Component', 'Purpose']} header /></thead>
      <tbody>
        <TableRow cells={['/', 'LandingPage', 'Public marketing page']} />
        <TableRow cells={['/t/:team', 'TeamHomePage', 'Dashboard — offices list, stats, create/delete']} />
        <TableRow cells={['/t/:team/o/:office/engine', 'EngineChooserPage', 'Pick Konva vs PixiJS before editing']} />
        <TableRow cells={['/t/:team/o/:office/map', 'MapView', 'Main canvas editor']} />
        <TableRow cells={['/t/:team/o/:office/roster', 'RosterPage', 'Employee table — assign, bulk edit, CSV import']} />
        <TableRow cells={['/t/:team/o/:office/reports', 'ReportsPage', 'Analytics — occupancy, utilization, heatmaps']} />
        <TableRow cells={['/t/:team/settings', 'TeamSettingsPage', 'Team config, members, billing']} />
        <TableRow cells={['/docs', 'ProjectDocsPage', 'This documentation page']} />
      </tbody>
    </table>
  </>)
}

function WorkflowSection() {
  return (<>
    <SectionTitle>User Workflow</SectionTitle>
    <P>The complete end-to-end workflow from account creation to floor plan management.</P>
    <SubTitle>1. Onboarding</SubTitle>
    <StepList steps={[
      { title: 'Sign Up / Login', desc: 'Email+password via Supabase Auth. Email verification required.' },
      { title: 'Create or Join Team', desc: 'Team onboarding page lets you name your workspace. Invite link for existing teams.' },
      { title: 'Land on Dashboard', desc: 'TeamHomePage shows all offices, stats strip, search/sort/filter controls.' },
    ]} />
    <SubTitle>2. Office Creation</SubTitle>
    <StepList steps={[
      { title: 'Click "+ New office"', desc: 'Browser prompt asks for a name. Auto-suggests "New office N".' },
      { title: 'Engine Chooser', desc: 'Pick Konva (stable, Canvas 2D) or PixiJS (experimental, WebGL). Persisted in uiStore.' },
      { title: 'Empty Canvas', desc: 'MapView loads with FirstRunCoach tour — pan, zoom, draw walls, place desks.' },
    ]} />
    <SubTitle>3. Floor Plan Design</SubTitle>
    <StepList steps={[
      { title: 'Draw Walls', desc: 'Wall tool with click-to-place points. Supports curved walls, wall styles, door/window attachments.' },
      { title: 'Place Elements', desc: 'Drag from Library sidebar: desks, tables, rooms, furniture. Each has configurable properties.' },
      { title: 'Create Neighborhoods', desc: 'Draw neighborhood zones — groups of desks by department or team. Color-coded on canvas.' },
      { title: 'Assign Employees', desc: 'Drag employee from roster → drop on desk. Or use bulk assign in roster page.' },
    ]} />
    <SubTitle>4. Reports & Analytics</SubTitle>
    <StepList steps={[
      { title: 'Occupancy Metrics', desc: 'Real-time desk utilization %, unassigned employees, open seats.' },
      { title: 'Department Breakdown', desc: 'Per-department seating distribution, neighborhood alignment scores.' },
      { title: 'Org Chart', desc: 'Hierarchical view from employee manager chains. Overlays on canvas.' },
      { title: 'Scenarios', desc: 'What-if planning — clone state, try rearrangements, compare outcomes.' },
    ]} />
  </>)
}

function ArchitectureSection() {
  return (<>
    <SectionTitle>Architecture</SectionTitle>
    <P>The app follows a clean separation: React components for UI, Zustand stores for state, and a lib/ layer for business logic and persistence.</P>
    <SubTitle>Directory Structure</SubTitle>
    <Card title="src/">
      <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: '#cbd5e1' }}>{`├── components/
│   ├── auth/          # Login, Signup, Forgot, Verify, Reset
│   ├── editor/        # MapView, RosterPage, ProjectShell, TopBar
│   │   ├── Canvas/    # Konva renderers: elements, rooms, walls, overlays
│   │   ├── RightSidebar/  # Properties, Insights, Layer panels
│   │   └── reports/   # ScenariosPage, OrgChart
│   ├── team/          # TeamHomePage, Settings, Account, Invite
│   ├── reports/       # ReportsPage, OrgChartOverlay, MovePlanner
│   ├── help/          # HelpPage, ProjectDocsPage (this)
│   ├── landing/       # Public landing page
│   └── ui/            # Button, Input, Modal, ThemeToggle
├── stores/            # 18 Zustand stores
├── hooks/             # useCan, useWallDrawing, usePresentationShortcuts
├── lib/               # Business logic, persistence, utilities
│   ├── auth/          # AuthProvider, session management
│   ├── offices/       # CRUD, sync, permissions, CSV import
│   └── theme/         # ThemeProvider, dark mode
├── types/             # TypeScript interfaces (floor, elements, team)
└── __tests__/         # 236 test files (Vitest)`}</pre>
    </Card>
    <SubTitle>Data Flow</SubTitle>
    <Card title="Load → Edit → Save cycle">
      <strong>1. Load:</strong> ProjectShell fetches office payload from Supabase → hydrates elementsStore, employeeStore, floorStore, neighborhoodStore.<br />
      <strong>2. Edit:</strong> User interactions update Zustand stores. Canvas re-renders via React subscriptions.<br />
      <strong>3. Save:</strong> useOfficeSync debounces changes, serializes stores → PATCH to Supabase. Conflict detection via updated_at versioning.
    </Card>
    <SubTitle>Canvas Rendering Pipeline</SubTitle>
    <Card title="Dual-Engine System">
      The editor supports two rendering backends selectable at the Engine Chooser page:<br /><br />
      <strong>Konva (default):</strong> Canvas 2D via react-konva. Full feature parity — selection, multi-select, alignment guides, snap-to-grid, hover outlines, minimap, overlays.<br /><br />
      <strong>PixiJS (experimental):</strong> WebGL via @pixi/react. GPU-accelerated for 10k+ elements. Limited overlay support.
    </Card>
  </>)
}

function AdminSection() {
  return (<>
    <SectionTitle>Admin System</SectionTitle>
    <P>Floorcraft uses an <strong>admin-first single-role architecture</strong>. Every authenticated user has full admin access.</P>
    <SubTitle>Permission Model</SubTitle>
    <Card title="Simplified Permissions">
      The <code style={{ background: '#334155', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>useCan(action)</code> hook unconditionally returns <code style={{ background: '#334155', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>true</code> for all actions.<br /><br />
      <strong>Available actions:</strong> editRoster, editMap, manageTeam, viewReports, viewSeatHistory, manageWorkspace, viewMap, viewPII<br /><br />
      <strong>Rationale:</strong> During the admin-only phase, all features are unlocked. A future "viewer" role will restrict write operations.
    </Card>
    <SubTitle>Admin Control Center</SubTitle>
    <Card title="AdminStatsToolbar">
      A dockable floating toolbar visible to admins with two tabs:<br /><br />
      <strong>Live Stats:</strong> Real-time neighborhood count, employee count, occupancy %, object count, assigned seats, health status, payload size.<br /><br />
      <strong>Maintenance:</strong> Force-overwrite remote, clear canvas (destructive), triage conflicts.
    </Card>
    <SubTitle>12 Canvas Tools</SubTitle>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><TableRow cells={['Tool', 'Shortcut', 'Description']} header /></thead>
      <tbody>
        <TableRow cells={['Select', 'V', 'Click/marquee select elements']} />
        <TableRow cells={['Pan', 'Space', 'Drag canvas to pan']} />
        <TableRow cells={['Wall', 'W', 'Click-to-place wall segments']} />
        <TableRow cells={['Door', '⇧D', 'Attach door to wall']} />
        <TableRow cells={['Window', '⇧N', 'Attach window to wall']} />
        <TableRow cells={['Rectangle', '⇧R', 'Draw rectangular rooms/zones']} />
        <TableRow cells={['Ellipse', 'E', 'Draw elliptical shapes']} />
        <TableRow cells={['Line', 'L', 'Freeform line tool']} />
        <TableRow cells={['Arrow', 'A', 'Directional arrow annotations']} />
        <TableRow cells={['Text', 'T', 'Place text labels']} />
        <TableRow cells={['Measure', '⇧M', 'Distance measurement overlay']} />
        <TableRow cells={['Neighborhood', '⇧G', 'Department/team zone boundaries']} />
      </tbody>
    </table>
  </>)
}

function EnginesSection() {
  return (<>
    <SectionTitle>Rendering Engines</SectionTitle>
    <P>The dual-engine architecture allows side-by-side comparison of Canvas 2D (Konva) and WebGL (PixiJS).</P>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card title="Konva" accent="#0ea5e9">
        <Badge tone="green">STABLE</Badge><br /><br />
        Canvas 2D rendering via <code style={{ background: '#334155', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>react-konva</code>.<br /><br />
        ✅ Full feature parity<br />
        ✅ Selection, multi-select, marquee<br />
        ✅ Alignment guides &amp; snap-to-grid<br />
        ✅ Hover outlines &amp; hover cards<br />
        ✅ Minimap with drag-pan<br />
        ✅ All overlay layers<br />
        ✅ Stable for production
      </Card>
      <Card title="PixiJS" accent="#6366f1">
        <Badge tone="amber">EXPERIMENTAL</Badge><br /><br />
        WebGL hardware-accelerated via <code style={{ background: '#334155', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>@pixi/react</code>.<br /><br />
        ✅ GPU-accelerated rendering<br />
        ✅ 60fps at 10k+ elements<br />
        ✅ Smoother zoom/pan<br />
        ⚠️ Limited overlay support<br />
        ⚠️ Some tools in progress<br />
        ⚠️ Not production-ready
      </Card>
    </div>
    <SubTitle>Engine Selection Flow</SubTitle>
    <StepList steps={[
      { title: 'New Office / Navigate', desc: 'Office index route redirects to /engine chooser page.' },
      { title: 'Pick Engine', desc: 'Click Konva or PixiJS card. Choice persisted in uiStore.viewMode ("2d" or "pixi").' },
      { title: 'Editor Loads', desc: 'MapView reads viewMode from uiStore to initialize the correct rendering backend.' },
      { title: 'Switch Later', desc: 'Use Ctrl+Shift+P or click engine indicator in status bar to toggle anytime.' },
    ]} />
  </>)
}

function StoresSection() {
  return (<>
    <SectionTitle>State Management</SectionTitle>
    <P>All state is managed via <strong>Zustand</strong> stores with React subscriptions. The <code style={{ background: '#334155', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>useShallow</code> wrapper prevents infinite re-render loops when selecting objects.</P>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><TableRow cells={['Store', 'Purpose', 'Key State']} header /></thead>
      <tbody>
        <TableRow cells={['elementsStore', 'Canvas elements (desks, walls, rooms)', 'elements: Record<id, CanvasElement>']} />
        <TableRow cells={['employeeStore', 'Employee roster data', 'employees: Record<id, Employee>']} />
        <TableRow cells={['floorStore', 'Single-floor context', 'floor: Floor (id, name, elements)']} />
        <TableRow cells={['canvasStore', 'Canvas interaction state', 'tool, zoom, pan, selection, grid']} />
        <TableRow cells={['uiStore', 'UI preferences & panels', 'viewMode, sidebar, overlays, theme']} />
        <TableRow cells={['projectStore', 'Save state & sync', 'saveState, lastSavedAt, conflict']} />
        <TableRow cells={['neighborhoodStore', 'Department zones', 'neighborhoods: Record<id, Neighborhood>']} />
        <TableRow cells={['insightsStore', 'Plan health issues', 'insights: Insight[]']} />
        <TableRow cells={['scenariosStore', 'What-if planning', 'scenarios, activeId, diffs']} />
        <TableRow cells={['seatHistoryStore', 'Seat assignment log', 'history entries per seat']} />
        <TableRow cells={['layerVisibilityStore', 'Toggle canvas layers', 'visible layers bitmask']} />
        <TableRow cells={['overlaysStore', 'Heatmap/org overlays', 'active overlay type']} />
        <TableRow cells={['toastStore', 'Notification toasts', 'queue of toast messages']} />
        <TableRow cells={['cursorStore', 'Cursor coordinates', 'x, y for status bar display']} />
        <TableRow cells={['annotationsStore', 'Map pins & notes', 'annotations: Annotation[]']} />
        <TableRow cells={['calibrateScaleStore', 'Real-world scale setup', 'calibration state & factor']} />
        <TableRow cells={['canvasFinderStore', '"Find on Map" feature', 'search query & highlighted elements']} />
        <TableRow cells={['seatDragStore', 'Drag-to-assign UX', 'dragging employee & target seat']} />
      </tbody>
    </table>
  </>)
}

function RemovedSection() {
  return (<>
    <SectionTitle>Removed Features</SectionTitle>
    <P>The following features were decommissioned during the admin-first simplification. Source files are archived in <code style={{ background: '#334155', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>c:\Floorcraft\deleted\</code>.</P>
    <SubTitle>Multi-Floor System</SubTitle>
    <Card title="FloorSwitcher, FloorCompare*">
      <Badge tone="red">REMOVED</Badge><br />
      Previously supported multiple floors per office with tab-based switching, floor comparison sparklines, and cross-floor analytics. Replaced by single-floor architecture (floorStore.floor).
    </Card>
    <SubTitle>Room Bookings</SubTitle>
    <Card title="RoomBookingBadge, RoomBookingDialog, RoomBookingsPanel">
      <Badge tone="red">REMOVED</Badge><br />
      Conference room reservation system with conflict detection, calendar integration, and real-time badges on room elements. Stores: roomBookingsStore, roomBookingDialogStore.
    </Card>
    <SubTitle>Seat Swap Requests</SubTitle>
    <Card title="SeatSwapRequestDialog, seatSwapsStore">
      <Badge tone="red">REMOVED</Badge><br />
      Employee-initiated seat swap workflow with manager approval. Panel in InsightsPanel showed pending swaps.
    </Card>
    <SubTitle>Reservations</SubTitle>
    <Card title="ReservationsPage, reservationsStore">
      <Badge tone="red">REMOVED</Badge><br />
      Hot desk reservation system with time slots, persistence layer, and dedicated page.
    </Card>
    <SubTitle>Share Links</SubTitle>
    <Card title="ShareModal, ShareView, ShareLinkDialog, shareLinksStore">
      <Badge tone="red">REMOVED</Badge><br />
      Public/private share link generation with token-based access, viewer permissions, and embedded read-only views.
    </Card>
    <SubTitle>Audit Logging</SubTitle>
    <Card title="audit.ts, auditRepository.ts, AuditLogPage">
      <Badge tone="red">REMOVED</Badge><br />
      Event-sourced audit trail recording every employee assignment, element change, and admin action. Dedicated log viewer page.
    </Card>
    <SubTitle>Other Removed Items</SubTitle>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><TableRow cells={['Component', 'Category', 'Reason']} header /></thead>
      <tbody>
        <TableRow cells={['ImpersonationBanner', 'Auth', 'View-as-user feature removed in admin-first mode']} />
        <TableRow cells={['ViewAsMenu', 'Auth', 'Role-switching UI removed']} />
        <TableRow cells={['SharedProjectView', 'Share', 'Public embed removed with share links']} />
        <TableRow cells={['collaborationStore', 'Collab', 'Real-time collaboration prototype removed']} />
        <TableRow cells={['floorSparklineSeries', 'Analytics', 'Multi-floor comparison data removed']} />
      </tbody>
    </table>
  </>)
}

function ChangelogSection() {
  return (<>
    <SectionTitle>Changelog</SectionTitle>
    <P>Recent changes to the Floorcraft codebase.</P>
    <Card title="April 2026 — Admin-First Simplification">
      • Transitioned to single-role admin architecture — useCan() always returns true<br />
      • Decommissioned multi-floor system → single-floor floorStore<br />
      • Removed room bookings, seat swaps, reservations, share links, audit log<br />
      • 37 dead source files archived to c:\Floorcraft\deleted\<br />
      • Fixed AdminStatsToolbar infinite render loop (useShallow)<br />
      • Fixed RosterPage: floors→floor migration, removed SeatSwapRequestDialog<br />
      • Fixed OrgChartOverlay: useActiveFloor returns Floor object, not string<br />
      • Cleaned orphaned imports from employeeStore, CSVImportDialog, FirstRunCoach, InsightsPanel<br />
      • Restored 236 test files + AuditLogPage + usePresentationShortcuts
    </Card>
    <Card title="April 2026 — Dual Engine System">
      • Created EngineChooserPage — premium dark-themed gateway<br />
      • Added /engine route, office index redirects to engine chooser<br />
      • New office flow: Dashboard → Engine Chooser → Map (was: Dashboard → Map)<br />
      • Engine choice persisted in uiStore.viewMode<br />
      • Konva: full feature parity, stable<br />
      • PixiJS: WebGL experimental, GPU-accelerated
    </Card>
    <Card title="April 2026 — UI Polish">
      • Dockable toolbar system for floating panels<br />
      • North Arrow compass with interactive rotation<br />
      • Status bar with cursor coords, zoom, occupancy<br />
      • Plan Health pill with issue count badge<br />
      • FirstRunCoach 5-step onboarding tour<br />
      • Keyboard shortcuts overlay (? key)
    </Card>
  </>)
}
