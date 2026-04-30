import { useEffect, useMemo } from 'react'
import { Canvas as ThreeCanvas, useThree } from '@react-three/fiber'
import { OrbitControls, Box, Plane, Edges } from '@react-three/drei'
import type { CanvasElement } from '../../types/elements'
import { useFloorStore } from '../../stores/floorStore'
import { useUIStore } from '../../stores/uiStore'

function Element3D({ element }: { element: CanvasElement }) {
  const { x, y, width, height, rotation, style, type } = element
  
  const h = type === 'wall' || type === 'divider' ? 30 : 
            type === 'desk' || type === 'hot-desk' ? 12 : 
            type === 'custom-shape' ? 10 : 8
  const lift = h / 2

  // Center points since Konva x,y are mostly top-left but threejs Box centers
  const cx = x + width / 2
  const cy = y + height / 2

  return (
    <group position={[cx, lift, cy]} rotation={[0, -rotation * (Math.PI / 180), 0]}>
      <Box args={[width, h, height]}>
        <meshStandardMaterial color={style?.fill || '#dddddd'} opacity={style?.opacity ?? 1} transparent={style?.opacity !== undefined && style.opacity < 1} />
        <Edges scale={1} color={style?.stroke || '#888888'} />
      </Box>
    </group>
  )
}

function Scene() {
  const activeFloorId = useFloorStore((s) => s.activeFloorId)
  const floorConfig = useFloorStore((s) => s.floors.find(f => f.id === activeFloorId))
  const elements = useMemo(() => floorConfig ? Object.values(floorConfig.elements) : [], [floorConfig])
  
  const { camera } = useThree()
  
  useEffect(() => {
    camera.position.set(0, 500, 500)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <>
      <OrbitControls makeDefault />
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 200, 100]} intensity={1} castShadow />

      <group position={[-500, 0, -500]}>
        <Plane args={[10000, 10000]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <meshStandardMaterial color="#f0f0f0" />
        </Plane>
        
        {elements.map((el) => (
          <Element3D key={el.id} element={el} />
        ))}
      </group>
    </>
  )
}

export function ThreeDView() {
  const setThreeDMode = useUIStore(s => s.setThreeDMode)

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-gray-50 flex flex-col">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setThreeDMode(false)}
          className="px-4 py-2 bg-gray-900 text-white rounded-md shadow-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Exit 3D View
        </button>
      </div>

      <div className="flex-1 w-full h-full">
        <ThreeCanvas shadows camera={{ position: [0, 800, 800], fov: 50 }}>
          <Scene />
        </ThreeCanvas>
      </div>
    </div>
  )
}
