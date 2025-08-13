import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap', // Use display swap for better performance
  preload: true,
});

// Enhanced metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "Olive Free Library Links",
  description: "A collection of useful links for the Olive Free Library community. Access digital resources, catalogs, and services.",
  keywords: "library, olive free library, digital resources, catalog, community",
  authors: [{ name: "Olive Free Library" }],
  creator: "Olive Free Library",
  publisher: "Olive Free Library",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://olivelibrarylinks.vercel.app'),
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
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
