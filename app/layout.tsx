import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

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
  return (
    <html lang="en" className={playfairDisplay.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
