# OandOcraft Technical Reference

## Current Engine Snapshot
| Engine | Current State | Notes |
|---|---|---|
| PixiJS (`PixiStage`) | Primary planner engine | Primary 2D planner path via `viewMode = pixi` |
| Konva (`react-konva`) | Secondary planner engine | Second planner path retained via `viewMode = 2d` |
| 2.5D engine (`view3d`, three-based) | Shared review mode | Used with both planner paths via `viewMode = 2.5d` |

## Planner Runtime Model
- The website contains two planner engines:
  - Pixi planner (primary)
  - Konva planner (secondary)
- 2.5D review mode is a shared layer and must work with both planners.
- Engine switching must preserve selection, viewport, and floor context.

## Current Routing Snapshot
| Route Group | Key Paths |
|---|---|
| Public | `/`, `/login`, `/signup`, `/forgot`, `/auth/verify`, `/auth/reset`, `/invite/:token`, `/help`, `/docs` |
| Team | `/dashboard`, `/t/:teamSlug`, `/t/:teamSlug/settings` |
| Office | `/t/:teamSlug/o/:officeSlug/engine`, `/map`, `/roster`, `/reports`, `/reports/scenarios`, `/org-chart` |

## System Topology
| Layer | Primary Modules | Responsibilities | Status |
|---|---|---|---|
| Routing | `src/App.tsx` | Public/auth/team/editor route graph with guards | Stable |
| Editor Surface | `ProjectShell`, `MapView`, `RightSidebar` | Canvas workflow, toolbars, panels, overlays | Active tuning |
| State | Zustand stores | Elements, UI, floors, people, insights, project sync | Stable |
| Data | `officeRepository` + Supabase | CRUD, optimistic save, conflict handling, RBAC | Stable |
| Quality | Vitest + ESLint + Vite build | Regression prevention and release gating | Continuous |

## Critical Routes
| Route | Purpose | Guard |
|---|---|---|
| `/` | Landing and session-aware entry points | Public |
| `/dashboard` | Auth team redirect and workspace start | Auth + Team |
| `/t/:teamSlug` | Office listing and workspace summary | Auth + Team |
| `/t/:teamSlug/o/:officeSlug/map` | Primary planning editor | Auth + Team |
| `/t/:teamSlug/o/:officeSlug/roster` | People assignment and roster ops | Auth + Team |
