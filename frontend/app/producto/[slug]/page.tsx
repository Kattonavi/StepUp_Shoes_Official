import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ShieldCheck, MessageCircle, RotateCcw } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductGallery from '@/components/product/ProductGallery'
import ProductBadges from '@/components/product/ProductBadges'
import ProductPrice from '@/components/product/ProductPrice'
import ProductActions from './ProductActions'
import TrackPageView from '@/components/analytics/TrackPageView'
import { serverGet } from '@/lib/server-api'
import { getPublicSettingsServer } from '@/lib/server-settings'
import {
  APP_NAME,
  buildCanonicalUrl,
  buildPageMetadata,
  getSafeImageUrl,
} from '@/lib/seo'
import type { Product, StockStatus } from '@/types'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await serverGet<Product>(`/products/slug/${slug}`)

  // Missing or non-public product → noindex so crawlers don't keep stale URLs.
  if (!product) {
    return buildPageMetadata({
      title: 'Producto no encontrado',
      description: 'El producto que buscas no está disponible en este momento.',
      path: `/producto/${slug}`,
      noindex: true,
    })
  }

  const title = (product.seoTitle && product.seoTitle.trim()) || product.name
  const description =
    (product.seoDescription && product.seoDescription.trim()) ||
    (product.description && product.description.trim()) ||
    `Consulta disponibilidad, tallas y precio de ${product.name} por WhatsApp.`

  const mainImage =
    product.images.find((i) => i.mainImage)?.url ??
    product.images[0]?.url ??
    null

  return buildPageMetadata({
    title,
    description,
    path: `/producto/${product.slug}`,
    image: mainImage,
    imageAlt: product.name,
    // OG type 'product' isn't in Next's typed Metadata; 'website' renders fine.
    ogType: 'website',
  })
}

export default async function ProductoPage({ params }: ProductPageProps) {
  const { slug } = await params
  const [product, settings] = await Promise.all([
    serverGet<Product>(`/products/slug/${slug}`),
    getPublicSettingsServer(),
  ])

  if (!product) notFound()

  // WhatsApp number resolution: settings > env fallback.
  // Honors `whatsappEnabled=false` from settings to hide the CTA entirely.
  const waEnabled = settings?.whatsappEnabled ?? true
  const waNumber = waEnabled
    ? (settings?.whatsappNumber || process.env.NEXT_PUBLIC_WA_NUMBER || null)
    : null

  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK'
  const isOnRequest = product.stockStatus === 'ON_REQUEST'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link href="/catalogo" className="hover:text-foreground transition-colors">Catálogo</Link>
            {product.categoryName && product.categorySlug && (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <Link
                  href={`/catalogo?categorySlug=${product.categorySlug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Gallery */}
            <div>
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Details */}
            <div className="space-y-5">
              {/* Category */}
              {product.categoryName && product.categorySlug && (
                <Link
                  href={`/catalogo?categorySlug=${product.categorySlug}`}
                  className="inline-block text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                >
                  {product.categoryName}
                </Link>
              )}

              {/* Name + badges */}
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                  {product.name}
                </h1>
                <ProductBadges product={product} layout="inline" />
              </div>

              {/* Price */}
              <ProductPrice product={product} size="lg" />

              {/* Availability — bloque claro, no rompe el flujo del CTA */}
              <div
                className={
                  isOutOfStock
                    ? 'rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3'
                    : isOnRequest
                    ? 'rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3'
                    : 'rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3'
                }
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      isOutOfStock
                        ? 'bg-destructive'
                        : isOnRequest
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-green-500'
                    }`}
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">
                      {isOutOfStock
                        ? 'Agotado por el momento'
                        : isOnRequest
                        ? 'Disponible por encargo'
                        : 'Disponible para compra'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isOutOfStock
                        ? 'Escríbenos por WhatsApp y te avisamos cuando vuelva.'
                        : isOnRequest
                        ? 'Te confirmamos tiempo de entrega antes de cualquier pago.'
                        : 'Confirmamos talla y stock por WhatsApp antes de cerrar la compra.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions: size selector + WA button (client component) */}
              <ProductActions
                sizes={product.sizes}
                waNumber={waNumber}
                productName={product.name}
                categoryName={product.categoryName}
                price={product.price}
                stockStatus={product.stockStatus}
              />

              {/* Description */}
              {product.description && (
                <div className="pt-4 border-t border-border">
                  <h2 className="font-semibold mb-3">Descripción</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Trust block */}
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: <MessageCircle className="w-4 h-4 text-green-500" />,
                      title: 'Atención por WhatsApp',
                      sub: 'Te respondemos rápido',
                    },
                    {
                      icon: <ShieldCheck className="w-4 h-4 text-primary" />,
                      title: 'Producto verificado',
                      sub: 'Revisado antes de enviar',
                    },
                    {
                      icon: <RotateCcw className="w-4 h-4 text-blue-400" />,
                      title: 'Confirma antes de pagar',
                      sub: 'Talla, color y stock',
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-xl bg-muted/30 border border-border/60 px-3 py-2.5"
                    >
                      <span className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0">
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground leading-tight truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight truncate">
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <TrackPageView
        eventType="PRODUCT_VIEW"
        productId={product.id}
        productSlug={product.slug}
        categorySlug={product.categorySlug ?? undefined}
        path={`/producto/${product.slug}`}
      />

      {/* JSON-LD Product — helps Google show rich results and price. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProductJsonLd(product)),
        }}
      />
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function availabilityFromStock(stock: StockStatus): string {
  switch (stock) {
    case 'AVAILABLE':    return 'https://schema.org/InStock'
    case 'OUT_OF_STOCK': return 'https://schema.org/OutOfStock'
    case 'ON_REQUEST':   return 'https://schema.org/PreOrder'
    default:             return 'https://schema.org/InStock'
  }
}

function buildProductJsonLd(product: Product): Record<string, unknown> {
  const mainImage =
    product.images.find((i) => i.mainImage)?.url ??
    product.images[0]?.url ??
    null

  // Both image URLs (gallery) and the canonical URL must be absolute http(s)
  // for Google's rich results validator.
  const imageList = product.images
    .map((i) => getSafeImageUrl(i.url))
    .filter((u) => /^https?:\/\//i.test(u))

  const canonical = buildCanonicalUrl(`/producto/${product.slug}`)

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.description?.trim() ||
      `${product.name} disponible en ${APP_NAME}.`,
    sku: product.id,
    url: canonical,
  }

  if (imageList.length > 0) {
    data.image = imageList
  } else if (mainImage) {
    data.image = [getSafeImageUrl(mainImage)]
  }

  if (product.categoryName) {
    data.category = product.categoryName
  }

  if (typeof product.price === 'number' && product.price >= 0) {
    data.offers = {
      '@type': 'Offer',
      priceCurrency: 'COP',
      price: product.price.toFixed(2),
      availability: availabilityFromStock(product.stockStatus),
      url: canonical,
    }
  }

  return data
}
