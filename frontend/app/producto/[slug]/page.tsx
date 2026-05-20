import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, MessageCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductGallery from '@/components/product/ProductGallery'
import ProductBadges from '@/components/product/ProductBadges'
import ProductPrice from '@/components/product/ProductPrice'
import SizeSelector from './SizeSelector'
import { serverGet } from '@/lib/server-api'
import { buildWhatsAppUrl, buildProductWhatsAppMessage } from '@/lib/utils'
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
      description: 'El producto que buscas no existe o no está disponible.',
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

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER
  const pageUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? `https://stepup.com/producto/${slug}`

  const waMessage = buildProductWhatsAppMessage({
    productName: product.name,
    pageUrl,
  })

  const whatsappUrl = waNumber ? buildWhatsAppUrl(waNumber, waMessage) : null

  const activeSizes = product.sizes.filter((s) => s.available)
  const isAvailable = product.stockStatus === 'AVAILABLE'
  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/catalogo" className="hover:text-foreground transition-colors">Catálogo</Link>
            {product.categoryName && product.categorySlug && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                  href={`/catalogo?categorySlug=${product.categorySlug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Gallery */}
            <div>
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Details */}
            <div className="space-y-6">
              {product.categoryName && product.categorySlug && (
                <Link
                  href={`/catalogo?categorySlug=${product.categorySlug}`}
                  className="inline-block text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                >
                  {product.categoryName}
                </Link>
              )}

              <h1 className="text-3xl font-extrabold leading-tight">{product.name}</h1>

              <div className="flex flex-wrap gap-2">
                <ProductBadges product={product} />
              </div>

              <ProductPrice product={product} size="lg" />

              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? 'bg-green-500' : isOutOfStock ? 'bg-destructive' : 'bg-yellow-500'
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {isAvailable ? 'Disponible' : isOutOfStock ? 'Sin stock' : 'Disponible por pedido'}
                </span>
              </div>

              {activeSizes.length > 0 && <SizeSelector sizes={activeSizes} />}

              <div className="space-y-3 pt-2">
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-green-500 text-white font-semibold py-4 rounded-xl hover:bg-green-600 transition-colors text-base"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Consultar por WhatsApp
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-3 w-full bg-muted text-muted-foreground font-semibold py-4 rounded-xl text-base cursor-not-allowed">
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp no configurado
                  </div>
                )}
              </div>

              {product.description && (
                <div className="pt-4 border-t border-border">
                  <h2 className="font-semibold mb-3">Descripción</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
