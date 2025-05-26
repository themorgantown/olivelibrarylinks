# Olive Library Links

A modern, responsive web application that displays a collection of curated links for the Olive Free Library. This application is built with Next.js and uses Google Sheets as a content management system, allowing staff to easily update links without technical knowledge.

## Overview

The Olive Library Links application serves as a central hub for important resources, providing a clean and organized interface for library patrons and staff. Links are managed through a Google Sheet and displayed in an elegant card layout on the website.

### Key Features

- **Google Sheets Integration**: Content is managed through a simple Google Sheet
- **Dynamic Updates**: Changes to the spreadsheet are reflected on the site automatically
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Caching System**: Implements efficient caching to reduce API calls and improve performance
- **Manual Refresh**: Ability to force-refresh content with a simple URL parameter

### How It Works

1. **Content Management**: Library staff update a Google Sheet with links, titles, and descriptions
2. **Data Fetching**: The application fetches data from Google Sheets using the Google Sheets API
3. **Caching**: Data is cached for 5 minutes to improve performance and reduce API calls
4. **Rendering**: Links are displayed as cards in a responsive grid layout
5. **Refresh Mechanism**: Content can be manually refreshed by visiting the site with a `?refresh` parameter

## Live URLs

- **Public Website**: [https://olivelibrarylinks.vercel.app/](https://olivelibrarylinks.vercel.app/)
- **Force Refresh**: [https://olivelibrarylinks.vercel.app/?refresh](https://olivelibrarylinks.vercel.app/?refresh)
- **Google Sheet Editor**: [Edit Google Sheet](https://docs.google.com/spreadsheets/d/1YVT8JOkYDYImEZ9X01r4Pp_J3jd3Vyzj_TNpMAkgdfw/edit?gid=0#gid=0)

## Monitoring & Administration

- **Google Cloud Console**: [https://console.cloud.google.com/apis/api/sheets.googleapis.com/metrics?inv=1&invt=Abyb2A&project=olive-free-library](https://console.cloud.google.com/apis/api/sheets.googleapis.com/metrics?inv=1&invt=Abyb2A&project=olive-free-library)
- **Vercel Dashboard**: [https://vercel.com/danielmorgans-projects/olivelibrarylinks](https://vercel.com/danielmorgans-projects/olivelibrarylinks)

## How to Build

This section provides detailed instructions for developers who want to build and customize this application.

### Prerequisites

1. **Node.js**: Version 18.x or higher
2. **Google Cloud Account**: For setting up Google Sheets API integration
3. **Vercel Account** (optional): For deployment

### Environment Setup

1. **Google Cloud Configuration**:
   - Create a new project in Google Cloud Console
   - Enable Google Sheets API
   - Create a service account with "Viewer" access to Google Sheets API
   - Download the service account JSON credentials
   - Share your target Google Sheet with the service account email

2. **Environment Variables**:
   Create a `.env.local` file in the project root with the following variables:
   ```
   GOOGLE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="Your private key from the JSON file, including quotes"
   GOOGLE_SHEET_ID=your-google-sheet-id-from-url
   GOOGLE_SHEET_RANGE=Sheet1!A2:C
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Google Sheet Structure**:
   - Row 1: Headers (Title, Description, URL)
   - Row 2+: Data entries
   - Column A: Link title (required)
   - Column B: Link description (optional)
   - Column C: URL (required)

### Technical Requirements

1. **Dependencies**:
   - Next.js 15.3.0 or later (App Router)
   - React 19.0.0 or later
   - Google APIs libraries (googleapis, google-auth-library)
   - Tailwind CSS for styling
   - Vercel Analytics (optional)

2. **Development Tools**:
   - TypeScript
   - ESLint
   - Tailwind CSS

### Build and Deployment Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd olivelibrarylinks
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the local development site**:
   Open [http://localhost:3000](http://localhost:3000)

5. **Production build**:
   ```bash
   npm run build
   ```

6. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Configure environment variables in the Vercel dashboard
   - Deploy from the Vercel dashboard or use the Vercel CLI

### Architecture and Customization

1. **Data Flow**:
   - `lib/google-sheets.ts` - Handles API connections and data fetching
   - `app/api/links/route.ts` - API route to fetch links
   - `app/api/refresh/route.ts` - API route to force cache invalidation
   - `app/page.tsx` - Main page component that displays links
   - `app/components/LinkContainer.tsx` - Container for link display
   - `app/components/LinkCard.tsx` - Individual link card component

2. **Caching Strategy**:
   - Uses Next.js's `unstable_cache` for server-side caching
   - Cache duration: 5 minutes (300 seconds)
   - Manual cache invalidation via the `/api/refresh` endpoint

3. **Styling Customization**:
   - Main colors and styles defined in `app/globals.css`
   - Components use Tailwind CSS utility classes
   - Font settings in `app/layout.tsx`

4. **Performance Optimizations**:
   - Dynamic imports for client components
   - Cache-Control headers for API responses
   - Next.js bundle optimizations in `next.config.ts`

## Getting Started

create .env.local with these variables: 

```
GOOGLE_CLIENT_EMAIL=something@projectname.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=" "
GOOGLE_SHEET_ID= 
GOOGLE_SHEET_RANGE=Sheet1!A2:C
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

First, run the development server:

```bash
npm i && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
