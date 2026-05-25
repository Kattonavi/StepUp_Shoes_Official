'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Package } from 'lucide-react'
import type { ProductSummary } from '@/types'
import ProductCard from '@/components/product/ProductCard'
import { fadeUp, scaleIn, stagger, VIEWPORT_ONCE } from './motion'

interface HomeFeaturedProductsProps {
  products: ProductSummary[]
  title: string
}

export default function HomeFeaturedProducts({
  products,
  title,
}: HomeFeaturedProductsProps) {
  return (
    <section className="relative py-16 md:py-24 px-4 bg-muted/15 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          variants={stagger}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <motion.p
              variants={fadeUp}
              className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2"
            >
              <Flame className="w-3.5 h-3.5" />
              Selección de la temporada
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05]"
            >
              {title}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl"
            >
              Las referencias que más están saliendo. Stock limitado — pregunta antes
              de que se acaben.
            </motion.p>
          </div>
          <motion.div variants={fadeUp}>
            <Link
              href="/catalogo?isFeatured=true"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
            >
              Ver todos los destacados
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>

        {products.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_ONCE}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
          >
            {products.map((p) => (
              <motion.div key={p.id} variants={scaleIn}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyFeatured />
        )}

        {/* Mobile-only CTA */}
        <div className="mt-10 sm:hidden text-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Ver catálogo completo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function EmptyFeatured() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/40 backdrop-blur-sm px-6 py-10 sm:py-12 text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-3">
        <Package className="w-5 h-5 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        Pronto nuevos productos destacados
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
        Mientras tanto, explora el catálogo completo.
      </p>
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        Ver catálogo
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
