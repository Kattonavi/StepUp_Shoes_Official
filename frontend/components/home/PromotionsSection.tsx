import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
import type { Promotion } from '@/types'

interface PromotionsSectionProps {
  promotions: Promotion[]
}

export default function PromotionsSection({ promotions }: PromotionsSectionProps) {
  if (promotions.length === 0) return null

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary rounded" />
              Ofertas especiales
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Promociones</h2>
          </div>
        </div>

        <div className={
          promotions.length === 1
            ? 'grid grid-cols-1 max-w-2xl gap-5'
            : promotions.length === 2
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-5'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
        }>
          {promotions.map((promo) => (
            <PromotionCard key={promo.id} promotion={promo} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PromotionCard({ promotion: p }: { promotion: Promotion }) {
  const inner = (
    <div className="group relative rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      {/* Image */}
      {p.imageUrl ? (
        <div className="relative h-44 overflow-hidden">
          <Image
            src={p.imageUrl}
            alt={p.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {p.badgeText && (
            <span className="absolute top-3 left-3 text-[11px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {p.badgeText}
            </span>
          )}
        </div>
      ) : (
        <div className="h-28 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
          <Tag className="w-8 h-8 text-primary/40" />
          {p.badgeText && (
            <span className="absolute top-3 left-3 text-[11px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {p.badgeText}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
          {p.title}
        </h3>
        {p.subtitle && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.subtitle}</p>
        )}
        {p.linkUrl && (
          <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary">
            {p.linkLabel ?? 'Ver más'}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </div>
  )

  if (p.linkUrl) {
    const isExternal = p.linkUrl.startsWith('http')
    if (isExternal) {
      return (
        <a href={p.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
          {inner}
        </a>
      )
    }
    return <Link href={p.linkUrl}>{inner}</Link>
  }

  return inner
}
