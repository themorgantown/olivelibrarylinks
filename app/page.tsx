'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LinkContainer from './components/LinkContainer';
import type { LinkItem, ApiResponse } from '@/lib/types';

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://thestrange.foundation/olivefreelibrarylinks/php/index.php';

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const hasLoadedRef = useRef(false);

  const fetchLinks = useCallback(
    async (forceRefresh = false) => {
      const endpoint = forceRefresh
        ? `${API_ENDPOINT}${API_ENDPOINT.includes('?') ? '&' : '?'}refresh=1`
        : API_ENDPOINT;

      try {
        if (!hasLoadedRef.current && !forceRefresh) {
          setLoading(true);
        }

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as ApiResponse;

        if (!data || !Array.isArray(data.links)) {
          throw new Error('The API returned an unexpected response.');
        }

        setLinks(data.links);
        setError(null);
        setLastUpdated(Date.now());
        hasLoadedRef.current = true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error fetching links.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchLinks(false);

    const interval = window.setInterval(() => {
      void fetchLinks(false);
    }, 5 * 60 * 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchLinks]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) {
      return null;
    }

    return new Date(lastUpdated).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [lastUpdated]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <header className="w-full max-w-3xl mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#3a4b20] mb-2 playfair-display-header">Olive Free Library Links</h1>
        <div className="h-1 w-24 bg-[#3a4b2066] mx-auto"></div>
      </header>

      <main className="w-full max-w-6xl flex-1">
        {loading && (
          <div className="text-center p-6 bg-[#d9d9d9] shadow rounded-md text-[#5B5B66]">
            Loading links…
          </div>
        )}

        {error && (
          <div className="text-center p-6 mb-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
            <p className="font-semibold">Unable to load links.</p>
            <p className="mt-2 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => fetchLinks(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#3a4b20] px-4 py-2 text-white transition hover:bg-[#2c3718]"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <LinkContainer links={links} />
        )}
      </main>

      <footer className="mt-12 text-center text-sm">
        <p>
          <a
            href="https://www.olivefreelibrary.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#3a4b20] transition-colors"
          >
            Olive Free Library
          </a>
        </p>
        <div className="flex justify-center space-x-4 mt-3">
          <a
            href="https://www.instagram.com/olivefreelibrary/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#3a4b20] transition-colors"
            aria-label="Visit our Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/olivelibrary"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#3a4b20] transition-colors"
            aria-label="Visit our Facebook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
