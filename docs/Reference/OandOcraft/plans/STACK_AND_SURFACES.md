# Stack and Surfaces

## Purpose
Define the product surfaces and the technical stack that powers them.

## Core questions this plan should answer
- What are the major user-facing surfaces?
- What routes are public, auth-gated, team-gated, and office-gated?
- What technologies power the planner?
- What is the authoritative client architecture?
- How should the stack be described to someone new to the repo?

## Product surfaces

### Public surfaces
- landing page
- auth pages
- docs page
- invite and recovery flows

### Team surfaces
- dashboard entry points
- team settings
- team onboarding
- account and membership views

### Office surfaces
- map editor
- roster manager
- reports and overlays
- org chart and operational surfaces

## Technical stack
- React and React Router for application structure and route control
- Konva / react-konva for canvas rendering and object interaction
- Zustand for client state
- zundo for undo/redo behavior
- Supabase for auth, persistence, access control, and sync
- Vite for local development and production builds
- TypeScript for type safety
- Vitest and ESLint for quality gates

## Architecture layers

### Routing layer
The route layer should be explained in terms of user flow and access control, not just a raw list of paths.

### Editor layer
The editor layer should explain the canvas stage, renderers, overlays, and interactions that make the product feel like an office-planning tool rather than a generic drawing app.

### State layer
The state layer should explain which store owns which behavior and why some state belongs in the undo tree while other data must stay separate.

### Persistence layer
The persistence layer should explain save/load behavior, conflict handling, and the relationship between local UI state and backend truth.

## Route and surface map

### Public
- `/`
- `/login`
- `/signup`
- `/forgot`
- `/auth/verify`
- `/auth/reset`
- `/invite/:token`
- `/help`
- `/docs`

### Authenticated and team-aware
- `/onboarding/team`
- `/account`
- `/dashboard`
- `/t/:teamSlug`
- `/t/:teamSlug/settings`

### Office editor shell
- `/t/:teamSlug/o/:officeSlug/engine`
- `/t/:teamSlug/o/:officeSlug/map`
- `/t/:teamSlug/o/:officeSlug/roster`
- `/t/:teamSlug/o/:officeSlug/reports`
- `/t/:teamSlug/o/:officeSlug/reports/scenarios`
- `/t/:teamSlug/o/:officeSlug/org-chart`

## Operational concerns

- preserve route-level behavior
- preserve permissions and guard behavior
- keep the editor isolated from host CSS
- keep the stack aligned with the current source truth

## Useful framing
This document should read like a map of the product's surfaces and the technology that supports them, not like a package list.
