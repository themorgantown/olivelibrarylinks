<?php

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
@set_time_limit(120); // Attempt to extend execution time

$config = require __DIR__ . '/config.php';

require __DIR__ . '/src/CacheStore.php';
require __DIR__ . '/src/GoogleSheetsService.php';
require __DIR__ . '/src/ImageExtractor.php';
require __DIR__ . '/src/ImageCacheService.php';

header('Content-Type: application/json');
// Cache for 5 minutes, allow stale content for 24 hours while revalidating
header('Cache-Control: public, max-age=300, stale-while-revalidate=86400');
header('Pragma: cache');

// Allow requests from any origin (or specify specific origins like http://localhost:3000)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if (strpos($origin, 'localhost') !== false) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    ensureExtensionsLoaded(['curl', 'openssl']);

    validateConfig($config);

    $cacheFile = $config['cache_file'] ?? (__DIR__ . '/storage/links-cache.json');
    $linksCacheTtl = (int) ($config['links_cache_ttl'] ?? ($config['cache_ttl'] ?? 300));
    $linksCacheTtl = $linksCacheTtl > 0 ? $linksCacheTtl : 300;

    $imageCacheTtl = (int) ($config['image_cache_ttl'] ?? 86400);
    $imageCacheTtl = $imageCacheTtl > 0 ? $imageCacheTtl : 86400;

    $cacheStore = new CacheStore($cacheFile);
    $sheetsService = new GoogleSheetsService($config);
    $maxDimension = (int) ($config['image_max_dimension'] ?? 650);
    $imageExtractor = new ImageExtractor();
    $storageDir = __DIR__ . '/storage';
    $imageCacheService = new ImageCacheService($storageDir, $maxDimension);

    // Occasional cleanup (1% chance)
    if (random_int(1, 100) === 1) {
        $imageCacheService->purgeOldFiles();
    }

    $cachedPayload = $cacheStore->read();
    $now = time();
    $forceRefresh = array_key_exists('refresh', $_GET);

    if (!$forceRefresh && isFresh($cachedPayload, $now, $linksCacheTtl)) {
        $links = $cachedPayload['links'];
        $fetchedAt = (int) $cachedPayload['fetched_at'];
        $age = max(0, $now - $fetchedAt);

        respond(200, [
            'links' => $links,
            'meta' => buildMeta(false, $age, $fetchedAt, $linksCacheTtl, $cacheFile, 'cache'),
        ]);
    }

    try {
        $links = enrichWithImages(
            $sheetsService->fetchLinks(),
            $imageExtractor,
            $imageCacheService,
            $cachedPayload['links'] ?? null,
            $imageCacheTtl,
            (bool) ($config['imagespreview'] ?? true),
            $forceRefresh,
            $now
        );
        $fetchedAt = time();

        // Count images
        $imgCount = 0;
        foreach ($links as $l) {
            if (!empty($l['image'])) $imgCount++;
        }

        $cacheStore->write([
            'links' => $links,
            'fetched_at' => $fetchedAt,
        ]);

        respond(200, [
            'links' => $links,
            'meta' => buildMeta(false, 0, $fetchedAt, $linksCacheTtl, $cacheFile, 'google_sheets'),
        ]);
    } catch (Throwable $innerException) {
        if ($cachedPayload !== null && isset($cachedPayload['links'], $cachedPayload['fetched_at'])) {
            $fetchedAt = (int) $cachedPayload['fetched_at'];
            $age = max(0, $now - $fetchedAt);

            respond(200, [
                'links' => $cachedPayload['links'],
                'meta' => buildMeta(true, $age, $fetchedAt, $linksCacheTtl, $cacheFile, 'stale_cache') + [
                    'error' => $innerException->getMessage(),
                ],
            ]);
        }

        throw $innerException;
    }
} catch (Throwable $exception) {
    respond(500, [
        'error' => 'Unable to fetch links',
        'details' => $exception->getMessage(),
    ]);
}

function respond(int $status, array $payload): void
{
    http_response_code($status);

    $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

    if ($json === false) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to encode response as JSON.',
        ]);
        exit;
    }

    echo $json;
    exit;
}

function validateConfig(array $config): void
{
    $required = ['google_sheet_id', 'google_sheet_range', 'google_client_email', 'google_private_key'];
    $missing = [];

    foreach ($required as $key) {
        if (!isset($config[$key]) || trim((string) $config[$key]) === '') {
            $missing[] = $key;
        }
    }

    if ($missing !== []) {
        throw new InvalidArgumentException('Missing configuration values: ' . implode(', ', $missing));
    }
}

function ensureExtensionsLoaded(array $extensions): void
{
    foreach ($extensions as $extension) {
        if (!extension_loaded($extension)) {
            throw new RuntimeException(sprintf('The required PHP extension "%s" is not available.', $extension));
        }
    }
}

function isFresh(?array $cachedPayload, int $now, int $ttl): bool
{
    if ($cachedPayload === null) {
        return false;
    }

    if (!isset($cachedPayload['fetched_at'])) {
        return false;
    }

    $fetchedAt = (int) $cachedPayload['fetched_at'];
    $age = $now - $fetchedAt;

    return $age >= 0 && $age < $ttl;
}

function buildMeta(bool $stale, int $age, int $fetchedAt, int $ttl, string $cacheFile, string $source): array
{
    return [
        'stale' => $stale,
        'age_seconds' => $age,
        'fetched_at' => $fetchedAt,
        'cache_ttl' => $ttl,
        'cache_file' => $cacheFile,
        'source' => $source,
    ];
}

/**
 * @param array<int, array<string, mixed>> $links
 * @param array<int, array<string, mixed>>|null $previousLinks
 * @return array<int, array<string, mixed>>
 */
function enrichWithImages(array $links, ImageExtractor $imageExtractor, ImageCacheService $imageCacheService, ?array $previousLinks, int $imageCacheTtl, bool $imagesPreview, bool $forceRefresh, int $now): array
{
    $previousByUrl = [];

    if ($previousLinks !== null) {
        foreach ($previousLinks as $prior) {
            if (isset($prior['url'], $prior['image']) && is_string($prior['url']) && is_string($prior['image'])) {
                $previousByUrl[$prior['url']] = [
                    'image' => $prior['image'],
                    'fetched_at' => isset($prior['image_fetched_at']) ? (int) $prior['image_fetched_at'] : null,
                ];
            }
        }
    }

    foreach ($links as $index => $link) {
        if (!isset($link['url']) || !is_string($link['url']) || $link['url'] === '') {
            continue;
        }

        $image = null;
        $imageFetchedAt = null;

        if (!$imagesPreview) {
            $links[$index]['image'] = null;
            continue;
        }

        $previous = $previousByUrl[$link['url']] ?? null;
        $previousFetchedAt = is_array($previous) && isset($previous['fetched_at']) ? (int) $previous['fetched_at'] : null;
        $canReusePrevious = !$forceRefresh
            && $previous !== null
            && $previous['image'] !== null
            && $previousFetchedAt !== null
            && ($now - $previousFetchedAt) < $imageCacheTtl;

        if ($canReusePrevious) {
            $image = $previous['image'];
            $imageFetchedAt = $previousFetchedAt;
        } else {
            // Safety check: Stop extracting new images if we're running long (over 15s)
            // This prevents a single request from hitting the PHP timeout (usually 30s) and crashing,
            // which would cause the entire cache update to fail.
            if ((time() - $now) > 15) {
               $image = null;
            } else {
                try {
                    $image = $imageExtractor->extract($link['url']);
                    $imageFetchedAt = $image !== null ? $now : null;
                } catch (Throwable) {
                    $image = null;
                }
            }
        }

        if ($image !== null) {
            $localImage = $imageCacheService->getLocalImage($image);
            if ($localImage !== null) {
                $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']);
                $links[$index]['image'] = rtrim($baseUrl, '/') . '/storage/' . $localImage;
            } else {
                $links[$index]['image'] = $image; // Fallback to remote if local fails
            }
            
            if ($imageFetchedAt !== null) {
                $links[$index]['image_fetched_at'] = $imageFetchedAt;
            }
        }
    }

    return $links;
}
