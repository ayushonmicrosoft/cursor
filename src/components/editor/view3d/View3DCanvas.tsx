import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { CanvasElement } from '../../../types/elements'
import type { Floor } from '../../../types/floor'
import {
  mapFloorToView3DScene,
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

function createMesh(
  instance: ReturnType<typeof mapFloorToView3DScene>['instances'][number],
  enableShadows: boolean,
): THREE.Mesh {
  const [width, height, depth] = instance.size
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = new THREE.MeshStandardMaterial({
    color: instance.color,
    roughness: 0.75,
    metalness: 0.05,
    transparent: instance.kind === 'room',
    opacity: instance.kind === 'room' ? 0.5 : 1,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(instance.position[0], instance.position[1], instance.position[2])
  mesh.rotation.y = instance.rotationY
  mesh.castShadow = enableShadows && instance.kind !== 'room'
  mesh.receiveShadow = enableShadows
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
    scene.background = new THREE.Color('#f8fafc')

    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10000)
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
    const enableShadows = sceneData.instances.length <= 1200
    renderer.shadowMap.enabled = enableShadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controlsRef.current = controls
    controls.enableDamping = true
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

    const ambient = new THREE.AmbientLight('#ffffff', 0.65)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight('#ffffff', 0.8)
    keyLight.position.set(200, 400, 200)
    keyLight.castShadow = enableShadows
    scene.add(keyLight)

    const [spanX, spanZ] = [
      sceneData.bounds.maxX - sceneData.bounds.minX,
      sceneData.bounds.maxZ - sceneData.bounds.minZ,
    ]
    const span = Math.max(spanX, spanZ)
    const gridSize = Math.min(6000, Math.max(400, Math.ceil(span / 100) * 100))
    const gridDivisions = Math.max(8, Math.min(96, Math.floor(gridSize / 80)))

    const grid = new THREE.GridHelper(gridSize, gridDivisions, '#94a3b8', '#e2e8f0')
    grid.position.set(sceneData.bounds.centerX, 0.1, sceneData.bounds.centerZ)
    scene.add(grid)

    const floorPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSize, gridSize),
      new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 1, metalness: 0 }),
    )
    floorPlane.rotation.x = -Math.PI / 2
    floorPlane.position.set(sceneData.bounds.centerX, 0, sceneData.bounds.centerZ)
    floorPlane.receiveShadow = true
    scene.add(floorPlane)

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
        const mesh = object as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.geometry?.dispose()
        const material = mesh.material
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
