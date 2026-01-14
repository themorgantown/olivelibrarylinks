<?php

declare(strict_types=1);

class ImageExtractor
{
    private const MAX_DOWNLOAD_BYTES = 2_097_152; // 2 MB cap
    private const TIMEOUT_SECONDS = 10;
    private const CONNECT_TIMEOUT_SECONDS = 5;

    public function extract(string $url): ?string
    {
        if ($url === '' || !$this->isHttpUrl($url)) {
            return null;
        }

        $html = $this->fetchHtml($url);

        if ($html === null || $html === '') {
            return null;
        }

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $loaded = @$dom->loadHTML($html);
        libxml_clear_errors();

        if ($loaded === false) {
            return null;
        }

        $baseHref = $this->getBaseHref($dom);
        $xpath = new DOMXPath($dom);

        $candidates = [];

        $this->collectFeaturedImages($xpath, $url, $baseHref, $candidates);
        $this->collectCmsPrimaryImages($xpath, $url, $baseHref, $candidates);
        $this->collectArticleImages($xpath, $url, $baseHref, $candidates);
        $this->collectMetaImages($xpath, $url, $baseHref, $candidates);
        $this->collectFallbackImages($xpath, $url, $baseHref, $candidates);

        $chosen = $this->chooseBest($candidates);

        $this->logSelection($url, $candidates, $chosen);

        return $chosen;
    }

    private function collectFeaturedImages(DOMXPath $xpath, string $pageUrl, ?string $baseHref, array &$candidates): void
    {
        $featuredClasses = [
            'post-thumbnail',
            'wp-post-image',
            'attachment-post-thumbnail',
            'featured',
            'featured-image',
            'entry-thumb',
            'newspack-featured-image',
            'article-featured-image',
            'single-featured-image',
        ];

        $classPredicates = array_map(static function (string $class): string {
            return sprintf("contains(concat(' ', normalize-space(@class), ' '), ' %s ')", $class);
        }, $featuredClasses);

        $predicate = implode(' or ', $classPredicates);

        $query = sprintf('//img[(%s)]', $predicate);

        /** @var DOMElement $img */
        foreach ($xpath->query($query) as $img) {
            $candidate = $this->buildImgCandidate($img, $pageUrl, $baseHref, 110);
            if ($candidate !== null) {
                $candidates[] = $candidate;
            }
        }

        // Also catch images inside figure.post-thumbnail wrappers.
        /** @var DOMElement $img */
        foreach ($xpath->query("//figure[contains(concat(' ', normalize-space(@class), ' '), ' post-thumbnail ')]//img[@src or @srcset]") as $img) {
            $candidate = $this->buildImgCandidate($img, $pageUrl, $baseHref, 110);
            if ($candidate !== null) {
                $candidates[] = $candidate;
            }
        }
    }

    private function collectCmsPrimaryImages(DOMXPath $xpath, string $pageUrl, ?string $baseHref, array &$candidates): void
    {
        // Common CMS wrappers: WordPress, Drupal, Joomla, Ghost, Squarespace, Wix, Blogger, Shopify blogs, Medium.
        $wrappers = [
            "//main[contains(@class,'site-main')]//img[@src or @srcset]",
            "//div[contains(@class,'entry-content')]//img[@src or @srcset]",
            "//div[contains(@class,'post-content')]//img[@src or @srcset]",
            "//div[contains(@class,'article-content')]//img[@src or @srcset]",
            "//div[contains(@class,'post-body')]//img[@src or @srcset]",
            "//div[contains(@class,'story-body')]//img[@src or @srcset]",
            "//div[contains(@class,'c-article-content')]//img[@src or @srcset]",
            "//div[contains(@class,'article__content')]//img[@src or @srcset]",
            "//div[contains(@class,'content-area')]//img[@src or @srcset]",
            "//section[contains(@class,'post')]//img[@src or @srcset]",
        ];

        foreach ($wrappers as $query) {
            /** @var DOMElement $img */
            foreach ($xpath->query($query) as $img) {
                $candidate = $this->buildImgCandidate($img, $pageUrl, $baseHref, 105);
                if ($candidate !== null) {
                    $candidates[] = $candidate;
                }
            }
        }

        // Picture tags often used by modern CMS themes; take the best source.
        /** @var DOMElement $picture */
        foreach ($xpath->query('//picture') as $picture) {
            $best = $this->pickFromPicture($picture, $pageUrl, $baseHref);
            if ($best !== null) {
                $candidates[] = [
                    'url' => $best['url'],
                    'priority' => 105,
                    'score' => $best['score'],
                ];
            }
        }
    }

    private function collectArticleImages(DOMXPath $xpath, string $pageUrl, ?string $baseHref, array &$candidates): void
    {
        /** @var DOMElement $img */
        foreach ($xpath->query('//article//img[@src or @srcset]') as $img) {
            $candidate = $this->buildImgCandidate($img, $pageUrl, $baseHref, 100);
            if ($candidate !== null) {
                $candidates[] = $candidate;
            }
        }
    }

    private function collectMetaImages(DOMXPath $xpath, string $pageUrl, ?string $baseHref, array &$candidates): void
    {
        $metaProps = [
            'og:image',
            'og:image:secure_url',
            'twitter:image',
            'twitter:image:src',
        ];

        foreach ($metaProps as $prop) {
            $nodeList = $xpath->query(sprintf('//meta[@property="%s" or @name="%s"]/@content', $prop, $prop));
            if ($nodeList === false) {
                continue;
            }

            foreach ($nodeList as $node) {
                $value = trim($node->nodeValue ?? '');
                $resolved = $this->resolveUrl($value, $pageUrl, $baseHref);

                if ($resolved !== null) {
                    $candidates[] = [
                        'url' => $resolved,
                        'priority' => 120, // Boosted priority above others
                        'score' => 1000,   // High initial score for meta images
                    ];
                }
            }
        }

        $linkNodes = $xpath->query('//link[@rel="image_src"]/@href');

        if ($linkNodes !== false) {
            foreach ($linkNodes as $node) {
                $value = trim($node->nodeValue ?? '');
                $resolved = $this->resolveUrl($value, $pageUrl, $baseHref);

                if ($resolved !== null) {
                    $candidates[] = [
                        'url' => $resolved,
                        'priority' => 60,
                        'score' => 0,
                    ];
                }
            }
        }
    }

    private function collectFallbackImages(DOMXPath $xpath, string $pageUrl, ?string $baseHref, array &$candidates): void
    {
        /** @var DOMElement $img */
        foreach ($xpath->query('//img[@src or @srcset]') as $img) {
            $candidate = $this->buildImgCandidate($img, $pageUrl, $baseHref, 40);
            if ($candidate !== null) {
                $candidates[] = $candidate;
            }
        }
    }

    private function buildImgCandidate(DOMElement $img, string $pageUrl, ?string $baseHref, int $priority): ?array
    {
        $src = trim((string) $img->getAttribute('src'));
        $srcset = trim((string) $img->getAttribute('srcset'));

        $bestFromSrcset = $this->pickFromSrcset($srcset, $pageUrl, $baseHref);

        $resolvedSrc = $this->resolveUrl($src, $pageUrl, $baseHref);

        $bestUrl = $bestFromSrcset['url'] ?? $resolvedSrc;
        $score = $bestFromSrcset['score'] ?? $this->estimateScoreFromAttributes($img);

        if ($bestUrl === null) {
            return null;
        }

        return [
            'url' => $bestUrl,
            'priority' => $priority,
            'score' => $score,
        ];
    }

    private function pickFromSrcset(string $srcset, string $pageUrl, ?string $baseHref): ?array
    {
        if ($srcset === '') {
            return null;
        }

        $best = null;

        foreach (explode(',', $srcset) as $part) {
            $trimmed = trim($part);

            if ($trimmed === '') {
                continue;
            }

            $pieces = preg_split('/\s+/', $trimmed);
            $urlPart = $pieces[0] ?? '';
            $descriptor = $pieces[1] ?? '';

            $resolved = $this->resolveUrl($urlPart, $pageUrl, $baseHref);

            if ($resolved === null) {
                continue;
            }

            $score = 0;

            if (preg_match('/^(\d+)(w|x)?$/', $descriptor, $matches) === 1) {
                $value = (int) $matches[1];
                $score = $matches[2] === 'x' ? $value * 1000 : $value;
            }

            if ($best === null || $score > $best['score']) {
                $best = [
                    'url' => $resolved,
                    'score' => $score,
                ];
            }
        }

        return $best;
    }

    private function pickFromPicture(DOMElement $picture, string $pageUrl, ?string $baseHref): ?array
    {
        $best = null;

        /** @var DOMElement $source */
        foreach ($picture->getElementsByTagName('source') as $source) {
            $srcset = trim((string) $source->getAttribute('srcset'));
            $candidate = $this->pickFromSrcset($srcset, $pageUrl, $baseHref);
            if ($candidate !== null && ($best === null || $candidate['score'] > $best['score'])) {
                $best = $candidate;
            }
        }

        // Fallback to img inside picture
        $images = $picture->getElementsByTagName('img');
        if ($images->length > 0) {
            $imgCandidate = $this->buildImgCandidate($images->item(0), $pageUrl, $baseHref, 0);
            if ($imgCandidate !== null && ($best === null || $imgCandidate['score'] > $best['score'])) {
                $best = [
                    'url' => $imgCandidate['url'],
                    'score' => $imgCandidate['score'],
                ];
            }
        }

        return $best;
    }

    private function estimateScoreFromAttributes(DOMElement $img): int
    {
        $width = (int) $img->getAttribute('width');
        $height = (int) $img->getAttribute('height');

        if ($width > 0 && $height > 0) {
            return $width * $height;
        }

        if ($width > 0) {
            return $width * $width;
        }

        if ($height > 0) {
            return $height * $height;
        }

        return 0;
    }

    private function chooseBest(array $candidates): ?string
    {
        if ($candidates === []) {
            return null;
        }

        usort($candidates, static function (array $a, array $b): int {
            if ($a['priority'] !== $b['priority']) {
                return $b['priority'] <=> $a['priority'];
            }
            return $b['score'] <=> $a['score'];
        });

        return $candidates[0]['url'] ?? null;
    }

    private function logSelection(string $pageUrl, array $candidates, ?string $chosen): void
    {
        // Minimal server-side logging to aid debugging missing images. Does not leak HTML contents.
        $count = count($candidates);
        $preview = array_slice($candidates, 0, 5);

        $summary = [
            'page' => $pageUrl,
            'candidates' => array_map(static function (array $c): array {
                return [
                    'url' => $c['url'],
                    'priority' => $c['priority'],
                    'score' => $c['score'],
                ];
            }, $preview),
            'total_candidates' => $count,
            'chosen' => $chosen,
        ];

        error_log('[ImageExtractor] selection: ' . json_encode($summary));
    }

    private function fetchHtml(string $url): ?string
    {
        $ch = curl_init();

        if ($ch === false) {
            return null;
        }

        $buffer = '';
        $maxBytes = self::MAX_DOWNLOAD_BYTES;

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_CONNECTTIMEOUT => self::CONNECT_TIMEOUT_SECONDS,
            CURLOPT_TIMEOUT => self::TIMEOUT_SECONDS,
            CURLOPT_USERAGENT => 'Olive-Library-Link-Preview/1.0',
            CURLOPT_WRITEFUNCTION => static function ($ch, string $data) use (&$buffer, $maxBytes) {
                $length = strlen($data);
                $current = strlen($buffer);

                if ($current >= $maxBytes) {
                    return 0;
                }

                $allowed = $maxBytes - $current;
                $buffer .= $allowed >= $length ? $data : substr($data, 0, $allowed);

                return $length;
            },
        ]);

        $ok = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $errorCode = curl_errno($ch);
        curl_close($ch);

        if ($ok === false && $errorCode !== CURLE_WRITE_ERROR) {
            return null;
        }

        if ($statusCode >= 400) {
            return null;
        }

        return $buffer;
    }

    private function getBaseHref(DOMDocument $dom): ?string
    {
        $tags = $dom->getElementsByTagName('base');

        if ($tags->length === 0) {
            return null;
        }

        $href = trim((string) $tags->item(0)?->getAttribute('href'));

        return $href !== '' ? $href : null;
    }

    private function resolveUrl(string $value, string $pageUrl, ?string $baseHref): ?string
    {
        if ($value === '') {
            return null;
        }

        $trimmed = trim($value);

        if (str_starts_with($trimmed, 'data:')) {
            return null;
        }

        if (preg_match('#^https?://#i', $trimmed) === 1) {
            return $this->isHttpUrl($trimmed) ? $trimmed : null;
        }

        if (str_starts_with($trimmed, '//')) {
            $scheme = parse_url($pageUrl, PHP_URL_SCHEME) ?: 'https';
            $resolved = $scheme . ':' . $trimmed;

            return $this->isHttpUrl($resolved) ? $resolved : null;
        }

        $base = $baseHref ?: $pageUrl;

        $parsed = parse_url($base);

        if ($parsed === false || !isset($parsed['scheme'], $parsed['host'])) {
            return null;
        }

        $scheme = $parsed['scheme'];
        $host = $parsed['host'];
        $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';
        $path = $parsed['path'] ?? '/';

        $dir = str_ends_with($path, '/') ? $path : dirname($path) . '/';
        $normalizedPath = $this->normalizePath($dir . ltrim($trimmed, '/'));

        $resolved = sprintf('%s://%s%s%s', $scheme, $host, $port, $normalizedPath);

        return $this->isHttpUrl($resolved) ? $resolved : null;
    }

    private function normalizePath(string $path): string
    {
        $segments = explode('/', $path);
        $resolved = [];

        foreach ($segments as $segment) {
            if ($segment === '' || $segment === '.') {
                continue;
            }

            if ($segment === '..') {
                array_pop($resolved);
                continue;
            }

            $resolved[] = $segment;
        }

        return '/' . implode('/', $resolved);
    }

    private function isHttpUrl(string $url): bool
    {
        $scheme = parse_url($url, PHP_URL_SCHEME);

        if ($scheme === null) {
            return false;
        }

        return in_array(strtolower($scheme), ['http', 'https'], true);
    }
}
