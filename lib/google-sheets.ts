import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// This function creates an authenticated client for Google Sheets
export async function getGoogleSheetsClient() {
  try {
    // Create a JWT client using environment variables
    const client = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // Create Google Sheets client
    const sheets = google.sheets({ version: 'v4', auth: client });
    return sheets;
  } catch (error) {
    console.error('Error creating Google Sheets client:', error);
    throw new Error('Failed to create Google Sheets client');
  }
}

// Define the link type
export interface Link {
  title: string;
  description?: string;
  url: string;
}

// Fetch links from Google Sheets
export async function getLinksFromSheet(): Promise<Link[]> {
  try {
    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A2:C', // Assuming headers in row 1, data starts from row 2
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return [];
    }

    // Transform sheet data into Link objects
    return rows.map((row) => ({
      title: row[0] || '', // First column: title
      description: row[1] || undefined, // Second column: description (optional)
      url: row[2] || '', // Third column: URL
    })).filter(link => link.title && link.url); // Filter out any incomplete entries
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw new Error('Failed to fetch links from Google Sheets');
  }
}
