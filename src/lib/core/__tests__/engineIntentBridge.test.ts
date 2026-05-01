import { beforeEach, describe, expect, it } from 'vitest'
import { applyEngineIntent, ENGINE_RUNTIME_BRIDGE_MODE } from '../engineIntentBridge'
import { useUIStore } from '../../../stores/uiStore'

describe('engineIntentBridge observe mode', () => {
  beforeEach(() => {
    useUIStore.setState({
      selectedIds: ['seed-id'],
      contextMenu: null,
    })
  })

  it('defaults to observe mode', () => {
    expect(ENGINE_RUNTIME_BRIDGE_MODE).toBe('observe')
  })

  it('does not mutate selection while observe mode is active', () => {
    applyEngineIntent({
      type: 'select',
      source: 'pointer',
      ids: ['next-id'],
      mode: 'replace',
    })
    expect(useUIStore.getState().selectedIds).toEqual(['seed-id'])
  })

  it('does not open context menu while observe mode is active', () => {
    applyEngineIntent({
      type: 'context-menu',
      source: 'pointer',
      position: { x: 100, y: 80 },
      targetId: 'next-id',
    })
    expect(useUIStore.getState().contextMenu).toBeNull()
  })
})
