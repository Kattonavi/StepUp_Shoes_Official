import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Tag, Sparkles } from 'lucide-react'
import { isSafeUrl } from '@/lib/url-validation'
import type { Promotion } from '@/types'
import { cn } from '@/lib/utils'

interface PromotionsSectionProps {
  promotions: Promotion[]
}

/**
 * Renders promotions with one of three layouts so the section never feels
 * empty or unbalanced:
 *  - 1 promotion  → wide banner card.
 *  - 2 promotions → two equal banner cards side by side.
 *  - 3+ promotions → first as feature banner, the rest as compact cards.
 */
export default function PromotionsSection({ promotions }: PromotionsSectionProps) {
  if (promotions.length === 0) return null

  const [first, ...rest] = promotions

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Subtle warm glow */}
      <div
        className="absolute inset-x-0 top-0 h-72 pointer-events-none opacity-[0.06]"
        style={{
          background:
            'radial-gradient(ellipse at top, #F26A21 0%, transparent 60%)',
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Ofertas especiales
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Promociones <span className="text-primary">activas</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Disponibles por tiempo limitado. Consulta por WhatsApp para confirmar
              stock y tallas.
            </p>
          </div>
        </div>

        {/* Variant: single promotion → wide banner */}
        {promotions.length === 1 && (
          <PromotionBanner promotion={first} variant="wide" />
        )}

        {/* Variant: 2 promotions → side-by-side banners */}
        {promotions.length === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PromotionBanner promotion={first} variant="half" />
            <PromotionBanner promotion={rest[0]} variant="half" />
          </div>
        )}

        {/* Variant: 3+ → 1 feature + grid of compact cards */}
        {promotions.length >= 3 && (
          <div className="space-y-5">
            <PromotionBanner promotion={first} variant="feature" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.slice(0, 6).map((p) => (
                <PromotionCard key={p.id} promotion={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Banner (1, 2 or feature variant) ───────────────────────────────────────

interface BannerProps {
  promotion: Promotion
  variant: 'wide' | 'half' | 'feature'
}

function PromotionBanner({ promotion: p, variant }: BannerProps) {
  const cta = p.linkLabel ?? 'Ver productos'

  const inner = (
    <div
      className={cn(
        'group relative rounded-3xl overflow-hidden border border-border bg-card',
        'transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10',
        variant === 'wide' && 'min-h-[18rem] md:min-h-[22rem]',
        variant === 'feature' && 'min-h-[16rem] md:min-h-[18rem]',
        variant === 'half' && 'min-h-[14rem] md:min-h-[16rem]'
      )}
    >
      {/* Background image or gradient */}
      {p.imageUrl ? (
        <>
          <Image
            src={p.imageUrl}
            alt={p.title}
            fill
            sizes={variant === 'half' ? '(max-width: 768px) 100vw, 50vw' : '100vw'}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            priority={variant !== 'half'}
          />
          {/* Readability gradient — heavier on bottom-left where the copy sits */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/55 to-black/15" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #1a0d05 0%, #2a1408 35%, #F26A21 100%)',
          }}
        />
      )}

      {/* Decorative tag floating */}
      <Tag
        className="absolute top-6 right-6 w-10 h-10 text-white/15 rotate-12 pointer-events-none hidden md:block"
        aria-hidden
      />

      {/* Content */}
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
            'font-black text-white tracking-tight leading-tight',
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
          <p className="text-white/80 mt-3 max-w-xl text-sm md:text-base leading-relaxed line-clamp-3">
            {p.subtitle}
          </p>
        )}
        {p.linkUrl && (
          <div className="mt-5 inline-flex items-center gap-2 self-start bg-white/95 group-hover:bg-white text-foreground font-bold text-sm px-5 py-2.5 rounded-full transition-all duration-200 shadow-lg">
            {cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </div>
  )

  return wrapIfLink(inner, p.linkUrl)
}

// ─── Compact card (used for promotions 2..N in 3+ variant) ──────────────────

function PromotionCard({ promotion: p }: { promotion: Promotion }) {
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Defense in depth: only wrap in <a>/<Link> if the URL passes isSafeUrl.
 * Legacy unsafe URLs render as plain cards (no broken/dangerous href).
 */
function wrapIfLink(inner: React.ReactNode, url: string | null) {
  if (!url || !isSafeUrl(url)) return <>{inner}</>
  const isExternal = url.startsWith('http')
  if (isExternal) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full">
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
