import { Container } from 'pixi.js'
import { describe, expect, it } from 'vitest'
import { syncNeighborhoodLayer } from '../PixiNeighborhoodLayer'

const baseNeighborhood = {
  id: 'zone-1',
  name: 'North',
  x: 100,
  y: 120,
  width: 240,
  height: 180,
  color: '#4f46e5',
}

describe('syncNeighborhoodLayer', () => {
  it('does not reuse destroyed zone containers across different layers', () => {
    const layerA = new Container()
    syncNeighborhoodLayer(layerA, { [baseNeighborhood.id]: baseNeighborhood }, null)

    expect(layerA.children).toHaveLength(1)
    const firstZone = layerA.children[0]

    layerA.destroy({ children: true })
    expect(firstZone.destroyed).toBe(true)

    const layerB = new Container()
    syncNeighborhoodLayer(layerB, { [baseNeighborhood.id]: baseNeighborhood }, null)

    expect(layerB.children).toHaveLength(1)
    const secondZone = layerB.children[0]
    expect(secondZone).not.toBe(firstZone)
    expect(secondZone.destroyed).toBe(false)

    layerB.destroy({ children: true })
  })
})
