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
    
    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error in links API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}
