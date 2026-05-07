import { Group, Line, Rect, Text } from 'react-konva'
import type { ConferenceRoomElement, PhoneBoothElement, CommonAreaElement } from '../../../types/elements'
import { isConferenceRoomElement, isCommonAreaElement } from '../../../types/elements'
import { useUIStore } from '../../../stores/uiStore'
import { truncateToWidth } from '../../../lib/textTruncate'
import { useCanvasStore } from '../../../stores/canvasStore'
import {
  CANVAS_COLORS,
  interactionStrokeWidth,
  labelDensityForScale,
} from './visualStyle'

type RoomElement = ConferenceRoomElement | PhoneBoothElement | CommonAreaElement
const SHARP_CORNER = 1
const ROOM_NAME_FONT_SIZE = 13
const ROOM_META_FONT_SIZE = 10

interface RoomRendererProps {
  element: RoomElement
}

export function RoomRenderer({ element }: RoomRendererProps) {
  const selectedIds = useUIStore((s) => s.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const stageScale = useCanvasStore((s) => s.stageScale)
  const labelDensity = labelDensityForScale(stageScale, isSelected)

  if (isConferenceRoomElement(element)) {
    return <ConferenceRoomRenderer element={element} isSelected={isSelected} labelDensity={labelDensity} />
  }

  if (isCommonAreaElement(element)) {
    return <CommonAreaRenderer element={element} isSelected={isSelected} labelDensity={labelDensity} />
  }

  return <PhoneBoothRenderer element={element as PhoneBoothElement} isSelected={isSelected} labelDensity={labelDensity} />
}

// --- Conference Room ---

interface ConferenceRoomRendererProps {
  element: ConferenceRoomElement
  isSelected: boolean
  labelDensity: ReturnType<typeof labelDensityForScale>
}

function ConferenceRoomRenderer({ element, isSelected, labelDensity }: ConferenceRoomRendererProps) {
  const stroke = isSelected ? CANVAS_COLORS.selected : CANVAS_COLORS.conferenceStroke
  const innerW = Math.max(48, element.width * 0.52)
  const innerH = Math.max(24, element.height * 0.28)
  const roomNameWidth = Math.max(24, element.width - 8)
  const roomNameText = truncateToWidth(element.roomName, roomNameWidth, ROOM_NAME_FONT_SIZE)
  const capacityText = truncateToWidth(`${element.capacity} seats`, roomNameWidth, ROOM_META_FONT_SIZE)
  const showName = labelDensity !== 'hidden'
  const showMeta = labelDensity === 'full'
  return (
    <Group rotation={element.rotation} listening={true}>
      <Rect
        x={-element.width / 2}
        y={-element.height / 2}
        width={element.width}
        height={element.height}
        fill={CANVAS_COLORS.conferenceFill}
        stroke={stroke}
        strokeWidth={interactionStrokeWidth(isSelected)}
        strokeScaleEnabled={false}
        cornerRadius={SHARP_CORNER}
        opacity={element.style.opacity}
        shadowColor="#0F172A"
        shadowBlur={4}
        shadowOpacity={0.08}
        shadowOffset={{ x: 0, y: 1 }}
      />
      {labelDensity !== 'hidden' && (
        <Rect
          x={-innerW / 2}
          y={-innerH / 2}
          width={innerW}
          height={innerH}
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={1}
          strokeScaleEnabled={false}
          cornerRadius={SHARP_CORNER}
          opacity={element.style.opacity * 0.82}
          listening={false}
        />
      )}

      {/* Room name */}
      {showName && (
        <Text
          text={labelDensity === 'compact' ? `${element.capacity}` : roomNameText}
          x={-element.width / 2 + 4}
          y={labelDensity === 'compact' ? -6 : -element.height / 2 + 8}
          width={roomNameWidth}
          align="center"
          fontSize={labelDensity === 'compact' ? 12 : ROOM_NAME_FONT_SIZE}
          fontStyle="bold"
          fill="#92400E"
          listening={false}
        />
      )}

      {/* Capacity */}
      {showMeta && (
        <Text
          text={capacityText}
          x={-element.width / 2 + 4}
          y={element.height / 2 - 20}
          width={roomNameWidth}
          align="center"
          fontSize={ROOM_META_FONT_SIZE}
          fill="#B45309"
          listening={false}
        />
      )}

      {element.locked && <LockedRoomCorner width={element.width} height={element.height} />}
    </Group>
  )
}

// --- Phone Booth ---

interface PhoneBoothRendererProps {
  element: PhoneBoothElement
  isSelected: boolean
  labelDensity: ReturnType<typeof labelDensityForScale>
}

function PhoneBoothRenderer({ element, isSelected, labelDensity }: PhoneBoothRendererProps) {
  const stroke = isSelected ? CANVAS_COLORS.selected : CANVAS_COLORS.roomStroke
  const handsetX = -element.width * 0.08
  return (
    <Group rotation={element.rotation} listening={true}>
      <Rect
        x={-element.width / 2}
        y={-element.height / 2}
        width={element.width}
        height={element.height}
        fill={CANVAS_COLORS.roomFill}
        stroke={stroke}
        strokeWidth={interactionStrokeWidth(isSelected)}
        strokeScaleEnabled={false}
        cornerRadius={SHARP_CORNER}
        opacity={element.style.opacity}
        shadowColor="#0F172A"
        shadowBlur={3}
        shadowOpacity={0.08}
        shadowOffset={{ x: 0, y: 1 }}
      />
      <Rect
        x={-element.width * 0.18}
        y={-element.height * 0.24}
        width={element.width * 0.36}
        height={element.height * 0.48}
        fill="#FFFFFF"
        stroke={stroke}
        strokeWidth={1}
        strokeScaleEnabled={false}
        cornerRadius={SHARP_CORNER}
        opacity={element.style.opacity * 0.85}
        listening={false}
      />
      <Text
        text=")"
        x={handsetX - 3}
        y={-element.height * 0.18}
        width={16}
        fontSize={Math.max(14, element.height * 0.34)}
        fontStyle="bold"
        fill={stroke}
        listening={false}
      />

      {labelDensity === 'full' && (
        <Text
          text="Booth"
          x={-element.width / 2 + 2}
          y={element.height / 2 - 16}
          width={element.width - 4}
          align="center"
          fontSize={9}
          fill="#166534"
          listening={false}
        />
      )}

      {element.locked && <LockedRoomCorner width={element.width} height={element.height} />}
    </Group>
  )
}

// --- Common Area ---

interface CommonAreaRendererProps {
  element: CommonAreaElement
  isSelected: boolean
  labelDensity: ReturnType<typeof labelDensityForScale>
}

function CommonAreaRenderer({ element, isSelected, labelDensity }: CommonAreaRendererProps) {
  const stroke = isSelected ? CANVAS_COLORS.selected : CANVAS_COLORS.roomStroke
  const areaNameWidth = Math.max(24, element.width - 8)
  const areaNameText = truncateToWidth(element.areaName, areaNameWidth, ROOM_NAME_FONT_SIZE)
  return (
    <Group rotation={element.rotation} listening={true}>
      <Rect
        x={-element.width / 2}
        y={-element.height / 2}
        width={element.width}
        height={element.height}
        fill={CANVAS_COLORS.roomFill}
        stroke={stroke}
        strokeWidth={interactionStrokeWidth(isSelected)}
        cornerRadius={SHARP_CORNER}
        opacity={element.style.opacity}
        shadowColor="#0F172A"
        shadowBlur={4}
        shadowOpacity={0.07}
        shadowOffset={{ x: 0, y: 1 }}
      />
      {labelDensity !== 'hidden' && (
        <Rect
          x={-element.width * 0.32}
          y={-element.height * 0.06}
          width={element.width * 0.64}
          height={element.height * 0.22}
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={1}
          cornerRadius={SHARP_CORNER}
          opacity={element.style.opacity * 0.78}
          listening={false}
        />
      )}
      <Rect
        x={-element.width * 0.26}
        y={element.height * 0.22}
        width={element.width * 0.52}
        height={Math.max(4, element.height * 0.05)}
        fill={stroke}
        opacity={element.style.opacity * 0.28}
        cornerRadius={1}
        listening={false}
      />

      {labelDensity !== 'hidden' && (
        <Text
          text={labelDensity === 'compact' ? 'Area' : areaNameText}
          x={-element.width / 2 + 4}
          y={labelDensity === 'compact' ? -6 : -element.height / 2 + 10}
          width={areaNameWidth}
          align="center"
          fontSize={labelDensity === 'compact' ? 11 : ROOM_NAME_FONT_SIZE}
          fontStyle="bold"
          fill="#166534"
          listening={false}
        />
      )}

      {element.locked && <LockedRoomCorner width={element.width} height={element.height} />}
    </Group>
  )
}

function LockedRoomCorner({ width, height }: { width: number; height: number }) {
  const size = Math.min(18, Math.max(10, Math.min(width, height) * 0.22))
  const x = width / 2 - size - 2
  const y = -height / 2 + 2
  return (
    <Group listening={false}>
      <Rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill={CANVAS_COLORS.lockedFill}
        stroke={CANVAS_COLORS.locked}
        strokeWidth={0.8}
        cornerRadius={SHARP_CORNER}
      />
      <Line
        points={[x + 3, y + size - 3, x + size - 3, y + 3]}
        stroke={CANVAS_COLORS.locked}
        strokeWidth={1}
        listening={false}
      />
    </Group>
  )
}

