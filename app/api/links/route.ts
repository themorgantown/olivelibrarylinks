import { NextResponse } from 'next/server';
import { getLinksFromSheet } from '@/lib/google-sheets';

// API route handler to fetch links from the Google Sheet
export async function GET() {
  try {
    const links = await getLinksFromSheet();
    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error in links API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}
