import type { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductSkeleton from '@/components/product/ProductSkeleton'
import CatalogoContent from './CatalogoContent'

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Explora nuestra colección completa de zapatos, gorras, ropa y accesorios. Filtra por categoría, precio y disponibilidad.',
}

function CatalogoSkeleton() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8">
      <div className="mb-8">
        <div className="h-9 bg-muted rounded-lg w-40 animate-pulse" />
        <div className="h-4 bg-muted rounded w-56 mt-2 animate-pulse" />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-card border border-border rounded-xl p-5 h-64 animate-pulse" />
        </aside>
        <div className="flex-1">
          <ProductSkeleton count={12} />
        </div>
      </div>
    </div>
  )
}

export default function CatalogoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<CatalogoSkeleton />}>
          <CatalogoContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
