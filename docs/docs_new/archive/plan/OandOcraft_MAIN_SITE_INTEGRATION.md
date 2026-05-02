# OandOcraft Main-Site Integration

Target path: `https://oando.co.in/OandOcraft/`

## Build

Use the subpath build whenever the app is being deployed under the main site:

```bash
npm run build:oando
```

That emits a `dist/` build whose asset URLs already point at `/OandOcraft/`.

## Hosting Rules

Serve the built files from the `/OandOcraft/` subdirectory on the main host.

Required rewrite behavior:

- `/OandOcraft/` -> `/OandOcraft/index.html`
- `/OandOcraft/login` -> `/OandOcraft/index.html`
- `/OandOcraft/dashboard` -> `/OandOcraft/index.html`
- `/OandOcraft/t/*` -> `/OandOcraft/index.html`
- `/OandOcraft/auth/verify` -> `/OandOcraft/index.html`
- `/OandOcraft/auth/reset` -> `/OandOcraft/index.html`
- `/OandOcraft/invite/*` -> `/OandOcraft/index.html`
- `/OandOcraft/assets/*` -> serve static file directly

Example Nginx block:

```nginx
location /OandOcraft/assets/ {
  alias /var/www/oando.co.in/OandOcraft/assets/;
  access_log off;
  expires 7d;
  add_header Cache-Control "public, max-age=604800, immutable";
}

location /OandOcraft/ {
  alias /var/www/oando.co.in/OandOcraft/;
  try_files $uri $uri/ /OandOcraft/index.html;
}
```

Example Apache rewrite:

```apache
RewriteEngine On
RewriteBase /OandOcraft/
RewriteRule ^assets/ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /OandOcraft/index.html [L]
```

## Supabase Auth Redirects

Set these redirect URLs in Supabase Auth:

- `https://oando.co.in/OandOcraft/auth/verify`
- `https://oando.co.in/OandOcraft/auth/reset`
- `https://oando.co.in/OandOcraft/invite/*`

Recommended site URL:

- `https://oando.co.in/OandOcraft`

## Production Environment

Main app env vars:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Edge-function env vars:

- `APP_URL=https://oando.co.in/OandOcraft`
- `RESEND_API_KEY`

## CSS Isolation

Deploy OandOcraft as its own routed app under `/OandOcraft/`. Do not inline its bundle into a page fragment of the main site.

Why:

- Vite emits a standalone CSS bundle for this app.
- React Router assumes it owns navigation under the `/OandOcraft/` base path.
- Serving it as a dedicated route boundary prevents main-site CSS from leaking into the planner and prevents planner resets from touching the rest of `oando.co.in`.

## Verification Checklist

After deployment:

1. Open `https://oando.co.in/OandOcraft/`
2. Refresh `https://oando.co.in/OandOcraft/login`
3. Refresh `https://oando.co.in/OandOcraft/dashboard`
4. Refresh a nested office route like `https://oando.co.in/OandOcraft/t/<team>/o/<office>/map`
5. Complete an auth verify/reset flow and confirm the redirect stays under `/OandOcraft/`
6. Confirm planner CSS does not affect non-OandO pages
7. Confirm main-site CSS does not affect planner spacing, typography, or controls
