import { Link } from '@/lib/google-sheets';
import LinkContainer from './components/LinkContainer';

// This enables ISR (Incremental Static Regeneration)
export const revalidate = 600; // Revalidate at most every 10 minutes

// Using server components to fetch data
async function getLinks(): Promise<Link[]> {
  try {
    // Use Cloudflare worker URL in production, fallback to local API in dev
    const apiUrl = process.env.NEXT_PUBLIC_WORKER_URL || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/links`;
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 600 }, // Cache for 10 minutes
    });
    
    if (!response.ok) throw new Error('Failed to fetch links');
    
    const data = await response.json();
    return data.links || [];
  } catch (error) {
    console.error('Error fetching links:', error);
    return [];
  }
}

export default async function Home() {
  const links = await getLinks();
  
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <header className="w-full max-w-md mb-12 text-center">
        <h1 className="text-3xl font-bold heading mb-2">Olive Free Library Links</h1>
        <div className="h-1 w-24 mx-auto heading opacity-40"></div>
      </header>
      
      <main className="w-full flex-1">
        <LinkContainer links={links} />
      </main>
      
      <footer className="mt-12 text-center text-sm">
        <p>
          <a 
            href="https://www.olivefreelibrary.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            Olive Free Library
          </a>
        </p>
        <div className="flex justify-center space-x-4 mt-3">
          <a 
            href="https://www.instagram.com/olivefreelibrary/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Visit our Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a 
            href="https://www.facebook.com/OliveFreeLibrary/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Visit our Facebook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
