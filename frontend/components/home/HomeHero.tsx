'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Tag,
  Star,
} from 'lucide-react'
import type { ProductSummary } from '@/types'
import { formatPrice } from '@/lib/utils'
import { fadeUp, floatY, stagger } from './motion'

interface HomeHeroProps {
  title: string
  subtitle: string
  ctaText: string
  ctaUrl: string
  waEnabled: boolean
  waHref: string | null
  /** Optional: real featured product used inside the right-hand showcase card. */
  showcaseProduct?: ProductSummary | null
}

/**
 * Split-layout hero with animated entry, floating chips and a product
 * showcase card on the right that uses a real featured product when available.
 * Falls back to a stylized product placeholder so it never feels empty.
 */
export default function HomeHero({
  title,
  subtitle,
  ctaText,
  ctaUrl,
  waEnabled,
  waHref,
  showcaseProduct,
}: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* ─── Decorative background ─── */}
      <HeroBackdrop />

      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* ─── Left: copy + CTAs ─── */}
        <motion.div
          className="lg:col-span-7 relative z-10"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 mb-8 rounded-full bg-primary/10 border border-primary/30 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Nueva temporada disponible
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-black tracking-[-0.03em] leading-[0.9] text-[clamp(2.75rem,8vw,6.5rem)]"
          >
            <span className="block text-foreground">{splitFirstLine(title)}</span>
            {splitRest(title) && (
              <span className="block">
                <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  {splitRest(title)}
                </span>
              </span>
            )}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg text-muted-foreground max-w-xl mt-7 leading-relaxed"
          >
            {subtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <Link
              href={ctaUrl}
              className="group inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground font-bold px-7 py-4 rounded-2xl hover:bg-primary/90 transition-all duration-200 text-base shadow-[0_10px_30px_-10px_rgba(242,106,33,0.55)] hover:shadow-[0_15px_40px_-10px_rgba(242,106,33,0.7)] hover:-translate-y-0.5"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {waEnabled && waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 border border-border bg-card/40 backdrop-blur-sm text-foreground font-semibold px-7 py-4 rounded-2xl hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5 transition-all duration-200 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </a>
            )}
          </motion.div>

          {/* Stats strip */}
          <motion.dl
            variants={fadeUp}
            className="mt-14 grid grid-cols-3 gap-6 max-w-md border-t border-border/40 pt-7"
          >
            {[
              { value: '100+', label: 'Referencias' },
              { value: 'Rápido', label: 'Por WhatsApp' },
              { value: 'Selectos', label: 'Productos curados' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-xl md:text-2xl font-black text-primary leading-none">
                  {s.value}
                </dt>
                <dd className="text-xs text-muted-foreground mt-1.5">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ─── Right: showcase composition ─── */}
        <div className="lg:col-span-5 relative h-[460px] sm:h-[520px] lg:h-[600px]">
          <HeroShowcase product={showcaseProduct ?? null} />
        </div>
      </div>
    </section>
  )
}

// ─── Backdrop ──────────────────────────────────────────────────────────────

function HeroBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
      {/* Big radial glow top-right */}
      <div
        className="absolute -top-1/3 -right-1/4 w-[900px] h-[900px] rounded-full opacity-[0.10] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
      />
      {/* Secondary glow bottom-left */}
      <div
        className="absolute -bottom-1/3 -left-1/4 w-[700px] h-[700px] rounded-full opacity-[0.06] blur-[110px]"
        style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
      />
      {/* Diagonal accent line */}
      <div className="absolute inset-y-0 right-1/3 w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent hidden lg:block" />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}

// ─── Showcase (right side) ────────────────────────────────────────────────

function HeroShowcase({ product }: { product: ProductSummary | null }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial="hidden"
      animate="show"
      variants={stagger}
      transition={{ delayChildren: 0.25 }}
    >
      {/* Main product card (center) */}
      <motion.div
        variants={floatY(0.05)}
        className="absolute inset-y-4 left-4 right-4 sm:left-10 sm:right-10 lg:left-2 lg:right-0"
      >
        <div className="relative h-full rounded-[2rem] overflow-hidden border border-border bg-gradient-to-br from-card via-card to-muted/40 shadow-2xl shadow-primary/5">
          {/* Inner glow ring */}
          <div className="absolute inset-0 ring-1 ring-inset ring-primary/10 rounded-[2rem] pointer-events-none" />

          {product?.mainImageUrl ? (
            <>
              <Image
                src={product.mainImageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
              {/* Top fade */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/60 to-transparent" />
              {/* Bottom fade — readable text */}
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            </>
          ) : (
            <HeroPlaceholder />
          )}

          {/* Drop badge */}
          <div className="absolute top-5 left-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/95 text-primary-foreground text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 shadow-lg">
              <Sparkles className="w-3 h-3" />
              Drop destacado
            </span>
          </div>

          {/* Featured rating chip top-right */}
          <div className="absolute top-5 right-5">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/85 backdrop-blur border border-border text-[11px] font-bold text-foreground px-2.5 py-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              Top
            </span>
          </div>

          {/* Bottom product info overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            {product ? (
              <>
                {product.categoryName && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">
                    {product.categoryName}
                  </p>
                )}
                <h3 className="text-white font-black text-xl sm:text-2xl leading-tight line-clamp-2 max-w-[85%]">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    {product.isOnSale && product.oldPrice && (
                      <p className="text-xs text-white/50 line-through">
                        {formatPrice(product.oldPrice)}
                      </p>
                    )}
                    <p className="text-white font-extrabold text-lg sm:text-xl">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <Link
                    href={`/producto/${product.slug}`}
                    className="inline-flex items-center gap-1.5 bg-white text-foreground text-xs font-bold px-3.5 py-2 rounded-full hover:bg-white/90 transition-all shadow-lg"
                  >
                    Ver
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">
                  Estilo urbano
                </p>
                <h3 className="text-white font-black text-xl sm:text-2xl leading-tight">
                  Encuentra tu próximo par favorito
                </h3>
                <Link
                  href="/catalogo"
                  className="mt-4 inline-flex items-center gap-1.5 bg-white text-foreground text-xs font-bold px-3.5 py-2 rounded-full hover:bg-white/90 transition-all shadow-lg"
                >
                  Explorar catálogo
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating mini chip — top-left (offset over card) */}
      <motion.div
        variants={floatY(0.35)}
        className="absolute -top-2 left-0 sm:-left-2 hidden sm:block"
      >
        <FloatingChip icon={Sparkles} label="Nuevas referencias" tint="orange" />
      </motion.div>

      {/* Floating mini chip — middle-right */}
      <motion.div
        variants={floatY(0.45)}
        className="absolute top-1/2 -right-2 sm:right-4 lg:-right-6 -translate-y-1/2 hidden sm:block"
      >
        <FloatingChip icon={ShieldCheck} label="Productos verificados" tint="primary" />
      </motion.div>

      {/* Floating mini chip — bottom-left */}
      <motion.div
        variants={floatY(0.55)}
        className="absolute -bottom-3 left-1 sm:-left-3 hidden sm:block"
      >
        <FloatingChip icon={MessageCircle} label="WhatsApp directo" tint="green" />
      </motion.div>

      {/* Decorative ring bottom-right */}
      <motion.div
        variants={floatY(0.65)}
        className="absolute bottom-6 right-2 lg:-right-4 w-20 h-20 rounded-full border border-primary/20 pointer-events-none hidden lg:block"
        aria-hidden
      />
    </motion.div>
  )
}

interface FloatingChipProps {
  icon: typeof Sparkles
  label: string
  tint: 'primary' | 'orange' | 'green'
}

function FloatingChip({ icon: Icon, label, tint }: FloatingChipProps) {
  const tintClass =
    tint === 'green'
      ? 'text-green-400 bg-green-500/10 border-green-500/30'
      : tint === 'primary'
      ? 'text-primary bg-primary/10 border-primary/30'
      : 'text-orange-300 bg-orange-500/10 border-orange-500/30'

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-card/80 backdrop-blur-md border border-border px-3 py-2 shadow-lg">
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center border ${tintClass}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </span>
      <span className="text-xs font-semibold text-foreground whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}

// ─── Fallback hero placeholder (when there's no featured product) ─────────

function HeroPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/40 to-background">
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-50 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
        />
      </div>
      <div className="relative text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 mb-5">
          <Tag className="w-10 h-10 text-primary" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Próximos drops
        </p>
        <p className="text-xs text-muted-foreground mt-1">Mantente atento</p>
      </div>
    </div>
  )
}

// ─── Title splitting (gradient on second half) ────────────────────────────

function splitFirstLine(title: string): string {
  const words = title.trim().split(' ')
  if (words.length <= 2) return words[0] ?? title
  const split = Math.ceil(words.length / 2)
  return words.slice(0, split).join(' ')
}

function splitRest(title: string): string {
  const words = title.trim().split(' ')
  if (words.length <= 2) return words.slice(1).join(' ')
  const split = Math.ceil(words.length / 2)
  return words.slice(split).join(' ')
}
