import { describe, it, expect, beforeAll } from 'vitest'
import {
  isSofaElement,
  isPlantElement,
  isPrinterElement,
  isWhiteboardElement,
  isMonitorElement,
  isTaskLampElement,
  isCredenzaElement,
  isBookshelfElement,
  isAreaRugElement,
  isAssignableElement,
  type CanvasElement,
  type SofaElement,
  type PlantElement,
  type PrinterElement,
  type WhiteboardElement,
  type MonitorElement,
  type TaskLampElement,
  type CredenzaElement,
  type BookshelfElement,
  type AreaRugElement,
  type ElementStyle,
} from '../types/elements'
import { getDefaults } from '../lib/constants'
import { loadAutoSave } from '../lib/offices/loadFromLegacyPayload'

const SAVE_KEY = 'floocraft-autosave'

// Node 25 ships an experimental localStorage that doesn't support .clear();
// match the pattern used by autoSaveSafety.test.ts for the legacy-payload
// round-trip assertion below.
beforeAll(() => {
  const store = new Map<string, string>()
  const shim: Storage = {
    get length() { return store.size },
    clear: () => store.clear(),
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    key: (i) => Array.from(store.keys())[i] ?? null,
    removeItem: (k) => { store.delete(k) },
    setItem: (k, v) => { store.set(k, String(v)) },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: shim,
    configurable: true,
    writable: true,
  })
})

const baseStyle: ElementStyle = { fill: '#fff', stroke: '#000', strokeWidth: 1, opacity: 1 }

function makeSofa(): SofaElement {
  const d = getDefaults('sofa')!
  return {
    id: 's1',
    type: 'sofa',
    x: 0, y: 0,
    width: d.width, height: d.height,
    rotation: 0, locked: false, groupId: null, zIndex: 1,
    label: 'Sofa', visible: true,
    style: { ...baseStyle, fill: d.fill, stroke: d.stroke },
  }
}

function makePlant(): PlantElement {
  const d = getDefaults('plant')!
  return {
    id: 'p1',
    type: 'plant',
    x: 10, y: 10,
    width: d.width, height: d.height,
    rotation: 0, locked: false, groupId: null, zIndex: 2,
    label: 'Plant', visible: true,
    style: { ...baseStyle, fill: d.fill, stroke: d.stroke },
  }
}

function makePrinter(): PrinterElement {
  const d = getDefaults('printer')!
  return {
    id: 'pr1',
    type: 'printer',
    x: 20, y: 20,
    width: d.width, height: d.height,
    rotation: 0, locked: false, groupId: null, zIndex: 3,
    label: 'Printer', visible: true,
    style: { ...baseStyle, fill: d.fill, stroke: d.stroke },
  }
}

function makeWhiteboard(): WhiteboardElement {
  const d = getDefaults('whiteboard')!
  return {
    id: 'w1',
    type: 'whiteboard',
    x: 30, y: 30,
    width: d.width, height: d.height,
    rotation: 0, locked: false, groupId: null, zIndex: 4,
    label: 'Whiteboard', visible: true,
    style: { ...baseStyle, fill: d.fill, stroke: d.stroke },
  }
}

function makeMonitor(): MonitorElement {
  const d = getDefaults('monitor')!
  return {
    id: 'm1',
    type: 'monitor',
    x: 40, y: 40,
    width: d.width, height: d.height,
    rotation: 0, locked: false, groupId: null, zIndex: 5,
    label: 'Monitor', visible: true,
    style: { ...baseStyle, fill: d.fill, stroke: d.stroke },
  }
}

function makeTaskLamp(): TaskLampElement {
  const d = getDefaults('task-lamp')!
  return {
    id: 'tl1',
    type: 'task-lamp',
    x: 50, y: 50,
    width: d.width, height: d.height,
    rotation: 0, locked: false, groupId: null, zIndex: 6,
    label: 'Task Lamp', visible: true,
    style: { ...baseStyle, fill: d.fill, stroke: d.stroke },
  }
}

function makeCredenza(): CredenzaElement {
  const d = getDefaults('credenza')!
  return {
    id: 'c1',
    type: 'credenza',
    x: 60, y: 60,
    width: d.width, height: d.height,
    rotation: 0, locked: false, groupId: null, zIndex: 7,
    label: 'Credenza', visible: true,
    style: { ...baseStyle, fill: d.fill, stroke: d.stroke },
  }
}

function makeBookshelf(): BookshelfElement {
  const d = getDefaults('bookshelf')!
  return {
    id: 'b1',
    type: 'bookshelf',
    x: 70, y: 70,
    width: d.width, height: d.height,
    rotation: 0, locked: false, groupId: null, zIndex: 8,
    label: 'Bookshelf', visible: true,
    style: { ...baseStyle, fill: d.fill, stroke: d.stroke },
  }
}

function makeAreaRug(): AreaRugElement {
  const d = getDefaults('area-rug')!
  return {
    id: 'r1',
    type: 'area-rug',
    x: 80, y: 80,
    width: d.width, height: d.height,
    rotation: 0, locked: false, groupId: null, zIndex: 9,
    label: 'Area Rug', visible: true,
    style: { ...baseStyle, fill: d.fill, stroke: d.stroke },
  }
}

describe('furniture catalog — type guards', () => {
  it('isSofaElement matches only sofas', () => {
    expect(isSofaElement(makeSofa())).toBe(true)
    expect(isSofaElement(makePlant() as CanvasElement)).toBe(false)
    expect(isSofaElement(makePrinter() as CanvasElement)).toBe(false)
    expect(isSofaElement(makeWhiteboard() as CanvasElement)).toBe(false)
  })

  it('isPlantElement matches only plants', () => {
    expect(isPlantElement(makePlant())).toBe(true)
    expect(isPlantElement(makeSofa() as CanvasElement)).toBe(false)
  })

  it('isPrinterElement matches only printers', () => {
    expect(isPrinterElement(makePrinter())).toBe(true)
    expect(isPrinterElement(makeSofa() as CanvasElement)).toBe(false)
  })

  it('isWhiteboardElement matches only whiteboards', () => {
    expect(isWhiteboardElement(makeWhiteboard())).toBe(true)
    expect(isWhiteboardElement(makePrinter() as CanvasElement)).toBe(false)
  })

  it('premium prop type guards match only their own element types', () => {
    expect(isMonitorElement(makeMonitor())).toBe(true)
    expect(isTaskLampElement(makeTaskLamp())).toBe(true)
    expect(isCredenzaElement(makeCredenza())).toBe(true)
    expect(isBookshelfElement(makeBookshelf())).toBe(true)
    expect(isAreaRugElement(makeAreaRug())).toBe(true)
    expect(isMonitorElement(makeTaskLamp() as CanvasElement)).toBe(false)
    expect(isBookshelfElement(makeCredenza() as CanvasElement)).toBe(false)
  })
})

describe('furniture catalog — default sizes', () => {
  it('sofa defaults are 200x80', () => {
    const d = getDefaults('sofa')!
    expect(d.width).toBe(200)
    expect(d.height).toBe(80)
  })

  it('plant defaults are 40x40', () => {
    const d = getDefaults('plant')!
    expect(d.width).toBe(40)
    expect(d.height).toBe(40)
  })

  it('printer defaults are 60x50', () => {
    const d = getDefaults('printer')!
    expect(d.width).toBe(60)
    expect(d.height).toBe(50)
  })

  it('whiteboard defaults are 180x20', () => {
    const d = getDefaults('whiteboard')!
    expect(d.width).toBe(180)
    expect(d.height).toBe(20)
  })

  it('premium prop defaults carry realistic top-down proportions', () => {
    expect(getDefaults('monitor')).toMatchObject({ width: 42, height: 26 })
    expect(getDefaults('task-lamp')).toMatchObject({ width: 36, height: 36 })
    expect(getDefaults('credenza')).toMatchObject({ width: 150, height: 46 })
    expect(getDefaults('bookshelf')).toMatchObject({ width: 90, height: 28 })
    expect(getDefaults('area-rug')).toMatchObject({ width: 160, height: 100 })
  })
})

describe('furniture catalog — non-assignable', () => {
  it('none of the new types are assignable (no seats / no employee binding)', () => {
    expect(isAssignableElement(makeSofa() as CanvasElement)).toBe(false)
    expect(isAssignableElement(makePlant() as CanvasElement)).toBe(false)
    expect(isAssignableElement(makePrinter() as CanvasElement)).toBe(false)
    expect(isAssignableElement(makeWhiteboard() as CanvasElement)).toBe(false)
    expect(isAssignableElement(makeMonitor() as CanvasElement)).toBe(false)
    expect(isAssignableElement(makeTaskLamp() as CanvasElement)).toBe(false)
    expect(isAssignableElement(makeCredenza() as CanvasElement)).toBe(false)
    expect(isAssignableElement(makeBookshelf() as CanvasElement)).toBe(false)
    expect(isAssignableElement(makeAreaRug() as CanvasElement)).toBe(false)
  })
})

describe('furniture catalog — legacy payload round-trip', () => {
  it('visual furniture props survive a save+load cycle without loss', () => {
    const elements: Record<string, CanvasElement> = {
      s1: makeSofa(),
      p1: makePlant(),
      pr1: makePrinter(),
      w1: makeWhiteboard(),
      m1: makeMonitor(),
      tl1: makeTaskLamp(),
      c1: makeCredenza(),
      b1: makeBookshelf(),
      r1: makeAreaRug(),
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify({ elements, employees: {} }))
    const loaded = loadAutoSave()
    expect(loaded).not.toBeNull()
    const out = loaded!.elements
    expect(Object.keys(out).sort()).toEqual(['b1', 'c1', 'm1', 'p1', 'pr1', 'r1', 's1', 'tl1', 'w1'])
    expect(isSofaElement(out.s1 as CanvasElement)).toBe(true)
    expect(isPlantElement(out.p1 as CanvasElement)).toBe(true)
    expect(isPrinterElement(out.pr1 as CanvasElement)).toBe(true)
    expect(isWhiteboardElement(out.w1 as CanvasElement)).toBe(true)
    expect(isMonitorElement(out.m1 as CanvasElement)).toBe(true)
    expect(isTaskLampElement(out.tl1 as CanvasElement)).toBe(true)
    expect(isCredenzaElement(out.c1 as CanvasElement)).toBe(true)
    expect(isBookshelfElement(out.b1 as CanvasElement)).toBe(true)
    expect(isAreaRugElement(out.r1 as CanvasElement)).toBe(true)
    // Dimensions preserved exactly.
    expect(out.s1.width).toBe(200)
    expect(out.s1.height).toBe(80)
    expect(out.p1.width).toBe(40)
    expect(out.pr1.width).toBe(60)
    expect(out.w1.width).toBe(180)
    expect(out.w1.height).toBe(20)
    expect(out.m1.width).toBe(42)
    expect(out.tl1.height).toBe(36)
    expect(out.c1.width).toBe(150)
    expect(out.b1.width).toBe(90)
    expect(out.r1.height).toBe(100)
  })
})
