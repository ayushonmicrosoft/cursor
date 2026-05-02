# Cursor Operating Rules

_Last updated: 2026-05-02_

## Why this document exists
Cursor is most valuable when each task is framed clearly before any code changes start. If planning is weak, the session tends to become expensive, slow, and noisy because the work keeps changing shape mid-stream.

This document is the practical operating manual for planning, building, and auditing work in this repo. It is intentionally stricter than a tips page.

## The short answer
The best way to plan in Cursor is:

1. Define the outcome in one sentence.
2. Check the source of truth before changing anything.
3. Split the work into the smallest safe steps.
4. Give one step at a time to implementation.
5. Audit the result against the plan before continuing.
6. Stop when the work starts drifting.
7. Keep docs, code, and validation aligned.

If the task is unclear, the correct move is not to guess. The correct move is to narrow the scope first.

## Core planning principle
A good plan answers these questions before implementation begins:

- What exactly are we trying to change?
- What is the current truth in the repo?
- What is in scope?
- What is explicitly out of scope?
- What can break?
- How will we know it worked?
- Who owns the final review?

If you cannot answer those, you do not yet have a real plan.

## The execution loop
Use this loop for almost every coding task:

### 1. Understand
Read the relevant files, current docs, and recent changes.

Ask:
- What currently exists?
- Which files own this behavior?
- Is the request about docs, UI, logic, data, or release process?
- Is this a new feature, a fix, a cleanup, or a migration?
- What would happen if we did nothing?

### 2. Frame
Write a short plan before editing.

Your plan should include:
- objective
- current truth
- files likely to change
- constraints
- assumptions
- non-goals
- validation steps
- rollback or recovery notes if needed

### 3. Build
Make the smallest change that satisfies the plan.

Rules:
- change only what is needed
- avoid refactors unless the task is about refactoring
- preserve compatibility unless migration is explicitly requested
- stop if the task becomes ambiguous
- never expand scope silently

### 4. Audit
Check the result against the original plan.

Audit questions:
- Did the result match the request?
- Did any change escape the scope?
- Did we introduce unnecessary complexity?
- Are tests, lint, and formatting clean?
- Did we preserve the repo's source of truth?
- Would a reviewer understand the change without guessing?

### 5. Deliver
Summarize what changed and what was verified.

Do not bury blockers. If something is incomplete, say so clearly.

## When to use a planner, builder, and critic
This repo already uses a three-role workflow for structured work.

### Planner
The planner should be used when the task is:
- multi-step
- ambiguous
- risky
- architectural
- likely to affect several files or workflows

Planner output should include:
- one-sentence objective
- scope boundaries
- assumptions
- files or areas affected
- validation steps
- risks and blockers
- final handoff for implementation

### Builder
The builder should be used when the plan is already clear.

The builder should:
- implement only the approved scope
- keep changes minimal
- ask for clarification when decisions are missing
- avoid inventing behavior
- report blockers instead of guessing

### Critic
The critic should be used after implementation.

The critic should:
- compare the change against the plan
- check for missing requirements
- look for boundary violations
- catch hidden assumptions
- confirm the output is reviewable

The critic should not edit files.

## What a strong plan contains
A strong plan is specific enough that another person could continue the work without guessing.

### Minimum plan template
- Objective: what success looks like
- Source of truth: what files or docs govern the work
- Scope: what will change
- Non-goals: what will not change
- Dependencies: what must already be true
- Risks: what could go wrong
- Validation: how to verify the result
- Handoff: the next implementation step
- Owner: who is responsible for the next move

### Example of a weak plan
- make the page better
- fix the UI
- improve the flow

These are too vague to be useful.

### Example of a strong plan
- Update the docs plan index to reflect the canonical planning files.
- Keep the markdown and HTML mirrors aligned.
- Do not change archived material.
- Validate that the new guide is discoverable from the main plan hub.

That is execution-ready.

## How to avoid wasting time in Cursor
If Cursor feels expensive, usually one of these is happening:

- the task was not scoped tightly enough
- the source of truth was not checked first
- the request mixed planning and implementation
- the work was allowed to drift across unrelated files
- no validation step was defined

### Preventive habits
- Ask for clarification early.
- Keep one task per session whenever possible.
- Prefer small edits over big rewrites.
- Read before you edit.
- Verify after every meaningful change.
- Keep docs and code aligned.

## Recommended workflow for this repo
For OandOcraft planning and execution, use this order:

1. Read the canonical plan.
2. Read the relevant phase file.
3. Check the repo truth in the files being changed.
4. Write a concise execution plan.
5. Implement the smallest safe change.
6. Audit for correctness.
7. Update the docs mirrors if needed.
8. Re-check for stale assumptions.
9. Confirm the change is easy to review.

## Decision rules
Use these rules when the task is unclear.

### If the request is ambiguous
Stop and clarify.

### If the request spans multiple phases
Split it into separate tasks.

### If the request changes architecture
Document the decision before editing.

### If the request only needs docs
Do not touch code.

### If the request could break existing behavior
Add validation before shipping.

## Good planning questions to ask yourself
- What is the smallest useful result?
- What would count as failure?
- What should stay exactly the same?
- What assumption am I making without proof?
- What file is the source of truth?
- Can I explain the change in one sentence?
- Can I verify the result in under five minutes?

## Anti-patterns
Avoid these patterns:
- starting implementation before defining scope
- combining unrelated fixes because they are nearby
- turning a task into a brainstorm
- rewriting docs to sound polished while losing precision
- making silent architecture changes
- treating old docs as current truth

## Practical template you can reuse
### Planning template
- Objective:
- Current truth:
- In scope:
- Out of scope:
- Constraints:
- Risks:
- Validation:
- Handoff:

### Audit template
- Did it match the objective?
- Did the change stay in scope?
- Did it preserve current truth?
- Are docs and implementation aligned?
- Did validation pass?

## Final recommendation
If you want Cursor to feel worth the money, use it as a disciplined execution system, not as a brainstorming machine.

The highest-value pattern is:
- plan clearly
- change minimally
- verify aggressively
- stop when the scope is complete
- refuse scope drift
- keep a reviewer in mind while editing

That keeps the work fast, readable, and predictable.

That keeps the work fast, readable, and predictable.