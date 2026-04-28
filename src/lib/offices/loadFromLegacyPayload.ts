import { useElementsStore } from '../../stores/elementsStore'
import { useEmployeeStore } from '../../stores/employeeStore'
import { useProjectStore } from '../../stores/projectStore'
import { useCanvasStore } from '../../stores/canvasStore'
import { useFloorStore } from '../../stores/floorStore'
import {
  isEmployeeStatus,
  isAccommodationType,
  LEAVE_TYPES,
  type Accommodation,
  type LeaveType,
  type PendingStatusChange,
} from '../../types/employee'
import { WALL_TYPES, type WallType } from '../../types/elements'
import type { Annotation, AnnotationAnchor } from '../../types/annotations'
import { ANNOTATION_BODY_MAX } from '../../types/annotations'

const SAVE_KEY = 'floocraft-autosave'

type AutoSavePayload = {
  project: ReturnType<typeof useProjectStore.getState>['currentProject']
  elements: ReturnType<typeof useElementsStore.getState>['elements']
  employees: ReturnType<typeof useEmployeeStore.getState>['employees']
  departmentColors: ReturnType<typeof useEmployeeStore.getState>['departmentColors']
  floors: ReturnType<typeof useFloorStore.getState>['floors']
  activeFloorId: ReturnType<typeof useFloorStore.getState>['activeFloorId']
  settings: ReturnType<typeof useCanvasStore.getState>['settings']
}

function migrateEquipment(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const entry of raw) {
    if (typeof entry !== 'string') continue
    const trimmed = entry.trim()
    if (trimmed.length === 0) continue
    out.push(trimmed)
  }
  return out
}

const EQUIPPABLE_TYPES = new Set([
  'desk',
  'hot-desk',
  'workstation',
  'private-office',
])

function migrateWorkstationAssignedEmployeeIds(
  raw: unknown,
  positions: number,
): Array<string | null> {
  const safeLen = Math.max(0, Math.floor(positions))
  if (!Array.isArray(raw)) {
    return Array.from({ length: safeLen }, () => null)
  }
  const out: Array<string | null> = []
  for (let i = 0; i < safeLen; i++) {
    const entry = raw[i]
    if (typeof entry === 'string' && entry.length > 0) {
      out.push(entry)
    } else {
      out.push(null)
    }
  }
  return out
}

export function migrateElements(
  elements: Record<string, unknown>,
): ReturnType<typeof useElementsStore.getState>['elements'] {
  const out: Record<string, unknown> = {}
  for (const [id, raw] of Object.entries(elements ?? {})) {
    if (!raw || typeof raw !== 'object') continue
    const el = raw as Record<string, unknown>
    if (el.type === 'wall' && Array.isArray(el.points)) {
      const expectedBulges = Math.max(0, el.points.length / 2 - 1)
      const currentBulges = Array.isArray(el.bulges) ? el.bulges : []
      const bulges: number[] = []
      for (let i = 0; i < expectedBulges; i++) {
        const b = currentBulges[i]
        bulges.push(typeof b === 'number' && Number.isFinite(b) ? b : 0)
      }
      const wallType: WallType =
        typeof el.wallType === 'string' &&
        (WALL_TYPES as readonly string[]).includes(el.wallType)
          ? (el.wallType as WallType)
          : 'solid'
      out[id] = {
        ...el,
        bulges,
        connectedWallIds: Array.isArray(el.connectedWallIds)
          ? el.connectedWallIds
          : [],
        wallType,
      }
    } else if (typeof el.type === 'string' && EQUIPPABLE_TYPES.has(el.type)) {
      const migrated: Record<string, unknown> = {
        ...el,
        equipment: migrateEquipment(el.equipment),
      }
      if (el.type === 'workstation') {
        const positions =
          typeof el.positions === 'number' && Number.isFinite(el.positions)
            ? el.positions
            : 0
        migrated.assignedEmployeeIds = migrateWorkstationAssignedEmployeeIds(
          el.assignedEmployeeIds,
          positions,
        )
      }
      out[id] = migrated
    } else {
      out[id] = el
    }
  }
  return out as ReturnType<typeof useElementsStore.getState>['elements']
}

function isLeaveType(v: unknown): v is LeaveType {
  return typeof v === 'string' && (LEAVE_TYPES as readonly string[]).includes(v)
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0
}

function isIsoDate(v: unknown): v is string {
  if (typeof v !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const t = Date.parse(v)
  return !Number.isNaN(t)
}

function migratePendingStatusChanges(
  raw: unknown,
  employeeId: string,
): PendingStatusChange[] {
  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw)) {
    return []
  }
  const out: PendingStatusChange[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (!isNonEmptyString(e.id)) continue
    if (!isIsoDate(e.effectiveDate)) continue
    if (!isEmployeeStatus(e.status)) continue
    out.push({
      id: e.id,
      status: e.status,
      effectiveDate: e.effectiveDate,
      note: isNonEmptyString(e.note) ? e.note : null,
      createdAt: isNonEmptyString(e.createdAt) ? e.createdAt : new Date(0).toISOString(),
    })
  }
  out.sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
  return out
}

function coerceAccommodation(raw: unknown): Accommodation | null {
  if (!raw || typeof raw !== 'object') return null
  const a = raw as Record<string, unknown>
  if (!isNonEmptyString(a.id)) return null
  if (!isAccommodationType(a.type)) return null
  return {
    id: a.id,
    type: a.type,
    notes: isNonEmptyString(a.notes) ? a.notes : null,
    createdAt: isNonEmptyString(a.createdAt) ? a.createdAt : new Date(0).toISOString(),
  }
}

function migrateAccommodations(raw: unknown): Accommodation[] {
  if (!Array.isArray(raw)) return []
  const out: Accommodation[] = []
  for (const entry of raw) {
    const coerced = coerceAccommodation(entry)
    if (coerced) out.push(coerced)
  }
  return out
}

function migrateSensitivityTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const entry of raw) {
    if (isNonEmptyString(entry)) out.push(entry)
  }
  return out
}

export function migrateEmployees(
  employees: Record<string, unknown>,
): ReturnType<typeof useEmployeeStore.getState>['employees'] {
  const out: Record<string, unknown> = {}
  for (const [id, raw] of Object.entries(employees ?? {})) {
    if (!raw || typeof raw !== 'object') continue
    const e = raw as Record<string, unknown>
    out[id] = {
      ...e,
      status: isEmployeeStatus(e.status) ? e.status : 'active',
      leaveType: isLeaveType(e.leaveType) ? e.leaveType : null,
      expectedReturnDate: isNonEmptyString(e.expectedReturnDate)
        ? e.expectedReturnDate
        : null,
      coverageEmployeeId: isNonEmptyString(e.coverageEmployeeId)
        ? e.coverageEmployeeId
        : null,
      leaveNotes: isNonEmptyString(e.leaveNotes) ? e.leaveNotes : null,
      departureDate: isNonEmptyString(e.departureDate) ? e.departureDate : null,
      accommodations: migrateAccommodations(e.accommodations),
      sensitivityTags: migrateSensitivityTags(e.sensitivityTags),
      pendingStatusChanges: migratePendingStatusChanges(
        e.pendingStatusChanges,
        id,
      ),
    }
  }
  return out as ReturnType<typeof useEmployeeStore.getState>['employees']
}

export function migrateAnnotations(
  raw: unknown,
): Record<string, Annotation> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, Annotation> = {}
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue
    const a = value as Record<string, unknown>
    if (!isNonEmptyString(a.id)) continue
    if (typeof a.body !== 'string') continue
    const rawAnchor = a.anchor as Record<string, unknown> | null | undefined
    if (!rawAnchor || typeof rawAnchor !== 'object') continue
    
    let anchor: AnnotationAnchor | null = null
    if (rawAnchor.type === 'element' && isNonEmptyString(rawAnchor.elementId)) {
      anchor = { type: 'element', elementId: rawAnchor.elementId }
    } else if (
      rawAnchor.type === 'floor-position' &&
      isNonEmptyString(rawAnchor.floorId) &&
      typeof rawAnchor.x === 'number' &&
      typeof rawAnchor.y === 'number' &&
      Number.isFinite(rawAnchor.x) &&
      Number.isFinite(rawAnchor.y)
    ) {
      anchor = {
        type: 'floor-position',
        floorId: rawAnchor.floorId,
        x: rawAnchor.x,
        y: rawAnchor.y,
      }
    }
    if (!anchor) continue
    
    const body = a.body.slice(0, ANNOTATION_BODY_MAX)
    out[id] = {
      id: a.id,
      body,
      authorName: isNonEmptyString(a.authorName) ? a.authorName : 'Unknown',
      createdAt: isNonEmptyString(a.createdAt)
        ? a.createdAt
        : new Date(0).toISOString(),
      resolvedAt: isNonEmptyString(a.resolvedAt) ? a.resolvedAt : null,
      anchor,
    }
  }
  return out
}

function isValidPayload(value: unknown): value is Partial<AutoSavePayload> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const v = value as Record<string, unknown>
  if (v.elements && typeof v.elements !== 'object') return false
  if (v.employees && typeof v.employees !== 'object') return false
  if (v.floors && !Array.isArray(v.floors)) return false
  return true
}

function ensureRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

export function loadAutoSave(): AutoSavePayload | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isValidPayload(parsed)) return null
  const payload = parsed as AutoSavePayload
  const rawObj = parsed as Record<string, unknown>
  if (rawObj.elements !== undefined) {
    payload.elements = migrateElements(ensureRecord(rawObj.elements))
  }
  if (rawObj.employees !== undefined) {
    payload.employees = migrateEmployees(ensureRecord(rawObj.employees))
  }
  return payload
}
