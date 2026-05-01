# OandOcraft Toolbar Docking Audit

This audit separates movable canvas toolbars from fixed application chrome.
The rule is simple: controls that operate on the canvas may dock or float;
navigation, route identity, and telemetry bars stay fixed so the editor does
not lose its orientation model.

## Dockable Canvas Toolbars

- Canvas controls: `CanvasActionDock`, backed by `DockableToolbar`.
- Align/distribute: `AlignDistributeToolbar`, backed by `DockableToolbar`.
- Admin operations: `AdminStatsToolbar`, backed by `DockableToolbar`.

These support docked/floating modes, persisted positions, reset-to-default,
and drag handles through the shared `DockableToolbar` shell.

## Intentionally Fixed Chrome

- Top bar: fixed because it owns team switching, file actions, save state,
  undo/redo, view menu, route links, and user identity outside the canvas dock
  host.
- Floor switcher: fixed because it owns office identity, route-level floor
  navigation, floor reorder, and destructive floor actions.
- Status bar: fixed because it reserves the bottom telemetry edge for cursor,
  zoom, occupancy, selected count, and tool hints. Keeping this fixed prevents
  floating toolbars from covering critical readouts.
- Roster bulk toolbar: fixed inside the roster table because it is tied to the
  selected row set and table scroll context, not to the canvas.

The fixed editor chrome exposes `data-fixed-toolbar` and
`data-fixed-toolbar-reason` attributes so future audits can distinguish
intentional fixed bars from missed dockable canvas toolbars.

## Remaining Rule

Any new canvas-only control cluster must use `DockableToolbar` unless it has a
documented fixed-chrome reason in this file.
