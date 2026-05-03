# Block Library Strategy

## Purpose
Define how block assets are selected, organized, normalized, and maintained.

## Core questions this plan should answer
- What is the canonical source hierarchy?
- What gets promoted into the library?
- How are old assets handled?
- How do we prevent drift between docs and assets?
- How do we make the system understandable to contributors?

## Strategy overview
The block library should behave like a curated product asset system, not an unstructured folder of files.

## Source hierarchy
1. Product-owned canonical assets
2. Curated internal additions
3. Legacy imported assets
4. Temporary fallback assets

## Quality policy
- Canonical assets are the default and preferred choice.
- Legacy assets should only survive when no canonical replacement exists.
- Fallback assets are transitional and must be easy to identify.
- If an asset is visually weak, it should not be promoted into the canonical set.

## Governance model
- establish naming rules
- establish metadata rules
- establish category rules
- establish promotion rules
- establish retirement rules

## Maintenance workflow
- review new assets against the canonical set
- deduplicate obvious overlaps
- normalize names and categories
- update docs when the source hierarchy changes
- document replacement candidates when older assets are retained

## Rebuild strategy
If the library is rebuilt, the plan should explain:
- what stays
- what is renamed
- what is retired
- what is promoted to canonical status
- what fallback material remains temporarily

## Acceptance criteria
- source order is unambiguous
- the canonical set is easy to identify
- contributors can evaluate a block without guessing

## Useful framing
This document should read like a governance and rebuild strategy, not like a simple asset list.
