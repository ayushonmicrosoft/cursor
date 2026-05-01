import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../stores/uiStore'

describe('uiStore view mode', () => {
  beforeEach(() => {
    useUIStore.setState({ viewMode: '2d', renderEngine: 'konva' })
  })

  it('defaults to 2d mode', () => {
    expect(useUIStore.getState().viewMode).toBe('2d')
  })

  it('switches to 2.5d and back', () => {
    useUIStore.getState().setViewMode('2.5d')
    expect(useUIStore.getState().viewMode).toBe('2.5d')

    useUIStore.getState().setViewMode('2d')
    expect(useUIStore.getState().viewMode).toBe('2d')
  })

  it('switches render engine', () => {
    expect(useUIStore.getState().renderEngine).toBe('konva')
    useUIStore.getState().setRenderEngine('pixi')
    expect(useUIStore.getState().renderEngine).toBe('pixi')
  })
})
