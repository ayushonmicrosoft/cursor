import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { CanvasElement } from '../../../types/elements'
import type { Floor } from '../../../types/floor'
import {
  mapFloorToView3DScene,
  type View3DMappingOptions,
} from '../../../lib/view3d'

interface View3DCanvasProps {
  floor?: Floor | null
  elements?: Record<string, CanvasElement>
  className?: string
  style?: CSSProperties
  mappingOptions?: View3DMappingOptions
}

function createMesh(instance: ReturnType<typeof mapFloorToView3DScene>['instances'][number]): THREE.Mesh {
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
  mesh.castShadow = instance.kind !== 'room'
  mesh.receiveShadow = true
  return mesh
}

export function View3DCanvas({
  floor,
  elements,
  className,
  style,
  mappingOptions,
}: View3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const sceneData = useMemo(
    () => mapFloorToView3DScene(floor, elements, mappingOptions),
    [floor, elements, mappingOptions],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8fafc')

    const camera = new THREE.PerspectiveCamera(50, 1, 1, 10000)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(sceneData.bounds.centerX, 0, sceneData.bounds.centerZ)

    const ambient = new THREE.AmbientLight('#ffffff', 0.65)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight('#ffffff', 0.8)
    keyLight.position.set(200, 400, 200)
    keyLight.castShadow = true
    scene.add(keyLight)

    const [spanX, spanZ] = [
      sceneData.bounds.maxX - sceneData.bounds.minX,
      sceneData.bounds.maxZ - sceneData.bounds.minZ,
    ]
    const gridSize = Math.max(500, Math.ceil(Math.max(spanX, spanZ) / 50) * 50)

    const grid = new THREE.GridHelper(gridSize, Math.max(10, Math.floor(gridSize / 20)), '#94a3b8', '#e2e8f0')
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
      scene.add(createMesh(instance))
    }

    const fitCamera = () => {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      renderer.setSize(width, height)

      camera.aspect = width / height
      const distance = sceneData.bounds.radius * 2.8
      camera.position.set(
        sceneData.bounds.centerX + distance,
        Math.max(distance * 0.8, 180),
        sceneData.bounds.centerZ + distance,
      )
      camera.updateProjectionMatrix()
      controls.update()
    }

    fitCamera()

    const resizeObserver = new ResizeObserver(() => {
      fitCamera()
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
  }, [sceneData])

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', ...style }} />
}
