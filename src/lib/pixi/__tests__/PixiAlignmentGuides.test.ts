import { Container } from 'pixi.js'
import { describe, expect, it } from 'vitest'
import { syncAlignmentGuides } from '../PixiAlignmentGuides'
import type { AlignmentGuide } from '../../geometry'

const guide: AlignmentGuide = {
  orientation: 'vertical',
  position: 320,
  start: 100,
  end: 600,
}

describe('syncAlignmentGuides', () => {
  it('destroys removed guide graphics when guides are cleared', () => {
    const layer = new Container()
    syncAlignmentGuides(layer, [guide])

    expect(layer.children).toHaveLength(1)
    const firstGraphics = layer.children[0]

    syncAlignmentGuides(layer, [])
    expect(layer.children).toHaveLength(0)
    expect(firstGraphics.destroyed).toBe(true)
  })

  it('destroys previous graphics before drawing the next guides set', () => {
    const layer = new Container()
    syncAlignmentGuides(layer, [guide])

    const firstGraphics = layer.children[0]
    const nextGuide: AlignmentGuide = { ...guide, orientation: 'horizontal', position: 180, start: 40, end: 900 }

    syncAlignmentGuides(layer, [nextGuide])
    expect(layer.children).toHaveLength(1)
    expect(layer.children[0]).not.toBe(firstGraphics)
    expect(firstGraphics.destroyed).toBe(true)
  })
})
