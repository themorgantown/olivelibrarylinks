import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { readFileSync } from "fs";
import { join } from "path";

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap', // Use display swap for better performance
  preload: false, // Disable preload to fix unused resource warning
});

// Enhanced metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "Olive Free Library Links",
  description: "A collection of useful links for the Olive Free Library community. Access digital resources, catalogs, and services.",
  keywords: "library, olive free library, digital resources, catalog, community",
  authors: [{ name: "Olive Free Library" }],
  creator: "Olive Free Library",
  publisher: "Olive Free Library",
  metadataBase: new URL('https://thestrange.foundation/olivefreelibrarylinks/php'),
  openGraph: {
    title: "Olive Free Library Links",
    description: "A collection of useful links for the Olive Free Library community.",
    url: '/',
    siteName: 'Olive Free Library Links',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Olive Free Library Links",
    description: "A collection of useful links for the Olive Free Library community.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Library',
    name: 'Olive Free Library',
    url: 'https://olivelibrarylinks.vercel.app/',
    logo: 'https://www.olivefreelibrary.org/favicon.ico', // Assuming an icon exists or will default to something generic if not, but good for SEO
    sameAs: [
      'https://www.olivefreelibrary.org',
      'https://www.instagram.com/olivefreelibrary/',
      'https://www.facebook.com/olivelibrary'
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '4033 Route 28A',
      addressLocality: 'West Shokan',
      addressRegion: 'NY',
      postalCode: '12494',
      addressCountry: 'US'
    },
    telephone: '+1-845-657-2482' 
  };

  // Read CSS file content to inline it
  let cssContent = '';
  try {
    cssContent = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf-8');
  } catch {
    // Fallback for edge cases
    console.warn('Could not inline CSS');
  }

  return (
    <html lang="en" className={playfairDisplay.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="preconnect" href="https://thestrange.foundation" />
        <link rel="dns-prefetch" href="https://thestrange.foundation" />
        {cssContent && <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: cssContent }} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
