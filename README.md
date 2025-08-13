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

## Full Feature List & Optimizations

### **Core Application Features**
-  **Google Sheets CMS** - Non-technical content management
-  **Real-time Updates** - Changes reflect automatically (with 5-minute cache)
-  **Responsive Grid Layout** - Mobile-first design with Tailwind CSS
-  **Manual Cache Refresh** - Force updates via `?refresh` parameter
-  **Error Handling** - Graceful fallbacks for API failures
-  **Loading States** - User-friendly loading indicators

### **Next.js 15 Optimizations**
-  **React 19 Compatibility** - Latest React features and performance
-  **Server Components** - Optimal rendering strategy
-  **App Router** - Modern Next.js routing with layouts
-  **Bundle Optimization** - Tree shaking and code splitting
-  **Server Minification** - Reduced server bundle size
-  **Package Import Optimization** - Optimized React and analytics imports
-  **Standalone Output** - Docker-ready builds
-  **Turbopack Support** - Faster development builds

### **Performance & Caching**
-  **Data Caching** - 5-minute server-side cache with `unstable_cache`
-  **API Response Caching** - Edge caching with stale-while-revalidate
-  **Static Asset Caching** - Long-term browser caching for static files
-  **Font Optimization** - Google Fonts with display swap
-  **Compression** - Gzip compression enabled
-  **ETag Generation** - Efficient cache validation

### **Security Features**
-  **Security Headers** - Content type protection, frame protection, referrer policy
-  **API Key Protection** - Secure Google Sheets API integration
-  **Environment Variable Management** - Secure credential handling
-  **HTTPS Enforcement** - Production security standards
-  **Powered-By Header Removal** - Security through obscurity

### **SEO & Metadata**
-  **Rich Metadata** - Title, description, keywords, author information
-  **Open Graph Tags** - Social media sharing optimization
-  **Twitter Cards** - Enhanced Twitter sharing
-  **Dynamic Sitemap** - Automatically generated XML sitemap
-  **Robots.txt** - Search engine crawler guidance
-  **Google Verification** - Ready for Google Search Console
-  **JSON-LD Schema** - Structured data support (ready to implement)

### **PWA Capabilities**
-  **Web App Manifest** - Basic Progressive Web App support
-  **Responsive Design** - Mobile-first responsive layout
-  **Offline Graceful Degradation** - Handles network failures
-  **App-like Experience** - Can be installed on mobile devices

### **Development & Monitoring**
-  **TypeScript** - Full type safety
-  **ESLint** - Code quality enforcement
-  **Vercel Analytics** - Performance monitoring
-  **Error Logging** - Comprehensive error tracking
-  **Development Hot Reload** - Fast development iteration
-  **Build Optimization** - Production-ready builds

### **Link Management & Validation**
-  **Automated Link Checking** - Puppeteer-based link validation
-  **Pre-commit Hooks** - Prevents broken deployments
-  **Screenshot Monitoring** - Visual verification of changes
-  **Link Count Tracking** - Automated content monitoring

## 📋 Customization Guide

To use this project for your own organization, you'll need to customize the following elements:

### **1. Branding & Content**

**Files to modify:**
- `app/page.tsx` - Main page content
- `app/layout.tsx` - Site metadata and title
- `public/manifest.json` - PWA information

**What to change:**
```typescript
// In app/layout.tsx
export const metadata: Metadata = {
  title: "Your Organization Links", // Change this
  description: "Your custom description", // Change this
  keywords: "your, custom, keywords", // Change this
  authors: [{ name: "Your Organization" }], // Change this
  creator: "Your Organization", // Change this
  publisher: "Your Organization", // Change this
}

// In app/page.tsx
<h1 className="text-3xl font-bold text-[#3a4b20] mb-2 playfair-display-header">
  Your Organization Links {/* Change this */}
</h1>

// Footer links - update these URLs
<a href="https://your-website.com" target="_blank" rel="noopener noreferrer">
  Your Organization {/* Change this */}
</a>
<a href="https://www.instagram.com/your-handle/" target="_blank" rel="noopener noreferrer">
  {/* Update social media links */}
</a>
```

**In `public/manifest.json`:**
```json
{
  "name": "Your Organization Links",
  "short_name": "Your Links",
  "description": "Your custom description"
}
```

### **2. Visual Styling**

**Color Scheme (in Tailwind classes):**
- Primary color: `#3a4b20` (olive green) - Search and replace throughout files
- Background colors: `#d9d9d9`, `#5B5B66`
- Update these in `app/page.tsx`, `app/components/LinkCard.tsx`

**Fonts:**
- Current: Playfair Display (in `app/layout.tsx`)
- Change font import and variable name to customize

### **3. Google Sheets Setup**

**Required Steps:**
1. Create your own Google Sheet with this structure:
   - Column A: Link Title (required)
   - Column B: Link Description (optional) 
   - Column C: URL (required)
   - Row 1: Headers

2. Set up Google Cloud Project:
   - Create project in Google Cloud Console
   - Enable Google Sheets API
   - Create service account with Sheets API access
   - Download service account JSON credentials
   - Share your Google Sheet with the service account email

3. Update environment variables:
```bash
# In .env.local
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="your-private-key-from-json"
GOOGLE_SHEET_ID=your-sheet-id-from-url
GOOGLE_SHEET_RANGE=Sheet1!A2:C  # Adjust if needed
NEXT_PUBLIC_BASE_URL=https://your-domain.com
GOOGLE_VERIFICATION_ID=your-google-verification-id  # Optional
```

### **4. Deployment Configuration**

**Domain & URLs:**
- Update `NEXT_PUBLIC_BASE_URL` in environment variables
- Update `public/robots.txt` with your domain
- Update sitemap URL in `app/sitemap.ts`

**Vercel Deployment:**
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Configure custom domain if desired

### **5. Cache & Performance Settings**

**Adjust cache duration (optional):**
```typescript
// In lib/google-sheets.ts
export const getLinksFromSheet = unstable_cache(
  async () => {
    return await fetchLinksFromSheet();
  },
  ['google-sheets-links'],
  { 
    revalidate: 300, // Change this (seconds) - currently 5 minutes
    tags: ['google-sheets-links']
  }
);

// In next.config.ts - API cache headers
{
  key: 'Cache-Control',
  value: 's-maxage=300, stale-while-revalidate=3600', // Adjust these values
}
```

### **6. Link Monitoring Setup (Optional)**

**Customize Puppeteer monitoring:**
- Update URL in `puppeteer/count-links.js`
- Adjust minimum link count threshold for pre-commit hook
- Customize screenshot settings

**Files to modify:**
- `puppeteer/count-links.js` - Update target URLs
- `.github/hooks/pre-commit` - Adjust validation rules

### **7. Analytics & Monitoring**

**Vercel Analytics:**
- Already included via `@vercel/analytics/react`
- Automatically works with Vercel deployment

**Google Analytics (optional addition):**
- Add Google Analytics tracking code to `app/layout.tsx`
- Include tracking ID in environment variables

### **8. Social Media & External Links**

**Update social media links in `app/page.tsx`:**
```tsx
// Instagram link
<a href="https://www.instagram.com/your-handle/">

// Facebook link  
<a href="https://www.facebook.com/your-page">

// Main website link
<a href="https://your-website.com">
```

## 🛠️ Technical Setup Instructions

### **Prerequisites**
1. Node.js 18+ 
2. Google Cloud account
3. GitHub account
4. Vercel account (for deployment)

### **Quick Start**
1. Fork this repository
2. Create Google Cloud project and service account
3. Create Google Sheet with your links
4. Set up environment variables
5. Customize branding and content
6. Deploy to Vercel

### **Environment Variables Template**
```bash
# Required - Google Sheets API
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SHEET_RANGE=Sheet1!A2:C

# Required - Site Configuration  
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Optional - SEO
GOOGLE_VERIFICATION_ID=your-verification-id
```

### How It Works

1. **Content Management**: Library staff update a Google Sheet with links, titles, and descriptions
2. **Data Fetching**: The application fetches data from Google Sheets using the Google Sheets API
3. **Caching**: Data is cached for 5 minutes to improve performance and reduce API calls
4. **Rendering**: Links are displayed as cards in a responsive grid layout
5. **Refresh Mechanism**: Content can be manually refreshed by visiting the site with a `?refresh` parameter

## 🔧 Performance Optimizations Included

This project includes numerous Next.js 15 and React 19 optimizations:

### **Bundle Size Optimization**
- **Current bundle size**: ~100KB first load JS
- **Tree shaking**: Removes unused code automatically
- **Code splitting**: Lazy loads components when needed
- **Package optimization**: Optimized imports for React, React-DOM, and Analytics

### **Caching Strategy**
- **Server-side caching**: 5-minute cache for Google Sheets data
- **Edge caching**: CDN caching with stale-while-revalidate
- **Browser caching**: Long-term caching for static assets
- **ETag support**: Efficient cache validation

### **Security Headers**
- **Content Security**: X-Content-Type-Options protection
- **Frame Security**: X-Frame-Options to prevent clickjacking
- **Referrer Policy**: Controlled referrer information sharing
- **Server Header**: Powered-By header removed for security

### **SEO Features**
- **Meta tags**: Rich metadata for search engines
- **Open Graph**: Social media sharing optimization
- **Sitemap**: Dynamic XML sitemap generation
- **Robots.txt**: Search engine crawler guidance
- **Twitter Cards**: Enhanced Twitter sharing

## Live URLs

- **Public Website**: [https://your-project-name.vercel.app/](https://your-project-name.vercel.app/)
- **Force Refresh**: [https://your-project-name.vercel.app/?refresh](https://your-project-name.vercel.app/?refresh)
- **Google Sheet Editor**: Edit your Google Sheet (private link not shown for security)

## Monitoring & Administration

- **Google Cloud Console**: Access your project's API metrics dashboard
- **Vercel Dashboard**: Access your Vercel project dashboard

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

## 🔐 Setting Up Vercel Environment Variables

### **Why Environment Variables are Needed**

Your local `.env.local` file contains sensitive credentials that:
- ❌ Should **NEVER** be committed to GitHub
- ✅ Must be securely stored in Vercel for production deployment
- ✅ Are automatically encrypted and protected by Vercel

### **Step-by-Step Vercel Setup**

#### **Method 1: Vercel Dashboard (Recommended)**

1. **Access Your Project Settings**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Navigate to your project dashboard
   - Click on your project name
   - Go to **Settings** tab
   - Click **Environment Variables** in the sidebar

2. **Add Each Environment Variable**:
   For each variable in your `.env.local`, add them one by one:

   **GOOGLE_CLIENT_EMAIL**:
   - Name: `GOOGLE_CLIENT_EMAIL`
   - Value: `your-service-account@your-project.iam.gserviceaccount.com`
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **GOOGLE_PRIVATE_KEY** ⚠️ **IMPORTANT**:
   - Name: `GOOGLE_PRIVATE_KEY` 
   - Value: Copy the **ENTIRE** private key including quotes and line breaks:
     ```
     "-----BEGIN PRIVATE KEY-----\blahblah=\n-----END PRIVATE KEY-----\n"
     ```
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **GOOGLE_SHEET_ID**:
   - Name: `GOOGLE_SHEET_ID`
   - Value: `your-google-sheet-id-from-url`
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **GOOGLE_SHEET_RANGE**:
   - Name: `GOOGLE_SHEET_RANGE`
   - Value: `Sheet1!A2:C`
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **NEXT_PUBLIC_BASE_URL**:
   - Name: `NEXT_PUBLIC_BASE_URL`
   - Value: `https://your-project-name.vercel.app` (replace with your actual domain)
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

3. **Trigger Redeployment**:
   - After adding all variables, go to **Deployments** tab
   - Click **Redeploy** on your latest deployment
   - Or push a new commit to trigger automatic deployment

#### **Method 2: Vercel CLI**

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Add Environment Variables**:
   ```bash
   # Navigate to your project directory
   cd olivelibrarylinks
   
   # Add each environment variable
   vercel env add GOOGLE_CLIENT_EMAIL
   # When prompted, enter: your-service-account@your-project.iam.gserviceaccount.com
   # Select: Production, Preview, Development
   
   vercel env add GOOGLE_PRIVATE_KEY
   # When prompted, paste the entire private key with quotes and newlines
   # Select: Production, Preview, Development
   
   vercel env add GOOGLE_SHEET_ID
   # When prompted, enter: your-google-sheet-id-from-url
   # Select: Production, Preview, Development
   
   vercel env add GOOGLE_SHEET_RANGE
   # When prompted, enter: Sheet1!A2:C
   # Select: Production, Preview, Development
   
   vercel env add NEXT_PUBLIC_BASE_URL
   # When prompted, enter: https://your-project-name.vercel.app
   # Select: Production, Preview, Development
   ```

4. **Deploy with new environment variables**:
   ```bash
   vercel --prod
   ```

### **⚠️ Important Security Notes**

1. **Private Key Formatting**:
   - Must include the surrounding quotes
   - Must include `\n` characters for line breaks
   - Copy exactly as shown in your `.env.local` file

2. **Never Share These Values**:
   - Don't post them in GitHub issues
   - Don't share screenshots with these values
   - Don't commit them to version control

3. **Verification**:
   - After deployment, visit your live site
   - Check browser console for any API errors
   - Test the `?refresh` parameter to ensure API is working

### **🔍 Troubleshooting Environment Variables**

**Common Issues:**

1. **"Invalid credentials" error**:
   - Check that `GOOGLE_PRIVATE_KEY` is copied exactly with quotes and `\n` characters
   - Verify `GOOGLE_CLIENT_EMAIL` matches your service account email

2. **"Sheet not found" error**:
   - Verify `GOOGLE_SHEET_ID` is correct (from the Google Sheets URL)
   - Ensure the service account email has access to the sheet

3. **"Range not found" error**:
   - Check `GOOGLE_SHEET_RANGE` matches your sheet structure
   - Ensure your sheet has the correct tab name (usually "Sheet1")

4. **Environment variables not updating**:
   - Force a new deployment after adding variables
   - Clear browser cache and try again
   - Check that variables are set for the correct environment (Production/Preview)

**Testing Your Setup:**
```bash
# Test your live site
curl https://your-site.vercel.app/api/links

# Should return JSON with your links data
```

## 🔧 Advanced Configuration

### **Performance Tuning**

**Cache Duration Settings:**
```typescript
// In lib/google-sheets.ts - Adjust data cache duration
{ 
  revalidate: 300, // Seconds (300 = 5 minutes)
  tags: ['google-sheets-links']
}

// In next.config.ts - Adjust API cache headers
{
  key: 'Cache-Control',
  value: 's-maxage=300, stale-while-revalidate=3600', // Edge cache settings
}
```

**Bundle Optimization:**
```typescript
// In next.config.ts - Add more packages to optimize
experimental: {
  optimizePackageImports: [
    'react', 
    'react-dom', 
    '@vercel/analytics',
    'your-additional-packages' // Add your packages here
  ],
}
```

### **Security Configuration**

**Additional Security Headers:**
```typescript
// In next.config.ts - Add more security headers
headers: [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'",
  },
]
```

**Environment Security:**
- Never commit `.env.local` to version control
- Use Vercel's environment variables for production
- Rotate service account keys regularly
- Monitor API usage in Google Cloud Console

### **SEO Enhancements**

**Add Structured Data:**
```typescript
// In app/page.tsx - Add JSON-LD structured data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Your Organization Links",
  "description": "Your description",
  "url": process.env.NEXT_PUBLIC_BASE_URL
};
```

**Google Analytics Setup:**
```typescript
// In app/layout.tsx - Add Google Analytics
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

### **Monitoring & Debugging**

**Enable Detailed Logging:**
```typescript
// In lib/google-sheets.ts - Add detailed logging
if (process.env.NODE_ENV === 'development') {
  console.log('Fetching data from Google Sheets...');
  console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);
  console.log('Range:', process.env.GOOGLE_SHEET_RANGE);
}
```

**Performance Monitoring:**
- Use Vercel Analytics (included)
- Monitor Core Web Vitals in production
- Set up error tracking with Sentry (optional)

## 🐛 Troubleshooting

### **Common Issues**

**1. Google Sheets API Errors:**
- Verify service account email has access to the sheet
- Check that Google Sheets API is enabled in your project
- Ensure private key is properly formatted in environment variables

**2. Build Failures:**
- Check that all environment variables are set
- Verify Node.js version compatibility (18+)
- Clear `.next` cache: `rm -rf .next`

**3. Caching Issues:**
- Force refresh with `?refresh` parameter
- Check cache settings in `next.config.ts`
- Verify Vercel edge cache configuration

**4. Styling Problems:**
- Verify Tailwind CSS is properly configured
- Check for conflicting CSS classes
- Test responsive design on different screen sizes

### **Debug Mode**

**Enable verbose logging:**
```bash
# Run with debug logging
DEBUG=* npm run dev

# Check build output
npm run build -- --debug
```

**Test API endpoints:**
```bash
# Test links API
curl http://localhost:3000/api/links

# Test refresh API  
curl http://localhost:3000/api/refresh
```

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

### Automated Link Checking and Pre-commit Hook

#### Puppeteer Link Counter
- The `puppeteer/count-links.js` script uses Puppeteer to launch a headless browser, visit the site, and count the number of content links (excluding navigation and social links).
- It logs the total and content link counts to `puppeteer/link-count-log.txt` and takes a screenshot of the current page (`puppeteer/latest-screenshot.png`).
- You can run the link counter manually:
  ```bash
  cd puppeteer
  npm install  # only needed once
  node count-links.js --url https://olivelibrarylinks.vercel.app/
  ```
  Or to check your local dev server:
  ```bash
  node count-links.js --url http://localhost:3000
  ```

#### Pre-commit Hook
- A pre-commit hook script (`.github/hooks/pre-commit`) automatically runs before each commit.
- It starts the local dev server, waits for it to be ready, then runs the Puppeteer link counter against `http://localhost:3000`.
- If the number of content links is less than 2, the commit is blocked and an error is shown. The link count and any errors are logged to `puppeteer/precommit-link-check.log`.
- This helps prevent accidental commits that would break or remove all content links from the site.
- To bypass the hook (not recommended), use `git commit --no-verify`.

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
