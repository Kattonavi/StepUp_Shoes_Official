import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/product/ProductCard'
import MaintenanceBanner from '@/components/common/MaintenanceBanner'
import HeroSection from '@/components/home/HeroSection'
import CategoryShowcase from '@/components/home/CategoryShowcase'
import BenefitsSection from '@/components/home/BenefitsSection'
import HomeCTABanner from '@/components/home/HomeCTABanner'
import PromotionsSection from '@/components/home/PromotionsSection'
import TrustStrip from '@/components/home/TrustStrip'
import { serverGet } from '@/lib/server-api'
import { getPublicSettingsServer } from '@/lib/server-settings'
import {
  APP_NAME,
  APP_URL,
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from '@/lib/seo'
import TrackPageView from '@/components/analytics/TrackPageView'
import type { Category, PageResponse, ProductSummary, Promotion } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  // Home prefers store settings when set, but falls back to safe defaults so
  // an empty CMS-side field never produces an empty <title>.
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
  const [featuredData, newArrivalsData, categoriesData, promotionsData, settings] = await Promise.all([
    serverGet<PageResponse<ProductSummary>>('/products', {
      isFeatured: 'true',
      size: '4',
      sort: 'featured',
    }),
    serverGet<PageResponse<ProductSummary>>('/products', {
      isNew: 'true',
      size: '4',
      sort: 'newest',
    }),
    serverGet<PageResponse<Category> | Category[]>('/categories', { size: '8' }),
    serverGet<Promotion[]>('/public/promotions'),
    getPublicSettingsServer(),
  ])

  const featured = featuredData?.content ?? []
  const newArrivals = newArrivalsData?.content ?? []
  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.content ?? [])
  const promotions: Promotion[] = promotionsData ?? []

  // WhatsApp
  const waNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WA_NUMBER || null
  const waEnabled = settings?.whatsappEnabled ?? true
  const waMessage = settings?.whatsappDefaultMessage ?? ''
  const waHref = waNumber
    ? `https://wa.me/${waNumber}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ''}`
    : null

  // Settings with fallbacks (treat empty strings as missing so admins can clear
  // a field without ending up with a blank hero).
  const safe = (v: string | null | undefined) => (v && v.trim().length > 0 ? v.trim() : null)
  const heroTitle =
    safe(settings?.heroTitle) ?? 'Estilo urbano que combina contigo'
  const heroSubtitle =
    safe(settings?.heroSubtitle) ??
    'Zapatos, ropa y accesorios seleccionados a mano. Pregunta tallas y disponibilidad por WhatsApp — te respondemos rápido.'
  const heroCtaText = safe(settings?.heroCtaText) ?? 'Ver catálogo'
  const heroCtaUrl = safe(settings?.heroCtaUrl) ?? '/catalogo'
  const featuredTitle = safe(settings?.featuredSectionTitle) ?? 'Lo más buscado'
  const newArrivalsTitle = safe(settings?.newArrivalsSectionTitle) ?? 'Acabados de llegar'
  const catalogEnabled = settings?.catalogEnabled ?? true

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MaintenanceBanner settings={settings} />

      <main className="flex-1">
        {/* ── Hero ── */}
        <HeroSection
          title={heroTitle}
          subtitle={heroSubtitle}
          ctaText={heroCtaText}
          ctaUrl={heroCtaUrl}
          waEnabled={waEnabled}
          waHref={waHref}
        />

        {/* ── Trust strip ── */}
        <TrustStrip />

        {/* ── Catalog disabled ── */}
        {!catalogEnabled && (
          <section className="py-20 px-4 text-center bg-background">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold mb-2">Catálogo temporalmente deshabilitado</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Estamos actualizando nuestro catálogo. Vuelve pronto.
            </p>
          </section>
        )}

        {catalogEnabled && (
          <>
            {/* ── Categories ── */}
            <CategoryShowcase categories={categories} />

            {/* ── Featured products ── */}
            <section className="py-16 md:py-20 px-4 bg-muted/20">
              <div className="max-w-6xl mx-auto">
                <SectionHeader
                  label="Selección de la temporada"
                  title={featuredTitle}
                  description="Las referencias que más están saliendo. Stock limitado."
                  href="/catalogo?isFeatured=true"
                />
                {featured.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mt-10">
                    {featured.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <ProductsEmptyPlaceholder />
                )}
              </div>
            </section>

            {/* ── Promotions ── shown between featured and new arrivals so it's
                impossible to miss when there are active promos */}
            <PromotionsSection promotions={promotions} />

            {/* ── New arrivals ── */}
            <section className="py-16 md:py-20 px-4 bg-background">
              <div className="max-w-6xl mx-auto">
                <SectionHeader
                  label="Recién llegado"
                  title={newArrivalsTitle}
                  description="Lo último que entró a la tienda. Antes de que se acabe."
                  href="/catalogo?isNew=true"
                />
                {newArrivals.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mt-10">
                    {newArrivals.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <ProductsEmptyPlaceholder />
                )}
              </div>
            </section>
          </>
        )}

        {/* ── Benefits ── */}
        <BenefitsSection />

        {/* ── WhatsApp CTA Banner ── */}
        {waEnabled && waHref && <HomeCTABanner waHref={waHref} catalogUrl={heroCtaUrl} />}
      </main>

      <Footer waNumber={waEnabled ? waNumber : null} settings={settings} />
      <TrackPageView eventType="HOME_VIEW" path="/" />

      {/* JSON-LD Organization — helps search engines display the brand panel. */}
      <script
        type="application/ld+json"
        // Safe: object is built from validated settings + constants, then
        // JSON.stringify with no user-controlled HTML.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd(settings)) }}
      />
    </div>
  )
}

function buildOrganizationJsonLd(settings: import('@/types').PublicStoreSettings | null) {
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
    logo: settings?.logoUrl && /^https?:\/\//i.test(settings.logoUrl)
      ? settings.logoUrl
      : `${APP_URL}/og-default.svg`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

// ─── Local helpers ────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  title,
  description,
  href,
}: {
  label: string
  title: string
  description?: string
  href?: string
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-0.5 bg-primary rounded" />
          {label}
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 max-w-md">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

function ProductsEmptyPlaceholder() {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border p-14 text-center">
      <Package className="w-10 h-10 mx-auto text-muted-foreground/30 mb-4" />
      <p className="text-sm text-muted-foreground">
        Pronto habrá nuevos productos disponibles en esta sección.
      </p>
      <Link
        href="/catalogo"
        className="inline-block mt-4 text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
      >
        Ver catálogo completo →
      </Link>
    </div>
  )
}
