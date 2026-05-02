import { useCallback } from 'react'
import { DockviewReact } from 'dockview-react'
import type { AddPanelPositionOptions, DockviewReadyEvent } from 'dockview-react'
import { ToolSelector } from './LeftSidebar/ToolSelector'
import { LayerVisibilityPanel } from './LeftSidebar/LayerVisibilityPanel'
import { ElementLibrary } from './LeftSidebar/ElementLibrary'
import { RightSidebar } from './RightSidebar/RightSidebar'
import { CanvasPanel } from './CanvasPanel'

const components = {
  tools: () => (
    <div className="w-full h-full overflow-y-auto bg-white dark:bg-gray-950 p-3">
      <ToolSelector />
    </div>
  ),
  layers: () => (
    <div className="w-full h-full overflow-y-auto bg-white dark:bg-gray-950 p-3">
      <LayerVisibilityPanel />
    </div>
  ),
  library: () => (
    <div className="w-full h-full overflow-y-auto bg-white dark:bg-gray-950 p-3">
      <ElementLibrary />
    </div>
  ),
  rightSidebar: () => (
    <div className="w-full h-full overflow-y-auto bg-white dark:bg-gray-950">
      <RightSidebar />
    </div>
  ),
  canvas: () => <CanvasPanel />
}

export function DockviewEditor() {
  const onReady = useCallback((event: DockviewReadyEvent) => {
    // Add Canvas in the center
    const canvasPanel = event.api.addPanel({
      id: 'canvas',
      component: 'canvas',
      title: 'Editor',
    })

    // Add Tools to the left of Canvas
    const toolsPanel = event.api.addPanel({
      id: 'tools',
      component: 'tools',
      title: 'Tools',
      position: { referencePanel: canvasPanel, direction: 'left' } satisfies AddPanelPositionOptions,
    })

    // Add Layers below Tools
    event.api.addPanel({
      id: 'layers',
      component: 'layers',
      title: 'Layers',
      position: { referencePanel: toolsPanel, direction: 'below' } satisfies AddPanelPositionOptions,
    })

    // Add Library below Layers
    event.api.addPanel({
      id: 'library',
      component: 'library',
      title: 'Library',
      position: { referencePanel: 'layers', direction: 'below' } satisfies AddPanelPositionOptions,
    })

    // Add Properties to the right of Canvas
    event.api.addPanel({
      id: 'rightSidebar',
      component: 'rightSidebar',
      title: 'Properties',
      position: { referencePanel: canvasPanel, direction: 'right' } satisfies AddPanelPositionOptions,
    })
  }, [])

  return (
    <DockviewReact
      components={components}
      onReady={onReady}
      className="dockview-theme-light dark:dockview-theme-dark flex-1"
    />
  )
}
