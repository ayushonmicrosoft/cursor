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
    <div className="glass-panel flex h-full min-w-0 flex-col overflow-hidden">
      <div className="flex items-stretch border-b border-white/40 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
        <SidebarToggle variant="inline" />
        <div
          role="tablist"
          aria-label="Right sidebar"
          className="flex flex-1 gap-1 px-2 py-2"
          onKeyDown={onKeyDown}
        >
        {tabs.map((t) => {
          const selected = safeTab === t.id
          const baseButtonClass =
            'relative flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full border px-2 py-2 text-[11px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset'
          const selectedClass = t.secondary
            ? 'border-slate-300 bg-white text-slate-950 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50'
            : 'border-slate-300 bg-white text-slate-950 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50'
          const idleClass = t.secondary
            ? 'border-transparent text-slate-500 hover:-translate-y-px hover:bg-white/90 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/70 dark:hover:text-slate-100'
            : 'border-transparent text-slate-500 hover:-translate-y-px hover:bg-white/90 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/70 dark:hover:text-slate-100'
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
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow">
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
        className="flex-1 overflow-x-hidden bg-transparent p-3"
      >
        {safeTab === 'properties' && <PropertiesPanel />}
        {safeTab === 'reports' && <ReportsPanel />}
        {safeTab === 'insights' && <InsightsPanel />}
      </div>
    </div>
  )
}
