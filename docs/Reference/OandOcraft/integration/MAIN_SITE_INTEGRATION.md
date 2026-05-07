# OandOcraft Main-Site Integration Plan

Target URL: `https://oando.co.in/OandOcraft/`
Main-site constraint: the main site is not Vite-based.
Chosen model: deploy OandOcraft as a bounded SPA under the `/OandOcraft/` subpath.

## 1. Integration Decision

OandOcraft should keep its own Vite build and be served by the main host as a self-contained application. Do not copy React components into the main-site frontend and do not mount the app inside a main-site page fragment until the standalone subpath deployment is proven.

Why this is the right first model:

- The planner has complex routing, Supabase Auth callbacks, Konva canvas behavior, and its own CSS bundle.
- A subpath boundary keeps release risk lower than a full stack migration.
- The main site can link to the planner without owning its runtime.
- The planner can be tested, built, rolled back, and deployed independently.

## 2. Build Contract

Use the subpath build for production deployment under the main site:

```bash
npm run build:oando
```

The build must emit:

- `dist/index.html`
- `dist/assets/*`
- asset URLs rooted at `/OandOcraft/`
- client routes that resolve with the React Router basename

Pre-deploy checks:

- `npm run lint`
- `npm run test`
- `npm run build:oando`
- `npm run audit:pages` when route-audit dependencies are available

## 3. Host Contract

The host must serve OandOcraft as a routed app boundary.

Static assets:

- `/OandOcraft/assets/*` serves files directly from the deployed `dist/assets/` folder.
- Static assets should be cacheable.
- `index.html` should not be cached aggressively.

Client routes:

- `/OandOcraft/`
- `/OandOcraft/login`
- `/OandOcraft/dashboard`
- `/OandOcraft/t/*`
- `/OandOcraft/auth/verify`
- `/OandOcraft/auth/reset`
- `/OandOcraft/invite/*`

All non-asset client routes must fall back to `/OandOcraft/index.html`.

## 4. Nginx Example

```nginx
location /OandOcraft/assets/ {
  alias /var/www/oando.co.in/OandOcraft/assets/;
  access_log off;
  expires 7d;
  add_header Cache-Control "public, max-age=604800, immutable";
}

location = /OandOcraft/index.html {
  alias /var/www/oando.co.in/OandOcraft/index.html;
  add_header Cache-Control "no-store";
}

location /OandOcraft/ {
  alias /var/www/oando.co.in/OandOcraft/;
  try_files $uri $uri/ /OandOcraft/index.html;
}
```

## 5. Apache Example

```apache
RewriteEngine On
RewriteBase /OandOcraft/
RewriteRule ^assets/ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /OandOcraft/index.html [L]

<Files "index.html">
  Header set Cache-Control "no-store"
</Files>
```

## 6. Supabase Auth Redirects

Supabase Auth must allow these production redirect URLs:

- `https://oando.co.in/OandOcraft/auth/verify`
- `https://oando.co.in/OandOcraft/auth/reset`
- `https://oando.co.in/OandOcraft/invite/*`

Recommended Supabase Site URL:

- `https://oando.co.in/OandOcraft`

Local development redirects should remain separate:

- `http://localhost:5173/auth/verify`
- `http://localhost:5173/auth/reset`
- `http://localhost:5173/invite/*`

## 7. Environment Variables

Frontend environment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Edge-function environment:

- `APP_URL=https://oando.co.in/OandOcraft`
- `RESEND_API_KEY`

Never commit:

- Supabase service-role keys
- production database URLs
- Resend secrets
- personal access tokens

## 8. CSS And JavaScript Isolation

OandOcraft must be deployed as a standalone route, not inlined into a main-site template.

Rules:

- Do not load main-site CSS into the OandOcraft app shell.
- Do not load OandOcraft CSS on non-planner pages.
- Do not rewrite Vite asset filenames after build.
- Do not run HTML minifiers that rewrite module paths without testing.
- Keep main-site analytics scripts passive and non-blocking if injected globally.

The current app direction also requires sharper, more professional UI geometry. The integration should not add host-side CSS that re-rounds planner controls or changes canvas chrome.

## 9. Security Headers

Minimum production headers for the OandOcraft route:

```http
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Recommended after final asset domains are known:

```http
Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'self' https://oando.co.in;
```

Adjust CSP only for confirmed production providers. Do not add wildcard domains for convenience.

## 10. Deployment Workflow

1. Pull the clean `main` branch.
2. Install dependencies with the lockfile-respecting command used by the host pipeline.
3. Run `npm run lint`.
4. Run `npm run test`.
5. Run `npm run build:oando`.
6. Upload `dist/*` to the host folder mapped to `/OandOcraft/`.
7. Apply host rewrites and cache rules.
8. Confirm Supabase redirect URLs and Edge Function `APP_URL`.
9. Smoke test the production route.
10. Keep the previous `dist/` artifact available for rollback.

## 11. Production Smoke Test

After deployment, verify:

- `https://oando.co.in/OandOcraft/` loads the app.
- `https://oando.co.in/OandOcraft/login` refreshes without 404.
- `https://oando.co.in/OandOcraft/dashboard` refreshes without 404.
- `https://oando.co.in/OandOcraft/t/<team>/o/<office>/map` refreshes without 404.
- Login works with a real allowed account.
- Invite acceptance returns under `/OandOcraft/`.
- Password reset returns under `/OandOcraft/`.
- The main site outside `/OandOcraft/` keeps its existing layout.
- The planner keeps its own typography, spacing, sharper corners, dockable toolbars, and canvas layout.
- Browser console has no route, asset, CSP, Supabase, or source-map errors that block usage.

## 12. Rollback

Rollback is artifact-based:

- keep the previous working `dist/` bundle
- replace the current `/OandOcraft/` folder with the previous artifact
- keep host rewrites unchanged unless the failed deploy changed them
- confirm `/OandOcraft/`, `/login`, `/dashboard`, and one office route after rollback

Do not roll back the database unless a migration caused the issue. If a database rollback is required, follow the Supabase migration and backup runbook before changing hosted data.

## 13. Future Options

Subdomain option:

- `https://craft.oando.co.in/`
- best if the main site wants total isolation later

Micro-frontend option:

- extract a mountable app component
- inject basename from the host
- namespace CSS under a root planner class
- decide auth ownership between host auth and Supabase Auth

Full stack migration:

- defer until the product is stable
- only consider if the main site must own the planner runtime
