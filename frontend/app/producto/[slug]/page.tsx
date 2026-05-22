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
import type { Product } from '@/types'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await serverGet<Product>(`/products/slug/${slug}`)

  if (!product) {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscas no está disponible en este momento.',
    }
  }

  const title = product.seoTitle ?? `${product.name} | StepUp`
  const description =
    product.seoDescription ?? product.description ?? `Compra ${product.name} en StepUp.`

  const mainImage = product.images.find((i) => i.mainImage)?.url ?? product.images[0]?.url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: mainImage ? [{ url: mainImage }] : [],
      type: 'website',
    },
  }
}

export default async function ProductoPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await serverGet<Product>(`/products/slug/${slug}`)

  if (!product) notFound()

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? null

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
                <h1 className="text-3xl font-extrabold leading-tight mb-3">{product.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <ProductBadges product={product} />
                </div>
              </div>

              {/* Price */}
              <ProductPrice product={product} size="lg" />

              {/* Availability */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isOutOfStock
                        ? 'bg-destructive'
                        : isOnRequest
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {isOutOfStock
                      ? 'Agotado por el momento'
                      : isOnRequest
                      ? 'Disponible por encargo'
                      : 'Disponible para compra'}
                  </span>
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
                      text: 'Respuesta rápida por WhatsApp',
                    },
                    {
                      icon: <ShieldCheck className="w-4 h-4 text-primary" />,
                      text: 'Producto verificado y seleccionado',
                    },
                    {
                      icon: <RotateCcw className="w-4 h-4 text-blue-400" />,
                      text: 'Consulta antes de pagar',
                    },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.icon}
                      <span>{item.text}</span>
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
    </div>
  )
}
