// Cloudflare Worker to cache Google Sheets data for 10 minutes

async function fetchGoogleSheetsData(env) {
  try {
    const clientEmail = env.GOOGLE_CLIENT_EMAIL;
    const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const spreadsheetId = env.GOOGLE_SHEET_ID;
    const range = env.GOOGLE_SHEET_RANGE || 'Sheet1!A2:C';
    
    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: generateJWT(clientEmail, privateKey),
      }),
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Fetch data from Google Sheets
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    const sheetsData = await sheetsResponse.json();
    
    // Format data similar to your existing API
    const links = (sheetsData.values || []).map(row => ({
      title: row[0] || '',
      url: row[1] || '',
      description: row[2] || '',
    })).filter(link => link.title && link.url);
    
    return { links };
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return { error: 'Failed to fetch data', links: [] };
  }
}

// Generate a JWT token for Google authentication
function generateJWT(clientEmail, privateKey) {
  // This is a simplified JWT implementation
  // In a production environment, use a JWT library
  // or the jose library for proper JWT generation
  
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Note: This is a placeholder. In production, use proper JWT signing
  // The actual signing would require RSA-SHA256 which isn't implemented here
  // You would need to use the SubtleCrypto API or a library
  
  return `${encodedHeader}.${encodedPayload}.signature`;
}

export default {
  async fetch(request, env, ctx) {
    // Define CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    
    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    // Use Cloudflare's cache
    const cacheKey = new Request(request.url);
    const cache = caches.default;
    
    // Check if we have a cached response
    let response = await cache.match(cacheKey);
    
    if (!response) {
      // If not in cache, fetch fresh data
      const data = await fetchGoogleSheetsData(env);
      
      response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600', // 10 minutes
          ...corsHeaders
        }
      });
      
      // Cache the response for 10 minutes
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    
    return response;
  }
};
