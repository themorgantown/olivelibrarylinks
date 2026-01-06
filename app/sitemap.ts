import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://olivelibrarylinks.vercel.app/';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
