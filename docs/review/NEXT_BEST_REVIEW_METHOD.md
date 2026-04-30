# Next-Best Review Method for Floorcraft

_Last updated: 2026-04-30_

This document defines the practical replacement review workflow to use when CodeRabbit cannot run locally on Windows. It is documentation-only guidance for reviewers working in `C:\Floorcraft\Floorcraft`.

## Why CodeRabbit Is Blocked

CodeRabbit could not be used in this Windows environment because:

- The CodeRabbit CLI was not installed or available on `PATH`.
- The installer path required `sh`.
- No Bash-compatible shell (`bash`, `sh`, Git Bash, WSL shell, or similar) was available.
- The repo can still be reviewed safely with local Git, npm scripts, TypeScript, ESLint, Vitest, dependency audit checks, optional Playwright smoke tests, and a focused manual diff review.

## Recommended Replacement Review Stack

Use this stack in order. Stop only when a blocker is clear and record it in the review notes.

1. Git scope review: confirm exactly which files changed and avoid unrelated dirty files.
2. Static confidence: run TypeScript/Vite build and ESLint.
3. Test confidence: run all tests or targeted tests that match the changed area.
4. Dependency confidence: run `npm audit` and document production-impacting issues.
5. Runtime confidence: optionally run a local preview and smoke the routes touched by the change.
6. Manual diff review: inspect behavior, data safety, React lifecycle, canvas rendering, Supabase access, and regression risk.
7. Artifact capture: save command outputs and review notes so the result is reproducible.

## Fast Local Review Commands

Run these from PowerShell in the repo root:

```powershell
Set-Location C:\Floorcraft\Floorcraft
```

### 1. Capture Review Artifacts

Create a timestamped folder for logs:

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$artifactDir = "docs\review\artifacts\$stamp"
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
"Artifacts: $artifactDir"
```

### 2. Check Git Scope

```powershell
git status --short | Tee-Object -FilePath "$artifactDir\git-status.txt"
git diff --stat | Tee-Object -FilePath "$artifactDir\git-diff-stat.txt"
git diff --name-status | Tee-Object -FilePath "$artifactDir\git-diff-name-status.txt"
git diff --check | Tee-Object -FilePath "$artifactDir\git-diff-check.txt"
```

If reviewing staged changes instead of the working tree, use:

```powershell
git diff --cached --stat | Tee-Object -FilePath "$artifactDir\git-diff-cached-stat.txt"
git diff --cached --name-status | Tee-Object -FilePath "$artifactDir\git-diff-cached-name-status.txt"
git diff --cached --check | Tee-Object -FilePath "$artifactDir\git-diff-cached-check.txt"
```

Inspect the patch in manageable chunks:

```powershell
git diff -- . ':!package-lock.json' | Tee-Object -FilePath "$artifactDir\git-diff-no-lockfile.patch"
```

For a specific file:

```powershell
git diff -- src\components\editor\Canvas\PixiStage.tsx
```

### 3. Build

The project has `build`, `lint`, `format:check`, and `test` scripts. Start with build because it catches TypeScript and bundling errors:

```powershell
npm run build 2>&1 | Tee-Object -FilePath "$artifactDir\npm-build.txt"
```

### 4. ESLint and Formatting

ESLint is available in this repo:

```powershell
npm run lint 2>&1 | Tee-Object -FilePath "$artifactDir\npm-lint.txt"
```

Formatting check is also available:

```powershell
npm run format:check 2>&1 | Tee-Object -FilePath "$artifactDir\npm-format-check.txt"
```

Do not run `npm run format` during review unless the review scope explicitly includes formatting changes, because it can rewrite many unrelated files.

### 5. Tests

Run the full test suite when feasible:

```powershell
npm test 2>&1 | Tee-Object -FilePath "$artifactDir\npm-test.txt"
```

Run targeted tests for changed files or nearby areas:

```powershell
npm exec vitest run src\components\editor\Canvas\AlignDistributeToolbar.test.tsx 2>&1 | Tee-Object -FilePath "$artifactDir\vitest-targeted.txt"
```

Find available tests with PowerShell if needed:

```powershell
Get-ChildItem -Path src -Recurse -Include *.test.ts,*.test.tsx,*.spec.ts,*.spec.tsx | Select-Object -ExpandProperty FullName
```

### 6. Dependency Audit

Use audit as a signal, not an automatic failure. Prioritize production, reachable, high-severity vulnerabilities.

```powershell
npm audit --omit=dev 2>&1 | Tee-Object -FilePath "$artifactDir\npm-audit-prod.txt"
npm audit 2>&1 | Tee-Object -FilePath "$artifactDir\npm-audit-all.txt"
```

Do not run `npm audit fix` during review unless the task explicitly approves dependency mutation.

### 7. Optional Playwright Route Smoke

Use this when the change touches routing, auth shells, editor pages, canvas rendering, dashboard, or build output. It starts a local preview and checks that core routes respond without a page-level crash.

```powershell
npm run build
$preview = Start-Process -FilePath npm -ArgumentList 'run','preview','--','--host','127.0.0.1','--port','4173' -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5
@"
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const routes = ['/', '/login', '/signup', '/forgot', '/help', '/docs', '/dashboard'];
  for (const route of routes) {
    const response = await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'domcontentloaded' });
    console.log(`${route} ${response ? response.status() : 'NO_RESPONSE'} ${await page.title()}`);
  }
  await browser.close();
})();
"@ | Set-Content -Path "$artifactDir\route-smoke.cjs"
node "$artifactDir\route-smoke.cjs" 2>&1 | Tee-Object -FilePath "$artifactDir\playwright-route-smoke.txt"
Stop-Process -Id $preview.Id -ErrorAction SilentlyContinue
```

For authenticated team/office routes such as `/t/:teamSlug/o/:officeSlug/map`, `/engine`, `/pixi`, `/roster`, `/reports`, and `/org-chart`, use a seeded local session or test account only if available. Otherwise, verify that unauthenticated redirects are intentional and do not crash.

## Manual Diff-Review Checklist

Use this checklist after command-line checks. Focus on changed lines first, then adjacent behavior.

### Scope and Intent

- Does the diff match the requested behavior and avoid unrelated rewrites?
- Are generated files, build artifacts, lockfile changes, and formatting-only changes intentional?
- Are existing dirty files preserved and not accidentally reverted?
- Are new files named and located consistently with the repo structure?

### React and State

- Are hooks called unconditionally and with correct dependency arrays?
- Are `useEffect` cleanups present for timers, listeners, subscriptions, observers, and canvas resources?
- Are memoized callbacks/selectors stable enough to avoid avoidable rerenders?
- Does Zustand state mutation preserve immutability and avoid stale closures?
- Are loading, empty, error, and permission states handled?
- Are route params and query params validated before use?

### PixiJS Review Focus

- Are Pixi applications, textures, containers, event handlers, and ticker callbacks cleaned up on unmount?
- Does the Pixi route remain isolated from the production Konva route unless the change intentionally bridges them?
- Are coordinate transforms, zoom, pan, hit testing, and resize behavior correct at different viewport sizes?
- Are WebGL/canvas resources reused or disposed to avoid memory leaks?
- Is fallback behavior acceptable when WebGL initialization fails?

### Konva Review Focus

- Are layer redraws, refs, drag handlers, transforms, and selection state synchronized correctly?
- Do snapping, measuring, alignment, marquee selection, and hover overlays still work together?
- Are pointer coordinates converted correctly when zoomed, panned, or scaled?
- Are heavy canvas nodes avoided in React render paths where imperative Konva updates are safer?
- Are accessibility and keyboard shortcuts preserved around canvas overlays and dialogs?

### Supabase and Data Safety

- Are Supabase calls scoped by authenticated user, team, office, or tenant as appropriate?
- Does the change rely on RLS rather than trusting client-side filters alone?
- Are inserts/updates/deletes explicit about target rows and columns?
- Are destructive actions confirmed, reversible, or limited to the intended scope?
- Are secrets kept out of client code and logs?
- Are migrations, seed scripts, and public table assumptions reviewed when schema or data shape changes?
- Are optimistic updates reconciled with server failures?

### Security and Privacy

- Are user-controlled values escaped or rendered safely?
- Are downloaded/exported files sanitized and limited to intended data?
- Are auth redirects, password reset flows, and invite/team flows protected from open redirects or token leakage?
- Are logs free of tokens, emails beyond necessity, and sensitive floor/office data?

### Performance and UX

- Does the change avoid blocking the main thread during canvas interactions?
- Are large lists virtualized or filtered efficiently?
- Are large assets lazy-loaded where appropriate?
- Does mobile or narrow-screen behavior degrade gracefully?
- Are error messages actionable without exposing internals?

## Severity Rubric

Use this rubric for findings:

| Severity | Meaning | Examples |
| --- | --- | --- |
| P0 Blocker | Must fix before merge or deploy. Causes data loss, auth bypass, secret exposure, app-wide crash, or destructive production impact. | Cross-tenant Supabase access, unguarded delete, leaked service key, route that crashes the whole app. |
| P1 High | Should fix before merge. Major feature regression, serious performance issue, broken build/test, or likely user-visible failure. | Editor cannot load, Pixi/Konva canvas leaks badly, save flow fails, required route broken. |
| P2 Medium | Fix soon or before release branch. Localized bug, missing edge case, confusing UX, incomplete validation, or moderate maintainability risk. | Incorrect measurement at non-100% zoom, missing empty state, stale effect dependency. |
| P3 Low | Nice to fix. Minor readability, small UI polish, low-risk cleanup, or documentation clarification. | Copy typo, redundant branch, non-blocking style inconsistency. |

## Review Artifacts to Produce

At the end of a review, attach or summarize:

- `git-status.txt`
- `git-diff-stat.txt`
- `git-diff-name-status.txt`
- `git-diff-check.txt`
- `npm-build.txt`
- `npm-lint.txt`
- `npm-format-check.txt` if run
- `npm-test.txt` or targeted Vitest logs
- `npm-audit-prod.txt` and any relevant all-dependency audit notes
- `playwright-route-smoke.txt` if route smoke was run
- A short findings list using the severity rubric
- A short residual-risk note for anything not tested

Suggested review summary template:

```text
Review scope:
- Files reviewed:
- Commands run:
- Findings:
- Residual risk:
- Recommendation: approve / approve with comments / request changes
```

## How to Later Re-Enable CodeRabbit

When a Bash-compatible shell is available, re-enable CodeRabbit as the first-pass AI reviewer and keep this local workflow as backup.

1. Install Git for Windows with Git Bash, enable WSL, or provide another `sh`/`bash` on `PATH`.
2. Open a new terminal and verify:

```powershell
Get-Command bash -ErrorAction SilentlyContinue
Get-Command sh -ErrorAction SilentlyContinue
```

3. Install or expose the CodeRabbit CLI according to the current official CodeRabbit instructions.
4. Verify the CLI is available:

```powershell
Get-Command coderabbit -ErrorAction SilentlyContinue
coderabbit --version
```

5. Run CodeRabbit on a small test diff first.
6. Compare CodeRabbit findings with this local stack before relying on it fully.
7. Keep the PowerShell commands in this document as the deterministic review record, even when CodeRabbit is restored.

## Recommended Default Decision

Until CodeRabbit is restored, use this replacement method as the standard review path:

```text
Git scope + build + lint + targeted/full tests + npm audit + optional route smoke + manual React/Pixi/Konva/Supabase diff review.
```
