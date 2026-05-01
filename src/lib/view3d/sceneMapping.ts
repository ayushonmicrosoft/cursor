import type { CanvasElement } from '../../types/elements'
import type { Floor } from '../../types/floor'
import {
  getTwoPointFiveCameraPresets,
  mapFloorToProjectedScene,
  type View3DBoxInstance,
  type View3DCameraBounds,
  type View3DCameraPreset,
  type View3DCameraPresetId,
  type View3DMappingOptions,
  type View3DSceneData,
} from '../twopointfive/projector'
import type { View3DMaterialProfile } from '../twopointfive/materials'

export type {
  View3DBoxInstance,
  View3DCameraBounds,
  View3DCameraPreset,
  View3DCameraPresetId,
  View3DMappingOptions,
  View3DMaterialProfile,
  View3DSceneData,
}

export function getView3DCameraPresets(bounds: View3DCameraBounds): View3DCameraPreset[] {
  return getTwoPointFiveCameraPresets(bounds)
}

export function mapFloorToView3DScene(
  floor: Floor | null | undefined,
  elementsOverride?: Record<string, CanvasElement>,
  inputOptions: View3DMappingOptions = {},
): View3DSceneData {
  return mapFloorToProjectedScene(floor, elementsOverride, inputOptions)
}
