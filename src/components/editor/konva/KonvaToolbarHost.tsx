import type { ReactNode } from 'react'
import { ToolSelector } from '../LeftSidebar/ToolSelector'
import { LayerVisibilityPanel } from '../LeftSidebar/LayerVisibilityPanel'
import { ElementLibrary } from '../LeftSidebar/ElementLibrary'
import { CollapsibleSection } from '../LeftSidebar/CollapsibleSection'
import { RightSidebar } from '../RightSidebar/RightSidebar'
import { SidebarToggle } from '../RightSidebar/SidebarToggle'
import { MOBILE_BREAKPOINT_PX } from '../NarrowScreenBanner'

interface KonvaToolbarHostProps {
  isCompactEditor: boolean
  leftToolsVisible: boolean
  rightInspectorVisible: boolean
  rightSidebarOpen: boolean
  children: ReactNode
}

export function KonvaToolbarHost({
  isCompactEditor,
  leftToolsVisible,
  rightInspectorVisible,
  rightSidebarOpen,
  children,
}: KonvaToolbarHostProps) {
  // Check if we're in mobile mode (480px-767px) where we use bottom sheet instead
  const isMobile = typeof window !== 'undefined' && window.innerWidth >= MOBILE_BREAKPOINT_PX && window.innerWidth < 768
  const showRightOverlay = isCompactEditor && !isMobile && rightSidebarOpen && rightInspectorVisible

  return (
    <div className="relative flex min-w-0 flex-1 overflow-hidden">
      {leftToolsVisible && !isCompactEditor && (
        <div
          className="flex w-[280px] flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-30"
          data-testid="mapview-left-sidebar"
        >
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
      {/* Docked right sidebar for desktop */}
      {rightSidebarOpen && rightInspectorVisible && !isCompactEditor && (
        <div className="flex w-[320px] flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-30" data-testid="mapview-right-sidebar-docked">
          <div className="flex h-8 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-3 bg-white dark:bg-gray-950">
            <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">Inspector</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <RightSidebar />
          </div>
        </div>
      )}
      {/* Overlay right sidebar for compact (tablet) mode - not shown on mobile (uses bottom sheet) */}
      {showRightOverlay && (
        <div
          className="absolute inset-y-0 right-0 z-30 w-[min(320px,85vw)] overflow-y-auto border-l border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950"
          data-testid="mapview-right-sidebar-overlay"
        >
          <RightSidebar />
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
