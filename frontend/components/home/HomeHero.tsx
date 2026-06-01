'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { fadeUp, scaleIn, stagger } from './motion'

interface HomeHeroProps {
  title: string
  subtitle: string
  ctaText: string
  ctaUrl: string
  waEnabled: boolean
  waHref: string | null
}

/**
 * Split layout hero:
 *  - Left: brand badge, headline (gradient on second half), subtitle, two CTAs,
 *    stats strip.
 *  - Right: a single static sneaker illustration sitting on top of a warm glow.
 *    Intentionally minimal — no floating chips, no fake product card.
 *
 * To swap the illustration for a real product photo, drop the new asset at
 * `/public/hero-shoe.svg` (or change `HERO_IMAGE` below to a .jpg/.webp path).
 */
const HERO_IMAGE = '/hero-shoe.svg'

export default function HomeHero({
  title,
  subtitle,
  ctaText,
  ctaUrl,
  waEnabled,
  waHref,
}: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-background">
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
              Nueva temporada · stock limitado
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
                className="inline-flex items-center justify-center gap-2.5 bg-emerald-500 text-white font-semibold px-7 py-4 rounded-2xl border border-emerald-400/30 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-400/30 transition-all duration-200 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Pregunta por WhatsApp
              </a>
            )}
          </motion.div>

          {/* Stats strip */}
          <motion.dl
            variants={fadeUp}
            className="mt-14 grid grid-cols-3 gap-6 max-w-md border-t border-border/40 pt-7"
          >
            {[
              { value: '50+', label: 'Referencias activas' },
              { value: 'WhatsApp', label: 'Atención rápida y directa' },
              { value: 'Curado', label: 'Selección con estilo y confianza' },
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

        {/* ─── Right: clean shoe image ─── */}
        <motion.div
          className="lg:col-span-5 relative h-[320px] sm:h-[420px] lg:h-[560px]"
          initial="hidden"
          animate="show"
          variants={scaleIn}
          transition={{ delay: 0.15 }}
        >
          <HeroShoeImage />
        </motion.div>
      </div>
    </section>
  )
}

// ─── Right-side static image with glow frame ──────────────────────────────

function HeroShoeImage() {
  return (
    <div className="relative w-full h-full">
      {/* Warm radial glow behind the shoe */}
      <div
        className="absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            'radial-gradient(50% 45% at 55% 55%, rgba(242,106,33,0.25) 0%, rgba(242,106,33,0.06) 55%, transparent 80%)',
        }}
        aria-hidden
      />

      {/* Subtle decorative ring */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-[88%] aspect-square rounded-full border border-primary/15 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-[68%] aspect-square rounded-full border border-primary/10 pointer-events-none"
        aria-hidden
      />

      {/* The shoe — fills its container, drop shadow for depth */}
      <div className="relative w-full h-full">
        <Image
          src={HERO_IMAGE}
          alt="Sneaker premium seleccionado por StepUp"
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 40vw"
          className="object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.55)]"
        />
      </div>
    </div>
  )
}

// ─── Backdrop (unchanged) ─────────────────────────────────────────────────

function HeroBackdrop() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
      <div
        className="absolute -top-1/3 -right-1/4 w-[900px] h-[900px] rounded-full opacity-[0.10] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-1/3 -left-1/4 w-[700px] h-[700px] rounded-full opacity-[0.06] blur-[110px]"
        style={{ background: 'radial-gradient(circle, #F26A21 0%, transparent 70%)' }}
      />
      <div className="absolute inset-y-0 right-1/3 w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent hidden lg:block" />
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
