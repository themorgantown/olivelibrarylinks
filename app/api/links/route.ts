import { NextResponse } from 'next/server';
import { getLinksFromSheet } from '@/lib/google-sheets';

// Cache control headers for 10 minutes
const CACHE_CONTROL_HEADERS = {
  'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300'
};

// API route handler to fetch links from the Google Sheet
export async function GET() {
  try {
    const links = await getLinksFromSheet();
    
    // Return response with caching headers
    return NextResponse.json(
      { links },
      { 
        status: 200,
        headers: CACHE_CONTROL_HEADERS 
      }
    );
  } catch (error) {
    console.error('Error in links API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// Export a revalidate setting for the route
export const revalidate = 600; // Revalidate this data at most every 10 minutes
