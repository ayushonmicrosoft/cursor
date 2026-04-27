import { Group, Rect, Text } from 'react-konva'
import type { ConferenceRoomElement, PhoneBoothElement, CommonAreaElement } from '../../../types/elements'
import { isConferenceRoomElement, isCommonAreaElement } from '../../../types/elements'
import { useUIStore } from '../../../stores/uiStore'
import { RoomBookingBadge } from './RoomBookingBadge'
import { truncateToWidth } from '../../../lib/textTruncate'

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

  if (isConferenceRoomElement(element)) {
    return <ConferenceRoomRenderer element={element} isSelected={isSelected} />
  }

  if (isCommonAreaElement(element)) {
    return <CommonAreaRenderer element={element} isSelected={isSelected} />
  }

  return <PhoneBoothRenderer element={element as PhoneBoothElement} isSelected={isSelected} />
}

// --- Conference Room ---

interface ConferenceRoomRendererProps {
  element: ConferenceRoomElement
  isSelected: boolean
}

function ConferenceRoomRenderer({ element, isSelected }: ConferenceRoomRendererProps) {
  const stroke = isSelected ? '#2563EB' : '#D97706'
  const innerW = Math.max(48, element.width * 0.52)
  const innerH = Math.max(24, element.height * 0.28)
  const roomNameWidth = Math.max(24, element.width - 8)
  const roomNameText = truncateToWidth(element.roomName, roomNameWidth, ROOM_NAME_FONT_SIZE)
  const capacityText = truncateToWidth(`${element.capacity} seats`, roomNameWidth, ROOM_META_FONT_SIZE)
  return (
    <Group rotation={element.rotation} listening={!element.locked}>
      <Rect
        x={-element.width / 2}
        y={-element.height / 2}
        width={element.width}
        height={element.height}
        fill="#FFF7ED"
        stroke={stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
        cornerRadius={SHARP_CORNER}
        opacity={element.style.opacity}
      />
      <Rect
        x={-innerW / 2}
        y={-innerH / 2}
        width={innerW}
        height={innerH}
        fill="#FFFFFF"
        stroke={stroke}
        strokeWidth={1}
        cornerRadius={SHARP_CORNER}
        opacity={element.style.opacity * 0.82}
        listening={false}
      />

      {/* Room name */}
      <Text
        text={roomNameText}
        x={-element.width / 2 + 4}
        y={-element.height / 2 + 8}
        width={roomNameWidth}
        align="center"
        fontSize={ROOM_NAME_FONT_SIZE}
        fontStyle="bold"
        fill="#92400E"
        listening={false}
      />

      {/* Capacity */}
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

      <RoomBookingBadge elementId={element.id} width={element.width} height={element.height} />
    </Group>
  )
}

// --- Phone Booth ---

interface PhoneBoothRendererProps {
  element: PhoneBoothElement
  isSelected: boolean
}

function PhoneBoothRenderer({ element, isSelected }: PhoneBoothRendererProps) {
  const stroke = isSelected ? '#2563EB' : '#15803D'
  const handsetX = -element.width * 0.08
  return (
    <Group rotation={element.rotation} listening={!element.locked}>
      <Rect
        x={-element.width / 2}
        y={-element.height / 2}
        width={element.width}
        height={element.height}
        fill="#F0FDF4"
        stroke={stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
        cornerRadius={SHARP_CORNER}
        opacity={element.style.opacity}
      />
      <Rect
        x={-element.width * 0.18}
        y={-element.height * 0.24}
        width={element.width * 0.36}
        height={element.height * 0.48}
        fill="#FFFFFF"
        stroke={stroke}
        strokeWidth={1}
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

      <RoomBookingBadge elementId={element.id} width={element.width} height={element.height} />
    </Group>
  )
}

// --- Common Area ---

interface CommonAreaRendererProps {
  element: CommonAreaElement
  isSelected: boolean
}

function CommonAreaRenderer({ element, isSelected }: CommonAreaRendererProps) {
  const stroke = isSelected ? '#2563EB' : '#15803D'
  const areaNameWidth = Math.max(24, element.width - 8)
  const areaNameText = truncateToWidth(element.areaName, areaNameWidth, ROOM_NAME_FONT_SIZE)
  return (
    <Group rotation={element.rotation} listening={!element.locked}>
      <Rect
        x={-element.width / 2}
        y={-element.height / 2}
        width={element.width}
        height={element.height}
        fill="#ECFDF5"
        stroke={stroke}
        strokeWidth={isSelected ? 2.5 : 1.5}
        cornerRadius={SHARP_CORNER}
        opacity={element.style.opacity}
      />
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

      <Text
        text={areaNameText}
        x={-element.width / 2 + 4}
        y={-element.height / 2 + 10}
        width={areaNameWidth}
        align="center"
        fontSize={ROOM_NAME_FONT_SIZE}
        fontStyle="bold"
        fill="#166534"
        listening={false}
      />

      <RoomBookingBadge elementId={element.id} width={element.width} height={element.height} />
    </Group>
  )
}
