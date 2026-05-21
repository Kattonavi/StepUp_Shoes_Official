import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'

interface HeroSectionProps {
  title: string
  subtitle: string
  ctaText: string
  ctaUrl: string
  waEnabled: boolean
  waHref: string | null
}

export default function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaUrl,
  waEnabled,
  waHref,
}: HeroSectionProps) {
  // Split title at roughly the halfway point for a two-line punch
  const words = title.trim().split(' ')
  const split = Math.ceil(words.length / 2)
  const line1 = words.slice(0, split).join(' ')
  const line2 = words.slice(split).join(' ')

  return (
    <section className="relative flex items-center overflow-hidden bg-background min-h-[88vh]">
      {/* ── Decorative background ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        {/* Primary glow — top right */}
        <div
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full opacity-[0.06] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
        />
        {/* Secondary glow — bottom left */}
        <div
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative max-w-6xl mx-auto w-full px-4 py-28 md:py-36">
        {/* Announcement badge */}
        <div className="inline-flex items-center gap-2.5 mb-10 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-primary text-xs font-bold uppercase tracking-widest">
            Nueva colección disponible
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-black tracking-tighter leading-[0.88] mb-10 text-[clamp(3rem,9vw,7.5rem)]">
          <span className="block text-foreground">{line1}</span>
          {line2 && <span className="block text-primary">{line2}</span>}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={ctaUrl}
            className="inline-flex items-center justify-center gap-2.5 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all duration-200 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
          {waEnabled && waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 border border-border text-foreground font-bold px-8 py-4 rounded-2xl hover:border-green-500/50 hover:text-green-400 transition-all duration-200 text-base hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </a>
          )}
        </div>

        {/* Stats strip */}
        <div className="mt-20 pt-8 border-t border-border/40 grid grid-cols-3 gap-6 max-w-sm">
          {[
            { value: '100+', label: 'Referencias' },
            { value: 'Rápido', label: 'Por WhatsApp' },
            { value: 'Siempre', label: 'Nuevos ingresos' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xl md:text-2xl font-black text-primary leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
