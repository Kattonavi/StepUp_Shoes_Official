'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Package,
  Footprints,
  Crown,
  Wallet,
  Waves,
  ShoppingBag,
  Watch,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@/types'
import { cn } from '@/lib/utils'
import { fadeUp, scaleIn, stagger, VIEWPORT_ONCE } from './motion'

interface HomeCategoriesShowcaseProps {
  categories: Category[]
}

/**
 * Renders real categories from the backend.
 *
 *  - 4+ reales → grid limpio con solo reales (sin fallback visual).
 *  - 2–3 reales → grid compacto solo con las reales.
 *  - 1 real    → tile grande para la única + 3 placeholders genéricos para
 *                no dejar la sección desbalanceada.
 *  - 0 reales  → bloque compacto "Pronto nuevas colecciones".
 *
 * El link de cada categoría apunta a `/catalogo?categorySlug=<slug>` que es
 * el formato que ya lee `useProductFilters` en el catálogo.
 */
export default function HomeCategoriesShowcase({
  categories,
}: HomeCategoriesShowcaseProps) {
  const realCount = categories.length

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
              Encuentra lo tuyo,{' '}
              <span className="text-primary">categoría por categoría</span>
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

        {/* 0 reales — placeholder compacto */}
        {realCount === 0 && <EmptyCollections />}

        {/* 1 real — tile grande + 3 placeholders genéricos */}
        {realCount === 1 && (
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
            <motion.div variants={scaleIn} className="grid grid-cols-3 gap-3">
              {GENERIC_PLACEHOLDERS.map((g) => (
                <CategoryTilePlaceholder key={g.label} {...g} />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* 2+ reales — solo reales, sin fallback */}
        {realCount >= 2 && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_ONCE}
            variants={stagger}
            className={cn(
              'grid gap-4',
              // Densidad responsive según cuántas reales hay para que ninguna
              // quede sola en su fila o demasiado apretada.
              realCount === 2 && 'grid-cols-1 sm:grid-cols-2',
              realCount === 3 && 'grid-cols-2 sm:grid-cols-3',
              realCount >= 4 &&
                'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            )}
          >
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={scaleIn}>
                <CategoryTile category={cat} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile "ver catálogo" — header arrow oculto en mobile */}
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

// ─── Empty state ───────────────────────────────────────────────────────────

function EmptyCollections() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/40 backdrop-blur-sm px-6 py-10 sm:py-12 text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        Pronto nuevas colecciones
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
        Estamos preparando nuevas categorías. Mientras tanto, explora el catálogo
        completo.
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

// ─── Real category tile ────────────────────────────────────────────────────

function CategoryTile({ category: cat }: { category: Category }) {
  const Icon = pickIconForCategoryName(cat.name)
  const description = cat.description?.trim() || pickFallbackCopy(cat.name)

  return (
    <Link
      href={`/catalogo?categorySlug=${encodeURIComponent(cat.slug)}`}
      className={cn(
        'group relative overflow-hidden bg-card border border-border rounded-2xl p-5 sm:p-6 block h-full',
        'transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10'
      )}
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none rounded-2xl" />

      {/* Visual: prefer admin emoji icon, else themed Lucide icon by name. */}
      {cat.icon ? (
        <div className="text-4xl sm:text-5xl mb-3 transition-transform duration-300 group-hover:scale-110 leading-none">
          {cat.icon}
        </div>
      ) : (
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors border border-primary/20">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}

      <p className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
        {cat.name}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary/80 group-hover:text-primary transition-colors">
        Explorar
        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

// ─── Large tile (used only when there's exactly 1 real category) ──────────

function CategoryTileLarge({ category: cat }: { category: Category }) {
  const Icon = pickIconForCategoryName(cat.name)
  const description = cat.description?.trim() || pickFallbackCopy(cat.name)

  return (
    <Link
      href={`/catalogo?categorySlug=${encodeURIComponent(cat.slug)}`}
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
            <Icon className="w-7 h-7 text-primary" />
          </div>
        )}
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
          Colección
        </p>
        <h3 className="text-2xl md:text-3xl font-black group-hover:text-primary transition-colors">
          {cat.name}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">{description}</p>
        )}
      </div>
      <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Explorar
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

// ─── Generic placeholder (only used when there is exactly 1 real category) ─

interface GenericPlaceholder {
  label: string
  icon: LucideIcon
}

const GENERIC_PLACEHOLDERS: GenericPlaceholder[] = [
  { label: 'Próximos drops', icon: Sparkles },
  { label: 'Más colecciones', icon: ShoppingBag },
  { label: 'Pronto disponibles', icon: Package },
]

function CategoryTilePlaceholder({ label, icon: Icon }: GenericPlaceholder) {
  return (
    <div className="relative overflow-hidden bg-card/40 backdrop-blur-sm border border-dashed border-border rounded-2xl p-4 text-center flex flex-col items-center justify-center">
      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mb-2 border border-primary/15">
        <Icon className="w-4 h-4 text-primary/60" />
      </div>
      <p className="text-[11px] font-semibold text-muted-foreground leading-tight">
        {label}
      </p>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Picks a themed Lucide icon for a real category based on its name.
 * Match is case/accent-insensitive and word-based, so admin names like
 * "Zapatos urbanos" or "Gorras snapback" also get the right icon.
 */
function pickIconForCategoryName(name: string): LucideIcon {
  const n = normalize(name)
  if (/(zapato|sneaker|tenis|calzado)/.test(n)) return Footprints
  if (/(gorra|cap|sombrero|hat)/.test(n))       return Crown
  if (/(billetera|wallet|cartera)/.test(n))     return Wallet
  if (/(chancla|sandali|flip|slide)/.test(n))   return Waves
  if (/(accesorio|reloj|pulser|cadena|joya)/.test(n)) return Watch
  if (/(bolso|mochila|bag|backpack)/.test(n))   return ShoppingBag
  return Package
}

/**
 * Fallback short copy by category name, used only when the admin didn't set
 * a description. Never overrides a real `category.description`.
 */
function pickFallbackCopy(name: string): string | null {
  const n = normalize(name)
  if (/(zapato|sneaker|tenis|calzado)/.test(n))
    return 'Sneakers, casuales y estilos urbanos.'
  if (/(gorra|cap|sombrero|hat)/.test(n))
    return 'Complementos para cerrar el look.'
  if (/(billetera|wallet|cartera)/.test(n))
    return 'Detalles prácticos para todos los días.'
  if (/(chancla|sandali|flip|slide)/.test(n))
    return 'Comodidad fresca para salir relajado.'
  if (/(accesorio|reloj|pulser|cadena|joya)/.test(n))
    return 'Piezas que completan tu estilo.'
  if (/(bolso|mochila|bag|backpack)/.test(n))
    return 'Lleva lo tuyo con estilo.'
  return null
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}
