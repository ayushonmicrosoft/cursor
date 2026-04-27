import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearInteractionIssueEvents,
  getInteractionIssueEvents,
  recordSelectionFailure,
} from '../lib/interactionTelemetry'
import { useElementsStore } from '../stores/elementsStore'
import {
  DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS,
  useUIStore,
} from '../stores/uiStore'
import type { CanvasElement } from '../types/elements'

describe('interaction telemetry', () => {
  beforeEach(() => {
    clearInteractionIssueEvents()
    useElementsStore.setState({ elements: {} })
    useUIStore.setState({
      selectedIds: [],
      dockableToolbarLayouts: { ...DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS },
    })
    localStorage.removeItem('oandocraft.toolbar-layouts')
  })

  it('records selection failures when selection targets are missing', () => {
    useUIStore.getState().setSelectedIds(['missing-1'])

    const events = getInteractionIssueEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      name: 'selection.failure',
      payload: {
        source: 'setSelectedIds',
        attemptedIds: ['missing-1'],
        missingIds: ['missing-1'],
      },
    })
  })

  it('does not record selection failures for known element ids', () => {
    useElementsStore.setState({
      elements: {
        seat1: {
          id: 'seat1',
        } as CanvasElement,
      },
    })

    useUIStore.getState().setSelectedIds(['seat1'])
    expect(getInteractionIssueEvents()).toHaveLength(0)
  })

  it('records toolbar layout anomalies and clamps invalid coordinates', () => {
    useUIStore.getState().setDockableToolbarPosition('canvas-actions', { x: Number.POSITIVE_INFINITY, y: 12 })

    const events = getInteractionIssueEvents()
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      name: 'toolbar.layout.anomaly',
      payload: {
        source: 'state-write',
        toolbarId: 'canvas-actions',
        reason: 'invalid-layout-data',
      },
    })
    expect(useUIStore.getState().dockableToolbarLayouts['canvas-actions'].position).toEqual(
      DEFAULT_DOCKABLE_TOOLBAR_LAYOUTS['canvas-actions'].position,
    )
  })

  it('keeps only the latest 200 events', () => {
    for (let i = 0; i < 230; i += 1) {
      recordSelectionFailure({
        source: 'buffer-test',
        attemptedIds: [`id-${i}`],
        missingIds: [`id-${i}`],
      })
    }

    const events = getInteractionIssueEvents()
    expect(events).toHaveLength(200)
    expect(events[0].payload).toMatchObject({
      attemptedIds: ['id-30'],
    })
    expect(events[199].payload).toMatchObject({
      attemptedIds: ['id-229'],
    })
  })
})
