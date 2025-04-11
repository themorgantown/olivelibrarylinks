import { NextResponse } from 'next/server';
import { getLinksFromSheet } from '@/lib/google-sheets';

// API route handler to fetch links from the Google Sheet
export async function GET() {
  try {
    const links = await getLinksFromSheet();
    
    // Log data in development mode (server-side)
    if (process.env.NODE_ENV === 'development') {
      console.log('Server-side - Google Sheets data fetched:', JSON.stringify(links, null, 2));
    }
    
    // Set cache headers to cache for 5 minutes (300 seconds)
    // s-maxage=300: Cache in the Vercel edge network for 5 minutes
    // stale-while-revalidate: Allow serving stale content while revalidating in the background
    return NextResponse.json({ links }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate'
      }
    });
  } catch (error) {
    console.error('Error in links API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}
