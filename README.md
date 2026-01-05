# Olive Library Links

This repository contains a static Next.js front-end and a lightweight PHP API that together surface curated resources for the Olive Free Library. The PHP endpoint reads from Google Sheets, caches results for five minutes, and serves JSON that the static site consumes at runtime.

## Tech Stack
- **Next.js 15 + React 19** for the static UI
- **TypeScript** across all front-end code
- **Tailwind-style utility classes** via global CSS
- **PHP 8.1+** endpoint (with `curl` and `openssl`) for Google Sheets access
- **Flat-file JSON cache** so the API works without a database

## Data Flow
1. The browser loads the exported static site (e.g., `https://thestrange.foundation/olivelibrarylinks/source/`).
2. On mount, the client fetches `../php/index.php` (or the URL defined in `NEXT_PUBLIC_API_ENDPOINT`).
3. The PHP script refreshes Google Sheets data at most every five minutes, serving cached results otherwise.
4. The React UI renders link cards, shows loading states, and offers a manual refresh button that appends `?refresh=1` to the API call.

## Directory Overview
- `app/` – Next.js App Router pages, layout, and components
- `lib/types.ts` – Shared TypeScript types for API responses
- `public/` – Static assets (favicon, manifest, robots)
- `php/` – Standalone PHP API, cache storage, and documentation
- `next.config.ts` – Configured with `output: 'export'` and `basePath: '/olivelibrarylinks/source'` for static hosting

## Configuration
- `NEXT_PUBLIC_API_ENDPOINT` (optional): Override the default API URL (`https://thestrange.foundation/olivefreelibrarylinks/php/index.php`).
- PHP config lives in `php/config.php`, which reads from environment variables when present. Populate:
  - `GOOGLE_SHEET_ID`
  - `GOOGLE_SHEET_RANGE`
  - `GOOGLE_CLIENT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`
  - `CACHE_FILE` (optional override)
  - `CACHE_TTL` (optional, defaults to 300 seconds)

## Local Development
```bash
npm install
npm run dev
```

The development server defaults to `http://localhost:3000/olivelibrarylinks/source/`. To test against a local PHP endpoint, set `NEXT_PUBLIC_API_ENDPOINT=http://localhost/path/to/php/index.php` before starting the server.

## Static Build & Deployment
```bash
# Generate the static output
npm run build

# The export is emitted to the ./out directory
```

Deploy by copying the contents of `out/` and the `php/` folder to your web root:
- Serve `out/` as static files at `https://thestrange.foundation/olivelibrarylinks/source/`.
- Ensure `php/index.php` is reachable at `https://thestrange.foundation/olivefreelibrarylinks/php/index.php`.
- Give the web server write access to `php/storage/` so cache files can be created.

## PHP Endpoint Notes
- The endpoint automatically returns cached data when Google Sheets cannot be reached.
- Adding `?refresh=1` forces an immediate refresh attempt; stale data is still returned on failure.
- Review `php/README.md` for detailed setup steps and response examples.

## Customisation Checklist
- Update copy and branding in `app/page.tsx`, `app/layout.tsx`, and `public/manifest.json`.
- Replace footer links and social media URLs as needed.
- Adjust styles or colors directly in the component class names.
- Edit metadata (Open Graph, Twitter) inside `app/layout.tsx`.

Once configured, the site can run entirely from any static hosting service while the PHP API handles live data updates and caching.
