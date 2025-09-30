# Olive Library Links PHP API

This lightweight PHP endpoint mirrors the Google Sheets data adapter used by the Next.js application. Deploy the contents of this folder to any PHP-capable host to expose a cached JSON feed that your frontend can consume instead of calling Google directly.

Endpoint URL:

https://thestrange.foundation/olivefreelibrarylinks/

## Requirements
- PHP 8.1+ with the `curl` and `openssl` extensions enabled
- Service account credentials with read access to your Google Sheet
- File-system write access so the API can maintain a JSON cache in `storage/`

## Configuration

Fill in the required settings in `config.php` (or provide them via environment variables):

| Key | Description |
| --- | --- |
| `google_sheet_id` | ID portion of your Google Sheet URL |
| `google_sheet_range` | Range to read (default `Sheet1!A2:C`) |
| `google_client_email` | Service account email address |
| `google_private_key` | Service account private key (use `\n` for newlines when setting env vars) |
| `cache_file` | Path to the JSON cache (defaults to `storage/links-cache.json`) |
| `cache_ttl` | Cache lifetime in seconds (default `300`, i.e. 5 minutes) |

You can either edit `config.php` directly or set the corresponding environment variables (`GOOGLE_SHEET_ID`, `GOOGLE_SHEET_RANGE`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`). When environment variables are present they take priority.

## Usage
- `GET /index.php` – Returns cached link data. Fresh data is fetched from Google Sheets when the cache is missing or older than five minutes.
- `GET /index.php?refresh=1` – Forces a refresh attempt regardless of cache age. If the refresh fails, the previous cache is still returned.

Responses follow this structure:

```json
{
  "links": [
    {
      "title": "Example",
      "description": "Optional description",
      "url": "https://example.org"
    }
  ],
  "meta": {
    "stale": false,
    "age_seconds": 12,
    "fetched_at": 1733443200,
    "cache_ttl": 300,
    "cache_file": "/full/path/storage/links-cache.json",
    "source": "google_sheets"
  }
}
```

If Google Sheets cannot be reached, the API serves the most recent cached payload and marks `meta.stale` as `true`. When no cache is available, the response is a `500` error with diagnostic details.

## Deployment Notes
- Ensure the `storage/` directory is writable by the web server user.
- Keep your service account key private. If you prefer not to store it in the repo, remove it from `config.php` and load it through environment variables instead.
- Consider protecting this endpoint behind your own authentication if it should not be publicly accessible.
