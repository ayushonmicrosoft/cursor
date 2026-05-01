/**
 * Pixi rendering library — barrel export.
 *
 * All PixiJS-specific renderers, layers, and utilities live in this
 * directory.  PixiStage.tsx imports from here; nothing else should
 * reach into these files directly.
 */

// Element renderers
export { renderDesk } from './PixiDeskRenderer'
export { renderWorkstation } from './PixiWorkstationRenderer'
export { renderWall } from './PixiWallRenderer'
export { renderTable } from './PixiTableRenderer'
export { renderRoom } from './PixiRoomRenderer'
export { renderFurniture } from './PixiFurnitureRenderer'

// Layers
export { syncNeighborhoodLayer } from './PixiNeighborhoodLayer'
export { syncGrid } from './PixiGridLayer'

// Overlays
export { syncAlignmentGuides } from './PixiAlignmentGuides'
export { syncSelectionHandles } from './PixiSelectionHandles'
