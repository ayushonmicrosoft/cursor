# UI Error Display Conventions

## Purpose
Define how errors should be presented across the planner so users can recover quickly and understand what to do next.

## Why this deserves its own document
Error display is not just a subtopic of UI polish. It affects trust, recovery, accessibility, and how people judge whether the app is safe to use in real operations.

## Principles
- show the problem clearly
- explain the impact
- provide one obvious next action
- avoid technical jargon unless it helps support or debugging
- keep the message visible where the user made the action
- do not force users to translate system errors into product meaning

## Error taxonomy

### Inline field errors
Use when a specific field, control, or input needs correction.

### Panel-level errors
Use when a section of the app is affected but the rest of the app remains usable.

### Blocking errors
Use when the user cannot safely continue without making a choice or fixing a critical issue.

### Non-blocking notices
Use when the app can continue but the user should know something important changed.

### Sync and save errors
Use for optimistic-lock conflicts, transient network failures, and retryable persistence issues.

## Display rules
- keep error messages close to the relevant action
- make the recovery path obvious
- separate user action from system status
- preserve state whenever possible
- make destructive or irreversible states explicit

## Copy guidelines
- use short sentences
- prefer active voice
- prefer plain language over system language
- tell the user what happened, why it matters, and what to do next
- avoid burying the useful part of the message in a blob of diagnostics

## Accessibility requirements
- errors must be announced when they appear
- focus should move predictably for blocking states
- error text must be readable at normal contrast settings
- keyboard users must be able to dismiss or act on the state
- color must never be the only signal

## Common scenarios

### Validation failure
The user entered bad input or skipped a required field.

### Save conflict
The user’s local state conflicts with a newer server version.

### Session expiry
The user needs to re-authenticate before continuing.

### Network failure
The app cannot reach the backend and should offer a retry or fallback path.

### Permission failure
The user lacks the necessary access for the requested action.

## Recovery design
Every important error should answer:
- Can the user continue?
- Is their data safe?
- What is the fastest next step?
- What can support debug if needed?

## Acceptance criteria
- each critical surface has a defined error state
- the same type of error is shown consistently across the app
- the messages are understandable without reading source code
- the recovery actions are obvious and testable

## Useful framing
This document should read like a product-quality UI policy, not a shallow note about error text.
