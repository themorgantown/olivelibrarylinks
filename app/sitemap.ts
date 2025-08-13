import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  // Ensure we use the correct base URL in production
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://olivelibrarylinks.vercel.app' 
    : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
