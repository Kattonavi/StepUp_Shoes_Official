import type { MetadataRoute } from 'next'
import { serverGet } from '@/lib/server-api'
import { APP_URL } from '@/lib/seo'
import type { PageResponse, ProductSummary } from '@/types'

/**
 * Dynamic sitemap. Falls back to just the static routes if the backend
 * is unreachable so the build never breaks because of a sitemap fetch.
 *
 * Catalog filters are intentionally NOT enumerated: every combination would
 * become a near-duplicate URL that competes with the canonical /catalogo.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${APP_URL}/catalogo`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${APP_URL}/contacto`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Try to enumerate public products. If the backend is down or returns an
  // error, return only the static entries — we never want to block a deploy
  // on the sitemap.
  let productEntries: MetadataRoute.Sitemap = []
  try {
    const products = await serverGet<PageResponse<ProductSummary>>(
      '/products',
      // size capped to keep the sitemap document manageable; if catalog grows
      // past 500 products we'll need a sitemap index.
      { size: '500', sort: 'newest' },
      { revalidate: 3600 }
    )

    if (products?.content?.length) {
      productEntries = products.content.map((p) => ({
        url: `${APP_URL}/producto/${p.slug}`,
        lastModified: p.createdAt ? new Date(p.createdAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    }
  } catch {
    // Silently fall through — static routes are still indexed.
  }

  return [...staticEntries, ...productEntries]
}
