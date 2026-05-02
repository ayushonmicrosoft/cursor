import { describe, expect, it } from 'vitest'
import { assertEngineIntent } from '../engineIntents'
import { createLifecycleTracker } from '../rendererContract'

describe('renderer lifecycle contract', () => {
  it('accepts valid lifecycle ordering', () => {
    const tracker = createLifecycleTracker()
    tracker.record('init')
    tracker.record('ready')
    tracker.record('render')
    tracker.record('resize')
    tracker.record('error')
    tracker.record('dispose')

    expect(tracker.getHistory()).toEqual(['init', 'ready', 'render', 'resize', 'error', 'dispose'])
  })

  it('rejects render before ready', () => {
    const tracker = createLifecycleTracker()
    tracker.record('init')
    expect(() => tracker.record('render')).toThrow(/requires ready/i)
  })

  it('rejects ready before init', () => {
    const tracker = createLifecycleTracker()
    expect(() => tracker.record('ready')).toThrow(/requires init/i)
  })

  it('rejects duplicate init and post-dispose events', () => {
    const tracker = createLifecycleTracker()
    tracker.record('init')
    expect(() => tracker.record('init')).toThrow(/only be emitted once/i)
    tracker.record('ready')
    tracker.record('dispose')
    expect(() => tracker.record('resize')).toThrow(/after dispose/i)
  })

  it('rejects invalid lifecycle payload timestamp', () => {
    const tracker = createLifecycleTracker()
    expect(() => tracker.record({ type: 'init', at: Number.NaN })).toThrow(/event\.at/i)
  })
})

describe('engine intent contract', () => {
  it('accepts valid intent payloads', () => {
    expect(() =>
      assertEngineIntent({
        type: 'select',
        source: 'pointer',
        ids: ['a', 'b'],
        mode: 'replace',
      }),
    ).not.toThrow()

    expect(() =>
      assertEngineIntent({
        type: 'zoom',
        source: 'pointer',
        scaleDelta: 1.1,
        anchor: { x: 320, y: 240 },
      }),
    ).not.toThrow()

    expect(() =>
      assertEngineIntent({
        type: 'key-command',
        source: 'keyboard',
        command: 'undo',
      }),
    ).not.toThrow()
  })

  it('rejects invalid select intent ids', () => {
    expect(() =>
      assertEngineIntent({
        type: 'select',
        source: 'pointer',
        ids: ['dup', 'dup'],
        mode: 'replace',
      }),
    ).toThrow(/unique/i)

    expect(() =>
      assertEngineIntent({
        type: 'select',
        source: 'pointer',
        ids: [],
        mode: 'add',
      }),
    ).toThrow(/cannot be empty/i)

    expect(() =>
      assertEngineIntent({
        type: 'select',
        source: 'pointer',
        ids: ['  node-1  '],
        mode: 'replace',
      }),
    ).toThrow(/non-empty strings/i)
  })

  it('rejects non-finite numeric payloads', () => {
    expect(() =>
      assertEngineIntent({
        type: 'pan',
        source: 'pointer',
        delta: { x: Number.NaN, y: 0 },
      }),
    ).toThrow(/finite/i)

    expect(() =>
      assertEngineIntent({
        type: 'zoom',
        source: 'pointer',
        scaleDelta: 0,
        anchor: null,
      }),
    ).toThrow(/> 0/i)
  })

  it('rejects invalid drag and context-menu ids', () => {
    expect(() =>
      assertEngineIntent({
        type: 'drag',
        source: 'pointer',
        phase: 'start',
        id: '   ',
        position: { x: 1, y: 2 },
      }),
    ).toThrow(/cannot be empty/i)

    expect(() =>
      assertEngineIntent({
        type: 'drag',
        source: 'pointer',
        phase: 'start',
        id: '  element-1',
        position: { x: 1, y: 2 },
      }),
    ).toThrow(/cannot be empty/i)

    expect(() =>
      assertEngineIntent({
        type: 'context-menu',
        source: 'pointer',
        position: { x: 10, y: 20 },
        targetId: ' ',
      }),
    ).toThrow(/targetId/i)

    expect(() =>
      assertEngineIntent({
        type: 'context-menu',
        source: 'pointer',
        position: { x: 10, y: 20 },
        targetId: ' element-1 ',
      }),
    ).toThrow(/targetId/i)
  })

  it('rejects invalid key-command source and command', () => {
    expect(() =>
      assertEngineIntent({
        type: 'key-command',
        source: 'pointer',
        command: 'undo',
      }),
    ).toThrow(/source must be keyboard/i)

    expect(() =>
      assertEngineIntent({
        type: 'key-command',
        source: 'keyboard',
        command: 'not-a-command',
      }),
    ).toThrow(/command is invalid/i)
  })
})
