import type { ReactNode } from 'react'
import { ToolSelector } from '../LeftSidebar/ToolSelector'
import { LayerVisibilityPanel } from '../LeftSidebar/LayerVisibilityPanel'
import { ElementLibrary } from '../LeftSidebar/ElementLibrary'
import { CollapsibleSection } from '../LeftSidebar/CollapsibleSection'
import { RightSidebar } from '../RightSidebar/RightSidebar'
import { SidebarToggle } from '../RightSidebar/SidebarToggle'

interface KonvaToolbarHostProps {
  leftToolsVisible: boolean
  rightInspectorVisible: boolean
  rightSidebarOpen: boolean
  children: ReactNode
}

export function KonvaToolbarHost({
  leftToolsVisible,
  rightInspectorVisible,
  rightSidebarOpen,
  children,
}: KonvaToolbarHostProps) {
  return (
    <div className="flex min-w-0 flex-1 overflow-hidden">
      {leftToolsVisible && (
        <div className="flex w-[280px] flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-30">
          <div className="flex h-8 shrink-0 items-center border-b border-gray-200 dark:border-gray-800 px-3 bg-white dark:bg-gray-950">
            <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">Tools Rail</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FloatingToolsRail />
          </div>
        </div>
      )}

      {children}

      {!rightSidebarOpen && <SidebarToggle variant="docked" />}
      {rightSidebarOpen && rightInspectorVisible && (
        <div className="flex w-[320px] flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-30">
          <div className="flex h-8 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-3 bg-white dark:bg-gray-950">
            <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">Inspector</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <RightSidebar />
          </div>
        </div>
      )}
    </div>
  )
}

function FloatingToolsRail() {
  return (
    <div className="flex flex-col">
      <CollapsibleSection title="Tools" defaultOpen storageKey="floating-tools">
        <ToolSelector />
      </CollapsibleSection>
      <CollapsibleSection title="Layers" defaultOpen={false} storageKey="floating-layers">
        <LayerVisibilityPanel />
      </CollapsibleSection>
      <CollapsibleSection title="Library" defaultOpen storageKey="floating-library">
        <ElementLibrary />
      </CollapsibleSection>
    </div>
  )
}
