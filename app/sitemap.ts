import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = false

const BASE_URL = 'https://thestrange.foundation/olivefreelibrarylinks/';

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
