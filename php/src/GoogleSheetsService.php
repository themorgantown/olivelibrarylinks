<?php

declare(strict_types=1);

class GoogleSheetsService
{
    private const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
    private const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * @return array<int, array<string, string>>
     */
    public function fetchLinks(): array
    {
        $accessToken = $this->getAccessToken();

        $sheetId = $this->config['google_sheet_id'] ?? '';
        $range = $this->config['google_sheet_range'] ?? '';

        if ($sheetId === '' || $range === '') {
            throw new InvalidArgumentException('Google Sheets ID or range is missing.');
        }

        $encodedRange = rawurlencode($range);
        $url = sprintf('https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s', $sheetId, $encodedRange);

        $response = $this->request('GET', $url, null, [
            'Authorization: Bearer ' . $accessToken,
            'Accept: application/json',
        ]);

        $decoded = json_decode($response['body'], true);

        if (!is_array($decoded) || !isset($decoded['values']) || !is_array($decoded['values'])) {
            throw new RuntimeException('Unexpected response from Google Sheets API.');
        }

        $links = [];

        foreach ($decoded['values'] as $row) {
            if (!is_array($row)) {
                continue;
            }

            $title = trim($row[0] ?? '');
            $description = trim($row[1] ?? '');
            $urlValue = trim($row[2] ?? '');

            if ($title === '') {
                continue;
            }

            $link = [
                'title' => $title,
                'url' => $urlValue,
            ];

            if ($description !== '') {
                $link['description'] = $description;
            }

            $links[] = $link;
        }

        return $links;
    }

    private function getAccessToken(): string
    {
        $clientEmail = $this->config['google_client_email'] ?? '';
        $privateKey = $this->config['google_private_key'] ?? '';

        if ($clientEmail === '' || $privateKey === '') {
            throw new InvalidArgumentException('Google service account credentials are missing.');
        }

        $privateKey = $this->normalizePrivateKey($privateKey);

        $jwt = $this->buildJwt($clientEmail, $privateKey);

        $response = $this->request('POST', self::TOKEN_ENDPOINT, http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]), [
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json',
        ]);

        $decoded = json_decode($response['body'], true);

        if (!is_array($decoded) || !isset($decoded['access_token'])) {
            throw new RuntimeException('Unable to obtain access token from Google.');
        }

        return (string) $decoded['access_token'];
    }

    private function normalizePrivateKey(string $privateKey): string
    {
        if (str_contains($privateKey, '\\n')) {
            $privateKey = str_replace('\\n', "\n", $privateKey);
        }

        if (!str_contains($privateKey, 'BEGIN PRIVATE KEY')) {
            return $privateKey;
        }

        return $privateKey;
    }

    private function buildJwt(string $clientEmail, string $privateKey): string
    {
        $now = time();
        $header = ['alg' => 'RS256', 'typ' => 'JWT'];
        $payload = [
            'iss' => $clientEmail,
            'scope' => self::SHEETS_SCOPE,
            'aud' => self::TOKEN_ENDPOINT,
            'exp' => $now + 3600,
            'iat' => $now,
        ];

        $segments = [
            $this->base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR)),
            $this->base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR)),
        ];

        $dataToSign = implode('.', $segments);

        $key = openssl_pkey_get_private($privateKey);

        if ($key === false) {
            throw new RuntimeException('Unable to parse the provided private key.');
        }

        try {
            $signature = '';
            $success = openssl_sign($dataToSign, $signature, $key, 'sha256WithRSAEncryption');

            if ($success === false || $signature === '') {
                throw new RuntimeException('Failed to sign JWT with the provided private key.');
            }
        } finally {
            openssl_free_key($key);
        }

        $segments[] = $this->base64UrlEncode($signature);

        return implode('.', $segments);
    }

    /**
     * @param array<int, string> $extraHeaders
     * @return array{status:int, body:string}
     */
    private function request(string $method, string $url, ?string $body = null, array $extraHeaders = []): array
    {
        $ch = curl_init();

        if ($ch === false) {
            throw new RuntimeException('Unable to initialize cURL.');
        }

        $headers = array_merge([
            'User-Agent: Olive-Library-Links-PHP-Client/1.0',
        ], $extraHeaders);

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 20,
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body ?? '');
        }

        $responseBody = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($responseBody === false) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new RuntimeException(sprintf('HTTP request failed: %s', $error));
        }

        curl_close($ch);

        if ($statusCode >= 400) {
            throw new RuntimeException(sprintf('HTTP request returned status %d: %s', $statusCode, $responseBody));
        }

        return [
            'status' => $statusCode,
            'body' => $responseBody,
        ];
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
