# Integration and Deployment

## Purpose
Define how OandOcraft is hosted and deployed as a bounded app.

## Core questions this plan should answer
- What is the deployment model?
- What must the host do to support the planner?
- What route behavior must be preserved?
- What auth redirects must stay valid?
- What failure modes should the team anticipate?

## Deployment model
OandOcraft should continue to ship as a standalone SPA build that is mounted under `/OandOcraft/`. The host may serve the files, but it should not own planner logic or rewrite planner behavior.

## Host contract

### Assets
- serve assets from the configured subpath
- keep static assets cacheable
- avoid aggressive caching for `index.html`

### Routes
- allow direct refresh on nested planner routes
- use SPA fallback for all non-asset client routes
- keep invite, reset, and verify flows valid under the subpath

## Redirect and environment contract

### Production redirects
- `https://oando.co.in/OandOcraft/auth/verify`
- `https://oando.co.in/OandOcraft/auth/reset`
- `https://oando.co.in/OandOcraft/invite/*`

### Local redirects
- `http://localhost:5173/auth/verify`
- `http://localhost:5173/auth/reset`
- `http://localhost:5173/invite/*`

### Environment variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `APP_URL=https://oando.co.in/OandOcraft`
- `RESEND_API_KEY`

## CSS and runtime isolation
- do not load host CSS into the planner shell
- do not let host styles change planner chrome
- do not post-process asset URLs without testing
- do not collapse the SPA into a partial host component unless that is explicitly a new architectural decision

## Release steps
1. run lint, test, and build
2. verify the subpath artifact
3. upload the bundle to the host-mapped folder
4. confirm rewrites and cache rules
5. verify redirects and smoke tests
6. keep the previous artifact for rollback

## Failure modes to watch
- stale asset URLs
- broken nested routes
- mismatched redirects
- host CSS bleed
- source-map or console regressions

## Useful framing
This document should read like a deployment contract, not like a shallow hosting note.
