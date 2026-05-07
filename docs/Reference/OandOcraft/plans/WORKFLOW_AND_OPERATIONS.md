# Workflow and Operations

## Purpose
Explain how the team plans, builds, validates, ships, and supports the product.

## Core questions this plan should answer
- How does work move through the team?
- What checks are expected before release?
- What operational obligations exist once the app is live?
- How does rollback work?
- What should a responder do when something goes wrong?

## Workflow stages

### 1. Bootstrap
Confirm repo truth, docs truth, scope, and risk before touching the implementation.

### 2. Analyze
Read the route, state, persistence, and UI layers and identify the invariants that cannot break.

### 3. Implement
Make the smallest change that solves the problem while preserving the established contracts.

### 4. Validate
Run lint, tests, build, and targeted checks across the exact surfaces that changed.

### 5. Release
Record what changed, what was verified, and how to roll back if needed.

## Operational model

### Deployment
Explain how the app is built, where it is hosted, and what the host must do and not do.

### Support and recovery
Explain how the team handles failures, stale artifacts, route issues, and sync problems.

### Release hygiene
Explain what should be captured before and after a release so the next person can understand the state of play.

## Current operations to document
- build and release flow
- auth redirect configuration
- invite email flow
- smoke-test routes
- rollback artifact retention
- recovery responsibilities

## Operator checklist
- verify route behavior
- verify auth behavior
- verify asset delivery
- verify host rewrite behavior
- verify console health
- verify rollback readiness

## Useful framing
This document should read like the operating manual for the team, not like a generic SDLC summary.
