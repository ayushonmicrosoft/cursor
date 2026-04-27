# OandOcraft Release Runbook

Target production URL: `https://oando.co.in/OandOcraft/`

## Release Artifact

- Build command: `npm run build:oando`
- Manifest command: `npm run release:manifest`
- Artifact directory: `dist/`
- Manifest file: `dist/OandOcraft-release-manifest.json`
- Artifact name format: `OandOcraft-v<package-version>-<git-sha>-<timestamp>-dist`
- Retention: keep the current production artifact plus the previous three
  release artifacts.
- Restore owner: O&O technical owner or the delegated deployment admin.
- Upload target: the main-site host path that serves `/OandOcraft/`.

The manifest records every file path, byte size, per-file SHA-256, aggregate
SHA-256, package version, commit, base path, and generated timestamp. Treat it
as the release checksum and rollback index.

## Preflight

1. Confirm `git status --short` is clean.
2. Confirm `.env.local` points at the intended Supabase project.
3. Run `npm run lint`.
4. Run `npm run test`.
5. Run `npm run build:oando`.
6. Run `npm run release:manifest`.
7. Start a local server and run `npm run audit:pages`.
8. Confirm `dist/index.html` references `/OandOcraft/` assets.
9. Record the manifest `artifactName` and `aggregateSha256` in the changelog.

## Deploy

1. Upload the full `dist/` directory to the host location that maps to
   `https://oando.co.in/OandOcraft/`.
2. Configure nested route rewrites to return `/OandOcraft/index.html`.
3. Keep app assets isolated from main-site assets.
4. Set Supabase production Site URL to `https://oando.co.in/OandOcraft`.
5. Add Supabase redirect allow-list entries for:
   - `https://oando.co.in/OandOcraft/auth/verify`
   - `https://oando.co.in/OandOcraft/auth/reset`
   - `https://oando.co.in/OandOcraft/invite/*`
6. Set the invite Edge Function `APP_URL` secret to
   `https://oando.co.in/OandOcraft`.

## Production Smoke Test

1. Open `https://oando.co.in/OandOcraft/`.
2. Refresh `/OandOcraft/login`.
3. Log in with an approved test account.
4. Open an office map.
5. Draw a room and finish the draw flow.
6. Add one desk and assign one test person.
7. Export PNG or PDF.
8. Open the admin HUD and verify Recover and Audit actions.
9. Confirm there are no blocking console errors.
10. Confirm main-site pages outside `/OandOcraft/` still render correctly.

## Rollback

Trigger rollback if production login, office load, route refresh, assignment,
export, or admin recovery is blocked.

1. Stop further uploads.
2. Restore the previous retained `dist/` artifact to the `/OandOcraft/` host
   path.
3. Verify the previous artifact manifest aggregate SHA-256.
4. Re-run the production smoke test.
5. Record the rollback artifact, reason, owner, and time in the changelog.

## Post-Release Record

Each release record must include:

- Artifact name
- Aggregate SHA-256
- Commit SHA
- Verification commands and results
- Production smoke-test result
- Known issues
- Rollback artifact
- Sign-off owner and timestamp
