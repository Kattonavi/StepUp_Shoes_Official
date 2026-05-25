import type { Metadata } from 'next'
import { Package } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MaintenanceBanner from '@/components/common/MaintenanceBanner'
import HomeHero from '@/components/home/HomeHero'
import HomePromotionsShowcase from '@/components/home/HomePromotionsShowcase'
import HomeCategoriesShowcase from '@/components/home/HomeCategoriesShowcase'
import HomeFeaturedProducts from '@/components/home/HomeFeaturedProducts'
import HomeTrustSection from '@/components/home/HomeTrustSection'
import HomeFinalCTA from '@/components/home/HomeFinalCTA'
import TrackPageView from '@/components/analytics/TrackPageView'
import { serverGet } from '@/lib/server-api'
import { getPublicSettingsServer } from '@/lib/server-settings'
import {
  APP_NAME,
  APP_URL,
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from '@/lib/seo'
import type { Category, PageResponse, ProductSummary, Promotion } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettingsServer()

  const title =
    pickNonEmpty(settings?.seoTitle, settings?.storeName) ?? DEFAULT_TITLE
  const description =
    pickNonEmpty(settings?.seoDescription, settings?.heroSubtitle) ??
    DEFAULT_DESCRIPTION

  return buildPageMetadata({
    title,
    description,
    path: '/',
    image: settings?.ogImageUrl ?? undefined,
  })
}

function pickNonEmpty(
  ...values: (string | null | undefined)[]
): string | undefined {
  for (const v of values) {
    if (v && v.trim().length > 0) return v.trim()
  }
  return undefined
}

export default async function HomePage() {
  // We deliberately drop the "new arrivals" call — the home no longer renders
  // that section per Fase J spec.
  const [featuredData, categoriesData, promotionsData, settings] = await Promise.all([
    serverGet<PageResponse<ProductSummary>>('/products', {
      isFeatured: 'true',
      size: '8',
      sort: 'featured',
    }),
    serverGet<PageResponse<Category> | Category[]>('/categories', { size: '8' }),
    serverGet<Promotion[]>('/public/promotions'),
    getPublicSettingsServer(),
  ])

  const featured = featuredData?.content ?? []
  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.content ?? [])
  const promotions: Promotion[] = promotionsData ?? []

  // Hero showcase uses the first featured product as the "drop" preview;
  // grid below shows the rest.
  const heroShowcase = featured[0] ?? null
  const featuredGrid = featured.slice(1, 5)

  // WhatsApp
  const waNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WA_NUMBER || null
  const waEnabled = settings?.whatsappEnabled ?? true
  const waMessage = settings?.whatsappDefaultMessage ?? ''
  const waHref = waNumber
    ? `https://wa.me/${waNumber}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ''}`
    : null

  // Settings with fallbacks — empty strings count as missing.
  const safe = (v: string | null | undefined) =>
    v && v.trim().length > 0 ? v.trim() : null
  const heroTitle =
    safe(settings?.heroTitle) ?? 'Eleva tu estilo desde el primer paso'
  const heroSubtitle =
    safe(settings?.heroSubtitle) ??
    'Explora zapatos, ropa y accesorios seleccionados para destacar todos los días. Consulta tallas, disponibilidad y pedidos por WhatsApp.'
  const heroCtaText = safe(settings?.heroCtaText) ?? 'Ver catálogo'
  const heroCtaUrl = safe(settings?.heroCtaUrl) ?? '/catalogo'
  const featuredTitle =
    safe(settings?.featuredSectionTitle) ?? 'Productos destacados'
  const catalogEnabled = settings?.catalogEnabled ?? true

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MaintenanceBanner settings={settings} />

      <main className="flex-1">
        {/* 1 — Hero */}
        <HomeHero
          title={heroTitle}
          subtitle={heroSubtitle}
          ctaText={heroCtaText}
          ctaUrl={heroCtaUrl}
          waEnabled={waEnabled}
          waHref={waHref}
          showcaseProduct={heroShowcase}
        />

        {/* Catalog disabled — replaces all storefront content below the hero */}
        {!catalogEnabled && (
          <section className="py-20 px-4 text-center bg-background">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold mb-2">
              Catálogo temporalmente deshabilitado
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Estamos actualizando nuestro catálogo. Vuelve pronto.
            </p>
          </section>
        )}

        {catalogEnabled && (
          <>
            {/* 2 — Promotions */}
            <HomePromotionsShowcase promotions={promotions} />

            {/* 3 — Categories */}
            <HomeCategoriesShowcase categories={categories} />

            {/* 4 — Featured products */}
            <HomeFeaturedProducts
              products={featuredGrid.length > 0 ? featuredGrid : featured}
              title={featuredTitle}
            />
          </>
        )}

        {/* 5 — Trust / Why us */}
        <HomeTrustSection />

        {/* 6 — Final CTA */}
        {waEnabled && waHref && (
          <HomeFinalCTA waHref={waHref} catalogUrl={heroCtaUrl} />
        )}
      </main>

      <Footer waNumber={waEnabled ? waNumber : null} settings={settings} />
      <TrackPageView eventType="HOME_VIEW" path="/" />

      {/* JSON-LD Organization — helps search engines display the brand panel. */}
      <script
        type="application/ld+json"
        // Safe: object is built from validated settings + constants, then
        // JSON.stringify with no user-controlled HTML.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildOrganizationJsonLd(settings)),
        }}
      />
    </div>
  )
}

function buildOrganizationJsonLd(
  settings: import('@/types').PublicStoreSettings | null
) {
  const sameAs = [
    settings?.instagramUrl,
    settings?.facebookUrl,
    settings?.tiktokUrl,
    settings?.youtubeUrl,
  ].filter((u): u is string => typeof u === 'string' && /^https?:\/\//i.test(u))

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.storeName || APP_NAME,
    url: APP_URL,
    logo:
      settings?.logoUrl && /^https?:\/\//i.test(settings.logoUrl)
        ? settings.logoUrl
        : `${APP_URL}/og-default.svg`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}
