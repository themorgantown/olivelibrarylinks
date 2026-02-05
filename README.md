# Olive Library Links

URL: https://olivelibrarylinks.vercel.app/ 
and: https://olivelibrarylinks.vercel.app/?refresh=1

This repository contains a static Next.js front-end and a lightweight PHP API that together surface curated resources for the Olive Free Library. The PHP endpoint reads from Google Sheets, caches results for five minutes, and serves JSON that the static site consumes at runtime.

## Tech Stack
- **Next.js 15 + React 19** for the static UI
- **TypeScript** across all front-end code
- **Tailwind-style utility classes** via global CSS. Inlined for speed. 
- **PHP 8.1+** endpoint (with `curl` and `openssl`) for Google Sheets access
- **Flat-file JSON cache** so the API works without a database

## Data Flow
1. The browser loads the exported static site: https://olivelibrarylinks.vercel.app/ 
2. On mount, the client renders the most recently cached links immediately (stored in `localStorage`), then fetches updated links from the PHP endpoint (or the URL defined in `NEXT_PUBLIC_API_ENDPOINT`) in the background. Visiting the site with `?refresh=1` forces that background fetch to request a refresh from the PHP endpoint.
3. The PHP script refreshes Google Sheets data at most every five minutes, serving cached results otherwise.
4. If the background fetch returns different links, the React UI updates. If the fetch fails but cached links exist, the UI continues showing the cached links without interrupting the experience.

## Client-side caching
- The front-end stores the last successful link payload in `localStorage` so returning visitors see links immediately, even if they haven’t visited in a while.
- To force a truly “cold” first-load experience during testing, clear site data for the domain (or remove the `localStorage` keys `olivelibrarylinks:links:v1` and `olivelibrarylinks:links_updated_at:v1`).

## Directory Overview
- `app/` – Next.js App Router pages, layout, and components
- `lib/types.ts` – Shared TypeScript types for API responses
- `public/` – Static assets (favicon, manifest, robots)
- `php/` – Standalone PHP API, cache storage, and documentation. 


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

## Static Build & Deployment
```bash
# Generate the static output
npm run build

# The export is emitted to the ./out directory
```

Deploy by copying the contents of `out/` and the `php/` folder to your web root:
- Serve `out/` as static files at `https://thestrange.foundation/olivefreelibrarylinks/source/`.
- Ensure `php/index.php` is reachable at `https://thestrange.foundation/olivefreelibrarylinks/php/index.php`.
- Give the web server write access to `php/storage/` so cache files can be created.

## PHP Endpoint Notes
- The endpoint automatically returns cached data when Google Sheets cannot be reached.
- Adding `?refresh=1` forces an immediate refresh attempt; stale data is still returned on failure.
- Review `php/README.md` for detailed setup steps and response examples.

## Customisation Checklist for your own site: 
- **Update Base URL**: Replace `https://olivelibrarylinks.vercel.app/` with your own domain in:
  - `app/sitemap.ts`
  - `app/robots.ts`
- **Configure API Endpoint**:
  - The default API endpoint is defined in `app/page.tsx`.
  - To use your own PHP backend, set the environment variable `NEXT_PUBLIC_API_ENDPOINT` in your deployment (e.g., Vercel) or update the default value in `app/page.tsx`.
- **Update Branding & Copy**:
  - `app/page.tsx`: Update the header title ("Olive Free Library Links") and the footer links.
  - `app/layout.tsx`: Update the metadata (title, description, Open Graph images).
  - `public/manifest.json`: Update the app name and icons.
- **Styling**:
  - Adjust colors and styles in `app/globals.css` or directly in component classes (Tailwind).


Once configured, the site can run entirely from any static hosting service while the PHP API handles live data updates and caching.
