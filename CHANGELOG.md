# OandOcraft Changelog

Use this file for release records. Each production or staging handoff should
copy the template below and fill in concrete evidence.

## Unreleased

### Summary

- OandOcraft overhaul work in progress.

### User-Visible Changes

- Cleaner SmartDraw-style canvas controls and sharper block visuals.
- `/OandOcraft/` subpath build support for the O&O main site.
- Direct named-user access and admin recovery surfaces.

### Operational Steps

- Run `npm run lint`.
- Run `npm run test`.
- Run `npm run build:oando`.
- Run `npm run release:manifest`.
- Run `npm run audit:pages` against a local or staging server.

### Known Issues

- Hosted Supabase/demo data may still contain legacy `Floorcraft` strings
  until the hosted database is cleaned or reseeded.
- Production host, Supabase redirect allow-list, and Edge Function `APP_URL`
  changes require host/admin access.

### Rollback

- Restore the previous retained `dist/` artifact.
- Verify the previous `OandOcraft-release-manifest.json` aggregate SHA-256.
- Re-run production smoke tests.

## Release Template

### `<version-label>` - `<YYYY-MM-DD>`

### Summary

-

### User-Visible Changes

-

### Operational Steps

-

### Verification

- `npm run lint`:
- `npm run test`:
- `npm run build:oando`:
- `npm run release:manifest`:
- `npm run audit:pages`:

### Artifact

- Artifact name:
- Commit:
- Aggregate SHA-256:
- Upload location:
- Retention slot:

### Known Issues

-

### Rollback

- Rollback artifact:
- Rollback owner:
- Restore path/command:

### Sign-Off

- Owner:
- Timestamp:
