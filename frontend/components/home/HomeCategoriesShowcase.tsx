'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Package,
  Footprints,
  Shirt,
  Watch,
  ShoppingBag,
} from 'lucide-react'
import type { Category } from '@/types'
import { cn } from '@/lib/utils'
import { fadeUp, scaleIn, stagger, VIEWPORT_ONCE } from './motion'

interface HomeCategoriesShowcaseProps {
  categories: Category[]
}

/**
 * Visual fallback "categories" for the empty/under-populated case.
 * These are NOT seeded into the backend; they're purely visual placeholders
 * that link to /catalogo so the section never feels empty.
 */
const FALLBACK_VISUAL_CATEGORIES = [
  { name: 'Zapatos', icon: Footprints, slug: null, href: '/catalogo' },
  { name: 'Ropa', icon: Shirt, slug: null, href: '/catalogo' },
  { name: 'Accesorios', icon: Watch, slug: null, href: '/catalogo' },
  { name: 'Ofertas', icon: ShoppingBag, slug: null, href: '/catalogo?isOnSale=true' },
] as const

export default function HomeCategoriesShowcase({
  categories,
}: HomeCategoriesShowcaseProps) {
  const realCount = categories.length

  // If we have zero or one real categories, pad the grid visually so the
  // section feels intentional rather than empty.
  const showFallback = realCount === 0
  const isSingle = realCount === 1

  return (
    <section className="relative py-16 md:py-24 px-4 bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
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
              <span className="w-5 h-0.5 bg-primary rounded" />
              Colecciones
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05]"
            >
              Explora por <span className="text-primary">categoría</span>
            </motion.h2>
          </div>
          <motion.div variants={fadeUp}>
            <Link
              href="/catalogo"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors whitespace-nowrap group"
            >
              Ver catálogo completo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Single category — give it room with a 2x layout */}
        {isSingle && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_ONCE}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <motion.div variants={scaleIn}>
              <CategoryTileLarge category={categories[0]} />
            </motion.div>
            <motion.div variants={scaleIn} className="grid grid-cols-2 gap-4">
              {FALLBACK_VISUAL_CATEGORIES.slice(0, 4).map((fc) => (
                <CategoryTileVisual key={fc.name} {...fc} />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Zero real categories → use fallback visual grid */}
        {showFallback && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_ONCE}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {FALLBACK_VISUAL_CATEGORIES.map((fc) => (
              <motion.div key={fc.name} variants={scaleIn}>
                <CategoryTileVisual {...fc} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 2+ real categories — real grid */}
        {realCount >= 2 && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_ONCE}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={scaleIn}>
                <CategoryTile category={cat} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile "ver catálogo" — when arrow is hidden in header */}
        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/catalogo"
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Tiles ─────────────────────────────────────────────────────────────────

function CategoryTile({ category: cat }: { category: Category }) {
  return (
    <Link
      href={`/catalogo?categorySlug=${cat.slug}`}
      className={cn(
        'group relative overflow-hidden bg-card border border-border rounded-2xl p-6 text-center block',
        'transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10'
      )}
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none rounded-2xl" />

      {cat.icon ? (
        <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110 leading-none">
          {cat.icon}
        </div>
      ) : (
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
          <Package className="w-6 h-6 text-primary" />
        </div>
      )}

      <p className="font-bold text-sm group-hover:text-primary transition-colors">
        {cat.name}
      </p>
      {cat.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {cat.description}
        </p>
      )}

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ArrowRight className="w-3.5 h-3.5 text-primary" />
      </div>
    </Link>
  )
}

function CategoryTileLarge({ category: cat }: { category: Category }) {
  return (
    <Link
      href={`/catalogo?categorySlug=${cat.slug}`}
      className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-8 md:p-10 min-h-[14rem] flex flex-col justify-between block transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
    >
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-30 blur-[60px]"
        style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
      />
      <div className="relative">
        {cat.icon ? (
          <div className="text-6xl mb-4 leading-none">{cat.icon}</div>
        ) : (
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
            <Package className="w-7 h-7 text-primary" />
          </div>
        )}
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
          Colección
        </p>
        <h3 className="text-2xl md:text-3xl font-black group-hover:text-primary transition-colors">
          {cat.name}
        </h3>
        {cat.description && (
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            {cat.description}
          </p>
        )}
      </div>
      <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Explorar
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

interface CategoryTileVisualProps {
  name: string
  icon: typeof Footprints
  href: string
}

function CategoryTileVisual({ name, icon: Icon, href }: CategoryTileVisualProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-5 text-center block transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/10 to-transparent pointer-events-none rounded-2xl" />
      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors border border-primary/20">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="font-bold text-sm group-hover:text-primary transition-colors">
        {name}
      </p>
    </Link>
  )
}
