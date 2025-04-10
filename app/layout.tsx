import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

// Optimize font loading
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap', // Use display swap for better performance
  preload: true,
});

// Enhanced metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "Olive Free Library Links",
  description: "Quick access to Olive Free Library's online resources and important links",
  keywords: ["library", "Olive", "books", "resources", "community"],
  authors: [{ name: "Olive Free Library" }],
  openGraph: {
    title: "Olive Free Library Links",
    description: "Access Olive Free Library's online resources",
    url: "https://links.olivefreelibrary.org",
    siteName: "Olive Free Library Links",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Olive Free Library Links",
    description: "Access Olive Free Library's online resources",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://links.olivefreelibrary.org"),
};

// Viewport settings
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
