import { Search, Map as MapIcon, Layers, FileText, Share2, HelpCircle, User, Zap, Pencil, Trash2, ArrowUpRight, MousePointer2, Plus, Info, Check, Copy, ChevronRight, X, ExternalLink, Menu, Sparkles, ChevronDown, Monitor, LayoutGrid, Ruler, Compass, Hash, Undo2, Redo2, Eye, Shield, Users, Building, Activity, Sliders, Play, Settings, Download, Printer, ImageIcon, Presentation, ClipboardList, BarChart3, AlertTriangle } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Kbd } from '../ui/Kbd'

interface HelpItem {
  id: string
  label: string
  icon: string | React.ReactNode
  searchText: string
  body: React.ReactNode
}

const HELP_ITEMS: HelpItem[] = [
  {
    id: 'getting-started',
    label: 'Getting started',
    icon: '🚀',
    searchText:
      "getting started onboarding create office team workspace dashboard invite members roles permissions admin member viewer first office sample plan",
    body: (
      <div className="space-y-4">
        <p>
          Welcome to Floorcraft. The dashboard is your home base where you can
          see all your team's offices. If you're an admin, you can invite new
          members and manage their roles (Admin, Member, or Viewer).
        </p>
        <p>
          To create your first plan, click <strong>+ New office</strong> on the
          dashboard. You can start with a blank canvas or use a sample office to
          get a feel for the tools.
        </p>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-4">The dashboard</h3>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 dark:text-gray-200">
          <li>
            <strong>Search and filter</strong> — quickly find the right office
            by name or status.
          </li>
          <li>
            <strong>Sort</strong> — sort offices by name, recently opened, or
            employee count.
          </li>
          <li>
            <strong>Office cards</strong> — hover an office card to see a quick
            preview and metadata like seat count and last update time.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'map-editor',
    label: 'Map (floor plan editor)',
    icon: '🗺️',
    searchText:
      "map floor plan editor konva canvas tools left sidebar element library undo redo grouping drawing walls press w wall tool snap grid double-click enter finish run drag wall midpoint curve arc placing elements desks workstations private offices conference rooms phone booths kitchens doors windows decor plants couches ghost preview snap nearest wall not-allowed cursor safe renames desk ids unique inline error properties panel selection editing click select shift-click marquee select ctrl+d duplicate arrow nudge ctrl+g group ctrl+l lock unlock moving rotating magenta alignment guides snap shift bypass rotate handle cardinal angles 0 45 90 135 180 225 270 315 angle badge drag empty canvas pan space-hold pan middle-mouse 4px threshold presentation mode fullscreen spawn animation fade-in scale stagger prefers-reduced-motion hover card tooltip portal 200ms PII share viewer distance labels px inverse-zoom short guides skip align distribute floating toolbar AABB 2+ 3+ horizontal vertical context menu right-click edit arrange align object group lucide icons shortcut pills empty canvas select-all toggle grid scale bar north arrow rotatable canvasSettings northRotation real-world units toggle compass hide compass N hotkey showNorthArrow cmd+f finder overlay dims non-matches enter shift+enter cycle floating action dock vertical pill zoom in out fit-to-content toggle grid minimap presentation topbar plan-health pill drawer jump-to-element orphan seats doors no wall seat assignments arrow-key roving left right home end first last element library search filter recents row hover tooltip 250ms drag-and-drop placement cursor",
    body: (
      <div className="space-y-4">
        <p>
          The map view is a Konva-backed canvas with tools in the left sidebar
          and an element library you drag from. It supports undo/redo and grouping.
        </p>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Panning &amp; zooming</h3>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 dark:text-gray-200">
          <li>
            <strong>Click-drag empty canvas to pan</strong> with the Select
            tool — no need to swap to the hand tool first. A 4-pixel movement
            threshold distinguishes a pan from a click, so quick taps still
            deselect cleanly. <kbd>Shift</kbd>+drag on empty canvas still
            gives you a marquee selection.
          </li>
          <li>
            Hold <kbd>Space</kbd> + drag for the classic pan-tool feel; release
            to snap back to whatever tool you were using. Middle-mouse drag
            pans too.
          </li>
          <li>
            Scroll to zoom around the cursor. <kbd>Ctrl</kbd>+<kbd>0</kbd>{' '}
            resets to 100%.
          </li>
          <li>
            A <strong>floating action dock</strong> on the canvas right edge
            collects zoom in / zoom out / fit-to-content / toggle grid /
            toggle minimap / enter presentation mode buttons — the same
            actions are reachable by keyboard, but the dock is there for
            mouse-first workflows.
          </li>
        </ul>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-4">Drawing walls</h3>
        <ol className="list-decimal pl-6 space-y-1.5 text-gray-700 dark:text-gray-200">
          <li>Press <kbd>W</kbd> or click the Wall tool.</li>
          <li>Click to drop each wall segment endpoint. Double-click or press <kbd>Enter</kbd> to finish a run.</li>
          <li>Walls snap to the grid (toggle with <kbd>G</kbd>) and to existing wall endpoints.</li>
          <li>Drag a wall midpoint to curve it into an arc.</li>
        </ol>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-4">Element library &amp; placement</h3>
        <p>
          Drag any tile from the left <strong>Element Library</strong> onto the
          canvas — desks, workstations, private offices, conference rooms, phone
          booths, kitchens, doors, windows, and decor (plants, couches, etc).
          Tiles drop at the cursor, not at the origin, so you can aim
          placements without a second drag.
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 dark:text-gray-200">
          <li>
            <strong>Search filter</strong> at the top of the library filters
            tiles by label or category — useful once the list is long.
          </li>
          <li>
            <strong>Recents row</strong> surfaces the last few elements you've
            used so repeat placements are one click away.
          </li>
          <li>
            Hover a tile for 250ms to get a richer tooltip with the element's
            description.
          </li>
          <li>
            <strong>Doors and windows</strong> show a dimmed ghost preview that
            tracks your cursor and snaps to the nearest wall. If you wander
            too far from any wall the cursor flips to <code>not-allowed</code>{' '}
            and clicking does nothing — we don't drop a door in open air.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'editing',
    label: 'Selection & editing',
    icon: '✨',
    searchText:
      "selection editing click select shift-click marquee select ctrl+d duplicate arrow nudge ctrl+g group ctrl+l lock unlock moving rotating magenta alignment guides snap shift bypass rotate handle cardinal angles 0 45 90 135 180 225 270 315 angle badge drag empty canvas pan space-hold pan middle-mouse 4px threshold presentation mode fullscreen",
    body: (
      <div className="space-y-4">
        <p>
          Click an element to select it, or use <kbd>Shift</kbd>+click or a
          marquee (click-drag empty space) to select several. Selecting a
          group selects all its members.
        </p>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Manipulation</h3>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 dark:text-gray-200">
          <li>
            <strong>Move</strong> — drag the selection or use the arrow keys
            for 1px nudges.
          </li>
          <li>
            <strong>Rotate</strong> — drag the handle at the top of the
            selection box. Holding <kbd>Shift</kbd> snaps rotation to 45°
            increments. A badge next to the handle shows the exact angle.
          </li>
          <li>
            <strong>Duplicate</strong> — use <kbd>Ctrl</kbd>+<kbd>D</kbd> or
            <kbd>Alt</kbd>+drag to quickly clone elements.
          </li>
          <li>
            <strong>Alignment guides</strong> — as you drag, magenta guides
            appear when you align with centers or edges of other elements.
            Distance labels show the exact gap in pixels.
          </li>
        </ul>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-4">Groups &amp; locking</h3>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 dark:text-gray-200">
          <li>
            <strong>Group</strong> — select multiple elements and press{' '}
            <kbd>Ctrl</kbd>+<kbd>G</kbd>. Groups move and rotate together,
            but can still be edited individually inside the properties panel.
          </li>
          <li>
            <strong>Lock</strong> — press <kbd>Ctrl</kbd>+<kbd>L</kbd> to lock
            elements. Locked elements cannot be dragged or deleted until
            unlocked, useful for walls and fixed furniture.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'assignment',
    label: 'Seats & neighborhoods',
    icon: '👥',
    searchText:
      "seats assignments neighborhoods employees unassigned unallocated occupancy health neighborhoods zones coloring occupancy chips health unassigned safe renames desk ids unique inline error properties panel selection editing click select shift-click marquee select",
    body: (
      <div className="space-y-4">
        <p>
          Floorcraft is built for assigning employees to physical seats. You
          can drag employees from the <strong>Employee List</strong> in the
          right sidebar onto any desk, workstation slot, or private office.
        </p>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Neighborhoods (Zones)</h3>
        <p>
          Neighborhoods are translucent, labeled zones used to group seats by
          department or team. Create them using the Neighborhood tool and
          customize their color and name in the properties panel.
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 dark:text-gray-200">
          <li>
            <strong>Occupancy chips</strong> — floating badges above each
            neighborhood show the count of assigned vs. total seats and a
            health indicator (green/yellow/red).
          </li>
          <li>
            <strong>Plan health pill</strong> — at the top of the editor, a pill
            summarizes total seats, assigned seats, and orphan elements. Click
            it to jump to problems.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'collaboration-sharing',
    label: 'Sharing & presentation',
    icon: '🔗',
    searchText:
      "collaboration sharing presentation share links stakeholders read-only PII access presentation mode fullscreen floor arrows spawn animation fade-in scale stagger prefers-reduced-motion hover card tooltip portal 200ms",
    body: (
      <div className="space-y-4">
        <p>
          Floorcraft plans are live and can be shared with anyone in your team.
          For stakeholders outside the team, you can create view-only share
          links.
        </p>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Presentation mode</h3>
        <p>
          Click the <strong>Presentation</strong> icon or press <kbd>P</kbd> to
          hide the editor chrome. This is ideal for screen sharing during
          all-hands meetings.
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 dark:text-gray-200">
          <li>
            <strong>Clean view</strong> — all toolbars, sidebars, and grid lines
            are hidden.
          </li>
          <li>
            <strong>Safe viewing</strong> — hover cards and selection highlights
            are suppressed to keep the focus on the floor plan.
          </li>
        </ul>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-4">Share links</h3>
        <p>
          Generate a public link in the <strong>Share</strong> modal. You can
          choose whether to show or hide employee names (PII) to ensure
          privacy when sharing outside the company.
        </p>
      </div>
    ),
  },
  {
    id: 'reports',
    label: 'Reports & audits',
    icon: '📊',
    searchText:
      "reports audits logs changes history export pdf png wayfinding employee directory neighborhoods usage utilization density scenario planning",
    body: (
      <div className="space-y-4">
        <p>
          The <strong>Reports</strong> view provides high-level insights into
          your office utilization and density.
        </p>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Audit logs</h3>
        <p>
          Track every change made to the floor plan, from seat assignments to
          wall moves. The audit log shows who made the change and when,
          ensuring transparency across the team.
        </p>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-4">Exports</h3>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 dark:text-gray-200">
          <li>
            <strong>Wayfinding PDF</strong> — a high-resolution export including
            the floor plan, an employee directory, and a neighborhood legend.
          </li>
          <li>
            <strong>PNG snapshot</strong> — a clean image of the floor plan for
            use in presentations or documentation.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'advanced-shortcuts',
    label: 'Keyboard shortcuts',
    icon: '⌨️',
    searchText: "shortcuts hotkeys commands pan zoom undo redo walls grid snap group lock duplicate finder presentation",
    body: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Tools &amp; Canvas</h3>
          <ul className="space-y-2 text-sm">
            <ShortcutRow kbd="V" label="Select tool" />
            <ShortcutRow kbd="W" label="Wall tool" />
            <ShortcutRow kbd="M" label="Measure tool" />
            <ShortcutRow kbd="Z" label="Zone (neighborhood) tool" />
            <ShortcutRow kbd="G" label="Toggle grid" />
            <ShortcutRow kbd="D" label="Toggle dimensions" />
            <ShortcutRow kbd="N" label="Toggle compass" />
            <ShortcutRow kbd="P" label="Presentation mode" />
            <ShortcutRow kbd="/" label="Finder / Search" />
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Manipulation</h3>
          <ul className="space-y-2 text-sm">
            <ShortcutRow kbd="Ctrl + Z" label="Undo" />
            <ShortcutRow kbd="Ctrl + Y" label="Redo" />
            <ShortcutRow kbd="Ctrl + D" label="Duplicate" />
            <ShortcutRow kbd="Ctrl + G" label="Group selection" />
            <ShortcutRow kbd="Ctrl + L" label="Lock / Unlock" />
            <ShortcutRow kbd="Del" label="Delete selection" />
            <ShortcutRow kbd="Esc" label="Deselect all" />
            <ShortcutRow kbd="Arrows" label="Nudge (1px)" />
            <ShortcutRow kbd="Shift + Arrows" label="Nudge (10px)" />
          </ul>
        </div>
      </div>
    ),
  },
]

function ShortcutRow({ kbd, label }: { kbd: string; label: string }) {
  return (
    <li className="flex items-center justify-between gap-4 text-gray-600 dark:text-gray-400">
      <span>{label}</span>
      <Kbd className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">{kbd}</Kbd>
    </li>
  )
}

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeItemId, setActiveItemId] = useState(HELP_ITEMS[0].id)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Global "/" shortcut to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filteredItems = useMemo(() => {
    if (!searchQuery) return HELP_ITEMS
    const query = searchQuery.toLowerCase()
    return HELP_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(query) ||
      item.searchText.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const activeItem = useMemo(() => {
    return HELP_ITEMS.find((i) => i.id === activeItemId) || HELP_ITEMS[0]
  }, [activeItemId])

  // Reset active item when filtering if current one is hidden
  useEffect(() => {
    if (filteredItems.length > 0 && !filteredItems.find(i => i.id === activeItemId)) {
      setActiveItemId(filteredItems[0].id)
    }
  }, [filteredItems, activeItemId])

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sticky header with search */}
      <header className="flex-none bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <HelpCircle size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                Help &amp; Documentation
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Everything you need to master Floorcraft
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search guides, tools, and shortcuts... (press /)"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2"
          >
            Back to dashboard
            <ExternalLink size={14} />
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex">
          {/* Navigation Sidebar */}
          <aside className="w-72 flex-none border-r border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
            <nav className="space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItemId(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeItemId === item.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                  {activeItemId === item.id && (
                    <ChevronRight size={14} className="ml-auto opacity-50" />
                  )}
                </button>
              ))}
              {filteredItems.length === 0 && (
                <div className="py-8 text-center">
                  <Search size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No matches found</p>
                </div>
              )}
            </nav>

            <div className="mt-12 p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                <Sparkles size={16} />
                Need more help?
              </h3>
              <p className="text-[11px] text-blue-100 leading-relaxed mb-4">
                Our support team is available 24/7 for Enterprise customers.
              </p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors">
                Contact Support
              </button>
            </div>
          </aside>

          {/* Content Area */}
          <article className="flex-1 overflow-y-auto p-12 bg-white dark:bg-gray-900">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl">
                  {activeItem.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {activeItem.label}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      Official Guide
                    </span>
                    <span className="text-xs text-gray-400">
                      Updated yesterday
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose prose-blue dark:prose-invert max-w-none">
                {activeItem.body}
              </div>

              {/* Helpful feedback */}
              <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <p className="text-sm text-gray-500">Was this guide helpful?</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    Yes
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    No
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}
