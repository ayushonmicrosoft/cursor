import { useId, useMemo, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { AlertTriangle, BarChart3, Settings } from 'lucide-react'
import { useInsightsStore } from '../../../stores/insightsStore'
import { useUIStore } from '../../../stores/uiStore'
import { InsightsPanel } from './InsightsPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { ReportsPanel } from './ReportsPanel'
import { SidebarToggle } from './SidebarToggle'

type TabId = 'properties' | 'reports' | 'insights'

export function RightSidebar() {
  const tab = useUIStore((s) => s.rightSidebarTab)
  const setTab = useUIStore((s) => s.setRightSidebarTab)
  const safeTab: TabId =
    tab === 'properties' || tab === 'reports' || tab === 'insights'
      ? tab
      : 'properties'

  const insights = useInsightsStore((s) => s.insights)
  const badgeCount = useMemo(() => {
    let critical = 0
    let warning = 0
    for (const i of insights) {
      if (i.dismissed) continue
      if (i.severity === 'critical') critical++
      else if (i.severity === 'warning') warning++
    }
    return critical + warning
  }, [insights])

  const tabs: { id: TabId; label: string; icon: ReactNode; secondary?: boolean }[] = [
    { id: 'properties', label: 'Properties', icon: <Settings size={13} aria-hidden="true" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={13} aria-hidden="true" />, secondary: true },
    { id: 'insights', label: 'Insights', icon: <AlertTriangle size={13} aria-hidden="true" />, secondary: true },
  ]

  // Stable id prefix so each tab <-> panel pair can reference each other
  // via aria-controls / aria-labelledby without colliding if multiple
  // RightSidebars ever mount simultaneously.
  const idBase = useId()
  const tabId = (id: TabId) => `${idBase}-tab-${id}`
  const panelId = (id: TabId) => `${idBase}-panel-${id}`

  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    properties: null,
    reports: null,
    insights: null,
  })

  // Arrow-left / arrow-right roving within the tablist, per the APG tabs
  // pattern. We move focus AND activate the new tab so the panel below
  // updates in lockstep — that's the "automatic activation" variant,
  // which is the right default for lightweight tabs like these (no
  // async panel content, no expensive mount).
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const idx = tabs.findIndex((t) => t.id === safeTab)
    let next = idx
    if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length
    else if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    const nextTab = tabs[next].id
    setTab(nextTab)
    tabRefs.current[nextTab]?.focus()
  }

  return (
    <div className="flex flex-col h-full min-w-0">
      <div className="flex items-stretch border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        {/* Collapse handle lives at the leftmost slot of the tablist
            row so it reads as part of the side panel, not part of the
            top ribbon. The four content tabs follow to the right. */}
        <SidebarToggle variant="inline" />
        <div
          role="tablist"
          aria-label="Right sidebar"
          className="flex flex-1 gap-0.5 px-1 py-1"
          onKeyDown={onKeyDown}
        >
        {tabs.map((t) => {
          const selected = safeTab === t.id
          const baseButtonClass =
            'relative flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md border px-1.5 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset'
          const selectedClass = t.secondary
            ? 'border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
            : 'border-gray-300 bg-gray-100 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
          const idleClass = t.secondary
            ? 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-900/70 dark:hover:text-gray-200'
            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-900/70 dark:hover:text-gray-200'
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el
              }}
              id={tabId(t.id)}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={panelId(t.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`${baseButtonClass} ${selected ? selectedClass : idleClass}`}
            >
              <span className="flex-shrink-0">{t.icon}</span>
              <span className="truncate">{t.label}</span>
              {t.id === 'insights' && badgeCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {badgeCount}
                </span>
              )}
            </button>
          )
        })}
        </div>
      </div>
      <div
        role="tabpanel"
        id={panelId(safeTab)}
        aria-labelledby={tabId(safeTab)}
        className="flex-1 overflow-y-auto bg-gray-50/60 p-2.5 dark:bg-gray-950"
      >
        {safeTab === 'properties' && <PropertiesPanel />}
        {safeTab === 'reports' && <ReportsPanel />}
        {safeTab === 'insights' && <InsightsPanel />}
      </div>
    </div>
  )
}
