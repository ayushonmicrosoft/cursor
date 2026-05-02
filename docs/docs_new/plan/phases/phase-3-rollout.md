# Phase 3 — External rollout, renderer expansion, and 2.5D / 3D direction

_Last updated: 2026-05-02_

## Goal
Release outward with a stronger spatial and rendering story once the internal system is proven.

## Outcome
The product can move outward with a stable rendering path, a compatible catalog model, and a clear external story for 2.5D and 3D evolution.

## Dependencies
- Phase 2 validation
- Stable catalog data
- Internal deployment feedback
- Renderer strategy

## Owner type
Frontend/rendering, product, and release owner.

## Focus areas
- External rollout posture
- Renderer and visualization expansion
- 2.5D and spatial evolution

## 1. External rollout posture
- [ ] Make the external experience feel clearly deliberate and production-ready.
- [ ] Decide which interactions are visible by default and which remain advanced.
- [ ] Ensure the outward rollout exposes value quickly without breaking the proven internal workflow.
- [ ] Keep the external surface compatible with the object catalog and metadata model built earlier.
- [ ] Define what users should see first when entering a project.

## 2. Renderer and visualization expansion
- [ ] Treat Pixi as a serious rendering option with real performance and fidelity goals.
- [ ] Define what workloads Pixi should handle better than the current editor path.
- [ ] Plan for advanced canvas interactions and richer rendering primitives.
- [ ] Keep Pixi separated from the map editor so each can evolve independently.
- [ ] Identify how Pixi could support future visualization or simulation features.
- [ ] Capture where Pixi should stay experimental and where it should become production-ready.
- [ ] Establish how future rendering layers inherit from the same catalog and workspace data.
- [ ] Keep photo-backed and generated assets compatible with the rollout path.

## 3. 2.5D and spatial evolution
- [ ] Define what `2.5d` means in product language.
- [ ] Treat `2.5d` as a bridge toward more spatial presentation, not a dead-end mode.
- [ ] Identify whether depth, tilt, layering, or perspective effects add user value.
- [ ] Keep the option open for future 3D-style spatial experiences where they improve comprehension.
- [ ] Prevent the editor from becoming locked into a flat-2D-only mental model.
- [ ] Use 2.5D as the transition layer between generated assets and richer 3D rollout.

## 4. Validation and acceptance criteria
- [ ] External users can enter the product through a production-ready experience.
- [ ] The rendering architecture can serve generated, photo-backed, and 3D assets.
- [ ] 2.5D remains available as a bridge, not a dead end.
- [ ] The rollout path is stable enough for broader public use.

## 5. Risks
- [ ] External rollout hides instability instead of exposing value.
- [ ] Pixi becomes a side quest rather than a strategic renderer.
- [ ] The catalog data model cannot support both photo-backed and 3D assets.
- [ ] The external experience arrives before internal confidence is real.
