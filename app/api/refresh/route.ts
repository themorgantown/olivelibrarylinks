import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    // Revalidate the cache for google-sheets-links
    revalidateTag('google-sheets-links');
    
    // Redirect back to the home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error revalidating cache:', error);
    return NextResponse.json({ error: 'Failed to revalidate cache' }, { status: 500 });
  }
}
