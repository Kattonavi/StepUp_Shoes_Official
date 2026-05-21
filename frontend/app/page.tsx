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
import { serverGet } from '@/lib/server-api'
import { getPublicSettingsServer } from '@/lib/server-settings'
import TrackPageView from '@/components/analytics/TrackPageView'
import type { Category, PageResponse, ProductSummary } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettingsServer()
  return {
    title: settings?.seoTitle ?? 'StepUp — Zapatos, Gorras y Accesorios',
    description:
      settings?.seoDescription ??
      'Descubre nuestra colección de zapatos, gorras, ropa y accesorios. Calidad y estilo en cada producto.',
  }
}

export default async function HomePage() {
  const [featuredData, newArrivalsData, categoriesData, settings] = await Promise.all([
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
    getPublicSettingsServer(),
  ])

  const featured = featuredData?.content ?? []
  const newArrivals = newArrivalsData?.content ?? []
  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.content ?? [])

  // WhatsApp
  const waNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WA_NUMBER || null
  const waEnabled = settings?.whatsappEnabled ?? true
  const waMessage = settings?.whatsappDefaultMessage ?? ''
  const waHref = waNumber
    ? `https://wa.me/${waNumber}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ''}`
    : null

  // Settings with fallbacks
  const heroTitle =
    settings?.heroTitle ?? 'Tu próximo estilo empieza aquí'
  const heroSubtitle =
    settings?.heroSubtitle ??
    'Zapatos, ropa y accesorios seleccionados para destacar todos los días. Consulta disponibilidad y tallas por WhatsApp de forma rápida.'
  const heroCtaText = settings?.heroCtaText ?? 'Ver catálogo'
  const heroCtaUrl = settings?.heroCtaUrl ?? '/catalogo'
  const featuredTitle = settings?.featuredSectionTitle ?? 'Productos destacados'
  const newArrivalsTitle = settings?.newArrivalsSectionTitle ?? 'Nuevos ingresos'
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
            <section className="py-24 px-4 bg-muted/20">
              <div className="max-w-6xl mx-auto">
                <SectionHeader
                  label="Selección especial"
                  title={featuredTitle}
                  href="/catalogo?isFeatured=true"
                />
                {featured.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
                    {featured.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                ) : (
                  <ProductsEmptyPlaceholder />
                )}
              </div>
            </section>

            {/* ── New arrivals ── */}
            <section className="py-24 px-4 bg-background">
              <div className="max-w-6xl mx-auto">
                <SectionHeader
                  label="Recién llegado"
                  title={newArrivalsTitle}
                  href="/catalogo?isNew=true"
                />
                {newArrivals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
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
    </div>
  )
}

// ─── Local helpers ────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  title,
  href,
}: {
  label: string
  title: string
  href?: string
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
          <span className="w-5 h-0.5 bg-primary rounded" />
          {label}
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h2>
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
