# Konva-Pixi Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate Konva and Pixi into independent engine + toolbar stacks while sharing one core scene contract and one 2.5D pipeline.

**Architecture:** `src/lib/core` owns renderer-agnostic scene + intents. `src/lib/konva` and `src/lib/pixi` own engine internals. `src/components/editor/konva` and `src/components/editor/pixi` own engine-specific toolbars/UI. `src/lib/twopointfive` is the only 2.5D mapping/projection source used by both engines.

**Tech Stack:** React, Zustand, TypeScript, Konva, PixiJS, Three.js-based 2.5D review.

---

## Target Boundaries

- Shared core:
  - `src/lib/core/types.ts`
  - `src/lib/core/rendererContract.ts`
  - `src/lib/core/sceneMapper.ts`
  - `src/lib/core/engineIntents.ts`
- Engine internals:
  - `src/lib/konva/*`
  - `src/lib/pixi/*`
- Shared 2.5D:
  - `src/lib/twopointfive/*`
- Engine UI/toolbars:
  - `src/components/editor/konva/*`
  - `src/components/editor/pixi/*`
- Orchestration only:
  - `src/components/editor/EngineHost.tsx`
  - route-level pages mount engine-specific hosts; no renderer internals in orchestration.

---

## Execution Order

### Task 0: Ownership & Contracts (must-do first)

**Files:**
- Create: `src/lib/core/engineIntents.ts`
- Create: `src/lib/core/rendererContract.ts`
- Modify: `src/lib/core/types.ts`
- Test: `src/lib/core/__tests__/engineContract.test.ts`

- [ ] Define typed `EngineIntent` and `EngineEvent` (select, pan, zoom, drag, marquee, context-menu, key-command).
- [ ] Define adapter lifecycle contract: `init`, `ready`, `render`, `resize`, `error`, `dispose`.
- [ ] Define ownership of side effects: adapters emit intents only; stores/commands handle mutations.
- [ ] Add contract tests for lifecycle ordering and intent payload invariants.

### Task 1: Host seam and runtime switch

**Files:**
- Create: `src/components/editor/EngineHost.tsx`
- Modify: `src/stores/uiStore.ts`
- Modify: `src/components/editor/MapView.tsx`
- Modify: `src/components/editor/PixiPreviewPage.tsx`
- Test: `src/components/editor/__tests__/engineSwitchHost.test.tsx`

- [ ] Add `renderEngine: 'konva' | 'pixi'` runtime setting.
- [ ] Make `EngineHost` own adapter mount/unmount and error fallback.
- [ ] Add deterministic fallback path to Konva on adapter init/render failure.
- [ ] Keep existing shortcuts/commands routed through shared intent pipeline.

### Task 2: Konva adapter behind contract

**Files:**
- Create: `src/lib/konva/KonvaAdapter.ts`
- Create: `src/lib/konva/konvaNodeFactory.ts`
- Modify: Konva stage glue in `src/components/editor/Canvas/*` (adapter hookup)
- Test: `src/lib/konva/__tests__/KonvaAdapter.test.ts`

- [ ] Wrap existing Konva render/input path in adapter contract.
- [ ] Ensure hit-test IDs and selection events map to shared intents.
- [ ] Add dispose/cleanup checks (listeners, stage refs, registries).

### Task 3: Pixi adapter behind contract

**Files:**
- Create: `src/lib/pixi/PixiAdapter.ts`
- Create: `src/lib/pixi/pixiNodeFactory.ts`
- Modify: `src/components/editor/Canvas/PixiStage.tsx` (adapter hookup)
- Test: `src/lib/pixi/__tests__/PixiAdapter.test.ts`

- [ ] Implement same adapter lifecycle + intent emission.
- [ ] Add explicit Pixi disposal for textures/containers/events.
- [ ] Validate input parity with Konva for pan/zoom/drag/select/marquee.

### Task 4: Toolbar and engine-UI separation

**Files:**
- Create: `src/components/editor/konva/KonvaToolbarHost.tsx`
- Create: `src/components/editor/konva/KonvaViewport.tsx`
- Create: `src/components/editor/pixi/PixiToolbarHost.tsx`
- Create: `src/components/editor/pixi/PixiViewport.tsx`
- Modify: `src/components/editor/MapView.tsx`
- Modify: `src/components/editor/PixiPreviewPage.tsx`
- Test: `src/components/editor/__tests__/engineToolbarIsolation.test.tsx`

- [ ] Move Konva toolbar composition into Konva-only folder.
- [ ] Move Pixi toolbar composition into Pixi-only folder.
- [ ] Remove cross-engine toolbar imports.
- [ ] Keep shared non-render UI primitives only (buttons/modals/layout).

### Task 5: Shared 2.5D stream (merged migration)

**Files:**
- Create: `src/lib/twopointfive/projector.ts`
- Create: `src/lib/twopointfive/materials.ts`
- Create: `src/lib/twopointfive/index.ts`
- Modify: `src/lib/view3d/sceneMapping.ts`
- Modify: `src/components/editor/view3d/View3DCanvas.tsx`
- Modify: `src/lib/konva/KonvaAdapter.ts`
- Modify: `src/lib/pixi/PixiAdapter.ts`
- Test: `src/lib/twopointfive/__tests__/projectorParity.test.ts`

- [ ] Extract projection/material rules to `src/lib/twopointfive`.
- [ ] Route both adapters + view3d mapping through this shared layer.
- [ ] Add parity checks so same scene inputs generate equivalent projected outputs.

### Task 6: Import-boundary enforcement

**Files:**
- Modify: `eslint.config.js`
- Create: `src/lib/core/__tests__/importBoundaries.test.ts` (or lint-based check)
- Modify: `.github/workflows/ci.yml`

- [ ] Add lint rule: `src/lib/konva` cannot import `src/lib/pixi` and vice versa.
- [ ] Add lint rule: orchestration files cannot import engine internals directly (only via host/contracts).
- [ ] Fail CI on boundary violations.

### Task 7: Rollout safety + rollback playbook

**Files:**
- Create: `src/lib/core/featureFlags.ts`
- Create: `docs_new/plan/ENGINE_ROLLBACK_PLAYBOOK.md`
- Modify: `README.md`

- [ ] Add kill switch: force Konva globally.
- [ ] Add fallback semantics for runtime switch failure (state reset + user notification + safe engine fallback).
- [ ] Define staged rollout: local -> internal -> canary -> default-on.

### Task 8: Verification matrix and CI gates

**Files:**
- Create: `docs_new/plan/ENGINE_PARITY_MATRIX.md`
- Modify: `.github/workflows/ci.yml`
- Add tests:
  - `src/components/editor/__tests__/engineParity.workflows.test.tsx`
  - `src/lib/__tests__/enginePerfBudget.test.ts`
  - `src/lib/__tests__/engineMemoryLeak.test.ts`

- [ ] Workflow parity matrix: select, drag, resize, marquee, context menu, shortcuts, undo/redo, export.
- [ ] Perf budgets: frame-time and rebuild thresholds for both engines.
- [ ] Memory checks: repeated mount/unmount + scene swap leaves no leaked listeners/resources.
- [ ] CI gate requires contract tests + adapter tests + parity tests + boundary lint.

---

## Non-negotiable Rules

- Adapters never mutate stores directly.
- `RenderScene` + `EngineIntent` are the only cross-engine shared runtime contracts.
- 2.5D rules exist only in `src/lib/twopointfive`.
- Engine-specific toolbars stay in engine-specific component folders.
- Orchestration layer cannot import engine internals except through adapter host boundary.

## Acceptance Criteria

- Konva and Pixi run through same contract and intent pipeline.
- Toolbars and renderer internals are fully separated by engine.
- 2.5D output is generated by one shared layer for both engines.
- Runtime engine switch has deterministic rollback behavior.
- Parity matrix and perf/memory gates pass in CI before default switch.
