# Block Library Sources

## Purpose
Define where block assets come from and how the library should be kept current.

## Why this deserves its own document
This is about provenance and product quality, not just asset storage. The docs should make it clear which source is trusted, which source is transitional, and which source should be retired.

## Source tiers
1. Product-owned canonical assets
2. Curated internal additions
3. Legacy imported assets
4. Temporary fallback assets

## Provenance model
Every block family should describe:
- where it came from
- whether it is canonical
- whether it is editable
- whether it is a fallback
- whether it should be replaced later

## Metadata expectations
- stable name
- category
- visual role
- source tier
- reuse or licensing note
- canonical status

## Naming rules
- use predictable human-readable names
- keep IDs stable
- avoid duplicate aliases unless they are explicitly documented
- align names between docs and implementation

## Maintenance workflow
- review new assets against the canonical set
- deduplicate obvious overlaps
- normalize names and categories
- update docs when the source hierarchy changes
- note replacement candidates for old assets

## Rebuild strategy
If the library is rebuilt, the plan should explain:
- what stays
- what is renamed
- what is retired
- what is promoted to canonical status
- what temporary fallback material remains

## Acceptance criteria
- the source order is unambiguous
- the canonical set is easy to identify
- contributors can evaluate a block without guessing
- old material does not quietly become the default

## Useful framing
This document should read like a source-governance and rebuild strategy, not a simple inventory.
