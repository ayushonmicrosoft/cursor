# Phase 1 — Foundation, truth, and archive alignment

_Last updated: 2026-05-02_

## Goal
Establish the only source of truth, remove ambiguity, and prepare the plan and archive structure so implementation can proceed without guesswork.

## Outcome
The team knows what is active, what is archived, what the stack really is, and what decisions are already fixed.

## Dependencies
- Repository truth
- Current docs state
- Archive inventory
- Plan ownership
- Agent pack in `.cursor/agents/`

## Owner type
Product lead, platform lead, docs owner, and reviewer.

## Exit gate
No implementation work starts until the plan, HTML, and source truth agree.

## 1. Canonical plan ownership
- [ ] Confirm `docs/docs_new/plan/OandOcraft_PLAN.md` is the active working plan.
- [ ] Confirm `docs/docs_new/plan/OandOcraft_PLAN.html` is the matching published view.
- [ ] Keep both files in lockstep whenever one changes.
- [ ] Remove wording that implies any other plan is active.
- [ ] Confirm the root `AGENTS.md` and `.cursor/agents/AGENTS.md` point to the same workflow.
- [ ] Ensure the three-agent pack is the standard operating model for structured work.

## 2. Stack truth and migration boundaries
- [ ] Record the current app shell as `Vite + React`.
- [ ] Record `index.html` → `/src/main.tsx` as the current runtime entry.
- [ ] Record `Next.js + React` as the future main-site target only.
- [ ] Keep current editor-runtime truth separate from future site migration truth.
- [ ] Remove any phrase that makes the repo sound already migrated.
- [ ] Preserve the distinction between current editor architecture and future site architecture.

## 3. Route and permission truth
- [ ] Keep the route inventory explicit and current.
- [ ] Preserve the auth and office route separation.
- [ ] Preserve the `RequireAuth` and `RequireTeam` behaviors.
- [ ] Preserve `useCan(action)` as the explicit permission gate.
- [ ] Preserve autosave, optimistic locking, explicit conflicts, and payload compatibility.
- [ ] Document any future route changes only as proposals, not as current truth.

## 4. Archive inventory and reference hygiene
- [ ] Identify every non-canonical reference document still in working folders.
- [ ] Move obsolete reference docs out of the active planning path.
- [ ] Keep the archive clearly labeled as historical, not active.
- [ ] Preserve `OandOcraft_BLOCK_LIBRARY_SOURCES.md` as the explicit exception.
- [ ] Note which archived docs may be consulted for context and which may not.
- [ ] Prevent archived docs from being cited as live truth in future work.

## 5. Documentation alignment
- [ ] Make the Markdown plan and HTML plan say the same thing.
- [ ] Keep section order, headings, and intent aligned.
- [ ] Rewrite vague summary text so it becomes implementation-grade language.
- [ ] Remove duplicated or circular statements.
- [ ] Ensure the plan can be used as a source of truth by future agents.
- [ ] Make the HTML version read like a polished docs page, not a marketing page.

## 6. Validation and acceptance criteria
- [ ] A builder can identify the current stack without guessing.
- [ ] A builder can identify the future stack target without confusing it for current truth.
- [ ] A reviewer can tell which files are canonical and which are archival.
- [ ] A builder can understand the agent workflow from the plan.
- [ ] HTML and Markdown remain aligned after edits.
- [ ] No stale reference layer is presented as active.

## 7. Risks
- [ ] Stack confusion leaks into implementation work.
- [ ] Archived docs continue to behave like live docs.
- [ ] The plan remains too vague for execution.
- [ ] The HTML diverges from the Markdown source of truth.
- [ ] The agent workflow is described loosely instead of operationally.
