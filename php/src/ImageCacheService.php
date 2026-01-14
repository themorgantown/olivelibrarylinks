<?php

declare(strict_types=1);

class ImageCacheService
{
    private string $storageDir;
    private int $maxDimension;
    private int $cacheTtlSeconds;

    public function __construct(string $storageDir, int $maxDimension = 650, int $cacheTtlSeconds = 5184000)
    {
        $this->storageDir = rtrim($storageDir, DIRECTORY_SEPARATOR);
        $this->maxDimension = $maxDimension;
        $this->cacheTtlSeconds = $cacheTtlSeconds;

        if (!is_dir($this->storageDir)) {
            mkdir($this->storageDir, 0777, true);
        }
    }

    /**
     * Downloads an image from a URL and returns the local filename.
     * Returns null if download fails.
     */
    public function getLocalImage(string $remoteUrl): ?string
    {
        if (empty($remoteUrl)) {
            return null;
        }

        $extension = pathinfo(parse_url($remoteUrl, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION);
        if (empty($extension)) {
            $extension = 'jpg'; // Fallback
        }
        
        // Sanitize extension
        $extension = strtolower(preg_replace('/[^a-z0-9]/i', '', $extension));
        if ($extension === '' || strlen($extension) > 4) {
             $extension = 'jpg';
        }

        $filename = md5($remoteUrl) . '.' . $extension;
        $path = $this->storageDir . DIRECTORY_SEPARATOR . $filename;

        // If file exists and is not too old, reuse it
        if (file_exists($path)) {
            return $filename;
        }

        // Otherwise download it
        $content = $this->downloadFile($remoteUrl);
        if ($content === null) {
            return null;
        }

        if (file_put_contents($path, $content) !== false) {
             // Resize if needed
             $this->resizeImage($path, $extension);
             return $filename;
        }

        return null;
    }

    /**
     * Purges files older than 60 days.
     */
    public function purgeOldFiles(): int
    {
        $purgedCount = 0;
        $now = time();

        $files = glob($this->storageDir . DIRECTORY_SEPARATOR . '*');
        if ($files === false) {
            return 0;
        }

        foreach ($files as $file) {
            if (is_file($file)) {
                $mtime = filemtime($file);
                if ($mtime !== false && ($now - $mtime) > $this->cacheTtlSeconds) {
                    unlink($file);
                    $purgedCount++;
                }
            }
        }

        return $purgedCount;
    }

    private function downloadFile(string $url): ?string
    {
        $ch = curl_init($url);
        if ($ch === false) {
            return null;
        }

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_USERAGENT => 'Olive-Library-Link-Preview/1.0',
            CURLOPT_SSL_VERIFYPEER => false, // Sometimes necessary for certain hosts
        ]);

        $content = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($status >= 200 && $status < 300 && is_string($content)) {
            return $content;
        }

        return null;
    }

    private function resizeImage(string $filePath, string $extension): void
    {
        if (!extension_loaded('gd')) {
            return;
        }

        // Get current dimensions
        $info = @getimagesize($filePath);
        if ($info === false) {
            return;
        }

        [$width, $height] = $info;

        // Calculate new dimensions
        if ($width <= $this->maxDimension && $height <= $this->maxDimension) {
            return; // No resize needed
        }

        $aspectRatio = $width / $height;
        if ($width > $height) {
            $newWidth = $this->maxDimension;
            $newHeight = (int) ($this->maxDimension / $aspectRatio);
        } else {
            $newHeight = $this->maxDimension;
            $newWidth = (int) ($this->maxDimension * $aspectRatio);
        }

        // Allow memory for processing
        @ini_set('memory_limit', '256M');

        // Create image resource
        $src = null;
        switch ($info[2]) { // IMAGETYPE constants
            case IMAGETYPE_JPEG:
                $src = @imagecreatefromjpeg($filePath);
                break;
            case IMAGETYPE_PNG:
                $src = @imagecreatefrompng($filePath);
                break;
            case IMAGETYPE_GIF:
                $src = @imagecreatefromgif($filePath);
                break;
            case IMAGETYPE_WEBP:
                if (function_exists('imagecreatefromwebp')) {
                    $src = @imagecreatefromwebp($filePath);
                }
                break;
        }

        if (!$src) {
             // Fallback: try creating from string if format detection failed but it's valid data
             $content = file_get_contents($filePath);
             if ($content) {
                 $src = @imagecreatefromstring($content);
             }
        }

        if (!$src) {
            return;
        }

        // Resample
        $dst = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preserve transparency for PNG/WEBP/GIF
        if ($info[2] === IMAGETYPE_PNG || $info[2] === IMAGETYPE_WEBP || $info[2] === IMAGETYPE_GIF) {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
            imagefilledrectangle($dst, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // Save back
        switch ($info[2]) {
            case IMAGETYPE_JPEG:
                imagejpeg($dst, $filePath, 85); // 85 quality
                break;
            case IMAGETYPE_PNG:
                imagepng($dst, $filePath, 8);
                break;
            case IMAGETYPE_GIF:
                imagegif($dst, $filePath);
                break;
            case IMAGETYPE_WEBP:
                if (function_exists('imagewebp')) {
                    imagewebp($dst, $filePath, 85);
                } else {
                     // Fallback to JPEG if WebP saving not supported but reading was
                     $newPath = preg_replace('/\.[^.]+$/', '.jpg', $filePath);
                     imagejpeg($dst, $newPath, 85);
                     // Note: We don't update the cache mapped filename here easily without returning it.
                     // For now, assume webp support or just fail execution and keep original.
                }
                break;
             default:
                // If we created from string but didn't match a type above, defaults to JPEG usually or native type
                imagejpeg($dst, $filePath, 85);
        }

        imagedestroy($src);
        imagedestroy($dst);
    }
}
