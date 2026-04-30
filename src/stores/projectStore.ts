import { create } from 'zustand'
import type { Project } from '../types/project'
import { DEFAULT_CANVAS_SETTINGS } from '../types/project'
import { generateSlug } from '../lib/slug'
import type { Role } from '../lib/permissions'

/**
 * Save-cycle state surfaced by `useOfficeSync` so the TopBar can show a
 * live indicator.
 */
export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Conflict signal raised by `useOfficeSync`.
 */
export type ProjectConflict = { payload: unknown } | null

interface ProjectState {
  currentProject: Project | null
  isDirty: boolean
  lastSavedAt: string | null
  saveState: SaveState
  officeId: string | null
  loadedVersion: string | null
  conflict: ProjectConflict
  currentOfficeRole: Role | null
  impersonatedRole: Role | null
  currentTeamId: string | null
  currentUserId: string | null

  setCurrentProject: (project: Project) => void
  updateProjectName: (name: string) => void
  setDirty: (dirty: boolean) => void
  setLastSavedAt: (at: string) => void
  setSaveState: (s: SaveState) => void
  setOfficeId: (id: string | null) => void
  setLoadedVersion: (v: string | null) => void
  setConflict: (c: ProjectConflict) => void
  setCurrentOfficeRole: (role: Role | null) => void
  setImpersonatedRole: (role: Role | null) => void
  setCurrentTeamId: (id: string | null) => void
  setCurrentUserId: (id: string | null) => void

  createNewProject: (name?: string) => Project
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  isDirty: false,
  lastSavedAt: null,
  saveState: 'idle',
  officeId: null,
  loadedVersion: null,
  conflict: null,
  currentOfficeRole: null,
  impersonatedRole: null,
  currentTeamId: null,
  currentUserId: null,

  setCurrentProject: (project) => set({ currentProject: project }),

  updateProjectName: (name) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, name }
        : null,
      isDirty: true,
    })),

  setDirty: (dirty) => set({ isDirty: dirty }),
  setLastSavedAt: (at) => set({ lastSavedAt: at, isDirty: false }),
  setSaveState: (s) => set({ saveState: s }),
  setOfficeId: (id) => set({ officeId: id }),
  setLoadedVersion: (v) => set({ loadedVersion: v }),
  setConflict: (c) => set({ conflict: c }),
  setCurrentOfficeRole: (role) => set({ currentOfficeRole: role }),
  setImpersonatedRole: (role) => set({ impersonatedRole: role }),
  setCurrentTeamId: (id) => set({ currentTeamId: id }),
  setCurrentUserId: (id) => set({ currentUserId: id }),

  createNewProject: (name) => {
    const defaultFloorId = crypto.randomUUID()
    const project: Project = {
      id: crypto.randomUUID(),
      ownerId: null,
      name: name || 'Untitled Office Plan',
      slug: generateSlug(),
      buildingName: null,
      floors: [{
        id: defaultFloorId,
        name: 'Floor 1',
        order: 0,
        elements: {},
      }],
      activeFloorId: defaultFloorId,
      canvasSettings: { ...DEFAULT_CANVAS_SETTINGS },
      thumbnailUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set({ currentProject: project, isDirty: false })
    return project
  },
}))
