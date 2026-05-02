import { Group, Rect, Text } from 'react-konva'
import type { BaseElement } from '../../../types/elements'
import { useUIStore } from '../../../stores/uiStore'
import { truncateToWidth } from '../../../lib/textTruncate'
import { useCanvasStore } from '../../../stores/canvasStore'
import { CANVAS_COLORS, interactionStrokeWidth, labelDensityForScale } from './visualStyle'
import { SilhouetteRenderer } from './SilhouetteRenderer'

interface FurnitureRendererProps {
  element: BaseElement
}

const SHARP_CORNER = 1
const SELECTED_STROKE = CANVAS_COLORS.selected
const LABEL_FONT_SIZE = 9

export function FurnitureRenderer({ element }: FurnitureRendererProps) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const stageScale = useCanvasStore((s) => s.stageScale)
  const labelDensity = labelDensityForScale(stageScale, isSelected)
  const stroke = isSelected
    ? SELECTED_STROKE
    : element.locked
      ? CANVAS_COLORS.locked
      : CANVAS_COLORS.furnitureStroke
  const strokeWidth = interactionStrokeWidth(isSelected)
  const opacity = element.style.opacity
  const labelWidth = Math.max(20, element.width - 8)
  const labelText = truncateToWidth(element.label ?? '', labelWidth, LABEL_FONT_SIZE)

  // Try to render with silhouette first
  const silhouette = (
    <SilhouetteRenderer
      type={element.type}
      width={element.width}
      height={element.height}
      fill={element.style.fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
    />
  )

  return (
    <Group rotation={element.rotation} listening={true}>
      {silhouette || (
        <Rect
          x={-element.width / 2}
          y={-element.height / 2}
          width={element.width}
          height={element.height}
          fill={element.style.fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          cornerRadius={SHARP_CORNER}
          opacity={opacity}
        />
      )}
      {labelDensity === 'full' && element.width >= 48 && element.height >= 24 && element.label && (
        <Text
          text={labelText}
          x={-element.width / 2 + 4}
          y={element.height / 2 + 3}
          width={labelWidth}
          align="center"
          fontSize={LABEL_FONT_SIZE}
          fontStyle="bold"
          fill="#475569"
          listening={false}
        />
      )}
      {element.locked && (
        <LockedFurnitureMark width={element.width} height={element.height} />
      )}
    </Group>
  )
}

function LockedFurnitureMark({ width, height }: { width: number; height: number }) {
  const size = Math.min(16, Math.max(9, Math.min(width, height) * 0.24))
  return (
    <Rect
      x={width / 2 - size - 1}
      y={-height / 2 + 1}
      width={size}
      height={size}
      fill={CANVAS_COLORS.lockedFill}
      stroke={CANVAS_COLORS.locked}
      strokeWidth={0.8}
      dash={[2, 2]}
      cornerRadius={1}
      listening={false}
    />
  )
}