# OandOcraft Full Audit Report (2026-04-27)

Prepared by: dedicated audit pass (read-only)
Scope: full repository scan across UX, reliability, security, data flows, performance, and test coverage.

## Executive summary

The audit found two P0 blockers (credential exposure in repo and broad anonymous share-token access), followed by P1 reliability/performance issues around share-link validation, admin mutation error handling, and autosave snapshot cost. The current phase work (0-2) addresses editor interaction reliability and admin command surface, but security and share-token hardening should be treated as a release gate.

## Findings by severity

### P0

1. Service-role credential tracked in `.env.local`.
2. Anonymous share-token policy is overly broad (`share_tokens`/`offices_public_via_share_token` path).

### P1

1. Share route relies on client-side token validity checks without strict office binding.
2. Admin/access mutation flows lack robust error rollback in several paths.
3. Autosave repeatedly serializes large snapshots (`JSON.stringify`) on edit/save.
4. Team home listing pulls full payload for each office.
5. Team bootstrap error handling can degrade to false "no teams" states.

### P2

1. Narrow-screen UX is still fixed-width heavy (top bar + sidebars).
2. Share UX messaging and route model are inconsistent (legacy vs current path behavior).

## Quick wins (1-2 days)

1. Rotate and remove leaked service-role credentials; keep service keys out of tracked env files.
2. Tighten share-token policies to token-bound validation only.
3. Add failure-path handling for access/admin mutations (display error + rollback optimistic state).
4. Bind share token validation to office identity on route load.

## Medium-term actions (1-2 weeks)

1. Replace full snapshot stringification with incremental dirty tracking for autosave.
2. Fetch lightweight office list data for team home (metadata first, payload lazy).
3. Implement responsive collapse strategy for sidebars/top-bar controls.
4. Unify to one share model and deprecate conflicting/legacy semantics.

## Risks if unresolved

1. Data exposure and token misuse risk.
2. Elevated compromise blast radius from leaked service-role credentials.
3. Admin UI drift during network/RLS errors.
4. Performance degradation on larger office payloads.

## Verification plan

1. Add DB policy tests for anon share-token behavior (valid, revoked, expired, wrong office).
2. Add integration tests for share route cold-load and token-office mismatch cases.
3. Add admin mutation failure tests for Share/Access/Team settings surfaces.
4. Add autosave latency budget checks on representative large payloads.
