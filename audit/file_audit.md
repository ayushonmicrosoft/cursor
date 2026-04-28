# Floorcraft Project File Audit

This document provides a comprehensive audit of all source files in the Floorcraft project, following the recent architectural refactor to remove multi-floor support and consolidate Konva layers.

## 1. Core Architecture & Stores

| File | Path | Status | Audit Notes |
| :--- | :--- | :--- | :--- |
| `floorStore.ts` | `src/stores/floorStore.ts` | ✅ Optimized | Flattened to a single-floor architecture. Legacy multi-floor methods (add/remove/reorder) are now no-ops. API compatibility maintained for elements. |
| `elementsStore.ts` | `src/stores/elementsStore.ts` | ✅ Stable | Primary store for canvas elements. Temporal state (undo/redo) is well-integrated. |
| `neighborhoodStore.ts` | `src/stores/neighborhoodStore.ts` | ✅ Stable | Manages translucent zones. Correctly filtered by floor ID (now static 'default'). |
| `canvasStore.ts` | `src/stores/canvasStore.ts` | ✅ Refactored | Manages viewport, zoom, and canvas settings. Includes normalization for compass and grid. |
| `uiStore.ts` | `src/stores/uiStore.ts` | ✅ Stable | Manages sidebar states, toolbars, and presentation mode. Dockable layout system is robust. |

## 2. Editor UI Components

| File | Path | Status | Audit Notes |
| :--- | :--- | :--- | :--- |
| `CanvasStage.tsx` | `src/components/editor/Canvas/CanvasStage.tsx` | 🚀 Performance | **Critical Optimization**: Consolidated 15+ layers into 5 shared layers. Decorative overlays now use Groups to avoid excessive canvas overhead. |
| `TopBar.tsx` | `src/components/editor/TopBar.tsx` | ✨ Polished | Multi-floor switcher removed. Identity cluster simplified. Export handlers updated for single-floor default. |
| `MapView.tsx` | `src/components/editor/MapView.tsx` | ✅ Cleaned | Removed floor-switching URL parameter logic. Simplified 2.5D fallback and focus logic. |
| `PresentationOverlay.tsx` | `src/components/editor/PresentationOverlay.tsx` | ✅ Refactored | Removed floor navigation shortcuts and hints. Now focuses purely on immersive presentation. |
| `HelpPage.tsx` | `src/components/help/HelpPage.tsx` | 📖 Updated | Complete documentation overhaul. Removed all multi-floor references and updated search tags. |

## 3. Rendering & Overlays

| File | Path | Status | Audit Notes |
| :--- | :--- | :--- | :--- |
| `GridLayer.tsx` | `src/components/editor/Canvas/GridLayer.tsx` | ✅ Grouped | Converted from Layer to Group. Batched into shared Background layer. |
| `NeighborhoodLayer.tsx` | `src/components/editor/Canvas/NeighborhoodLayer.tsx` | ✅ Grouped | Converted from Layer to Group. Batched into shared Background layer. |
| `WallDrawingOverlay.tsx` | `src/components/editor/Canvas/WallDrawingOverlay.tsx` | ✅ Grouped | Converted from Layer to Group. Batched into shared Decorations layer. |
| `DimensionLayer.tsx` | `src/components/editor/Canvas/DimensionLayer.tsx` | ✅ Grouped | Converted from Layer to Group. Batched into shared Decorations layer. |
| `HoverOutline.tsx` | `src/components/editor/Canvas/HoverOutline.tsx` | ✅ Grouped | Converted from Layer to Group. Batched into shared Decorations layer. |

## 4. Technical Debt & Cleanup

| Item | Status | Action Taken |
| :--- | :--- | :--- |
| **Multi-floor Logic** | 🗑️ Removed | Deleted `FloorSwitcher`, `FloorCompare`, and related routes. |
| **Konva Layer Warning** | 🛡️ Fixed | Consolidated layers to stay within the 3-5 layer recommended limit. |
| **Type Integrity** | 🛠️ Verified | Clean `tsc --noEmit` pass confirmed across the entire project. |
| **SEO & A11y** | ⚠️ Needs Work | Lighthouse score indicates accessibility and SEO gaps (partially due to canvas-heavy nature). |

## 5. Performance Metrics (Lighthouse)

*   **Best Practices**: 83/100
*   **Accessibility**: 37/100 (Canvas interactivity requires improved ARIA patterns)
*   **SEO**: 0/100 (Internal editor page, not indexed)

---
*Audit completed on April 28, 2026.*
