import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MessageCircle, ShieldCheck, Star, Package } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/product/ProductCard'
import MaintenanceBanner from '@/components/common/MaintenanceBanner'
import { serverGet } from '@/lib/server-api'
import { getPublicSettingsServer } from '@/lib/server-settings'
import type { Category, PageResponse, ProductSummary } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettingsServer()
  return {
    title: settings?.seoTitle ?? 'StepUp — Zapatos, Gorras y Accesorios',
    description: settings?.seoDescription ?? 'Descubre nuestra colección de zapatos, gorras, ropa y accesorios. Calidad y estilo en cada producto.',
  }
}

export default async function HomePage() {
  const [featuredData, newArrivalsData, categoriesData, settings] = await Promise.all([
    serverGet<PageResponse<ProductSummary>>('/products', { isFeatured: 'true', size: '4', sort: 'featured' }),
    serverGet<PageResponse<ProductSummary>>('/products', { isNew: 'true', size: '4', sort: 'newest' }),
    serverGet<PageResponse<Category> | Category[]>('/categories', { size: '8' }),
    getPublicSettingsServer(),
  ])

  const featured = featuredData?.content ?? []
  const newArrivals = newArrivalsData?.content ?? []
  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.content ?? []

  // Fallback chain: settings → env var → null
  const waNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WA_NUMBER || null
  const waEnabled = settings?.whatsappEnabled ?? true
  const waMessage = settings?.whatsappDefaultMessage ?? ''
  const waHref = waNumber
    ? `https://wa.me/${waNumber}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ''}`
    : null

  const heroTitle    = settings?.heroTitle    ?? 'Tu estilo, tu paso'
  const heroSubtitle = settings?.heroSubtitle ?? 'Zapatos, gorras, ropa y accesorios seleccionados para los que saben cómo moverse.'
  const heroCtaText  = settings?.heroCtaText  ?? 'Explorar catálogo'
  const heroCtaUrl   = settings?.heroCtaUrl   ?? '/catalogo'
  const featuredTitle     = settings?.featuredSectionTitle    ?? 'Productos destacados'
  const newArrivalsTitle  = settings?.newArrivalsSectionTitle ?? 'Nuevos ingresos'
  const catalogEnabled    = settings?.catalogEnabled ?? true

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MaintenanceBanner settings={settings} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-card via-brand-elevated to-card py-24 px-4">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: '#F26A21' }}
          />
          <div className="max-w-4xl mx-auto text-center relative">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4">
              Nueva colección disponible
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-none">
              {heroTitle.includes(' ') ? (
                <>
                  {heroTitle.split(' ').slice(0, -2).join(' ')}{' '}
                  <span className="text-primary">{heroTitle.split(' ').slice(-2).join(' ')}</span>
                </>
              ) : (
                <span className="text-primary">{heroTitle}</span>
              )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={heroCtaUrl}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors text-base"
              >
                {heroCtaText}
                <ArrowRight className="w-5 h-5" />
              </Link>
              {waEnabled && waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-semibold px-8 py-4 rounded-xl hover:border-primary/50 hover:text-primary transition-colors text-base"
                >
                  <MessageCircle className="w-5 h-5" />
                  Consultar
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Catalog disabled */}
        {!catalogEnabled && (
          <section className="py-20 px-4 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Catálogo temporalmente deshabilitado</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Estamos actualizando nuestro catálogo. Vuelve pronto.
            </p>
          </section>
        )}

        {catalogEnabled && (
          <>
            {/* Categories */}
            {categories.length > 0 && (
              <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                  <SectionHeader label="Colecciones" title="Explora por categoría" href="/catalogo" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/catalogo?categorySlug=${cat.slug}`}
                        className="group bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                      >
                        {cat.icon && <div className="text-4xl mb-3">{cat.icon}</div>}
                        {!cat.icon && (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {cat.name}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Featured products */}
            <section className="py-16 px-4 bg-muted/30">
              <div className="max-w-6xl mx-auto">
                <SectionHeader label="Selección especial" title={featuredTitle} href="/catalogo?isFeatured=true" />
                {featured.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                    {featured.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                ) : (
                  <ProductsEmptyPlaceholder />
                )}
              </div>
            </section>

            {/* New arrivals */}
            <section className="py-16 px-4">
              <div className="max-w-6xl mx-auto">
                <SectionHeader label="Recién llegado" title={newArrivalsTitle} href="/catalogo?isNew=true" />
                {newArrivals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                    {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                ) : (
                  <ProductsEmptyPlaceholder />
                )}
              </div>
            </section>
          </>
        )}

        {/* Trust */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { icon: <ShieldCheck className="w-8 h-8 mx-auto text-primary" />, title: 'Calidad garantizada', desc: 'Productos seleccionados con altos estándares de calidad.' },
                { icon: <Star className="w-8 h-8 mx-auto text-primary" />, title: 'Atención personalizada', desc: 'Te asesoramos para encontrar el producto perfecto.' },
                { icon: <MessageCircle className="w-8 h-8 mx-auto text-primary" />, title: 'Respuesta rápida', desc: 'Consultas respondidas por WhatsApp en minutos.' },
              ].map((item) => (
                <div key={item.title} className="space-y-3">
                  {item.icon}
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WhatsApp CTA */}
        {waEnabled && waHref && (
          <section className="py-16 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-card border border-border rounded-2xl p-10 space-y-5">
                <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <MessageCircle className="w-7 h-7 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">¿Tienes dudas?</h2>
                <p className="text-muted-foreground">Escríbenos directamente y te ayudamos a encontrar lo que buscas.</p>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chatear por WhatsApp
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer waNumber={waEnabled ? waNumber : null} settings={settings} />
    </div>
  )
}

function SectionHeader({ label, title, href }: { label: string; title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">{label}</p>
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1">
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

function ProductsEmptyPlaceholder() {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
      <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground">Los productos aparecerán aquí cuando estén disponibles.</p>
      <Link href="/catalogo" className="inline-block mt-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
        Ver catálogo completo →
      </Link>
    </div>
  )
}
