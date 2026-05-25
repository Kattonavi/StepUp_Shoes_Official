'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Tag } from 'lucide-react'
import { isSafeUrl } from '@/lib/url-validation'
import type { Promotion } from '@/types'
import { cn } from '@/lib/utils'
import { fadeUp, stagger, VIEWPORT_ONCE } from './motion'

interface HomePromotionsShowcaseProps {
  promotions: Promotion[]
}

/**
 * Premium promotions strip. Layout adapts to the number of active promotions:
 *  - 0    → compact "pronto" placeholder (does NOT take a huge empty section).
 *  - 1    → wide hero banner.
 *  - 2    → split banners.
 *  - 3+   → 1 hero + grid of compact cards (max 6).
 */
export default function HomePromotionsShowcase({
  promotions,
}: HomePromotionsShowcaseProps) {
  const empty = promotions.length === 0
  const [first, ...rest] = promotions

  return (
    <section className="relative py-16 md:py-20 px-4 overflow-hidden bg-gradient-to-b from-background via-muted/15 to-background">
      {/* Top warm glow */}
      <div
        className="absolute inset-x-0 top-0 h-80 pointer-events-none opacity-[0.07]"
        style={{
          background:
            'radial-gradient(ellipse at top, #F26A21 0%, transparent 60%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          variants={stagger}
          className="mb-10"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ofertas activas
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05]"
          >
            Aprovecha antes <span className="text-primary">de que se acaben</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl"
          >
            Drops por tiempo limitado y descuentos reales. Reserva tu talla por
            WhatsApp en menos de 5 minutos.
          </motion.p>
        </motion.div>

        {/* Empty */}
        {empty && <EmptyPromotions />}

        {/* 1 */}
        {promotions.length === 1 && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_ONCE}
            variants={fadeUp}
          >
            <PromoBanner promotion={first} variant="wide" />
          </motion.div>
        )}

        {/* 2 */}
        {promotions.length === 2 && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_ONCE}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <motion.div variants={fadeUp}>
              <PromoBanner promotion={first} variant="half" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <PromoBanner promotion={rest[0]} variant="half" />
            </motion.div>
          </motion.div>
        )}

        {/* 3+ */}
        {promotions.length >= 3 && (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_ONCE}
            variants={stagger}
            className="space-y-5"
          >
            <motion.div variants={fadeUp}>
              <PromoBanner promotion={first} variant="feature" />
            </motion.div>
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {rest.slice(0, 6).map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <PromoCard promotion={p} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

// ─── Empty state — compact, never a giant empty hole ────────────────────────

function EmptyPromotions() {
  return (
    <div className="relative rounded-3xl border border-dashed border-border bg-card/40 backdrop-blur-sm px-6 py-10 sm:py-12 text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-3">
        <Tag className="w-5 h-5 text-primary" />
      </div>
      <p className="text-sm font-semibold text-foreground">
        Pronto nuevas promociones
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
        Síguenos por WhatsApp para enterarte primero de los próximos drops y ofertas.
      </p>
    </div>
  )
}

// ─── Hero banner variants ───────────────────────────────────────────────────

interface BannerProps {
  promotion: Promotion
  variant: 'wide' | 'half' | 'feature'
}

function PromoBanner({ promotion: p, variant }: BannerProps) {
  const cta = p.linkLabel ?? 'Ver productos'

  const inner = (
    <div
      className={cn(
        'group relative rounded-3xl overflow-hidden border border-border bg-card',
        'transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10',
        variant === 'wide' && 'min-h-[20rem] md:min-h-[24rem]',
        variant === 'feature' && 'min-h-[18rem] md:min-h-[20rem]',
        variant === 'half' && 'min-h-[16rem] md:min-h-[18rem]'
      )}
    >
      {p.imageUrl ? (
        <>
          <Image
            src={p.imageUrl}
            alt={p.title}
            fill
            sizes={variant === 'half' ? '(max-width: 768px) 100vw, 50vw' : '100vw'}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            priority={variant !== 'half'}
          />
          {/* Readability gradient: deep on bottom-left where copy sits */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/55 to-black/10" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #150803 0%, #29130A 35%, #F26A21 110%)',
          }}
        />
      )}

      {/* Decorative ring */}
      <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full border border-white/10 pointer-events-none hidden md:block" />
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full border border-white/5 pointer-events-none hidden md:block" />

      <div
        className={cn(
          'relative h-full flex flex-col justify-end p-6 md:p-10',
          variant === 'wide' && 'md:max-w-2xl'
        )}
      >
        {p.badgeText && (
          <span className="inline-flex items-center self-start gap-1.5 text-[11px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-3 h-3" />
            {p.badgeText}
          </span>
        )}
        <h3
          className={cn(
            'font-black text-white tracking-tight leading-[1.05]',
            variant === 'wide'
              ? 'text-3xl md:text-5xl'
              : variant === 'feature'
              ? 'text-2xl md:text-4xl'
              : 'text-2xl md:text-3xl'
          )}
        >
          {p.title}
        </h3>
        {p.subtitle && (
          <p className="text-white/85 mt-3 max-w-xl text-sm md:text-base leading-relaxed line-clamp-3">
            {p.subtitle}
          </p>
        )}
        {p.linkUrl && (
          <div className="mt-5 inline-flex items-center gap-2 self-start bg-white/95 group-hover:bg-white text-foreground font-bold text-sm px-5 py-2.5 rounded-full transition-all shadow-lg">
            {cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </div>
  )

  return wrapIfLink(inner, p.linkUrl)
}

// ─── Compact card (3+ variant) ─────────────────────────────────────────────

function PromoCard({ promotion: p }: { promotion: Promotion }) {
  const inner = (
    <div className="group relative rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full">
      {p.imageUrl ? (
        <div className="relative h-40 overflow-hidden">
          <Image
            src={p.imageUrl}
            alt={p.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
          {p.badgeText && (
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {p.badgeText}
            </span>
          )}
        </div>
      ) : (
        <div className="h-28 bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center relative">
          <Tag className="w-8 h-8 text-primary/50" />
          {p.badgeText && (
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {p.badgeText}
            </span>
          )}
        </div>
      )}

      <div className="p-5">
        <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
          {p.title}
        </h3>
        {p.subtitle && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {p.subtitle}
          </p>
        )}
        {p.linkUrl && (
          <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary">
            {p.linkLabel ?? 'Ver productos'}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </div>
  )

  return wrapIfLink(inner, p.linkUrl)
}

// ─── Safe link wrapper ─────────────────────────────────────────────────────

function wrapIfLink(inner: React.ReactNode, url: string | null) {
  if (!url || !isSafeUrl(url)) return <>{inner}</>
  const isExternal = url.startsWith('http')
  if (isExternal) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {inner}
      </a>
    )
  }
  return (
    <Link href={url} className="block h-full">
      {inner}
    </Link>
  )
}
