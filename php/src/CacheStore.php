<?php

declare(strict_types=1);

class CacheStore
{
    private string $filePath;

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
    }

    public function read(): ?array
    {
        if (!is_file($this->filePath)) {
            return null;
        }

        $handle = fopen($this->filePath, 'r');
        if ($handle === false) {
            return null;
        }

        try {
            if (!flock($handle, LOCK_SH)) {
                return null;
            }

            $contents = stream_get_contents($handle);
            flock($handle, LOCK_UN);

            if ($contents === false || $contents === '') {
                return null;
            }

            $decoded = json_decode($contents, true);

            if (!is_array($decoded) || !isset($decoded['links'], $decoded['fetched_at'])) {
                return null;
            }

            return $decoded;
        } finally {
            fclose($handle);
        }
    }

    public function write(array $payload): void
    {
        $directory = dirname($this->filePath);

        if (!is_dir($directory)) {
            if (!mkdir($directory, 0775, true) && !is_dir($directory)) {
                throw new RuntimeException(sprintf('Unable to create cache directory: %s', $directory));
            }
        }

        $handle = fopen($this->filePath, 'c+');

        if ($handle === false) {
            throw new RuntimeException(sprintf('Unable to open cache file: %s', $this->filePath));
        }

        try {
            if (!flock($handle, LOCK_EX)) {
                throw new RuntimeException('Unable to lock cache file for writing.');
            }

            if (!ftruncate($handle, 0)) {
                throw new RuntimeException('Unable to truncate cache file.');
            }

            $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

            if ($json === false) {
                throw new RuntimeException('Unable to encode cache payload as JSON.');
            }

            if (fwrite($handle, $json) === false) {
                throw new RuntimeException('Unable to write cache data to file.');
            }

            fflush($handle);
            flock($handle, LOCK_UN);
        } finally {
            fclose($handle);
        }
    }
}
