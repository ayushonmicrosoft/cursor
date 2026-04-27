import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { CanvasElement } from '../../../types/elements'
import type { Floor } from '../../../types/floor'
import {
  mapFloorToView3DScene,
  type View3DMaterialProfile,
  type View3DMappingOptions,
} from '../../../lib/view3d'
import {
  getView3DCameraPresets,
  type View3DCameraPreset,
  type View3DCameraPresetId,
} from '../../../lib/view3d/sceneMapping'

interface View3DCanvasProps {
  floor?: Floor | null
  elements?: Record<string, CanvasElement>
  className?: string
  style?: CSSProperties
  mappingOptions?: View3DMappingOptions
  onRequestFallback2D?: () => void
}

const MATERIAL_SETTINGS: Record<
  View3DMaterialProfile,
  {
    roughness: number
    metalness: number
    opacity?: number
    edge: string
    edgeOpacity: number
    emissive?: string
  }
> = {
  'solid-wall': { roughness: 0.72, metalness: 0.04, edge: '#0f172a', edgeOpacity: 0.3 },
  'glass-wall': { roughness: 0.2, metalness: 0, opacity: 0.36, edge: '#0369a1', edgeOpacity: 0.36 },
  'half-wall': { roughness: 0.7, metalness: 0.03, edge: '#1e293b', edgeOpacity: 0.28 },
  'room-zone': { roughness: 0.9, metalness: 0, opacity: 0.42, edge: '#475569', edgeOpacity: 0.24 },
  'work-surface': { roughness: 0.64, metalness: 0.08, edge: '#075985', edgeOpacity: 0.22 },
  'hot-desk': { roughness: 0.66, metalness: 0.06, edge: '#0f766e', edgeOpacity: 0.22 },
  'meeting-table': { roughness: 0.58, metalness: 0.04, edge: '#78350f', edgeOpacity: 0.2 },
  'soft-seating': { roughness: 0.86, metalness: 0, edge: '#9a3412', edgeOpacity: 0.2 },
  divider: { roughness: 0.7, metalness: 0.03, opacity: 0.9, edge: '#334155', edgeOpacity: 0.26 },
  plant: { roughness: 0.82, metalness: 0, edge: '#166534', edgeOpacity: 0.16 },
  equipment: { roughness: 0.54, metalness: 0.16, edge: '#334155', edgeOpacity: 0.2 },
  whiteboard: { roughness: 0.38, metalness: 0.02, edge: '#94a3b8', edgeOpacity: 0.28, emissive: '#f8fafc' },
  'generic-furniture': { roughness: 0.68, metalness: 0.04, edge: '#334155', edgeOpacity: 0.2 },
}

function createMaterial(
  color: string,
  profile: View3DMaterialProfile,
): THREE.MeshStandardMaterial {
  const settings = MATERIAL_SETTINGS[profile]
  return new THREE.MeshStandardMaterial({
    color,
    roughness: settings.roughness,
    metalness: settings.metalness,
    transparent: settings.opacity !== undefined,
    opacity: settings.opacity ?? 1,
    emissive: settings.emissive ? new THREE.Color(settings.emissive) : new THREE.Color('#000000'),
    emissiveIntensity: settings.emissive ? 0.16 : 0,
  })
}

function addEdgeOverlay(mesh: THREE.Mesh, profile: View3DMaterialProfile) {
  const settings = MATERIAL_SETTINGS[profile]
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({
      color: settings.edge,
      transparent: true,
      opacity: settings.edgeOpacity,
    }),
  )
  edges.renderOrder = 2
  mesh.add(edges)
}

function createMesh(
  instance: ReturnType<typeof mapFloorToView3DScene>['instances'][number],
  enableShadows: boolean,
): THREE.Mesh {
  const [width, height, depth] = instance.size
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = createMaterial(instance.color, instance.materialProfile)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(instance.position[0], instance.position[1], instance.position[2])
  mesh.rotation.y = instance.rotationY
  mesh.castShadow = enableShadows && instance.kind !== 'room'
  mesh.receiveShadow = enableShadows
  addEdgeOverlay(mesh, instance.materialProfile)
  return mesh
}

function findPreset(
  presets: View3DCameraPreset[],
  activePresetId: View3DCameraPresetId | null,
): View3DCameraPreset | null {
  if (presets.length === 0) return null
  if (!activePresetId) return presets[0]
  return presets.find((preset) => preset.id === activePresetId) ?? presets[0]
}

export function View3DCanvas({
  floor,
  elements,
  className,
  style,
  mappingOptions,
  onRequestFallback2D,
}: View3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const applyPresetRef = useRef<((presetId: View3DCameraPresetId | null) => void) | null>(null)
  const activePresetIdRef = useRef<View3DCameraPresetId | null>('overview')
  const [activePresetId, setActivePresetId] = useState<View3DCameraPresetId | null>('overview')
  const [renderInitError, setRenderInitError] = useState<string | null>(null)

  const sceneData = useMemo(
    () => mapFloorToView3DScene(floor, elements, mappingOptions),
    [floor, elements, mappingOptions],
  )
  const cameraPresets = useMemo(() => getView3DCameraPresets(sceneData.bounds), [sceneData.bounds])
  const hasSceneObjects = sceneData.instances.length > 0

  useEffect(() => {
    if (cameraPresets.some((preset) => preset.id === activePresetId)) return
    setActivePresetId(cameraPresets[0]?.id ?? null)
  }, [activePresetId, cameraPresets])

  useEffect(() => {
    activePresetIdRef.current = activePresetId
    applyPresetRef.current?.(activePresetId)
  }, [activePresetId])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    setRenderInitError(null)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#eef3f8')
    scene.fog = new THREE.Fog('#eef3f8', sceneData.bounds.radius * 3, sceneData.bounds.radius * 7)

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 10000)
    cameraRef.current = camera

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    } catch {
      setRenderInitError('WebGL is unavailable in this browser context.')
      return () => {
        cameraRef.current = null
      }
    }

    rendererRef.current = renderer
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.03
    const enableShadows = sceneData.instances.length <= 1200
    renderer.shadowMap.enabled = enableShadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.screenSpacePanning = false
    controls.minDistance = Math.max(sceneData.bounds.radius * 0.15, 30)
    controls.maxDistance = Math.max(sceneData.bounds.radius * 8, 600)
    controls.maxPolarAngle = Math.PI / 2 - 0.03

    const applyPreset = (presetId: View3DCameraPresetId | null) => {
      const preset = findPreset(cameraPresets, presetId)
      if (!preset) return
      camera.position.set(preset.position[0], preset.position[1], preset.position[2])
      controls.target.set(preset.target[0], preset.target[1], preset.target[2])
      controls.update()
    }
    applyPresetRef.current = applyPreset

    const [spanX, spanZ] = [
      sceneData.bounds.maxX - sceneData.bounds.minX,
      sceneData.bounds.maxZ - sceneData.bounds.minZ,
    ]
    const span = Math.max(spanX, spanZ)

    scene.add(new THREE.HemisphereLight('#ffffff', '#d6dee9', 1.8))
    scene.add(new THREE.AmbientLight('#ffffff', 0.22))

    const keyLight = new THREE.DirectionalLight('#ffffff', 2.35)
    keyLight.position.set(sceneData.bounds.centerX - spanX * 0.5, 520, sceneData.bounds.centerZ + spanZ * 0.55)
    keyLight.castShadow = enableShadows
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.camera.near = 1
    keyLight.shadow.camera.far = Math.max(sceneData.bounds.radius * 6, 1200)
    const shadowReach = Math.max(sceneData.bounds.radius * 1.8, 350)
    keyLight.shadow.camera.left = -shadowReach
    keyLight.shadow.camera.right = shadowReach
    keyLight.shadow.camera.top = shadowReach
    keyLight.shadow.camera.bottom = -shadowReach
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight('#dbeafe', 0.55)
    fillLight.position.set(sceneData.bounds.centerX + spanX * 0.65, 220, sceneData.bounds.centerZ - spanZ * 0.45)
    scene.add(fillLight)

    const gridSize = Math.min(6000, Math.max(400, Math.ceil((span + 160) / 100) * 100))
    const gridDivisions = Math.max(8, Math.min(96, Math.floor(gridSize / 80)))

    const floorPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSize, gridSize),
      new THREE.MeshStandardMaterial({ color: '#e8edf3', roughness: 0.96, metalness: 0 }),
    )
    floorPlane.rotation.x = -Math.PI / 2
    floorPlane.position.set(sceneData.bounds.centerX, 0, sceneData.bounds.centerZ)
    floorPlane.receiveShadow = true
    scene.add(floorPlane)

    const grid = new THREE.GridHelper(gridSize, gridDivisions, '#94a3b8', '#d7dee8')
    grid.position.set(sceneData.bounds.centerX, 0.18, sceneData.bounds.centerZ)
    scene.add(grid)

    for (const instance of sceneData.instances) {
      scene.add(createMesh(instance, enableShadows))
    }

    const fitViewport = () => {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      renderer.setSize(width, height)

      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    fitViewport()
    applyPreset(activePresetIdRef.current)

    const resizeObserver = new ResizeObserver(() => {
      fitViewport()
    })
    resizeObserver.observe(container)

    let raf = 0
    const tick = () => {
      controls.update()
      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(tick)
    }
    tick()

    return () => {
      applyPresetRef.current = null
      controlsRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      window.cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      scene.traverse((object: THREE.Object3D) => {
        const renderable = object as THREE.Mesh | THREE.LineSegments
        if (!renderable.geometry || !('material' in renderable)) return
        renderable.geometry.dispose()
        const material = renderable.material
        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose())
        } else {
          material?.dispose()
        }
      })
      container.removeChild(renderer.domElement)
    }
  }, [cameraPresets, sceneData])

  return (
    <div className={`relative ${className ?? ''}`} style={{ width: '100%', height: '100%', ...style }}>
      <div ref={containerRef} className="h-full w-full" />
      {!renderInitError && (
        <div className="pointer-events-none absolute right-3 top-3 z-20 flex max-w-[min(26rem,calc(100%-1.5rem))] flex-col items-end gap-2">
          <div className="pointer-events-auto rounded-md border border-white/70 bg-slate-950/82 px-3 py-2 text-left text-white shadow-lg backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200">
              2.5D review mode
            </p>
            <p className="mt-1 text-xs text-slate-100">
              Inspect layout density, rooms, and circulation. Editing stays in 2D.
            </p>
          </div>
          {onRequestFallback2D && (
            <button
              type="button"
              onClick={onRequestFallback2D}
              className="pointer-events-auto rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-md ring-1 ring-slate-200 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Return to 2D
            </button>
          )}
        </div>
      )}
      {!renderInitError && cameraPresets.length > 0 && (
        <div className="pointer-events-none absolute left-3 top-3 z-20">
          <div className="pointer-events-auto rounded-lg border border-slate-200/80 bg-white/85 p-2 shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">Review presets</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cameraPresets.map((preset) => {
                const isActive = preset.id === activePresetId
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setActivePresetId(preset.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    aria-pressed={isActive}
                    title={preset.description}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
      {!renderInitError && !hasSceneObjects && (
        <div className="absolute inset-x-4 bottom-4 z-20 flex justify-center">
          <div className="max-w-md rounded-md border border-slate-200 bg-white/92 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
            <p className="text-sm font-semibold text-slate-900">Nothing to review in 2.5D yet</p>
            <p className="mt-1 text-xs text-slate-600">
              Add walls, rooms, desks, or furniture in 2D, then switch back here for a spatial review.
            </p>
          </div>
        </div>
      )}
      {renderInitError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/88 p-5 text-center">
          <div className="max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">2.5D renderer unavailable</p>
            <p className="mt-2 text-xs text-slate-600">{renderInitError}</p>
            {onRequestFallback2D && (
              <button
                type="button"
                onClick={onRequestFallback2D}
                className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
              >
                Back to 2D editor
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
