import { describe, expect, it } from 'vitest'
import { KonvaAdapter } from '../KonvaAdapter'
import { createKonvaNodeId } from '../konvaNodeFactory'
import type { EngineLifecycleEvent } from '../../core/rendererContract'
import type { EngineIntent } from '../../core/engineIntents'

type MockKonvaStageLike = Parameters<KonvaAdapter['bindStage']>[0]
type MockKonvaStageHandler = Parameters<MockKonvaStageLike['on']>[1]
type MockKonvaStageEvent = Parameters<MockKonvaStageHandler>[0]

class MockStage implements MockKonvaStageLike {
  private readonly handlers = new Map<string, Set<MockKonvaStageHandler>>()

  on(eventName: string, handler: MockKonvaStageHandler) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set())
    }
    this.handlers.get(eventName)?.add(handler)
  }

  off(eventName: string, handler: MockKonvaStageHandler) {
    this.handlers.get(eventName)?.delete(handler)
  }

  emit(eventName: string, event: MockKonvaStageEvent) {
    const callbacks = this.handlers.get(eventName)
    if (!callbacks) return
    for (const callback of callbacks) {
      callback(event)
    }
  }

  listenerCount(eventName: string) {
    return this.handlers.get(eventName)?.size ?? 0
  }
}

function createHarness() {
  const lifecycleEvents: EngineLifecycleEvent[] = []
  const intents: EngineIntent[] = []
  const adapter = new KonvaAdapter()
  adapter.init({
    host: document.createElement('div'),
    emitIntent: (intent) => intents.push(intent),
    emitEvent: (event) => lifecycleEvents.push(event),
  })
  return { adapter, lifecycleEvents, intents }
}

describe('KonvaAdapter', () => {
  it('tracks lifecycle and stores latest scene', () => {
    const { adapter } = createHarness()

    adapter.render({
      floor: { id: 'floor-1', name: 'HQ' },
      elements: {},
      selectedIds: [],
      hoveredId: null,
      viewport: { x: 0, y: 0, scale: 1 },
      readOnly: false,
    })
    adapter.resize({ width: 800, height: 600 })
    adapter.dispose()

    expect(adapter.getLifecycleHistory()).toEqual(['init', 'ready', 'render', 'resize', 'dispose'])
    expect(adapter.getLastScene()).toBeNull()
  })

  it('emits select and context-menu intents from bound stage', () => {
    const { adapter, intents } = createHarness()
    const stage = new MockStage()
    adapter.bindStage(stage)

    stage.emit('pointerdown', {
      target: { id: () => createKonvaNodeId('desk-1') },
    })
    stage.emit('contextmenu', {
      target: { id: () => createKonvaNodeId('desk-1') },
      evt: { clientX: 120, clientY: 80 },
    })

    expect(intents).toMatchObject([
      {
        type: 'select',
        ids: ['desk-1'],
      },
      {
        type: 'context-menu',
        targetId: 'desk-1',
        position: { x: 120, y: 80 },
      },
    ])
  })

  it('emits clear-selection intent on background click', () => {
    const { adapter, intents } = createHarness()
    const stage = new MockStage()
    adapter.bindStage(stage)

    stage.emit('pointerdown', {
      target: { id: () => '' },
    })

    expect(intents).toMatchObject([
      {
        type: 'select',
        mode: 'replace',
        ids: [],
      },
    ])
  })

  it('resolves element id from parent node when child has no id', () => {
    const { adapter, intents } = createHarness()
    const stage = new MockStage()
    adapter.bindStage(stage)

    stage.emit('pointerdown', {
      target: {
        id: () => '',
        getParent: () => ({
          id: () => createKonvaNodeId('desk-2'),
        }),
      },
    })

    expect(intents).toMatchObject([
      {
        type: 'select',
        ids: ['desk-2'],
      },
    ])
  })

  it('ignores zero and invalid wheel deltas', () => {
    const { adapter, intents } = createHarness()
    const stage = new MockStage()
    adapter.bindStage(stage)

    stage.emit('wheel', { evt: { deltaY: 0 } })
    stage.emit('wheel', { evt: { deltaY: Number.NaN } })
    expect(intents).toHaveLength(0)

    stage.emit('wheel', { evt: { deltaY: -20 } })
    expect(intents).toHaveLength(1)
    expect(intents[0]).toMatchObject({ type: 'zoom' })
  })

  it('detaches listeners on dispose', () => {
    const { adapter } = createHarness()
    const stage = new MockStage()
    adapter.bindStage(stage)

    expect(stage.listenerCount('pointerdown')).toBe(1)
    expect(stage.listenerCount('contextmenu')).toBe(1)
    expect(stage.listenerCount('wheel')).toBe(1)

    adapter.dispose()

    expect(stage.listenerCount('pointerdown')).toBe(0)
    expect(stage.listenerCount('contextmenu')).toBe(0)
    expect(stage.listenerCount('wheel')).toBe(0)
  })

  it('can explicitly unbind stage listeners before dispose', () => {
    const { adapter } = createHarness()
    const stage = new MockStage()
    adapter.bindStage(stage)

    adapter.unbindStage()

    expect(stage.listenerCount('pointerdown')).toBe(0)
    expect(stage.listenerCount('contextmenu')).toBe(0)
    expect(stage.listenerCount('wheel')).toBe(0)
  })
})
