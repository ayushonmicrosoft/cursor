# OandOcraft Playbook Spec

## Project Intent
OandOcraft is a floor planning and seating operations product where map editing, team assignment, and office-level governance must remain predictable, readable, and production-safe.

## Scope and Boundaries
### In Scope
- Map editing workflow in `/t/:teamSlug/o/:officeSlug/map`.
- Roster assignment workflow in `/roster`.
- Team/admin surfaces, export/share controls, and quality gates.

### Out of Scope
- Backend model rewrites that break payload compatibility.
- Unbounded refactors unrelated to operator experience.

## Definition of Done
- Primary user flows complete with no blocker UX regressions.
- Accessibility baseline passes for focus, contrast, and touch targets.
- `npm run lint`, `npm run test`, and `npm run build` pass.
- Release note and rollback instructions are recorded.
