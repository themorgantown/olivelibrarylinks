<?php

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');

$config = require __DIR__ . '/config.php';

require __DIR__ . '/src/CacheStore.php';
require __DIR__ . '/src/GoogleSheetsService.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, must-revalidate');
header('Pragma: no-cache');

// Allow requests from any origin (or specify specific origins like http://localhost:3000)
header('Access-Control-Allow-Origin: *');
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
    $cacheTtl = (int) ($config['cache_ttl'] ?? 300);
    $cacheTtl = $cacheTtl > 0 ? $cacheTtl : 300;

    $cacheStore = new CacheStore($cacheFile);
    $sheetsService = new GoogleSheetsService($config);

    $cachedPayload = $cacheStore->read();
    $now = time();
    $forceRefresh = array_key_exists('refresh', $_GET);

    if (!$forceRefresh && isFresh($cachedPayload, $now, $cacheTtl)) {
        $links = $cachedPayload['links'];
        $fetchedAt = (int) $cachedPayload['fetched_at'];
        $age = max(0, $now - $fetchedAt);

        respond(200, [
            'links' => $links,
            'meta' => buildMeta(false, $age, $fetchedAt, $cacheTtl, $cacheFile, 'cache'),
        ]);
    }

    try {
        $links = $sheetsService->fetchLinks();
        $fetchedAt = time();

        $cacheStore->write([
            'links' => $links,
            'fetched_at' => $fetchedAt,
        ]);

        respond(200, [
            'links' => $links,
            'meta' => buildMeta(false, 0, $fetchedAt, $cacheTtl, $cacheFile, 'google_sheets'),
        ]);
    } catch (Throwable $innerException) {
        if ($cachedPayload !== null && isset($cachedPayload['links'], $cachedPayload['fetched_at'])) {
            $fetchedAt = (int) $cachedPayload['fetched_at'];
            $age = max(0, $now - $fetchedAt);

            respond(200, [
                'links' => $cachedPayload['links'],
                'meta' => buildMeta(true, $age, $fetchedAt, $cacheTtl, $cacheFile, 'stale_cache') + [
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
