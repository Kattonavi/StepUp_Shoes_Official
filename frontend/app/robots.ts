import type { MetadataRoute } from 'next'
import { APP_URL } from '@/lib/seo'

/**
 * robots.txt — generated dynamically so the sitemap URL matches APP_URL.
 *
 * Admin and login are blocked at the crawler level as defense in depth;
 * each individual route also returns noindex via its own metadata.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/login',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
