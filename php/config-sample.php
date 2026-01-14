<?php

$manualConfig = [
    // Fill these in if you prefer file-based configuration.
    'google_sheet_id' => 'xxx',
    'google_sheet_range' => 'Sheet1!A2:C',
    'google_client_email' => 'xxx',
    'google_private_key' => 'xxx',
    'cache_file' => __DIR__ . '/storage/links-cache.json',
    'links_cache_ttl' => 300,
    'image_cache_ttl' => 86400,
    'imagespreview' => true,
];

return [
    // Google Sheets configuration
    'google_sheet_id' => getenv('GOOGLE_SHEET_ID') ?: $manualConfig['google_sheet_id'],
    'google_sheet_range' => getenv('GOOGLE_SHEET_RANGE') ?: $manualConfig['google_sheet_range'],
    'google_client_email' => getenv('GOOGLE_CLIENT_EMAIL') ?: $manualConfig['google_client_email'],
    'google_private_key' => getenv('GOOGLE_PRIVATE_KEY') ?: $manualConfig['google_private_key'],

    // Cache configuration
    'cache_file' => getenv('CACHE_FILE') ?: $manualConfig['cache_file'],
    'links_cache_ttl' => getenv('LINKS_CACHE_TTL') ? (int) getenv('LINKS_CACHE_TTL') : (int) ($manualConfig['links_cache_ttl'] ?? 300),
    'image_cache_ttl' => getenv('IMAGE_CACHE_TTL') ? (int) getenv('IMAGE_CACHE_TTL') : (int) ($manualConfig['image_cache_ttl'] ?? 86400),
];
