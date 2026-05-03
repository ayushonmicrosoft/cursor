# UI System and Feedback

## Purpose
Define the UI conventions that keep the planner readable, accessible, and production-safe.

## Core questions this plan should answer
- How should errors be shown?
- How should loading and empty states behave?
- How should the UI communicate severity and recovery?
- What accessibility rules must the app maintain?
- What style boundaries should host integration respect?

## UI principles
- show the problem clearly
- explain the impact
- offer one obvious next step
- keep feedback near the action that triggered it
- make the UI calm, legible, and consistent

## Feedback modes
- inline field errors
- panel-level errors
- banners and notices
- blocking modals
- retryable sync and save feedback
- empty and loading states

## Accessibility rules
- announce errors when they appear
- keep focus behavior predictable
- avoid color-only meaning
- maintain usable touch targets
- keep contrast readable in every state

## Related conventions
This plan should sit next to the dedicated error-display reference and describe the broader system of feedback, tone, layout, and interaction states.

## Acceptance criteria
- every critical surface has a defined feedback state
- errors are visible in the right place
- recovery actions are obvious
- keyboard users can understand and navigate the state

## Useful framing
This document should read like a design-and-UX system note for production behaviors, not a placeholder checklist.
